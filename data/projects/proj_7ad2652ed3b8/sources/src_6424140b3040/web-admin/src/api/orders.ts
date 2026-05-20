import request from './request'

export function listOrders(params: any) {
  return request.get('/orders', { params })
}

export function getOrder(id: number) {
  return request.get(`/orders/${id}`)
}

export function verifyOrder(id: number) {
  return request.post(`/orders/${id}/verify`)
}

export function refundOrder(id: number, data: any) {
  return request.post(`/orders/${id}/refund`, data)
}

export function listRefunds(params: any) {
  return request.get('/refunds', { params })
}

export function reviewRefund(id: number, data: any) {
  return request.post(`/refunds/${id}/review`, data)
}
