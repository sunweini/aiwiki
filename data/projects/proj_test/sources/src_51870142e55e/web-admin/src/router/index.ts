import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
  },
  {
    path: '/',
    component: AppLayout,
    redirect: '/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/Overview/index.vue'),
        meta: { title: '园区总览', icon: 'HomeFilled' },
      },
      // Parks
      {
        path: 'parks',
        name: 'Parks',
        component: () => import('@/views/Park/List.vue'),
        meta: { title: '园区管理' },
      },
      // Shops
      {
        path: 'shops',
        name: 'Shops',
        component: () => import('@/views/Shop/List.vue'),
        meta: { title: '店铺管理' },
      },
      {
        path: 'shop-stats',
        name: 'ShopStats',
        component: () => import('@/views/Shop/List.vue'),
        meta: { title: '店铺统计' },
      },
      // Users
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/User/List.vue'),
        meta: { title: '客户管理' },
      },
      {
        path: 'user-stats',
        name: 'UserStats',
        component: () => import('@/views/User/List.vue'),
        meta: { title: '客户统计' },
      },
      // Orders
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Order/List.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'refunds',
        name: 'Refunds',
        component: () => import('@/views/Order/List.vue'),
        meta: { title: '退款处理' },
      },
      // Finance
      {
        path: 'finance/account',
        name: 'FinanceAccount',
        component: () => import('@/views/Finance/Account.vue'),
        meta: { title: '园区账户' },
      },
      {
        path: 'finance/withdraw',
        name: 'FinanceWithdraw',
        component: () => import('@/views/Finance/Withdraw.vue'),
        meta: { title: '提现管理' },
      },
      {
        path: 'finance/reconcile',
        name: 'FinanceReconcile',
        component: () => import('@/views/Finance/Reconcile.vue'),
        meta: { title: '对账单' },
      },
      // Data Dashboard
      {
        path: 'databoard',
        name: 'Databoard',
        component: () => import('@/views/Databoard/index.vue'),
        meta: { title: '数据看板' },
      },
      {
        path: 'sales-stats',
        name: 'SalesStats',
        component: () => import('@/views/SalesStats/index.vue'),
        meta: { title: '销售统计' },
      },
      {
        path: 'flow-stats',
        name: 'FlowStats',
        component: () => import('@/views/FlowStats/index.vue'),
        meta: { title: '客流统计' },
      },
      // Operations
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/views/Employee/List.vue'),
        meta: { title: '员工管理' },
      },
      {
        path: 'gates',
        name: 'Gates',
        component: () => import('@/views/Gate/List.vue'),
        meta: { title: '闸机管理' },
      },
      {
        path: 'activities',
        name: 'Activities',
        component: () => import('@/views/Activity/List.vue'),
        meta: { title: '活动管理' },
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: () => import('@/views/Permission/index.vue'),
        meta: { title: '权限管理' },
      },
      // Meituan
      { path: 'meituan', name: 'Meituan', redirect: '/meituan/dashboard', children: [
        { path: 'dashboard', name: 'MeituanDashboard', component: () => import('@/views/Meituan/Dashboard.vue'), meta: { title: '美团仪表盘' } },
        { path: 'records', name: 'MeituanRecords', component: () => import('@/views/Meituan/Records.vue'), meta: { title: '美团验券记录' } },
        { path: 'settlement', name: 'MeituanSettlement', component: () => import('@/views/Meituan/Settlement.vue'), meta: { title: '美团结算' } },
        { path: 'config', name: 'MeituanConfig', component: () => import('@/views/Meituan/Config.vue'), meta: { title: '美团配置' } },
      ]},
      // Douyin
      { path: 'douyin', name: 'Douyin', redirect: '/douyin/dashboard', children: [
        { path: 'dashboard', name: 'DouyinDashboard', component: () => import('@/views/Douyin/Dashboard.vue'), meta: { title: '抖音仪表盘' } },
        { path: 'records', name: 'DouyinRecords', component: () => import('@/views/Douyin/Records.vue'), meta: { title: '抖音验券记录' } },
        { path: 'settlement', name: 'DouyinSettlement', component: () => import('@/views/Douyin/Settlement.vue'), meta: { title: '抖音结算' } },
        { path: 'config', name: 'DouyinConfig', component: () => import('@/views/Douyin/Config.vue'), meta: { title: '抖音配置' } },
      ]},
      // Settings
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings/index.vue'),
        meta: { title: '系统设置' },
      },
      {
        path: 'mp-config',
        name: 'MPConfig',
        component: () => import('@/views/Settings/MPConfig.vue'),
        meta: { title: '小程序配置' },
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/Logs/index.vue'),
        meta: { title: '操作日志' },
      },
    ],
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  if (to.matched.some(r => r.meta.requiresAuth) && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
