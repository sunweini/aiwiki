import request from './request'

export function getDashboard(params?: any) {
  return request.get('/meituan/dashboard', { params })
}

export function listRecords(params?: any) {
  return request.get('/meituan/records', { params })
}

export function listSettlements(params?: any) {
  return request.get('/meituan/settlements', { params })
}

export function triggerSettlement(data: { shop_id: number; date: string }) {
  return request.post('/meituan/settlements/trigger', data)
}

export function listStores() {
  return request.get('/meituan/stores')
}

export function upsertStore(data: any) {
  return request.post('/meituan/stores', data)
}

export function getConfig() {
  return request.get('/meituan/config')
}

export function updateConfig(data: any) {
  return request.put('/meituan/config', data)
}
