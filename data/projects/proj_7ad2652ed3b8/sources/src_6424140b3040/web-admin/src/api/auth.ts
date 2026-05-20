import request from './request'

export function login(username: string, password: string) {
  return request.post('/auth/login', { username, password })
}

export function getMenu(view: string) {
  return request.get('/rbac/menu', { params: { view } })
}

export function listRoles() {
  return request.get('/rbac/roles')
}
