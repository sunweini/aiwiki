import request from './request'

export function listShops(params: any) {
  return request.get('/shops', { params })
}

export function getShop(id: number) {
  return request.get(`/shops/${id}`)
}

export function createShop(data: any) {
  return request.post('/shops', data)
}

export function updateShop(id: number, data: any) {
  return request.put(`/shops/${id}`, data)
}

export function deleteShop(id: number) {
  return request.delete(`/shops/${id}`)
}

export function getShopStats() {
  return request.get('/shops/stats')
}

export function getShopQRCode(id: number) {
  return request.get(`/shops/${id}/qrcode`)
}
