import request from './request'

export function getDashboard(params?: any) {
  return request.get('/douyin/dashboard', { params })
}

export function listRecords(params?: any) {
  return request.get('/douyin/records', { params })
}

export function listSettlements(params?: any) {
  return request.get('/douyin/settlements', { params })
}

export function triggerSettlement(data: { shop_id: number; date: string }) {
  return request.post('/douyin/settlements/trigger', data)
}

export function listStores() {
  return request.get('/douyin/stores')
}

export function upsertStore(data: any) {
  return request.post('/douyin/stores', data)
}

export function getConfig() {
  return request.get('/douyin/config')
}

export function updateConfig(data: any) {
  return request.put('/douyin/config', data)
}
