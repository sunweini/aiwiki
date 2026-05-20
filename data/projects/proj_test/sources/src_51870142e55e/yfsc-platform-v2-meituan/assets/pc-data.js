// ============================================================
// 平台基础数据 & 三层 RBAC 模型
// ============================================================

// 角色定义 (按 PRD 2.2)
const ROLES = {
  ADMIN_PLATFORM: { name: '平台超级管理员', layer: '总部', avatar: '张', user: '张三' },
  PLATFORM_OPER:  { name: '总部运营', layer: '总部', avatar: '王', user: '王运营' },
  PARK_ADMIN:     { name: '园区管理员', layer: '园区', avatar: '李', user: '李四' },
  PARK_MANAGER:   { name: '园区经理', layer: '园区', avatar: '陈', user: '陈经理' },
  SHOP_ADMIN:     { name: '商户管理员', layer: '商户', avatar: '黄', user: '黄轩辉' },
  SHOP_CASHIER:   { name: '商户收银员', layer: '商户', avatar: '赵', user: '赵收银' },
};

// 视角 → 默认角色
const VIEW_TO_ROLE = {
  'platform': 'ADMIN_PLATFORM',
  'park-hm':  'PARK_ADMIN',
  'park-wh':  'PARK_ADMIN',
  'shop-hcct':'SHOP_ADMIN',
};

// 每个视角对应的菜单可见性 (按 PRD 2.2 + 第三/四章 模块划分)
//   true   = 可见可操作
//   false  = 不可见 (菜单隐藏)
//   'view' = 可见只读
const MENU_VISIBILITY = {
  platform: {
    'overview':1,'databoard':1,'parks':1,'park-list':1,'park-add':1,
    'shops':1,'shop-list':'view','shop-stats':'view','shop-types':'view',
    'users':1,'user-list':'view','user-stats':1,'recharge-records':'view',
    'consumption':1,'order-list':'view','refund':'view','verify':'view',
    'sales-stats':1,'flow-stats':1,'finance':'view','park-account':'view','withdraw':'view','reconcile':'view',
    'employees':1,'employee-list':1,'position-list':1,
    'gates':'view','gate-list':'view','face-list':'view','entry-records':'view',
    'activities':1,'activity-list':1,'activity-create':1,
    'permissions':1,'role-perm':1,
    'mp-mgmt':1,'mp-client':1,'mp-merchant':1,'mp-admin':1,
    'settings':1,'mp-config':1,'logs':1,
    'meituan':1,'meituan-dashboard':1,'meituan-records':1,'meituan-settlement':1,'meituan-config':1,
    'douyin':1,'douyin-dashboard':1,'douyin-records':1,'douyin-settlement':1,'douyin-config':1,
  },
  park: {
    'shops':1,'shop-list':1,'shop-stats':1,'shop-types':1,
    'users':1,'user-list':1,'user-stats':1,'recharge-records':1,
    'consumption':1,'order-list':1,'refund':1,'verify':1,
    'finance':1,'park-account':1,'withdraw':1,'reconcile':1,
    'gates':1,'gate-list':1,'face-list':1,'entry-records':1,
    'activities':1,'activity-list':1,
    'mp-client':1,'mp-merchant':1,'mp-admin':1,
    'meituan':1,'meituan-dashboard':1,'meituan-records':1,'meituan-settlement':1,'meituan-config':1,
    'douyin':1,'douyin-dashboard':1,'douyin-records':1,'douyin-settlement':1,'douyin-config':1,
  },
  shop: {
    'consumption':1,'order-list':1,'verify':1,'refund':1,
    'withdraw':1,
    'meituan':1,'meituan-dashboard':1,'meituan-records':1,'meituan-settlement':1,
    'douyin':1,'douyin-dashboard':1,'douyin-records':1,'douyin-settlement':1,
  }
};

