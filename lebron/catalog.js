export const eras = [
  { name: '骑士一期', range: '2003–2010', start: 2003, accent: '#f69079' },
  { name: '热火', range: '2010–2014', start: 2010, accent: '#fdab79' },
  { name: '骑士二期', range: '2014–2018', start: 2014, accent: '#dc8aaf' },
  { name: '湖人', range: '2018 起', start: 2018, accent: '#c8a5ff' }
];
export const features = { rc: '新秀', auto: '签字', relic: '实物切片' };
export const filters = [
  ['season', '赛季'], ['series', '产品'], ['team', '画面球队'], ['color', '球衣色'], ['action', '动作'],
  ['feature', '卡片特征']
];

const seasons = new Map();
const imageRoot = new URL('./images/', import.meta.url);

async function readData(file) {
  const response = await fetch(new URL('./data/' + file + '.json', import.meta.url));
  if (!response.ok) throw new Error('目录读取失败（' + response.status + '）');
  return response.json();
}

export const loadIndex = () => readData('index');

export function loadSeason(season) {
  if (!seasons.has(season)) {
    seasons.set(season, readData(season).catch(error => {
      seasons.delete(season);
      throw error;
    }));
  }
  return seasons.get(season);
}

export function versionId(season, product, slot, version) {
  return [season, product.key, slot.key, version.key].join('.');
}

export function flatten(dataset) {
  const { season, products } = dataset;
  return products.flatMap(product => product.slots.flatMap(slot => slot.versions.map(version => ({
    ...version, season, product, slot,
    scene: { ...slot.scene, ...version.scene },
    id: versionId(season, product, slot, version),
    slotId: [season, product.key, slot.key].join('.'),
    title: [season, product.brand, product.series, '#' + slot.productNumber].join(' ')
  }))));
}

export function eraOf(season) {
  const year = Number(season.slice(0, 4));
  return eras.findLastIndex(era => year >= era.start);
}

export function imageUrl(asset, thumbnail = false) {
  return new URL(thumbnail ? asset.thumb : asset.file, imageRoot).href;
}

export function variantLabel(card) {
  return [card.cardVariant, card.cardVariantCN, card.printRun === 1 ? '1/1' : card.printRun && '/' + card.printRun]
    .filter(Boolean).join(' · ');
}

export function filterValues(card, name) {
  if (name === 'feature') return (card.features || []).concat(card.printRun ? 'numbered' : []);
  if (name === 'series') return [card.product.brand + ' ' + card.product.series];
  return [name === 'season' ? card.season : card.scene[name]].filter(Boolean);
}

function keywords(value) {
  return value.toLowerCase().normalize('NFKC').replace(/[‐‑–—]/g, '-').trim();
}

export function matches(card, search, selected) {
  const haystack = keywords([
    card.title, card.slot.productNumber, card.slot.cardSubset, card.slot.cardTitle,
    card.cardVariant, card.cardVariantCN, ...card.slot.subjects, '勒布朗 詹姆斯',
    card.scene.team, card.scene.color, card.scene.action, ...(card.scene.costars || [])
  ].join(' '));
  return keywords(search).split(/\s+/).every(term => haystack.includes(term))
    && Object.entries(selected).every(([name, values]) =>
      values.every(value => filterValues(card, name).includes(value)));
}

export function ordered(cards) {
  return [...cards].sort((a, b) =>
    a.season.localeCompare(b.season)
    || a.product.series.localeCompare(b.product.series)
    || a.slot.productNumber.localeCompare(b.slot.productNumber, 'en', { numeric: true })
    || (b.printRun || Infinity) - (a.printRun || Infinity)
  );
}
