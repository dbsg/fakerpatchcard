// 详情页逻辑
let currentCard = null;
let currentImageIndex = 0;

function renderImageGroup(card, type, title) {
  const images = card.images.filter(img => img.type === type);
  if (images.length === 0) return '';

  const dotClass = type === 'after' ? 'dot-after' : type === 'before' ? 'dot-before' : 'dot-compare';

  return `
    <div class="image-timeline">
      <div class="timeline-title">
        ${title}
        <span class="timeline-count">(${images.length}张)</span>
      </div>
      <div class="timeline-items">
        ${images.map(image => {
          const originalIndex = card.images.indexOf(image);
          return `
            <div class="timeline-item">
              <div class="timeline-dot ${dotClass}"></div>
              <img
                class="timeline-image"
                src="${image.url}"
                alt="${image.note}"
                onerror="this.src='images/placeholder.jpg'"
                onclick="openModal(${originalIndex})"
              >
              <div class="timeline-note">📝 ${image.note}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

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

  const category = currentCard.category || 'fake-patch';
  const warningTexts = {
    'fake-patch': {
      confirmed: { title: '🚫 确认警告：此卡片已确认为换Patch卡', desc: '该卡片经过对比和验证，已确认Patch被替换。<strong>强烈建议不要购买此类卡片。</strong>' },
      suspected: { title: '⚠️ 高危警示：此卡片疑似换Patch', desc: '根据同款卡片对比或相关经验判断，该卡换Patch的概率很大。<strong>请谨慎购买，建议进一步核实。</strong>' }
    },
    'counterfeit': {
      confirmed: { title: '🚫 确认警告：此卡片已确认为假卡（伪造/复刻）', desc: '该卡片经过验证，已确认为伪造或复刻卡。<strong>强烈建议不要购买此类卡片。</strong>' },
      suspected: { title: '⚠️ 高危警示：此卡片疑似为假卡', desc: '根据相关经验判断，该卡为伪造/复刻的概率很大。<strong>请谨慎购买，建议进一步核实。</strong>' }
    },
    'fake-auto': {
      confirmed: { title: '🚫 确认警告：此卡片签字已确认被涂改或伪造', desc: '该卡片签字经过验证，已确认存在涂改或伪造。<strong>强烈建议不要购买此类卡片。</strong>' },
      suspected: { title: '⚠️ 高危警示：此卡片签字疑似被涂改或伪造', desc: '根据相关经验判断，该卡签字被涂改或伪造的概率很大。<strong>请谨慎购买，建议进一步核实。</strong>' }
    }
  };

  let warningBox = '';
  const wt = (warningTexts[category] || warningTexts['fake-patch'])[currentCard.status];
  if (wt) {
    const cls = currentCard.status === 'confirmed' ? 'warning-danger' : 'warning-caution';
    warningBox = `
      <div class="warning-box ${cls}">
        <p><strong>${wt.title}</strong></p>
        <p>${wt.desc}</p>
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

        ${renderImageGroup(currentCard, 'after', category === 'counterfeit' ? '🔴 问题卡片照片' : category === 'fake-auto' ? '🔴 涂改/伪造后' : '🔴 换 Patch 后')}
        ${category !== 'counterfeit' ? renderImageGroup(currentCard, 'before', category === 'fake-auto' ? '🟢 原始签字' : '🟢 换 Patch 前') : ''}
        ${renderImageGroup(currentCard, 'compare', '🔍 对比图')}
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