// ============================================================
// Ant Design SVG 图标 (24x24 outlined, 2px stroke)
// ============================================================
function antIcon(name) {
  const icons = {
    home: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    chart: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    lineChart: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 20 9 12 15 16 21 4"/></svg>',
    building: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 18h6v4H9z"/></svg>',
    shop: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    creditCard: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    dollar: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    team: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    safety: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>',
    api: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"/><polyline points="8 12 12 8 16 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    merchant: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><line x1="12" y1="2" x2="12" y2="6"/></svg>',
    setting: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    swap: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
    scan: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>',
    tag: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    file: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    target: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    undo: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>',
    stop: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
    circle: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
    warning: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    sum: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    logout: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    download: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    key: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    image: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    truck: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polyline points="16 8 20 8 23 11 23 16 16 16"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    smile: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    mapPin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    reload: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
  };
  return icons[name] || name;
}

// 统计卡片 SVG 图标 (18x18)
function antStat(name) {
  const s = antIcon(name);
  return s ? s.replace('width="16" height="16"', 'width="18" height="18"') : name;
}

// 菜单结构 (完整 PRD 模块)
const FULL_MENU = [
  { section: '总览', items: [
    { id: 'overview',  icon: antIcon('home'), label: '园区总览', page: 'overview' },
    { id: 'databoard', icon: antIcon('dashboard'), label: '数据看板', page: 'databoard' },
    { id: 'sales-stats', icon: antIcon('chart'), label: '销售统计', page: 'sales-stats' },
    { id: 'flow-stats',  icon: antIcon('lineChart'), label: '客流统计', page: 'flow-stats' },
  ]},
  { section: '业务管理', items: [
    { id: 'parks', icon: antIcon('building'), label: '园区管理', sub: [
      { id: 'park-list', label: '园区列表', page: 'park-list' },
      { id: 'park-add',  label: '新增园区', page: 'park-add' },
    ]},
    { id: 'shops', icon: antIcon('shop'), label: '店铺管理', sub: [
      { id: 'shop-list',  label: '店铺列表',  page: 'shop-list' },
      { id: 'shop-stats', label: '店铺统计',  page: 'shop-stats' },
      { id: 'shop-types', label: '店铺类型',  page: 'shop-types' },
    ]},
    { id: 'users', icon: antIcon('user'), label: '客户管理', sub: [
      { id: 'user-list',        label: '客户列表', page: 'user-list' },
      { id: 'user-stats',       label: '客户统计', page: 'user-stats' },
      { id: 'recharge-records', label: '充值记录', page: 'recharge-records' },
    ]},
    { id: 'consumption', icon: antIcon('creditCard'), label: '消费管理', sub: [
      { id: 'order-list', label: '订单列表',  page: 'order-list' },
      { id: 'verify',     label: '核销管理',  page: 'verify' },
      { id: 'refund',     label: '退款处理',  page: 'refund' },
    ]},
    { id: 'meituan', icon: antIcon('tag'), label: '美团核销', sub: [
      { id: 'meituan-dashboard', label: '核销仪表盘', page: 'meituan-dashboard' },
      { id: 'meituan-records', label: '验券记录', page: 'meituan-records' },
      { id: 'meituan-settlement', label: '结算明细', page: 'meituan-settlement' },
      { id: 'meituan-config', label: 'API 配置', page: 'meituan-config' },
    ]},
    { id: 'douyin', icon: antIcon('play'), label: '抖音核销', sub: [
      { id: 'douyin-dashboard', label: '核销仪表盘', page: 'douyin-dashboard' },
      { id: 'douyin-records', label: '验券记录', page: 'douyin-records' },
      { id: 'douyin-settlement', label: '结算明细', page: 'douyin-settlement' },
      { id: 'douyin-config', label: 'API 配置', page: 'douyin-config' },
    ]},
  ]},
  { section: '园区运营', items: [
    { id: 'finance', icon: antIcon('dollar'), label: '财务管理', sub: [
      { id: 'park-account', label: '园区账户', page: 'park-account' },
      { id: 'withdraw',     label: '提现管理', page: 'withdraw' },
      { id: 'reconcile',    label: '对账单',  page: 'reconcile' },
    ]},
    { id: 'gates', icon: antIcon('scan'), label: '闸机管理', sub: [
      { id: 'gate-list',     label: '闸机列表', page: 'gate-list' },
      { id: 'face-list',     label: '人脸管理', page: 'face-list' },
      { id: 'entry-records', label: '进出记录', page: 'entry-records' },
    ]},
    { id: 'activities', icon: antIcon('gift'), label: '活动管理', sub: [
      { id: 'activity-list',   label: '活动列表', page: 'activity-list' },
      { id: 'activity-create', label: '创建活动', page: 'activity-create' },
    ]},
  ]},
  { section: '小程序管理', items: [
    { id: 'mp-client',   icon: antIcon('phone'), label: '客户端',   page: 'mp-client-mgmt' },
    { id: 'mp-merchant', icon: antIcon('merchant'), label: '商户端',   page: 'mp-merchant-mgmt' },
    { id: 'mp-admin',    icon: antIcon('setting'), label: '管理端',   page: 'mp-admin-mgmt' },
  ]},
  { section: '系统管理', items: [
    { id: 'permissions', icon: antIcon('safety'), label: '权限管理', sub: [
      { id: 'role-perm', label: '角色权限', page: 'role-perm' },
    ]},
    { id: 'employees', icon: antIcon('team'), label: '员工管理', sub: [
      { id: 'employee-list', label: '员工列表', page: 'employee-list' },
      { id: 'position-list', label: '岗位管理', page: 'position-list' },
    ]},
    { id: 'settings', icon: antIcon('setting'), label: '系统设置', sub: [
      { id: 'mp-config', label: '小程序配置', page: 'mp-config' },
      { id: 'logs',      label: '操作日志',   page: 'logs' },
    ]},
  ]},
];

