<template>
  <el-select v-model="currentView" size="small" placeholder="当前视角" style="width: 160px">
    <el-option label="平台总部视角" value="platform" />
    <el-option label="园区视角" value="park" />
    <el-option label="商户视角" value="shop" />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useViewStore } from '@/store/view'

const viewStore = useViewStore()
const currentView = ref(viewStore.currentView)

watch(currentView, (val) => {
  viewStore.setView(val)
  // TODO: re-fetch menu based on new view
})
</script>

<style scoped>
.el-select {
  background: var(--color-primary);
}
</style>
