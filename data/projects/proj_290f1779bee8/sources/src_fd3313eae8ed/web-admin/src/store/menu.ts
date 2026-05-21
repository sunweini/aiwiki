import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MenuItem {
  id: string
  label: string
  page?: string
  sub?: MenuItem[]
}

export const useMenuStore = defineStore('menu', () => {
  const items = ref<MenuItem[]>([])

  function setMenu(menu: MenuItem[]) {
    items.value = menu
  }

  return { items, setMenu }
})