// 视角 → 菜单可见性映射
function getMenuKey(view) {
  if (view === 'platform') return 'platform';
  if (view.startsWith('park')) return 'park';
  if (view.startsWith('shop')) return 'shop';
  return 'park';
}

// 视角 → 标题
const VIEW_TITLES = {
  'platform':  { title: '智慧园区平台', subtitle: '平台总部 · 全局视角', tag: '总部' },
  'park-hm':   { title: '黄梅袁夫稻田', subtitle: '园区管理 · 黄梅', tag: '园区' },
  'park-wh':   { title: '武汉袁夫稻田', subtitle: '园区管理 · 江夏', tag: '园区' },
  'shop-hcct': { title: '火车餐厅',     subtitle: '商户管理 · 黄梅园区', tag: '商户' },
};

// 模拟用户表
const USERS = [
  { id: 3005, nick: '稻田守望者',  phone: '187****9908', level: 'VIP2',     balance: 130.00, consumption: 256.50, faceState: '未录入', regAt: '2026-05-13 14:22', openid: 'oXG-2x...JK7v' },
  { id: 3004, nick: '田园生活家',  phone: '138****5678', level: 'VIP1',     balance:  50.00, consumption:  89.00, faceState: '已录入', regAt: '2026-04-20 10:15', openid: 'oXG-9P...zM3a' },
  { id: 3003, nick: '稻香一缕',    phone: '159****2345', level: '普通用户', balance:   0.00, consumption:  22.00, faceState: '未录入', regAt: '2026-04-15 08:30', openid: 'oXG-7t...Qm4b' },
  { id: 3002, nick: '小麦的麦',    phone: '152****6677', level: 'VIP3',     balance: 580.00, consumption: 942.30, faceState: '已录入', regAt: '2026-03-22 09:50', openid: 'oXG-3a...Yp9d' },
  { id: 3001, nick: '游客小新',    phone: '199****1122', level: '普通用户', balance:  10.00, consumption:  88.00, faceState: '已录入', regAt: '2026-02-09 16:57', openid: 'oXG-5f...Wq2e' },
];

// 模拟订单
const ORDERS = [
  { no:'202605141422001', user:'稻田守望者', shop:'火车餐厅',   amount:86.50, pay:'余额',     status:'已支付', time:'2026-05-14 14:22' },
  { no:'202605141315002', user:'田园生活家', shop:'树下咖啡',   amount:32.00, pay:'微信支付', status:'已核销', time:'2026-05-14 13:15' },
  { no:'202605141140003', user:'游客小新',  shop:'稻田手作坊', amount:22.00, pay:'余额',     status:'退款处理中', time:'2026-05-14 11:40' },
  { no:'202605141025004', user:'小麦的麦',  shop:'火车餐厅',   amount:128.00,pay:'余额',     status:'已核销', time:'2026-05-14 10:25' },
  { no:'202605140915005', user:'稻香一缕',  shop:'树下咖啡',   amount:46.00, pay:'微信支付', status:'已退款', time:'2026-05-14 09:15' },
];

