// 主应用逻辑
const app = {
  // 当前显示的卡片数据
  currentCards: [],

  // 所有卡片数据
  allCards: cardsData,

  // 分页相关
  currentPage: 1,
  pageSize: 6,

  // 初始化
  init() {
    this.currentCards = [...this.allCards];
    this.populatePlayerFilter();
    this.populateBrandFilter();
    this.populateYearFilter();
    this.renderCards();
    this.updateStats();
    this.renderPagination();
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
      document.getElementById('pagination').style.display = 'none';
      return;
    }

    cardList.style.display = 'grid';
    emptyState.style.display = 'none';
    document.getElementById('pagination').style.display = 'flex';

    // 按 ID 降序排列（新添加的在前面）
    const sortedCards = [...this.currentCards].sort((a, b) => b.id - a.id);

    // 计算分页
    const totalPages = Math.ceil(sortedCards.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedCards = sortedCards.slice(startIndex, endIndex);

    cardList.innerHTML = paginatedCards.map(card => {
      // 显示最后一张图片（最新状态）
      const latestImage = card.images[card.images.length - 1];

      // 根据状态显示标签
      const badgeClass = card.status === 'suspected' ? 'suspected' : 'fake';
      const badgeText = card.status === 'suspected' ? '高危' : '假';

      return `
        <div class="card-item" onclick="app.goToDetail(${card.id})">
          <div class="card-image-wrapper">
            <img class="card-image" src="${latestImage.url}" alt="${card.player}" onerror="this.src='images/placeholder.jpg'">
            <span class="card-badge ${badgeClass}">${badgeText}</span>
            <span class="card-id">ID: ${card.id}</span>
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

    this.renderPagination();
  },

  // 搜索
  search() {
    this.applyFilters();
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

    this.currentPage = 1; // 重置到第一页
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
    this.currentPage = 1; // 重置到第一页
    this.renderCards();
    this.updateStats();
  },

  // 渲染分页
  renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(this.currentCards.length / this.pageSize);

    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    pagination.style.display = 'flex';

    let paginationHTML = '';

    // 上一页按钮
    paginationHTML += `
      <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}"
              onclick="app.goToPage(${this.currentPage - 1})"
              ${this.currentPage === 1 ? 'disabled' : ''}>
        上一页
      </button>
    `;

    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="app.goToPage(1)">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="page-ellipsis">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="page-btn ${i === this.currentPage ? 'active' : ''}"
                onclick="app.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="page-ellipsis">...</span>`;
      }
      paginationHTML += `<button class="page-btn" onclick="app.goToPage(${totalPages})">${totalPages}</button>`;
    }

    // 下一页按钮
    paginationHTML += `
      <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
              onclick="app.goToPage(${this.currentPage + 1})"
              ${this.currentPage === totalPages ? 'disabled' : ''}>
        下一页
      </button>
    `;

    pagination.innerHTML = paginationHTML;
  },

  // 跳转到指定页
  goToPage(page) {
    const totalPages = Math.ceil(this.currentCards.length / this.pageSize);
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    this.renderCards();

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    // 实时搜索：input事件
    searchInput.addEventListener('input', () => {
      this.applyFilters();
    });
    // 同时保留回车事件
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.applyFilters();
      }
    });
  },

  // 显示关于信息
  showAbout() {
    alert(`球星卡换 Patch 记录系统

这是一个用于记录被换 Patch 的球星卡的公益项目，帮助收藏者识别和避免购买到被篡改的卡片。

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
