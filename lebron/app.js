import { eras, features, filters, loadIndex, loadSeason, flatten, eraOf, imageUrl, variantLabel, filterValues, matches, ordered } from './catalog.js';

const byId = id => document.getElementById(id);
const atlas = byId('atlas');
const catalog = byId('catalog');
const form = byId('filters');
const stars = byId('stars');
const spotlight = byId('spotlight');
const dialog = byId('card-dialog');
const zoom = byId('zoom-dialog');
const random = byId('random');
const featureLabels = { ...features, numbered: '限编' };
let index;
let activeEra;
let allCards;
let allPending;
let currentCard;
let shownSide;
let activation;
let randomSeen = new Set();
let skyRequest = 0;
let skyKey;
let routeRequest = 0;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function hashFor(card) {
  return '#card/' + card.id;
}

function cardLink(card, text, className) {
  const link = element('a', text, className);
  link.href = hashFor(card);
  return link;
}

function picture(card, side = 'front') {
  const face = side === 'front' ? '正面' : '背面';
  const asset = card[side];
  const placeholder = () => element('span', face + '待补', 'placeholder');
  if (!asset) return placeholder();
  const image = element('img', '', 'card-picture');
  image.src = imageUrl(asset, true);
  image.alt = card.cardVariant + ' ' + face;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => image.replaceWith(placeholder()), { once: true });
  return image;
}

function drawDust() {
  const canvas = byId('dust');
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  const points = width < 490 ? 70 : 155;
  for (let index = 1; index <= points; index++) {
    const x = (index * .6180339887 % 1) * width;
    const y = (index * .4270509831 % 1) * height;
    const bright = index % 9 === 0;
    ctx.fillStyle = bright ? '#ffcf91aa' : '#f7e6ee56';
    ctx.beginPath();
    ctx.arc(x, y, bright ? 1.5 : .65, 0, Math.PI * 2);
    ctx.fill();
  }
}

function filterState() {
  const data = new FormData(form);
  const selected = Object.fromEntries(filters.map(([name]) => [name, data.getAll(name).filter(Boolean)]));
  return { search: data.get('q') || '', selected };
}

function filtered(cards) {
  const { search, selected } = filterState();
  return cards.filter(card => matches(card, search, selected));
}

async function catalogCards() {
  if (!allPending) {
    allPending = Promise.all(index.seasons.map(loadSeason)).then(datasets => {
      allCards = ordered(datasets.flatMap(flatten));
      const fronts = allCards.filter(card => card.front).length;
      const both = allCards.filter(card => card.front && card.back).length;
      byId('coverage').textContent = allCards.length + ' 个发行版本 · ' + fronts + ' 张有正图 · ' + both + ' 张正背齐全';
      setupFilters();
      return allCards;
    }).catch(error => {
      allPending = null;
      throw error;
    });
  }
  return allPending;
}

function highlight(card) {
  const link = cardLink(card, '', 'spotlight-card');
  const visual = picture(card);
  if (visual instanceof HTMLImageElement) visual.loading = 'eager';
  link.append(visual);
  const caption = element('small', card.title);
  caption.append(element('strong', variantLabel(card)));
  link.append(caption);
  spotlight.replaceChildren(link);
}

async function renderSky() {
  const { search, selected } = filterState();
  const nextKey = JSON.stringify([activeEra, search, selected]);
  const request = ++skyRequest;
  const era = eras[activeEra];
  byId('sky').style.setProperty('--accent', era.accent);
  byId('sky-era').textContent = era.name + ' · ' + era.range;
  Array.from(byId('timeline').children).forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === activeEra));
  });
  if (nextKey === skyKey) return;
  const season = index.seasons.findLast(season => eraOf(season) === activeEra);
  const hasFilter = search.trim() || Object.values(selected).some(values => values.length);
  const candidates = hasFilter ? filtered(await catalogCards()).filter(card => eraOf(card.season) === activeEra)
    : season ? flatten(await loadSeason(season)) : [];
  if (request !== skyRequest) return;
  skyKey = nextKey;
  stars.replaceChildren();
  spotlight.replaceChildren();
  if (!candidates.length) {
    spotlight.append(element('p', hasFilter ? '本星区没有匹配版本' : '卡片待收录', 'empty-sky'));
    return;
  }
  const sample = candidates.slice(0, 4);
  const first = sample.find(card => card.key === 'green' && card.front) || sample.find(card => card.front) || sample[0];
  highlight(first);
  for (const card of sample) {
    const star = element('button', '', 'star');
    star.type = 'button';
    star.setAttribute('aria-label', card.title + ' ' + variantLabel(card));
    const icon = element('span', '✦');
    icon.setAttribute('aria-hidden', 'true');
    star.append(icon);
    star.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') highlight(card); });
    star.addEventListener('focus', () => highlight(card));
    star.addEventListener('click', () => openCard(card.id, star));
    stars.append(star);
  }
}