// 模拟充值记录
const RECHARGES = [
  { id: 'CZ20260514102230', phone:'187****9908', amount: 200, gift: 30, pay:'微信支付', status:'成功',   txn:'4200001234202605141022', remark:'', at:'2026-05-14 10:22' },
  { id: 'TF20260513163019', phone:'138****5678', amount: 100, gift: 10, pay:'微信支付', status:'成功',   txn:'4200001234202605131630', remark:'', at:'2026-05-13 16:30' },
  { id: 'CZ20260513102211', phone:'152****6677', amount: 500, gift: 100,pay:'微信支付', status:'成功',   txn:'4200001234202605131022', remark:'', at:'2026-05-13 10:22' },
  { id: 'TK20260512091215', phone:'187****9908', amount:-50,  gift: 0,  pay:'微信支付', status:'已退款', txn:'TK20260512091215001',    remark:'用户申请余额退款', at:'2026-05-12 09:12' },
  { id: 'CZ20260511183055', phone:'199****1122', amount: 50,  gift: 0,  pay:'微信支付', status:'成功',   txn:'4200001234202605111830', remark:'', at:'2026-05-11 18:30' },
  { id: 'CZ20260510091523', phone:'187****9908', amount: 100, gift: 10, pay:'微信支付', status:'成功',   txn:'4200001234202605100915', remark:'', at:'2026-05-10 09:15' },
];

// 模拟退款申请
const REFUNDS = [
  { id: 'RF20260514114009', order:'202605141140003', user:'游客小新',   amount: 22.00, type:'订单退款', reason:'体验项目临时取消',     status:'待审核',  applyAt:'2026-05-14 12:00' },
  { id: 'RF20260512091200', order:'-',               user:'稻田守望者', amount: 50.00, type:'余额退款', reason:'账户停用申请全额提现', status:'已通过',  applyAt:'2026-05-12 09:12' },
  { id: 'RF20260510143055', order:'202605101040002', user:'小麦的麦',   amount: 38.00, type:'订单退款', reason:'菜品口味不符',         status:'已驳回',  applyAt:'2026-05-10 14:30' },
  { id: 'RF20260509164220', order:'-',               user:'李客户',     amount:120.00, type:'余额退款', reason:'用户主动申请',         status:'已通过',  applyAt:'2026-05-09 16:42' },
];

// 模拟店铺
const SHOPS = [
  { id: 1, name:'火车餐厅',   addr:'湖北省黄冈市黄梅县大河镇77号', type:'餐饮', status:'营业中', park:'黄梅袁夫稻田', createdAt:'2026-03-10 17:48' },
  { id: 2, name:'树下咖啡',   addr:'湖北省黄冈市黄梅县大河镇78号', type:'餐饮', status:'营业中', park:'黄梅袁夫稻田', createdAt:'2026-04-09 13:40' },
  { id: 3, name:'稻田手作坊', addr:'湖北省黄冈市黄梅县大河镇79号', type:'体验', status:'休息中', park:'黄梅袁夫稻田', createdAt:'2026-05-01 09:20' },
  { id: 4, name:'稻田鲜货铺', addr:'湖北省武汉市江夏区21号',       type:'零售', status:'营业中', park:'武汉袁夫稻田', createdAt:'2026-04-22 11:30' },
  { id: 5, name:'江夏火车厨', addr:'湖北省武汉市江夏区23号',       type:'餐饮', status:'营业中', park:'武汉袁夫稻田', createdAt:'2026-04-25 09:00' },
];

const PARKS = [
  { id:1, name:'黄梅袁夫稻田', code:'PARK_HM_001', addr:'湖北省黄冈市黄梅县大河镇', shopCount:3, status:'营业中', createdAt:'2026-01-21 16:37' },
  { id:2, name:'武汉袁夫稻田', code:'PARK_WH_001', addr:'湖北省武汉市江夏区',       shopCount:2, status:'营业中', createdAt:'2026-03-15 09:20' },
];

