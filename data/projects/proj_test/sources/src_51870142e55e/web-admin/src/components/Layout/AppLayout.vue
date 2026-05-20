<template>
  <div class="pc-layout">
    <div class="pc-sider">
      <Sidebar />
    </div>
    <div class="pc-main">
      <div class="pc-header">
        <div class="pc-breadcrumb">
          <router-link to="/overview">首页</router-link>
          <span class="sep">/</span>
          <span class="current">{{ pageTitle }}</span>
        </div>
        <div class="pc-header-actions">
          <span style="font-size:14px;color:var(--ant-text-2);cursor:pointer">用户 ▾</span>
        </div>
      </div>
      <div class="pc-content">
        <router-view />
      </div>
      <div class="view-switcher">
        <ViewSwitch />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import ViewSwitch from './ViewSwitch.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || '')
</script>

<style scoped>
.pc-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width, 220px) 1fr;
  height: 100vh;
}
.pc-sider {
  overflow: hidden;
}
.pc-main {
  background: var(--ant-bg-layout);
  display: flex; flex-direction: column; overflow: hidden;
}
.pc-header {
  height: 56px; background: #fff;
  border-bottom: 1px solid var(--ant-border-secondary);
  display: flex; align-items: center; gap: 16px;
  padding: 0 24px;
}
.pc-breadcrumb {
  font-size: 13px; color: var(--ant-text-3);
  display: flex; align-items: center; gap: 6px;
}
.pc-breadcrumb a { color: var(--ant-text-3); text-decoration: none; }
.pc-breadcrumb a:hover { color: var(--ant-primary); }
.pc-breadcrumb .sep { color: var(--ant-text-disabled); }
.pc-breadcrumb .current { color: var(--ant-text-1); font-weight: 500; }
.pc-header-actions { margin-left: auto; }
.pc-content {
  flex: 1; overflow-y: auto; padding: 16px 24px 24px;
}
.view-switcher {
  position: fixed; bottom: 12px; left: calc(var(--sidebar-width, 220px) / 2);
  transform: translateX(-50%); z-index: 100;
}
.pc-content::-webkit-scrollbar { width: 6px; }
.pc-content::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
</style>
