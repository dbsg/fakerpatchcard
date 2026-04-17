const collection = {
  PASSWORD: '232323',
  SESSION_KEY: 'col_auth',
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],

  init() {
    if (sessionStorage.getItem(this.SESSION_KEY) === '1') {
      document.getElementById('authPanel').style.display = 'none'
      document.getElementById('mainContent').style.display = 'block'
      this.renderSeriesList()
    }
  },

  authenticate() {
    const input = document.getElementById('authPassword')
    if (input.value === this.PASSWORD) {
      sessionStorage.setItem(this.SESSION_KEY, '1')
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
        <a href="collection-detail.html?idx=${idx}" class="col-series-card">
          <div class="col-series-icon">${series.name.charAt(0)}</div>
          <div class="col-series-info">
            <div class="col-series-name">${this.escHtml(series.name)}</div>
            ${statsHtml}
          </div>
        </a>
      `
    }).join('')
  },

  escHtml(s) {
    const d = document.createElement('div')
    d.textContent = s
    return d.innerHTML
  }
}

document.addEventListener('DOMContentLoaded', () => {
  collection.init()
  document.getElementById('authPassword').addEventListener('keypress', e => {
    if (e.key === 'Enter') collection.authenticate()
  })
})
