import { zip } from './zip.js';
import { features, loadIndex, loadSeason, flatten, matches, imageUrl, variantLabel } from '../lebron/catalog.js';

const byId = id => document.getElementById(id);
const form = byId('editor');
const slotField = byId('slot');
const versionField = byId('version');
const status = byId('editor-status');
const sides = ['front', 'back'];
const fileTypes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const split = value => value.split(/[,，]/).map(item => item.trim()).filter(Boolean);
const draftDb = new Promise((resolve, reject) => {
  const request = indexedDB.open('lebron-atlas-editor', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('drafts');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
draftDb.catch(() => {});

let index;
let datasets;
let cards;
let editing;
let mode;
let files = {};
let previewUrls = [];
let exportPackage;
let revision = 0;
let draftWrites = Promise.resolve();

async function draftOperation(method, value) {
  const db = await draftDb;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', method === 'get' ? 'readonly' : 'readwrite');
    const store = tx.objectStore('drafts');
    const request = method === 'get' ? store.get('current') : store.put(value, 'current');
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function field(name) {
  return form.elements.namedItem(name);
}

function invalidate() {
  revision++;
  exportPackage = null;
  byId('review').hidden = true;
  for (const url of previewUrls) URL.revokeObjectURL(url);
  previewUrls = [];
}

function showFileStatus() {
  byId('draft-images').textContent = sides.flatMap(side => {
    const label = side === 'front' ? '正图' : '背图';
    return files[side] ? [label + '草稿 ' + files[side].name] : editing?.[side] ? [label + '已收录'] : [];
  }).join(' · ');
}

function renderSlots() {
  const search = byId('search-slot').value;
  const slots = new Map(cards.filter(card => matches(card, search, {})).map(card => [card.slotId, card]));
  const previous = slotField.value;
  slotField.replaceChildren(new Option('选择卡位', ''));
  for (const card of slots.values()) {
    slotField.append(new Option(card.title + ' · ' + card.slot.cardSubset, card.slotId));
  }
  if (slots.has(previous)) slotField.value = previous;
}

function renderVersions() {
  versionField.replaceChildren(new Option('选择版本', ''));
  if (!slotField.value) return;
  for (const card of cards.filter(card => card.slotId === slotField.value)) {
    versionField.append(new Option(variantLabel(card), card.id));
  }
  versionField.append(new Option('新增平行版本', 'new'));
}

function setFields(values) {
  for (const control of form.elements) {
    if (!control.name || control.type === 'file' || control.type === 'checkbox') continue;
    control.value = values[control.name] ?? control.defaultValue ?? '';
  }
  for (const checkbox of form.querySelectorAll('[name="feature"]')) {
    checkbox.checked = values.features?.includes(checkbox.value) || false;
  }
  field('verified').checked = Boolean(values.verified);
}

function beginEditing(nextMode, card) {
  mode = nextMode;
  editing = card;
  invalidate();
  files = {};
  form.reset();
  const keepVersion = mode === 'edit';
  const values = card ? {
    season: card.season, brand: card.product.brand, series: card.product.series,
    productNumber: card.slot.productNumber, cardSubset: card.slot.cardSubset,
    subjects: card.slot.subjects.join(', '), checklistSource: card.product.checklistSource,
    ...card.scene, costars: card.scene.costars?.join(', '),
    features: keepVersion ? card.features : card.features?.filter(feature => feature === 'rc'),
    ...(keepVersion && {
      cardVariant: card.cardVariant, cardVariantCN: card.cardVariantCN, printRun: card.printRun,
      cardSummary: card.cardSummary, cardSummaryEN: card.cardSummaryEN,
      frontSource: card.front?.source, backSource: card.back?.source
    })
  } : {};
  setFields(values);
  for (const key of ['season', 'brand', 'series', 'productNumber', 'cardSubset', 'subjects', 'checklistSource']) {
    field(key).readOnly = Boolean(card);
  }
  for (const key of ['cardVariant', 'cardVariantCN', 'printRun']) field(key).readOnly = keepVersion;
  form.hidden = false;
  status.textContent = keepVersion ? '补图或更新画面、卡背资料' : '新增发行版本';
  showFileStatus();
  refreshSuggestions();
}

function valuesFromForm() {
  const data = new FormData(form);
  const values = Object.fromEntries([...data].filter(([, value]) => typeof value === 'string').map(([key, value]) => [key, value.trim()]));
  values.features = data.getAll('feature');
  values.verified = data.has('verified');
  delete values.feature;
  return values;
}

function saveDraft() {
  if (form.hidden) return;
  const draft = { mode, editingId: editing?.id, files: { ...files }, values: valuesFromForm() };
  draftWrites = draftWrites.catch(() => {}).then(() => draftOperation('put', draft));
  draftWrites.catch(() => { status.textContent = '本机草稿保存失败，请在关闭前导出。'; });
}

function url(value, label) {
  if (!value || !/^https?:\/\//i.test(value)) throw new Error(label + '需填写 HTTP 或 HTTPS 链接');
  return new URL(value).href;
}

function keyOf(value) {
  return value.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function contextSuggestions(options, name, values) {
  const text = field(name).value.trim().toLowerCase();
  return text ? options.filter(card => values(card).trim().toLowerCase() === text) : options;
}

function refreshSuggestions() {
  const byBrand = contextSuggestions(cards, 'brand', card => card.product.brand);
  const byYear = contextSuggestions(byBrand, 'season', card => card.season);
  const bySeries = contextSuggestions(byYear, 'series', card => card.product.series);
  const options = {
    seasons: index.seasons, brands: cards.map(card => card.product.brand),
    series: byBrand.map(card => card.product.series), variants: bySeries.map(card => card.cardVariant),
    teams: ['骑士', '热火', '湖人'], colors: ['白色', '黑色', '红色', '黄色', '紫色', '蓝色', '其他'],
    actions: ['扣篮', '上篮', '投篮', '持球', '运球', '传球', '防守', '肖像', '合影']
  };
  for (const [id, values] of Object.entries(options)) {
    byId(id).replaceChildren(...[...new Set(values)].map(value => new Option(value)));
  }
}

async function createAsset(file, source) {
  const ext = fileTypes[file.type];
  if (!ext) throw new Error('图片格式需为 JPEG、PNG 或 WebP');
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
  const key = [...hash].map(byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
  const image = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 260 / image.width, 350 / image.height);
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const thumb = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .87));
  if (!thumb || thumb.type !== 'image/webp') throw new Error('浏览器无法生成 WebP 缩略图');
  const asset = { file: key + '.' + ext, thumb: key + '-thumb.webp', source };
  return { asset, assets: [[asset.file, file], [asset.thumb, thumb]] };
}

async function planExport(values) {
  const start = Number(values.season.slice(0, 4));
  if (start < 2003 || Number(values.season.slice(5)) !== (start + 1) % 100) throw new Error('请填写有效发行赛季，如 2003-04');
  const original = datasets.find(item => item.season === values.season);
  const dataset = original ? structuredClone(original) : { season: values.season, products: [] };
  const productKey = editing?.product.key || keyOf(values.brand + '-' + values.series);
  const slotKey = editing?.slot.key || keyOf(values.cardSubset + '-' + values.productNumber);
  const versionKey = mode === 'edit' ? editing.key : keyOf(values.cardVariant);
  if (!productKey || !slotKey || !versionKey) throw new Error('发行信息需包含英文或数字，以生成可共享的链接');
  const subjects = split(values.subjects);
  if (!subjects.includes('LeBron James')) throw new Error('主体需包含 LeBron James');
  const checklistSource = url(values.checklistSource, '发行卡表来源');
  let product = dataset.products.find(item => item.key === productKey);
  if (product && !editing && (product.brand !== values.brand || product.series !== values.series)) {
    throw new Error('已有同名产品，请按卡表中的厂商和系列名称填写');
  }
  if (!product) {
    product = { key: productKey, brand: values.brand, series: values.series, checklistSource, checklistComplete: false, slots: [] };
    dataset.products.push(product);
  }
  let slot = product.slots.find(item => item.key === slotKey);
  if (slot && !editing) throw new Error('已有同名卡位，请在上方选择对应卡位');
  const scene = { team: values.team, color: values.color, action: values.action, costars: split(values.costars) };
  if (!slot) {
    slot = { key: slotKey, cardSubset: values.cardSubset, productNumber: values.productNumber, subjects, scene, versions: [] };
    product.slots.push(slot);
  }
  const existing = slot.versions.find(version => version.key === versionKey
    || keyOf(version.cardVariant) === keyOf(values.cardVariant)
    || (values.cardVariantCN && version.cardVariantCN === values.cardVariantCN));
  if (mode === 'edit' && !existing) throw new Error('原版本无法核对，请重新选择卡位');
  if (mode !== 'edit' && existing) throw new Error('这个版本已存在，请从版本列表选择后补图');
  const next = existing || {
    key: versionKey, cardVariant: values.cardVariant, cardVariantCN: values.cardVariantCN,
    printRun: values.printRun ? Number(values.printRun) : null
  };
  if (!existing) slot.versions.push(next);
  next.features = values.features;
  next.cardSummary = values.cardSummary;
  next.cardSummaryEN = values.cardSummaryEN;
  if (editing) {
    const overrides = Object.fromEntries(Object.entries(scene).filter(([key, value]) =>
      JSON.stringify(value) !== JSON.stringify(slot.scene?.[key] ?? (key === 'costars' ? [] : ''))));
    if (Object.keys(overrides).length) next.scene = overrides;
    else delete next.scene;
  }
  const assets = [];
  for (const side of sides) {
    const sourceValue = values[side + 'Source'];
    const file = files[side];
    if (file || next[side]) {
      const source = url(sourceValue, side === 'front' ? '正图来源' : '背图来源');
      if (file) {
        const result = await createAsset(file, source);
        next[side] = result.asset;
        assets.push(...result.assets);
      } else {
        next[side].source = source;
      }
    } else if (sourceValue) {
      throw new Error('为新增图片填写来源时，请同时选择对应图片');
    }
  }
  const nextIndex = original ? null : { seasons: [...index.seasons, dataset.season].sort() };
  return { dataset, nextIndex, assets, version: next, existing: Boolean(existing), title: values.season + ' ' + product.brand + ' ' + product.series + ' #' + slot.productNumber };
}

function renderReview(update) {
  byId('review-text').textContent = update.title + ' · ' + variantLabel(update.version)
    + (update.existing ? ' · 更新已有版本' : ' · 新增 1 个版本');
  const preview = byId('preview-images');
  preview.replaceChildren();
  for (const side of sides) {
    const image = update.version[side];
    const block = document.createElement('div');
    const label = side === 'front' ? '正面' : '背面';
    block.append(label + (image ? '' : '待补'));
    if (image) {
      const figure = document.createElement('img');
      figure.alt = label;
      if (files[side]) {
        figure.src = URL.createObjectURL(files[side]);
        previewUrls.push(figure.src);
      } else {
        figure.src = imageUrl(image);
      }
      block.append(figure);
    }
    preview.append(block);
  }
  byId('review').hidden = false;
}

async function exportFiles(update) {
  const name = 'lebron-export-' + crypto.randomUUID().slice(0, 8) + '.zip';
  const encode = value => new TextEncoder().encode(JSON.stringify(value, null, 2) + '\n');
  const entries = new Map([['lebron/data/' + update.dataset.season + '.json', encode(update.dataset)]]);
  for (const [file, blob] of update.assets) {
    entries.set('lebron/images/' + file, new Uint8Array(await blob.arrayBuffer()));
  }
  if (update.nextIndex) entries.set('lebron/data/index.json', encode(update.nextIndex));
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zip(entries));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 30000);
  status.textContent = '已生成 ' + name + '。解压后可以预览并提交变更。';
}

async function start() {
  if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) throw new Error('录入页仅在本机静态预览中开放。');
  index = await loadIndex();
  datasets = await Promise.all(index.seasons.map(loadSeason));
  cards = datasets.flatMap(flatten);
  for (const [value, label] of Object.entries(features)) {
    const wrapper = document.createElement('label');
    wrapper.className = 'check';
    const checkbox = document.createElement('input');
    checkbox.name = 'feature';
    checkbox.type = 'checkbox';
    checkbox.value = value;
    wrapper.append(checkbox, label);
    byId('features').append(wrapper);
  }
  renderSlots();
  renderVersions();
  byId('lookup').hidden = false;
  byId('setup-status').textContent = '';
  let draft;
  try {
    draft = await draftOperation('get');
  } catch {
    status.textContent = '本机草稿存储不可用。';
  }
  if (draft) {
    const card = cards.find(card => card.id === draft.editingId);
    if (card || draft.mode === 'new-slot') {
      beginEditing(draft.mode, card);
      if (card) {
        slotField.value = card.slotId;
        renderVersions();
        versionField.value = draft.mode === 'edit' ? card.id : 'new';
      }
      setFields(draft.values);
      files = draft.files || {};
      showFileStatus();
      status.textContent = '已恢复本机草稿';
    }
  }
}

function changeSlot() {
  renderVersions();
  invalidate();
  form.hidden = true;
}
byId('search-slot').addEventListener('input', () => { renderSlots(); changeSlot(); });
slotField.addEventListener('change', changeSlot);
versionField.addEventListener('change', () => {
  const id = versionField.value;
  if (!id) {
    form.hidden = true;
    invalidate();
    return;
  }
  const card = id === 'new' ? cards.find(card => card.slotId === slotField.value) : cards.find(card => card.id === id);
  beginEditing(id === 'new' ? 'new-version' : 'edit', card);
  saveDraft();
});
byId('new-slot').addEventListener('click', () => {
  slotField.value = '';
  renderVersions();
  beginEditing('new-slot');
  saveDraft();
});
form.addEventListener('input', event => {
  const control = event.target;
  if (control.type === 'file') {
    const side = control.name === 'frontFile' ? 'front' : 'back';
    if (control.files.length) files[side] = control.files[0];
    else delete files[side];
    showFileStatus();
  }
  if (['season', 'brand', 'series'].includes(control.name)) refreshSuggestions();
  invalidate();
  saveDraft();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  invalidate();
  const request = revision;
  status.textContent = '';
  try {
    const result = await planExport(valuesFromForm());
    if (request !== revision) return;
    exportPackage = result;
    renderReview(result);
  } catch (error) {
    if (request === revision) status.textContent = error.message;
  }
});
byId('export').addEventListener('click', async () => {
  const button = byId('export');
  if (!exportPackage) return;
  button.disabled = true;
  try {
    await exportFiles(exportPackage);
  } catch (error) {
    if (error.name !== 'AbortError') status.textContent = '导出失败。' + error.message;
  } finally {
    button.disabled = false;
  }
});
start().catch(error => { byId('setup-status').textContent = error.message; });