const EMPLOYEES = [
  { name:'张三',  username:'admin01',    phone:'13800138000', park:'-',           shop:'-',         role:'平台超级管理员', position:'平台运营',     online:true,  createdAt:'2026-01-05 15:09' },
  { name:'李四',  username:'park-hm',    phone:'13700137000', park:'黄梅袁夫稻田', shop:'-',         role:'园区管理员',    position:'园区经理',     online:true,  createdAt:'2026-02-09 16:57' },
  { name:'王五',  username:'hcct-mgr',   phone:'13912345678', park:'黄梅袁夫稻田', shop:'火车餐厅',  role:'商户管理员',    position:'火车餐厅经理', online:true,  createdAt:'2026-03-11 14:38' },
  { name:'赵六',  username:'hcct-sub',   phone:'13912345699', park:'黄梅袁夫稻田', shop:'火车餐厅',  role:'商户收银员',    position:'前厅主管',     online:false, createdAt:'2026-03-11 14:49' },
  { name:'孙七',  username:'shuxia-01',  phone:'18888888888', park:'黄梅袁夫稻田', shop:'树下咖啡',  role:'商户管理员',    position:'咖啡店长',     online:false, createdAt:'2026-04-09 13:41' },
  { name:'周八',  username:'park-wh',    phone:'13600136000', park:'武汉袁夫稻田', shop:'-',         role:'园区管理员',    position:'园区经理',     online:true,  createdAt:'2026-04-22 10:20' },
];

const ACTIVITIES = [
  { id:1, title:'🌾 夏日稻田音乐节',   type:'节日活动',  parkScope:'全部园区', shopScope:'全部商户', startAt:'2026-06-01', endAt:'2026-06-03', status:'进行中',  exposure:1245, joins:86,  orders:62, verifyRate:'72%' },
  { id:2, title:'🎫 充值送好礼',        type:'会员专享',  parkScope:'全部园区', shopScope:'全部商户', startAt:'2026-05-01', endAt:'2026-12-31', status:'进行中',  exposure:3580, joins:420, orders:380,verifyRate:'90%' },
  { id:3, title:'☕ 树下咖啡满减券',    type:'满减活动',  parkScope:'黄梅袁夫稻田', shopScope:'树下咖啡', startAt:'2026-05-10', endAt:'2026-05-25', status:'进行中',  exposure: 820, joins:160, orders:130,verifyRate:'81%' },
  { id:4, title:'🎁 五一假期满100减30', type:'限时折扣',  parkScope:'全部园区', shopScope:'全部商户', startAt:'2026-05-01', endAt:'2026-05-05', status:'已结束',  exposure:5320, joins:730, orders:680,verifyRate:'93%' },
  { id:5, title:'🚂 火车餐厅 6 月限定', type:'优惠券活动', parkScope:'黄梅袁夫稻田', shopScope:'火车餐厅', startAt:'2026-06-05', endAt:'2026-06-30', status:'待审核',  exposure: 0,    joins: 0,  orders: 0, verifyRate:'-' },
];

// 美团核销模拟数据
const MEITUAN_VERIFY_RECORDS = [
  { id:'MT20260514142201', couponCode:'MT-YF-8821-5023', product:'稻田双人套餐', originPrice:198.00, salePrice:128.00, user:'稻田守望者', phone:'187****9908', shop:'火车餐厅', status:'已核销', verifyBy:'王五', verifyAt:'2026-05-14 14:22', refundable:true },
  { id:'MT20260514131502', couponCode:'MT-YF-9942-7163', product:'树下咖啡体验券', originPrice:68.00, salePrice:39.90, user:'田园生活家', phone:'138****5678', shop:'树下咖啡', status:'已核销', verifyBy:'赵六', verifyAt:'2026-05-14 13:15', refundable:true },
  { id:'MT20260514102503', couponCode:'MT-YF-7710-5532', product:'火车特色套餐', originPrice:168.00, salePrice:99.00, user:'小麦的麦', phone:'152****6677', shop:'火车餐厅', status:'已撤销', verifyBy:'王五', verifyAt:'2026-05-14 10:25', refundable:false },
  { id:'MT20260514091504', couponCode:'MT-YF-3308-1247', product:'稻田米浆体验', originPrice:38.00, salePrice:19.90, user:'稻香一缕', phone:'159****2345', shop:'稻田手作坊', status:'已核销', verifyBy:'赵六', verifyAt:'2026-05-14 09:15', refundable:true },
  { id:'MT20260513203005', couponCode:'MT-YF-6621-8890', product:'稻田双人套餐', originPrice:198.00, salePrice:128.00, user:'游客小新', phone:'199****1122', shop:'火车餐厅', status:'已核销', verifyBy:'王五', verifyAt:'2026-05-13 20:30', refundable:false },
];

