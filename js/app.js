// 主应用逻辑
const app = {
  // 当前显示的卡片数据
  currentCards: [],

  // 所有卡片数据
  allCards: cardsData,

  // 初始化
  init() {
    this.currentCards = [...this.allCards];
    this.populatePlayerFilter();
    this.populateBrandFilter();
    this.populateYearFilter();
    this.renderCards();
    this.updateStats();
    this.hideLoading();
    this.setupSearchEnter();
  },

  // 填充球员筛选器
  populatePlayerFilter() {
    const players = [...new Set(this.allCards.map(card => card.player))].sort();
    const playerFilter = document.getElementById('playerFilter');
    players.forEach(player => {
      const option = document.createElement('option');
      option.value = player;
      option.textContent = player;
      playerFilter.appendChild(option);
    });
  },

  // 填充品牌筛选器
  populateBrandFilter() {
    const brands = [...new Set(this.allCards.map(card => card.brand))].sort();
    const brandFilter = document.getElementById('brandFilter');
    brands.forEach(brand => {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      brandFilter.appendChild(option);
    });
  },

  // 填充年份筛选器
  populateYearFilter() {
    const years = [...new Set(this.allCards.map(card => card.year))].sort((a, b) => b - a);
    const yearFilter = document.getElementById('yearFilter');
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
  },

  // 渲染卡片列表
  renderCards() {
    const cardList = document.getElementById('cardList');
    const emptyState = document.getElementById('emptyState');

    if (this.currentCards.length === 0) {
      cardList.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    cardList.style.display = 'grid';
    emptyState.style.display = 'none';

    // 按 ID 降序排列（新添加的在前面）
    const sortedCards = [...this.currentCards].sort((a, b) => b.id - a.id);

    cardList.innerHTML = sortedCards.map(card => {
      // 显示最后一张图片（最新状态）
      const latestImage = card.images[card.images.length - 1];

      return `
        <div class="card-item" onclick="app.goToDetail(${card.id})">
          <div class="card-image-wrapper">
            <img class="card-image" src="${latestImage.url}" alt="${card.player}" onerror="this.src='images/placeholder.jpg'">
          </div>
          <div class="card-info">
            <div class="card-player">${card.player}</div>
            <div class="card-details">${card.brand} · ${card.year} · ${card.series}</div>
            <div class="card-meta">
              <span class="card-images-count">📸 ${card.images.length} 张照片</span>
              <span class="card-number">${card.number}编</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // 搜索
  search() {
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();

    if (!keyword) {
      this.currentCards = [...this.allCards];
    } else {
      this.currentCards = this.allCards.filter(card =>
        card.player.toLowerCase().includes(keyword) ||
        (card.playerCN && card.playerCN.includes(keyword)) ||
        card.series.toLowerCase().includes(keyword) ||
        card.number.toLowerCase().includes(keyword)
      );
    }

    this.renderCards();
    this.updateStats();
  },

  // 应用所有筛选条件
  applyFilters() {
    const player = document.getElementById('playerFilter').value;
    const brand = document.getElementById('brandFilter').value;
    const year = document.getElementById('yearFilter').value;
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();

    this.currentCards = this.allCards.filter(card => {
      const matchPlayer = !player || card.player === player;
      const matchBrand = !brand || card.brand === brand;
      const matchYear = !year || card.year === year;
      const matchKeyword = !keyword ||
        card.player.toLowerCase().includes(keyword) ||
        (card.playerCN && card.playerCN.includes(keyword)) ||
        card.series.toLowerCase().includes(keyword) ||
        card.number.toLowerCase().includes(keyword);

      return matchPlayer && matchBrand && matchYear && matchKeyword;
    });

    this.renderCards();
    this.updateStats();
  },

  // 重置筛选
  resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('playerFilter').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('yearFilter').value = '';
    this.currentCards = [...this.allCards];
    this.renderCards();
    this.updateStats();
  },

  // 更新统计信息
  updateStats() {
    const total = this.currentCards.length;
    document.getElementById('totalCount').textContent = total;
  },

  // 跳转到详情页
  goToDetail(id) {
    window.location.href = `detail.html?id=${id}`;
  },

  // 隐藏加载动画
  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  },

  // 设置搜索框回车事件
  setupSearchEnter() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.search();
      }
    });
  },

  // 显示关于信息
  showAbout() {
    alert(`球星卡换Patch记录系统

这是一个用于记录被换Patch的球星卡的公益项目，帮助收藏者识别和避免购买到被篡改的卡片。

注意事项：
- 本站信息仅供参考，不构成法律依据
- 交易前请务必仔细核对
- 建议通过正规渠道购买
- 发现可疑卡片请及时举报`);
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
