import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Employee {
  id: number
  username: string
  real_name: string
  role: string
  park_id?: number
  shop_id?: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('access_token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
  const employee = ref<Employee | null>(null)

  function setAuth(t: string, rt: string, emp: Employee) {
    token.value = t
    refreshToken.value = rt
    employee.value = emp
    localStorage.setItem('access_token', t)
    localStorage.setItem('refresh_token', rt)
  }

  function logout() {
    token.value = ''
    refreshToken.value = ''
    employee.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return { token, refreshToken, employee, setAuth, logout }
})
