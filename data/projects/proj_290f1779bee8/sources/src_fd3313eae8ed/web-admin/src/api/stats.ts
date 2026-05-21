import request from './request'

export function getSalesOverview(params: any) {
  return request.get('/stats/sales', { params })
}

export function getSalesTrend(params: any) {
  return request.get('/stats/sales/trend', { params })
}

export function getSalesByShop(params: any) {
  return request.get('/stats/sales/by-shop', { params })
}

export function getFlowOverview(params: any) {
  return request.get('/stats/flow', { params })
}

export function getFlowTrend(params: any) {
  return request.get('/stats/flow/trend', { params })
}

export function getFlowHeatmap(params: any) {
  return request.get('/stats/flow/heatmap', { params })
}

export function getUserGrowth() {
  return request.get('/stats/user-growth')
}
