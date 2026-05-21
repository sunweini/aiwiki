import request from './request'

export function listUsers(params: any) {
  return request.get('/users', { params })
}

export function getUser(id: number) {
  return request.get(`/users/${id}`)
}

export function createUser(data: any) {
  return request.post('/users', data)
}

export function updateUser(id: number, data: any) {
  return request.put(`/users/${id}`, data)
}

export function getUserStats() {
  return request.get('/users/stats')
}

export function getUserRecharges(userId: number, params: any) {
  return request.get(`/users/${userId}/recharges`, { params })
}
