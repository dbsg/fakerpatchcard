// 详情页逻辑
let currentCard = null;
let currentImageIndex = 0;

const placeholderNoteRe = /^(after|before|compare)_\d+$/;
const QUALITY_TAG_LABELS = {
  patch: 'Patch/材质',
  auto: '签字',
  serial: '编号',
  slab: '评级盒',
  comparison: '对比图'
};

const SOURCE_TYPE_LABELS = {
  web_public: '网络公开资料',
  user_submission: '公开反馈',
  manual_curation: '小丁卡册人工整理',
  official_image: '官方/评级资料',
  user_photo: '实拍图片',
  auction_platform: '拍卖平台',
  auction: '拍卖平台',
  social_share: '网络分享',
  web_ref: '网络分享',
  official: '官方图',
  grading_db: '评级机构数据库',
  other: '其他'
};

function getWarningText(category, status) {
  const warningTexts = {
    'fake-patch': {
      confirmed: {
        title: '资料提示：明确异常记录',
        desc: '这张卡已进入明确 Patch 异常记录：同一张卡出现 Patch 不一致，或已有明确换 Patch / 来源冲突记录。请仔细查看来源资料或者当前页面相关信息后再做判断，本网站不构成任何鉴定结论、交易建议或维权证据。'
      },
      suspected: {
        title: '资料提示：高度存疑线索',
        desc: '这张卡已进入高度存疑 Patch 线索：疑点来自同款卡 Patch 材质、位置、复杂度或球队/年份合理性对比，但尚未形成明确结论。请仔细查看来源资料或者当前页面相关信息后再做判断，本网站不构成任何鉴定结论、交易建议或维权证据。'
      }
    },
    counterfeit: {
      confirmed: {
        title: '资料提示：明确异常记录',
        desc: '这张卡已进入明确假卡记录：假卡仅凭图片通常难以完全判断。请仔细查看来源资料或者当前页面相关信息后再做判断，本网站不构成任何鉴定结论、交易建议或维权证据。'
      },
      suspected: {
        title: '资料提示：高度存疑线索',
        desc: '这张卡已进入高度存疑假卡线索：疑点主要来自同款卡、版式、编号或公开图片对比。假卡仅凭图片通常难以完全判断。请仔细查看来源资料或者当前页面相关信息后再做判断，本网站不构成任何鉴定结论、交易建议或维权证据。'
      }
    },
    'fake-auto': {
      confirmed: {
        title: '资料提示：明确异常记录',
        desc: '这张卡已进入明确签字异常记录：已有明确伪签、后签、涂改，或签字与可信资料明显冲突的记录。请仔细查看来源资料或者当前页面相关信息后再做判断，本网站不构成任何鉴定结论、交易建议或维权证据。'
      },
      suspected: {
        title: '资料提示：高度存疑线索',
        desc: '这张卡已进入高度存疑签字线索：疑点来自同款签字特征、笔迹、位置或公开图片对比，当前证据仍需补充。请仔细查看来源资料或者当前页面相关信息后再做判断，本网站不构成任何鉴定结论、交易建议或维权证据。'
      }
    }
  };
  return (warningTexts[category] || warningTexts['fake-patch'])[status];
}

function sanitizePublicSourceText(value) {
  return String(value || '')
    .replace(/小程序用[户戶]反馈/g, '小程序反馈')
    .replace(/用[户戶]投稿/g, '公开反馈')
    .replace(/用[户戶]实拍/g, '实拍图片')
    .replace(/上传用[户戶]\s*[:：]?\s*[A-Za-z0-9_-]*/g, '')
    .trim();
}

function getAfterTitle(category) {
  if (category === 'counterfeit') return '异常样本';
  if (category === 'fake-auto') return '签字样本';
  return 'Patch 异常样本';
}

function getBeforeTitle(category) {
  if (category === 'counterfeit') return '参考对比';
  if (category === 'fake-auto') return '原始签字参考';
  return '原始 Patch 参考';
}

function renderImageGroup(card, type, title) {
  const types = type === 'after' ? ['after', 'compare'] : [type];
  const images = card.images.filter(img => types.includes(img.type));
  if (images.length === 0) return '';

  const dotClass = type === 'after' ? 'dot-after' : 'dot-before';

  return `
    <div class="image-timeline">
      <div class="timeline-title">
        ${title}
        <span class="timeline-count">(${images.length}张)</span>
      </div>
      <div class="timeline-items">
        ${images.map(image => {
          const originalIndex = card.images.indexOf(image);
          const hasNote = image.note && !placeholderNoteRe.test(image.note);
          return `
            <div class="timeline-item">
              <div class="timeline-dot ${dotClass}"></div>
              <img
                class="timeline-image"
                src="${image.url}"
                alt="${hasNote ? image.note : ''}"
                onerror="this.src='images/placeholder.jpg'"
                onclick="openModal(${originalIndex})"
              >
              ${hasNote ? `<div class="timeline-note">📝 ${image.note}</div>` : ''}
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
  let warningBox = '';
  const wt = getWarningText(category, currentCard.status);
  if (wt) {
    const cls = currentCard.status === 'confirmed' ? 'warning-danger' : 'warning-caution';
    warningBox = `
      <div class="warning-box ${cls}">
        <p><strong>${wt.title}</strong></p>
        <p>${wt.desc}</p>
      </div>
    `;
  }

  // 构建问题说明的信息项（如果有的话）
  const highRiskReasonItem = currentCard.highRiskReason
    ? `<div class="detail-info-item detail-info-full">
        <span class="detail-label">问题说明</span>
        <span class="detail-value">${currentCard.highRiskReason}</span>
      </div>`
    : '';

  const qualityTagLabels = Array.isArray(currentCard.qualityTags)
    ? currentCard.qualityTags.map(tag => QUALITY_TAG_LABELS[tag] || tag).filter(Boolean)
    : [];
  const qualityTagItem = qualityTagLabels.length
    ? `<div class="detail-info-item detail-info-full">
        <span class="detail-label">识别项</span>
        <span class="detail-value">${qualityTagLabels.join('、')}</span>
      </div>`
    : '';
  const sourceTypeItem = currentCard.sourceType && SOURCE_TYPE_LABELS[currentCard.sourceType]
    ? `<div class="detail-info-item">
        <span class="detail-label">来源类型</span>
        <span class="detail-value">${SOURCE_TYPE_LABELS[currentCard.sourceType]}</span>
      </div>`
    : '';

  const sourceText = sanitizePublicSourceText(currentCard.source);
  const sourceItem = sourceText
    ? `<div class="detail-info-item detail-info-full">
        <span class="detail-label">资料来源</span>
        <span class="detail-value">${sourceText.startsWith('http') ? `<a href="${sourceText}" target="_blank" rel="noopener" class="source-link">${sourceText}</a>` : sourceText}</span>
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
          ${highRiskReasonItem}
          ${qualityTagItem}
          ${sourceTypeItem}
          ${sourceItem}
        </div>

        ${renderImageGroup(currentCard, 'after', getAfterTitle(category))}
        ${renderImageGroup(currentCard, 'before', getBeforeTitle(category))}
        <div class="reference-note">本资料仅用于收藏研究与卡片特征对比，不构成鉴定结论、交易建议或维权依据。</div>
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
  const hasNote = image.note && !placeholderNoteRe.test(image.note);

  modal.style.display = 'block';
  modalImg.src = image.url;
  caption.innerHTML = `
    <strong>记录 ${index + 1}</strong>
    ${hasNote ? `<br>${image.note}` : ''}
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
