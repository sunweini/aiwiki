import request from './request'

export function listParks(params: any) {
  return request.get('/parks', { params })
}

export function getPark(id: number) {
  return request.get(`/parks/${id}`)
}

export function createPark(data: any) {
  return request.post('/parks', data)
}

export function updatePark(id: number, data: any) {
  return request.put(`/parks/${id}`, data)
}

export function deletePark(id: number) {
  return request.delete(`/parks/${id}`)
}

export function togglePark(id: number, status: number) {
  return request.post(`/parks/${id}/toggle`, { status })
}
