const ISSUE_OPTIONS = [
  { value: 'info', label: '资料内容有误' },
  { value: 'dispute', label: '异常认定有异议' }
]
const DECISION_LABELS = {
  corrected: '已修正资料', maintained: '维持异常认定', revoked: '异常认定已撤销',
  deferred: '暂无法核实', dismissed: '未采纳'
}
const HIDDEN_STATUSES = ['pending', 'revoked']

function isAbnormalCorrection(record = {}) {
  return record.type === 'abnormal_card_correction' || (!record.type && !!record.cardId)
}

function isPubliclyVisible(card = {}) {
  return !card.deleted && !HIDDEN_STATUSES.includes(card.reviewStatus)
}

function formatCorrection(record = {}) {
  return {
    ...record,
    issueLabel: (ISSUE_OPTIONS.find(item => item.value === record.issueType) || ISSUE_OPTIONS[0]).label,
    resultLabel: DECISION_LABELS[record.reviewDecision] || (record.status === 'pending' ? '待处理' : record.status === 'resolved' ? '已处理' : '未采纳')
  }
}

const abnormalReviewPolicy = { ISSUE_OPTIONS, DECISION_LABELS, HIDDEN_STATUSES, isAbnormalCorrection, isPubliclyVisible, formatCorrection }
if (typeof module !== 'undefined' && module.exports) module.exports = abnormalReviewPolicy
if (typeof window !== 'undefined') window.abnormalReview = abnormalReviewPolicy
