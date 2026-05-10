const assert = require('assert')
const fs = require('fs')
const path = require('path')

const clientAccess = require('../miniprogram-card/utils/seriesAccess')
const cloudAccess = require('../miniprogram-card/cloudfunctions/seriesOps/accessPolicy')

const root = path.join(__dirname, '..')
const collectionSeriesJs = fs.readFileSync(path.join(root, 'miniprogram-card/pages/collection-series/collection-series.js'), 'utf8')
const collectionSeriesWxml = fs.readFileSync(path.join(root, 'miniprogram-card/pages/collection-series/collection-series.wxml'), 'utf8')
const adminJs = fs.readFileSync(path.join(root, 'miniprogram-card/pages/admin/admin.js'), 'utf8')
const adminWxml = fs.readFileSync(path.join(root, 'miniprogram-card/pages/admin/admin.wxml'), 'utf8')
const collectionData = fs.readFileSync(path.join(root, 'miniprogram-card/utils/collectionData.js'), 'utf8')
const seriesOps = fs.readFileSync(path.join(root, 'miniprogram-card/cloudfunctions/seriesOps/index.js'), 'utf8')

function verifyAccessPolicy(policy, label) {
  const publicSeries = {
    accessType: 'public',
    creatorOpenid: 'creator',
    managerOpenids: ['manager']
  }
  const personalSeries = {
    accessType: 'personal',
    creatorOpenid: 'creator',
    managerOpenids: ['manager']
  }

  assert.strictEqual(policy.canContributeToSeries(publicSeries, 'viewer', false), true, `${label}: public series should allow ordinary contribution`)
  assert.strictEqual(policy.canManageSeriesContent(publicSeries, 'viewer', false), false, `${label}: ordinary public user should not manage content`)
  assert.strictEqual(policy.canDeleteSeriesContent(publicSeries, 'viewer', false), false, `${label}: ordinary public user should not delete series`)

  assert.strictEqual(policy.canContributeToSeries(publicSeries, 'manager', false), true, `${label}: approved series manager should contribute`)
  assert.strictEqual(policy.canManageSeriesContent(publicSeries, 'manager', false), true, `${label}: approved series manager should manage content`)
  assert.strictEqual(policy.canDeleteSeriesContent(publicSeries, 'manager', false), false, `${label}: approved series manager should not delete the series`)

  assert.strictEqual(policy.canContributeToSeries(personalSeries, 'manager', false), true, `${label}: approved personal-series manager should contribute`)
  assert.strictEqual(policy.canManageSeriesContent(personalSeries, 'manager', false), true, `${label}: approved personal-series manager should manage content`)
  assert.strictEqual(policy.canDeleteSeriesContent(personalSeries, 'manager', false), false, `${label}: approved personal-series manager should not delete personal series`)

  assert.strictEqual(policy.canManageSeriesContent(personalSeries, 'creator', false), true, `${label}: personal creator should manage content`)
  assert.strictEqual(policy.canDeleteSeriesContent(personalSeries, 'creator', false), true, `${label}: personal creator should still delete own personal series`)

  assert.strictEqual(policy.canManageSeriesContent(publicSeries, 'admin', true), true, `${label}: global admin should manage content`)
  assert.strictEqual(policy.canDeleteSeriesContent(publicSeries, 'admin', true), true, `${label}: global admin should delete series`)
}

verifyAccessPolicy(clientAccess, 'client')
verifyAccessPolicy(cloudAccess, 'cloud')

assert(collectionSeriesJs.includes('getSeriesManagerApplicationStatus'), 'collection series page should load current manager application status')
assert(collectionSeriesJs.includes('applySeriesManager()'), 'collection series page should submit manager applications')
assert(collectionSeriesWxml.includes('managerApplicationLabel'), 'collection series page should show manager application action')
assert(collectionSeriesWxml.includes('wx:if="{{canDelete}}" class="action-btn action-btn-danger"'), 'delete series action should remain gated by canDelete')
assert(collectionSeriesWxml.includes('wx:if="{{hasSubset && canManageSeries}}" class="batch-migrate-btn"'), 'content batch migration should be gated by content manager permission')

assert(adminJs.includes('loadManagerApplicationList'), 'admin page should load manager applications')
assert(adminJs.includes('reviewManagerApplication'), 'admin page should review manager applications')
assert(adminWxml.includes('data-tab="seriesManager"'), 'admin page should expose manager application tab')
assert(adminWxml.includes('data-decision="approved"'), 'admin page should approve manager applications')
assert(adminWxml.includes('data-decision="rejected"'), 'admin page should reject manager applications')

assert(collectionData.includes('applySeriesManager(seriesId)'), 'collectionData should expose manager application submission')
assert(collectionData.includes('reviewSeriesManagerApplication(applicationId, decision)'), 'collectionData should expose manager application review')
assert(seriesOps.includes('seriesManagerApplicationsCol'), 'seriesOps should use a manager application collection')
assert(seriesOps.includes("action === 'applySeriesManager'"), 'seriesOps should route manager application submission')
assert(seriesOps.includes("action === 'reviewSeriesManagerApplication'"), 'seriesOps should route manager application review')
assert(seriesOps.includes('assertCanManageSeries(target.series, openid)'), 'seriesOps should allow content managers to remove or replace series images')

console.log('series manager permission tests passed')
