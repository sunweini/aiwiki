<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo-icon">禾</div>
      <div class="sidebar-title">袁夫稻田</div>
    </div>
    <nav class="sidebar-nav">
      <div v-for="section in menu" :key="section.section" class="pc-nav-section">
        <div class="pc-nav-section-title">{{ section.section }}</div>
        <template v-for="item in section.items" :key="item.id">
          <router-link
            v-if="!item.children"
            :to="item.path"
            class="pc-nav-item"
            :class="{ active: item.path === route.path }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            {{ item.label }}
          </router-link>
          <div v-else>
            <div
              class="pc-nav-item"
              :class="{ active: isSectionActive(item.children) }"
              @click="toggleExpand(item.id)"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              {{ item.label }}
              <span class="nav-arrow">{{ expanded.has(item.id) ? '▾' : '▸' }}</span>
            </div>
            <div v-if="expanded.has(item.id)" class="pc-nav-sub">
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="pc-nav-item"
                :class="{ active: child.path === route.path }"
              >
                {{ child.label }}
              </router-link>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const expanded = ref(new Set<string>())

function toggleExpand(id: string) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

function isSectionActive(children: { path: string }[]) {
  return children.some(c => c.path === route.path)
}

const menu = [
  { section: '总览', items: [
    { id: 'overview', icon: '⌂', label: '园区总览', path: '/overview' },
    { id: 'databoard', icon: '▦', label: '数据看板', path: '/databoard' },
    { id: 'sales-stats', icon: '◉', label: '销售统计', path: '/sales-stats' },
    { id: 'flow-stats', icon: '⛬', label: '客流统计', path: '/flow-stats' },
  ]},
  { section: '业务管理', items: [
    { id: 'parks', icon: '⌘', label: '园区管理', children: [
      { label: '园区列表', path: '/parks' },
    ]},
    { id: 'shops', icon: '⧈', label: '店铺管理', children: [
      { label: '店铺列表', path: '/shops' },
    ]},
    { id: 'users', icon: '⊚', label: '客户管理', children: [
      { label: '客户列表', path: '/users' },
    ]},
    { id: 'consumption', icon: '◈', label: '消费管理', children: [
      { label: '订单列表', path: '/orders' },
      { label: '退款处理', path: '/refunds' },
    ]},
    { id: 'meituan', icon: '☷', label: '美团核销', children: [
      { label: '核销仪表盘', path: '/meituan/dashboard' },
      { label: '验券记录', path: '/meituan/records' },
      { label: '结算明细', path: '/meituan/settlement' },
      { label: 'API 配置', path: '/meituan/config' },
    ]},
    { id: 'douyin', icon: '♫', label: '抖音核销', children: [
      { label: '核销仪表盘', path: '/douyin/dashboard' },
      { label: '验券记录', path: '/douyin/records' },
      { label: '结算明细', path: '/douyin/settlement' },
      { label: 'API 配置', path: '/douyin/config' },
    ]},
  ]},
  { section: '园区运营', items: [
    { id: 'finance', icon: '¥', label: '财务管理', children: [
      { label: '园区账户', path: '/finance/account' },
      { label: '提现管理', path: '/finance/withdraw' },
      { label: '对账单', path: '/finance/reconcile' },
    ]},
    { id: 'gates', icon: '⊞', label: '闸机管理', children: [
      { label: '闸机列表', path: '/gates' },
    ]},
    { id: 'activities', icon: '◉', label: '活动管理', children: [
      { label: '活动管理', path: '/activities' },
    ]},
  ]},
  { section: '系统管理', items: [
    { id: 'permissions', icon: '⊡', label: '权限管理', path: '/permissions' },
    { id: 'employees', icon: '⊞', label: '员工管理', children: [
      { label: '员工列表', path: '/employees' },
    ]},
    { id: 'settings', icon: '⚙', label: '系统设置', children: [
      { label: '小程序配置', path: '/mp-config' },
      { label: '操作日志', path: '/logs' },
    ]},
  ]},
]
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid var(--ant-border-secondary);
}
.sidebar-header {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border-bottom: 1px solid var(--ant-border-secondary);
}
.logo-icon {
  width: 32px; height: 32px; border-radius: 6px;
  background: linear-gradient(135deg, var(--brand-green), var(--brand-gold));
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 16px;
}
.sidebar-title {
  font-size: 15px; font-weight: 600; color: var(--ant-text-1);
}
.sidebar-nav {
  flex: 1; overflow-y: auto; padding: 4px 8px 16px;
}
.pc-nav-section { margin-top: 12px; }
.pc-nav-section-title {
  font-size: 11px; color: var(--ant-text-3); text-transform: uppercase;
  letter-spacing: 0.05em; padding: 6px 12px;
}
.pc-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; margin: 2px 0;
  border-radius: 6px; cursor: pointer;
  font-size: 13px; color: var(--ant-text-1);
  transition: all 0.15s; user-select: none;
  text-decoration: none;
}
.pc-nav-item:hover { background: var(--ant-fill-tertiary); color: var(--ant-text-1); }
.pc-nav-item.active { background: var(--ant-primary-bg); color: var(--ant-primary); font-weight: 500; }
.nav-icon { width: 16px; text-align: center; font-size: 14px; }
.nav-arrow { margin-left: auto; font-size: 10px; opacity: 0.5; }
.pc-nav-sub .pc-nav-item { padding: 6px 12px 6px 38px; font-size: 13px; margin: 1px 0; }
.sidebar-nav::-webkit-scrollbar { width: 6px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
</style>
