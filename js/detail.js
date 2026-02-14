// 详情页逻辑
let currentCard = null;
let currentImageIndex = 0;

// 获取URL参数
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// 加载卡片详情
function loadCardDetail() {
  const cardId = parseInt(getQueryParam('id'));

  if (!cardId) {
    showError('未找到卡片ID');
    return;
  }

  currentCard = cardsData.find(card => card.id === cardId);

  if (!currentCard) {
    showError('未找到该卡片');
    return;
  }

  renderDetail();
  hideLoading();
}

// 渲染详情内容
function renderDetail() {
  const detailContent = document.getElementById('detailContent');

  // 根据状态显示不同的警告
  let warningBox = '';
  if (currentCard.status === 'confirmed') {
    warningBox = `
      <div class="warning-box warning-danger">
        <p><strong>🚫 确认警告：此卡片已确认为换Patch卡</strong></p>
        <p>该卡片经过对比和验证，已确认Patch被替换。<strong>强烈建议不要购买此类卡片。</strong></p>
      </div>
    `;
  } else if (currentCard.status === 'suspected') {
    warningBox = `
      <div class="warning-box warning-caution">
        <p><strong>⚠️ 高危警示：此卡片疑似换Patch</strong></p>
        <p>虽未找到该卡片的原始对比图片，但根据同款卡片对比或相关经验判断，该卡换Patch的概率很大。<strong>请谨慎购买，建议进一步核实。</strong></p>
      </div>
    `;
  }

  // 构建高危原因的信息项（如果有的话）
  const highRiskReasonItem = currentCard.highRiskReason
    ? `<div class="detail-info-item detail-info-full">
        <span class="detail-label">高危原因</span>
        <span class="detail-value">${currentCard.highRiskReason}</span>
      </div>`
    : '';

  detailContent.innerHTML = `
    <div class="detail-container">
      <div class="detail-card">
        <h2 class="detail-title">${currentCard.player}</h2>

        ${warningBox}

        <div class="detail-info-grid">
          <div class="detail-info-item">
            <span class="detail-label">品牌</span>
            <span class="detail-value">${currentCard.brand}</span>
          </div>
          <div class="detail-info-item">
            <span class="detail-label">年份</span>
            <span class="detail-value">${currentCard.year}</span>
          </div>
          <div class="detail-info-item">
            <span class="detail-label">系列</span>
            <span class="detail-value">${currentCard.series}</span>
          </div>
          <div class="detail-info-item">
            <span class="detail-label">编号</span>
            <span class="detail-value">${currentCard.number}</span>
          </div>
          <div class="detail-info-item">
            <span class="detail-label">照片记录</span>
            <span class="detail-value">${currentCard.images.length} 张</span>
          </div>
          ${highRiskReasonItem}
        </div>

        <div class="image-timeline">
          <div class="timeline-title">
            照片记录
            <span class="timeline-count">(共${currentCard.images.length}张)</span>
          </div>

          <div class="timeline-items">
            ${currentCard.images.slice().reverse().map((image, reverseIndex) => {
              const originalIndex = currentCard.images.length - 1 - reverseIndex;
              return `
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-header">
                  <span class="timeline-index">记录 ${originalIndex + 1}</span>
                </div>
                <img
                  class="timeline-image"
                  src="${image.url}"
                  alt="记录 ${originalIndex + 1}"
                  onerror="this.src='images/placeholder.jpg'"
                  onclick="openModal(${originalIndex})"
                >
                <div class="timeline-note">
                  📝 ${image.note}
                </div>
              </div>
            `}).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 打开图片模态框
function openModal(index) {
  currentImageIndex = index;
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const caption = document.getElementById('modalCaption');

  const image = currentCard.images[index];

  modal.style.display = 'block';
  modalImg.src = image.url;
  caption.innerHTML = `
    <strong>记录 ${index + 1}</strong><br>
    ${image.note}
  `;
}

// 关闭模态框
function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
}

// 切换图片
function navigateImage(direction) {
  currentImageIndex += direction;

  if (currentImageIndex < 0) {
    currentImageIndex = currentCard.images.length - 1;
  } else if (currentImageIndex >= currentCard.images.length) {
    currentImageIndex = 0;
  }

  openModal(currentImageIndex);
}

// 显示错误
function showError(message) {
  const detailContent = document.getElementById('detailContent');
  detailContent.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❌</div>
      <p class="empty-text">${message}</p>
      <br>
      <a href="index.html" class="search-btn">返回首页</a>
    </div>
  `;
  hideLoading();
}

// 隐藏加载动画
function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
}

// 键盘事件
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('imageModal');
  if (modal.style.display === 'block') {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      navigateImage(-1);
    } else if (e.key === 'ArrowRight') {
      navigateImage(1);
    }
  }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  loadCardDetail();
});