const MEITUAN_SETTLEMENTS = [
  { id:'MT-STL-20260514-001', shop:'火车餐厅', settleDate:'2026-05-14', orderCount:12, totalAmount:1420.50, commission:142.05, netAmount:1278.45, status:'待结算', period:'T+1' },
  { id:'MT-STL-20260513-002', shop:'火车餐厅', settleDate:'2026-05-13', orderCount:8, totalAmount:896.00, commission:89.60, netAmount:806.40, status:'已结算', period:'T+1' },
  { id:'MT-STL-20260514-003', shop:'树下咖啡', settleDate:'2026-05-14', orderCount:5, totalAmount:218.50, commission:21.85, netAmount:196.65, status:'待结算', period:'T+1' },
  { id:'MT-STL-20260513-004', shop:'树下咖啡', settleDate:'2026-05-13', orderCount:3, totalAmount:119.70, commission:11.97, netAmount:107.73, status:'已结算', period:'T+1' },
  { id:'MT-STL-20260514-005', shop:'稻田手作坊', settleDate:'2026-05-14', orderCount:2, totalAmount:39.80, commission:3.98, netAmount:35.82, status:'待结算', period:'T+1' },
];

const MEITUAN_STORE_CONFIGS = [
  { id:1, shop:'火车餐厅', appAuthToken:'MT-AUTH-HCCT-xxxx-xxxx-xxxx', status:'已绑定', bindAt:'2026-05-10 09:30', lastSync:'2026-05-14 14:25', verifyCount:42 },
  { id:2, shop:'树下咖啡', appAuthToken:'MT-AUTH-SXKF-xxxx-xxxx-xxxx', status:'已绑定', bindAt:'2026-05-11 14:20', lastSync:'2026-05-14 13:18', verifyCount:18 },
  { id:3, shop:'稻田手作坊', appAuthToken:'', status:'待绑定', bindAt:'-', lastSync:'-', verifyCount:0 },
];

// 抖音核销模拟数据
const DOUYIN_VERIFY_RECORDS = [
  { id:'DY20260514182001', couponCode:'DY-GROUP-A8K2-M9P1', product:'稻田丰收双人餐', originPrice:228.00, salePrice:158.00, user:'稻田守望者', phone:'187****9908', shop:'火车餐厅', couponType:'团购套餐', verifyCount:1, maxCount:1, status:'已核销', verifyBy:'王五', verifyAt:'2026-05-14 18:20', refundable:true },
  { id:'DY20260514163002', couponCode:'DY-GROUP-C3F7-R2X5', product:'精品手冲咖啡体验', originPrice:88.00, salePrice:49.90, user:'田园生活家', phone:'138****5678', shop:'树下咖啡', couponType:'团购套餐', verifyCount:1, maxCount:1, status:'已核销', verifyBy:'赵六', verifyAt:'2026-05-14 16:30', refundable:true },
  { id:'DY20260514150003', couponCode:'DY-CARD-T9W4-L8H6', product:'稻田米浆次卡 (10次)', originPrice:380.00, salePrice:199.00, user:'小麦的麦', phone:'152****6677', shop:'火车餐厅', couponType:'次卡', verifyCount:4, maxCount:10, status:'部分核销', verifyBy:'王五', verifyAt:'2026-05-14 15:00', refundable:false },
  { id:'DY20260514142004', couponCode:'DY-VOUCHER-B1N6-S3D8', product:'满100减20代金券', originPrice:20.00, salePrice:9.90, user:'稻香一缕', phone:'159****2345', shop:'树下咖啡', couponType:'代金券', verifyCount:1, maxCount:1, status:'已核销', verifyBy:'赵六', verifyAt:'2026-05-14 14:20', refundable:true },
  { id:'DY20260514105005', couponCode:'DY-GROUP-J5M2-K7Q9', product:'火车特色双人餐', originPrice:298.00, salePrice:188.00, user:'游客小新', phone:'199****1122', shop:'火车餐厅', couponType:'团购套餐', verifyCount:1, maxCount:1, status:'已撤销', verifyBy:'王五', verifyAt:'2026-05-14 10:50', refundable:false },
  { id:'DY20260513203006', couponCode:'DY-PACK-P4R9-H2V1', product:'稻田一日游组合券包', originPrice:456.00, salePrice:268.00, user:'稻田守望者', phone:'187****9908', shop:'火车餐厅', couponType:'组合券包', verifyCount:2, maxCount:3, status:'部分核销', verifyBy:'王五', verifyAt:'2026-05-13 20:30', refundable:true },
];

