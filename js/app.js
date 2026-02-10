// 主应用逻辑
const app = {
  // 当前显示的卡片数据
  currentCards: [],

  // 所有卡片数据
  allCards: cardsData,

  // 初始化
  init() {
    this.currentCards = [...this.allCards];
    this.populateYearFilter();
    this.renderCards();
    this.updateStats();
    this.hideLoading();
    this.setupSearchEnter();
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

    cardList.innerHTML = this.currentCards.map(card => {
      const hasChanged = card.images.length > 1;
      const badgeClass = hasChanged ? 'changed' : 'normal';
      const badgeText = hasChanged ? '有变化记录' : '初次记录';

      return `
        <div class="card-item" onclick="app.goToDetail(${card.id})">
          <div class="card-image-wrapper">
            <img class="card-image" src="${card.images[0].url}" alt="${card.player}" onerror="this.src='images/placeholder.jpg'">
            <span class="card-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="card-info">
            <div class="card-player">${card.player}</div>
            <div class="card-details">${card.brand} · ${card.year} · ${card.series}</div>
            <div class="card-meta">
              <span class="card-images-count">📸 ${card.images.length} 张照片</span>
              <span class="card-number">${card.number}</span>
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
        card.series.toLowerCase().includes(keyword) ||
        card.number.toLowerCase().includes(keyword)
      );
    }

    this.renderCards();
    this.updateStats();
  },

  // 按品牌筛选
  filterByBrand() {
    const brand = document.getElementById('brandFilter').value;
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    const year = document.getElementById('yearFilter').value;

    this.currentCards = this.allCards.filter(card => {
      const matchBrand = !brand || card.brand === brand;
      const matchKeyword = !keyword ||
        card.player.toLowerCase().includes(keyword) ||
        card.series.toLowerCase().includes(keyword) ||
        card.number.toLowerCase().includes(keyword);
      const matchYear = !year || card.year === year;

      return matchBrand && matchKeyword && matchYear;
    });

    this.renderCards();
    this.updateStats();
  },

  // 按年份筛选
  filterByYear() {
    this.filterByBrand(); // 复用品牌筛选逻辑
  },

  // 重置筛选
  resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('yearFilter').value = '';
    this.currentCards = [...this.allCards];
    this.renderCards();
    this.updateStats();
  },

  // 更新统计信息
  updateStats() {
    const total = this.currentCards.length;
    const changed = this.currentCards.filter(card => card.images.length > 1).length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('changedCount').textContent = changed;
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

数据来源：
- eBay、PWCC、Goldin等拍卖平台
- 社交媒体晒卡照片
- 收藏者社区举报

注意事项：
- 本站信息仅供参考，不构成法律依据
- 交易前请务必仔细核对
- 建议通过正规渠道购买
- 发现可疑卡片请及时举报

GitHub: https://github.com/yourusername/card`);
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