function setupFilters() {
  const fields = byId('select-filters');
  const checks = byId('feature-filters');
  if (fields.childElementCount) return;
  for (const [key, caption] of filters) {
    const values = [...new Set(allCards.flatMap(card => filterValues(card, key)))];
    if (key === 'feature') {
      for (const [value, label] of Object.entries(featureLabels)) {
        const checkbox = element('input');
        checkbox.type = 'checkbox';
        checkbox.name = key;
        checkbox.value = value;
        const wrapper = element('label');
        wrapper.append(checkbox, label);
        checks.append(wrapper);
      }
    } else {
      const label = element('label', caption);
      const select = element('select');
      select.name = key;
      select.append(new Option('全部', ''));
      for (const value of values.sort((a, b) => a.localeCompare(b, 'zh-CN'))) {
        select.append(new Option(value, value));
      }
      label.append(select);
      fields.append(label);
    }
  }
}

function groupBy(items, toKey) {
  const groups = new Map();
  for (const item of items) {
    const key = toKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function renderCatalog() {
  if (!allCards) return;
  const groups = groupBy(filtered(allCards), card => card.season + '.' + card.product.key);
  const results = byId('results');
  results.replaceChildren();
  const hits = [...groups.values()].flat();
  byId('results-status').textContent = hits.length ? hits.length + ' 个匹配版本' : '没有匹配的卡片';
  for (const productCards of groups.values()) {
    const { season, product } = productCards[0];
    const section = element('section');
    section.append(element('h2', [season, product.brand, product.series].join(' '), 'product-title'));
    const issued = product.slots.flatMap(slot => slot.versions);
    const fronts = issued.filter(version => version.front).length;
    const both = issued.filter(version => version.front && version.back).length;
    const progress = product.checklistComplete ? ' · 正背完成 ' + Math.round(both / issued.length * 100) + '%' : '';
    section.append(element('p', issued.length + ' 个已确认版本 · ' + fronts + ' 张有正图 · ' + both + ' 张正背齐全' + progress, 'product-progress'));
    const grid = element('div', '', 'tile-grid');
    for (const slotCards of groupBy(productCards, card => card.slotId).values()) {
      const card = slotCards.find(card => card.front) || slotCards[0];
      const tile = cardLink(card, '', 'tile');
      tile.append(
        picture(card),
        element('span', '#' + card.slot.productNumber + ' · ' + card.slot.cardSubset, 'tile-title'),
        element('small', variantLabel(card)),
        element('small', slotCards.length + ' 个匹配版本 / ' + card.slot.versions.length + ' 个已收录版本')
      );
      grid.append(tile);
    }
    section.append(grid);
    results.append(section);
  }
}

function showSide(side) {
  shownSide = side;
  const face = byId('detail-face');
  const visual = picture(currentCard, side);
  if (visual instanceof HTMLImageElement) visual.loading = 'eager';
  if (currentCard[side]) {
    const button = element('button');
    button.type = 'button';
    button.setAttribute('aria-label', '放大' + (side === 'back' ? '背面' : '正面'));
    button.append(visual);
    button.addEventListener('click', () => {
      const zoomImage = byId('zoom-image');
      zoomImage.src = imageUrl(currentCard[shownSide]);
      zoomImage.alt = visual.alt;
      zoom.showModal();
    });
    face.replaceChildren(button);
  } else {
    face.replaceChildren(visual);
  }
  for (const button of document.querySelectorAll('[data-side]')) {
    button.setAttribute('aria-pressed', String(button.dataset.side === side));
  }
}

function sourceLink(text, source) {
  if (!source) return null;
  let url;
  try {
    url = new URL(source);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  const link = element('a', text);
  link.href = url.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function renderDetail(card, related) {
  currentCard = card;
  const info = element('section');
  const heading = element('h2', card.title);
  heading.id = 'detail-title';
  info.append(element('p', card.slot.cardSubset, 'eyebrow'), heading, element('p', variantLabel(card), 'detail-subtitle'));
  const meta = [...card.slot.subjects, card.scene.team, card.scene.color && card.scene.color + '球衣', card.scene.action,
    ...(card.scene.costars || []), ...(card.features || []).map(feature => featureLabels[feature])].filter(Boolean);
  info.append(element('p', meta.join(' · '), 'detail-meta'));
  info.append(element('h3', '卡背摘要'), element('p', card.cardSummary || '待补充', 'detail-summary'));
  if (card.cardSummaryEN) info.append(element('p', card.cardSummaryEN, 'detail-summary'));
  const sources = element('div', '', 'sources');
  for (const [caption, source] of [
    ['发行卡表', card.product.checklistSource], ['正面图', card.front?.source], ['背面图', card.back?.source]
  ]) {
    const link = sourceLink(caption, source);
    if (link) sources.append(link);
  }
  if (sources.childElementCount) info.append(element('h3', '来源'), sources);
  const visual = element('div', '', 'detail-visual');
  const face = element('div', '', 'detail-face');
  face.id = 'detail-face';
  const buttons = element('div', '', 'faces');
  for (const [side, label] of [['front', '正面'], ['back', '背面']]) {
    const button = element('button', label, 'quiet');
    button.type = 'button';
    button.dataset.side = side;
    button.addEventListener('click', () => showSide(side));
    buttons.append(button);
  }
  visual.append(face, buttons);
  const comparison = element('section', '', 'variants');
  comparison.append(element('h3', '同卡位版本'));
  const list = element('div', '', 'variant-list');
  for (const version of ordered(related)) {
    const link = cardLink(version);
    link.append(picture(version), element('span', variantLabel(version)));
    if (version.id === card.id) link.setAttribute('aria-current', 'true');
    list.append(link);
  }
  comparison.append(list);
  byId('card-detail').replaceChildren(visual, info, comparison);
  showSide(card.front || !card.back ? 'front' : 'back');
  if (!dialog.open) {
    if (activation?.trigger) {
      const origin = activation.trigger.getBoundingClientRect();
      dialog.style.setProperty('--enter-x', (origin.left + origin.width / 2 - innerWidth / 2) / 5 + 'px');
      dialog.style.setProperty('--enter-y', (origin.top + origin.height / 2 - innerHeight / 2) / 5 + 'px');
    } else {
      dialog.style.removeProperty('--enter-x');
      dialog.style.removeProperty('--enter-y');
    }
    dialog.showModal();
  }
}

function openCard(id, trigger) {
  const from = atlas.hidden ? '#catalog' : '#atlas';
  const next = '#card/' + id;
  if (location.hash.startsWith('#card/') && (dialog.open || activation)) {
    history.replaceState(history.state, '', next);
  } else {
    activation = { trigger, from };
    history.pushState({ lebronDetail: true }, '', next);
  }
  route().catch(showError);
}

function closeCard() {
  if (history.state?.lebronDetail) {
    history.back();
  } else {
    history.replaceState(null, '', activation?.from || '#atlas');
    route().catch(showError);
  }
}

function showError(error) {
  const message = byId('page-message');
  message.hidden = false;
  message.textContent = (error instanceof Error ? error.message : '资料读取失败') + '。请刷新重试。';
}

async function route() {
  const request = ++routeRequest;
  const hash = location.hash;
  byId('page-message').hidden = true;
  if (hash.startsWith('#card/')) {
    const id = hash.slice(6);
    const season = id.split('.')[0];
    if (!index.seasons.includes(season)) throw new Error('找不到这张卡');
    const seasonCards = flatten(await loadSeason(season));
    if (request !== routeRequest) return;
    const card = seasonCards.find(card => card.id === id);
    if (!card) throw new Error('找不到这张卡');
    renderDetail(card, seasonCards.filter(version => version.slotId === card.slotId));
    return;
  }
  if (zoom.open) zoom.close();
  if (dialog.open) {
    dialog.close();
    activation?.trigger?.focus();
  }
  activation = null;
  const showCatalog = hash === '#catalog';
  atlas.hidden = showCatalog;
  catalog.hidden = !showCatalog;
  byId('atlas-link').toggleAttribute('aria-current', !showCatalog);
  byId('catalog-link').toggleAttribute('aria-current', showCatalog);
  if (showCatalog) {
    byId('results-status').textContent = '正在读取发行目录…';
    await catalogCards();
    if (request === routeRequest) renderCatalog();
  } else {
    await renderSky();
  }
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#card/"]');
  if (!link || event.button || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  if (dialog.open && location.hash === link.hash) return;
  openCard(link.hash.slice(6), link);
});
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('input', () => {
  randomSeen.clear();
  byId('random-status').textContent = '';
  renderCatalog();
});
form.addEventListener('reset', () => setTimeout(() => {
  randomSeen.clear();
  byId('random-status').textContent = '';
  renderCatalog();
}));
byId('close-card').addEventListener('click', closeCard);
dialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeCard();
});
byId('close-zoom').addEventListener('click', () => zoom.close());

random.addEventListener('click', async () => {
  random.disabled = true;
  try {
    const options = filtered(await catalogCards()).filter(card => card.front);
    if (!options.length) {
      byId('random-status').textContent = '当前筛选没有可随机查看的正面图';
      return;
    }
    if (options.every(card => randomSeen.has(card.id))) randomSeen.clear();
    const unseen = options.filter(card => !randomSeen.has(card.id));
    const picked = unseen[Math.floor(Math.random() * unseen.length)];
    randomSeen.add(picked.id);
    byId('random-status').textContent = '';
    random.disabled = false;
    openCard(picked.id, random);
  } catch (error) {
    showError(error);
  } finally {
    random.disabled = false;
  }
});

async function start() {
  index = await loadIndex();
  activeEra = eraOf(index.seasons.at(-1) || '');
  if (activeEra < 0) activeEra = 0;
  byId('coverage').textContent = '已收录 ' + index.seasons.length + ' 个发行赛季';
  for (const [index, era] of eras.entries()) {
    const button = element('button', '', 'era');
    button.type = 'button';
    button.style.setProperty('--era-color', era.accent);
    button.append(element('span', era.name), element('small', era.range));
    button.addEventListener('click', () => {
      activeEra = index;
      renderSky().catch(showError);
    });
    byId('timeline').append(button);
  }
  new ResizeObserver(drawDust).observe(byId('sky'));
  random.disabled = false;
  window.addEventListener('hashchange', () => route().catch(showError));
  await route();
}

start().catch(showError);