const DOUYIN_SETTLEMENTS = [
  { id:'DY-STL-20260514-001', shop:'火车餐厅', settleDate:'2026-05-14', orderCount:15, totalAmount:2280.50, commission:114.03, netAmount:2166.47, status:'待结算', period:'T+1', rate:'5%' },
  { id:'DY-STL-20260513-002', shop:'火车餐厅', settleDate:'2026-05-13', orderCount:10, totalAmount:1420.00, commission:71.00, netAmount:1349.00, status:'已结算', period:'T+1', rate:'5%' },
  { id:'DY-STL-20260514-003', shop:'树下咖啡', settleDate:'2026-05-14', orderCount:6, totalAmount:299.40, commission:14.97, netAmount:284.43, status:'待结算', period:'T+1', rate:'5%' },
  { id:'DY-STL-20260513-004', shop:'树下咖啡', settleDate:'2026-05-13', orderCount:4, totalAmount:199.60, commission:9.98, netAmount:189.62, status:'已结算', period:'T+1', rate:'5%' },
  { id:'DY-STL-20260514-005', shop:'稻田手作坊', settleDate:'2026-05-14', orderCount:2, totalAmount:49.80, commission:2.49, netAmount:47.31, status:'待结算', period:'T+1', rate:'5%' },
];

const DOUYIN_STORE_CONFIGS = [
  { id:1, shop:'火车餐厅', appAuthToken:'DY-AUTH-HCCT-xxxx-xxxx-xxxx', status:'已绑定', bindAt:'2026-05-12 10:15', lastSync:'2026-05-14 18:22', verifyCount:58, scope:'门店映射 + 商品管理' },
  { id:2, shop:'树下咖啡', appAuthToken:'DY-AUTH-SXKF-xxxx-xxxx-xxxx', status:'已绑定', bindAt:'2026-05-13 11:40', lastSync:'2026-05-14 16:35', verifyCount:22, scope:'门店映射' },
  { id:3, shop:'稻田手作坊', appAuthToken:'', status:'待绑定', bindAt:'-', lastSync:'-', verifyCount:0, scope:'-' },
];

// 园区财务 · 团购收入数据
const PARK_FINANCE = {
  platform: {
    totalRevenue: 1099.80 + 320.00,
    onlineRevenue: 1099.80,
    offlineRevenue: 320.00,
    meituanRevenue: 415.90,
    douyinRevenue: 683.90,
    balance: 4280.50 + 2166.47 + 1349.00,
    frozen: 0,
    withdrawn: 8420.00,
    totalIn: 12700.50 + 415.90 + 683.90,
  },
  parks: {
    'park-hm': {
      name: '黄梅袁夫稻田',
      totalRevenue: 732.80 + 240.00,
      onlineRevenue: 732.80,
      offlineRevenue: 240.00,
      meituanRevenue: 287.80,
      douyinRevenue: 445.00,
      balance: 4280.50,
      frozen: 0,
      withdrawn: 4260.00 + 2840.00 + 1320.00,
      shops: [
        { name:'火车餐厅', online:552.90, offline:240.00, meituan:206.90, douyin:346.00, balance:2180.50, frozen:0, withdrawn:4260.00 },
        { name:'树下咖啡', online:179.90, offline:80.00, meituan:80.90, douyin:99.00, balance:1840.00, frozen:0, withdrawn:2840.00 },
        { name:'稻田手作坊', online:0, offline:0, meituan:0, douyin:0, balance:260.00, frozen:0, withdrawn:1320.00 },
      ],
    },
    'park-wh': {
      name: '武汉袁夫稻田',
      totalRevenue: 367.00 + 80.00,
      onlineRevenue: 367.00,
      offlineRevenue: 80.00,
      meituanRevenue: 128.10,
      douyinRevenue: 238.90,
      balance: 0,
      frozen: 0,
      withdrawn: 0,
      shops: [
        { name:'稻田鲜货铺', online:160.00, offline:50.00, meituan:60.00, douyin:100.00, balance:0, frozen:0, withdrawn:0 },
        { name:'江夏火车厨', online:207.00, offline:30.00, meituan:68.10, douyin:138.90, balance:0, frozen:0, withdrawn:0 },
      ],
    },
  },
};

