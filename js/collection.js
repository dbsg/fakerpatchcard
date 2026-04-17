const collection = {
  PASSWORD: '232323',
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],

  authenticate() {
    const input = document.getElementById('authPassword')
    if (input.value === this.PASSWORD) {
      document.getElementById('authPanel').style.display = 'none'
      document.getElementById('mainContent').style.display = 'block'
      this.renderSeriesList()
    } else {
      input.value = ''
      input.placeholder = '密码错误，请重试'
      input.classList.add('auth-input-error')
      setTimeout(() => {
        input.placeholder = '请输入密码'
        input.classList.remove('auth-input-error')
      }, 1500)
    }
  },

  renderSeriesList() {
    const container = document.getElementById('seriesList')
    if (!this.seriesData.length) {
      container.innerHTML = '<div class="col-empty">暂无收藏数据</div>'
      return
    }

    container.innerHTML = this.seriesData.map((series, idx) => {
      const cl = series.checklist || []
      const isFree = cl.length === 0
      const freeImages = series.freeImages || []

      let statsHtml
      if (isFree) {
        statsHtml = `<span class="col-series-stat">${freeImages.length} 张图片</span>`
      } else {
        const withImages = cl.filter(i => i.images && i.images.length > 0).length
        const pct = cl.length ? Math.round(withImages / cl.length * 100) : 0
        statsHtml = `
          <div class="col-progress"><div class="col-progress-fill" style="width:${pct}%"></div></div>
          <span class="col-series-stat">已收集 ${withImages} / ${cl.length} (${pct}%)</span>
        `
      }

      return `
        <div class="col-series-card" onclick="collection.openDetail(${idx})">
          <div class="col-series-icon">${series.name.charAt(0)}</div>
          <div class="col-series-info">
            <div class="col-series-name">${this.escHtml(series.name)}</div>
            ${statsHtml}
          </div>
        </div>
      `
    }).join('')
  },

  openDetail(idx) {
    const series = this.seriesData[idx]
    if (!series) return

    document.getElementById('modalTitle').textContent = series.name
    const body = document.getElementById('modalBody')
    const cl = series.checklist || []
    const isFree = cl.length === 0

    if (isFree) {
      const images = series.freeImages || []
      body.innerHTML = images.length
        ? `<div class="col-images">${images.map(img => this.renderImage(img)).join('')}</div>`
        : '<div class="col-empty-detail">暂无图片</div>'
    } else {
      const groups = this.buildGroups(cl)
      body.innerHTML = groups.map(g => `
        ${g.subset ? `<div class="col-subset-title">${this.escHtml(g.subset)}</div>` : ''}
        <div class="col-checklist">
          ${g.items.map(item => {
            const sorted = this.sortImages(item.images, item.text)
            return `
              <div class="col-card-block">
                <div class="col-card-text">${this.escHtml(item.text)}</div>
                ${sorted.length ? `<div class="col-images">${sorted.map(img => this.renderImage(img)).join('')}</div>` : ''}
              </div>
            `
          }).join('')}
        </div>
      `).join('')
    }

    document.getElementById('seriesModal').style.display = 'flex'
    document.body.style.overflow = 'hidden'
  },

  closeDetail() {
    document.getElementById('seriesModal').style.display = 'none'
    document.body.style.overflow = ''
  },

  renderImage(img) {
    const ownedLabel = img.owned ? '<span class="col-img-owned">拥有</span>' : ''
    const numberLabel = img.number ? `<span class="col-img-number">#${this.escHtml(img.number)}</span>` : ''
    return `
      <div class="col-img-wrap" onclick="event.stopPropagation(); collection.previewImage('${this.escAttr(img.url)}')">
        <img class="col-img" src="${this.escAttr(img.url)}" alt="" loading="lazy">
        ${ownedLabel}${numberLabel}
      </div>
    `
  },

  buildGroups(checklist) {
    const groups = []
    let current = null
    checklist.forEach(item => {
      if (!current || item.subset !== current.subset) {
        current = { subset: item.subset || '', items: [] }
        groups.push(current)
      }
      current.items.push(item)
    })
    return groups
  },

  sortImages(images, text) {
    if (!images || !images.length) return []
    const isNumbered = /\/\d+\s*$/.test(text || '')
    if (!isNumbered) return [...images]
    return [...images].sort((a, b) => {
      const na = parseInt(a.number) || 9999
      const nb = parseInt(b.number) || 9999
      return na - nb
    })
  },

  previewImage(url) {
    document.getElementById('previewImg').src = url
    document.getElementById('imagePreview').style.display = 'flex'
  },

  closePreview() {
    document.getElementById('imagePreview').style.display = 'none'
    document.getElementById('previewImg').src = ''
  },

  escHtml(s) {
    const d = document.createElement('div')
    d.textContent = s
    return d.innerHTML
  },

  escAttr(s) {
    return s.replace(/'/g, "\\'").replace(/"/g, '&quot;')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('authPassword').addEventListener('keypress', e => {
    if (e.key === 'Enter') collection.authenticate()
  })
})
