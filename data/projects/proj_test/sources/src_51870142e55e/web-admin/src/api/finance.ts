import request from './request'

export function getAccount(params: any) {
  return request.get('/finance/account', { params })
}

export function createWithdraw(data: any) {
  return request.post('/finance/withdraw', data)
}

export function listWithdraws(params: any) {
  return request.get('/finance/withdraws', { params })
}

export function reviewWithdraw(id: number, data: any) {
  return request.post(`/finance/withdraws/${id}/review`, data)
}

export function listReconcile(params: any) {
  return request.get('/finance/reconcile', { params })
}