// 提现申请 · 增强数据 (含银行信息、流程状态)
const WITHDRAW_APPLICATIONS = [
  { id:'TX26051415070', shop:'火车餐厅', shopPark:'黄梅袁夫稻田', amount:1200.00, bankName:'招商银行', bankAccount:'6214****6908', bankHolder:'黄轩辉', status:'pending', applyAt:'2026-05-14 15:07', reconciliationId:'' },
  { id:'TX26051310220', shop:'树下咖啡', shopPark:'黄梅袁夫稻田', amount:800.00, bankName:'建设银行', bankAccount:'6217****3320', bankHolder:'孙七', status:'pending', applyAt:'2026-05-13 10:22', reconciliationId:'' },
];

const WITHDRAW_HISTORY = [
  { id:'TX26051209150', shop:'火车餐厅', shopPark:'黄梅袁夫稻田', amount:2400.00, bankName:'招商银行', bankAccount:'6214****6908', bankHolder:'黄轩辉', status:'paid', reconciliationId:'DZ20260512-FCCT', reviewer:'李四', reviewedAt:'2026-05-12 09:30', paidAt:'2026-05-12 09:35' },
  { id:'TX26050816220', shop:'树下咖啡', shopPark:'黄梅袁夫稻田', amount:1500.00, bankName:'建设银行', bankAccount:'6217****3320', bankHolder:'孙七', status:'paid', reconciliationId:'DZ20260508-SXKF', reviewer:'李四', reviewedAt:'2026-05-08 16:42', paidAt:'2026-05-08 16:50' },
  { id:'TX26050714050', shop:'稻田手作坊', shopPark:'黄梅袁夫稻田', amount:320.00, bankName:'农业银行', bankAccount:'6228****1190', bankHolder:'赵六', status:'rejected', reconciliationId:'', reviewer:'李四', reviewedAt:'2026-05-07 14:30', paidAt:'-' },
];

// 小程序配置 · 多小程序支持
const MINI_PROGRAMS = [
  { id:1, appId:'wx7c2a3b4e5d6f7890', name:'袁夫稻田·客户端', type:'client', typeLabel:'客户端', appSecret:'••••••••••••••••', callbackUrl:'https://api.yuanfu-rice.com/wx/client/callback', mchId:'1900012345', status:'active', version:'v2.3.1', publishedAt:'2026-05-12' },
  { id:2, appId:'wx8d3b4c5e6f7a8901', name:'袁夫稻田·商户端', type:'merchant', typeLabel:'商户端', appSecret:'••••••••••••••••', callbackUrl:'https://api.yuanfu-rice.com/wx/merchant/callback', mchId:'1900012345', status:'active', version:'v1.8.4', publishedAt:'2026-05-10' },
  { id:3, appId:'wx9e4c5d6f7a8b9012', name:'袁夫稻田·管理端', type:'admin', typeLabel:'管理端', appSecret:'••••••••••••••••', callbackUrl:'https://api.yuanfu-rice.com/wx/admin/callback', mchId:'1900012345', status:'active', version:'v1.5.2', publishedAt:'2026-05-08' },
];

// 商户视角 → 当前店铺映射
function getCurrentShop() {
  if (APP.view === 'shop-hcct') return '火车餐厅';
  return null;
}

// 商户视角数据过滤 (自动检测 shop 字段)
function shopData(data, field) {
  const shop = getCurrentShop();
  if (!shop) return data;
  const f = field || 'shop';
  return data.filter(item => item[f] === shop);
}

// 当前应用状态
const APP = {
  view: 'platform',
  page: 'overview',
  expanded: new Set(['shops', 'users', 'consumption', 'finance']),
};
