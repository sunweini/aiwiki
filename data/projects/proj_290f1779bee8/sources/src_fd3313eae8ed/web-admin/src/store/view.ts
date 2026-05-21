import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useViewStore = defineStore('view', () => {
  const currentView = ref<'platform' | 'park' | 'shop'>('platform')

  function setView(view: 'platform' | 'park' | 'shop') {
    currentView.value = view
  }

  return { currentView, setView }
})
