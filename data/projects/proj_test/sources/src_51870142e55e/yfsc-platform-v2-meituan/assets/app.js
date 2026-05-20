// ============================================================
// 应用主入口 — 平台切换 / PC 导航 / 渲染调度
// ============================================================

// ============ 平台切换 ============
document.getElementById('platformTabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.platform-tab');
  if (!tab) return;
  document.querySelectorAll('.platform-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  const platform = tab.dataset.platform;
  document.querySelectorAll('.pc-layout, .mobile-layout').forEach(el => el.classList.remove('active'));
  document.getElementById('platform-' + platform).classList.add('active');
});

// ============ PC 视角切换 ============
document.getElementById('viewSwitch').addEventListener('change', (e) => {
  switchView(e.target.value);
});

function switchView(view) {
  APP.view = view;
  document.getElementById('viewSwitch').value = view;
  const role = ROLES[VIEW_TO_ROLE[view]];
  document.getElementById('userAvatar').textContent = role.avatar;
  document.getElementById('userName').textContent = role.user;
  document.getElementById('userRole').textContent = role.name;

  // 切到一个该视角可见的页面
  const menuKey = getMenuKey(view);
  const vis = MENU_VISIBILITY[menuKey];
  if (!vis[APP.page] || vis[APP.page] === false) {
    // 园区/商户视角跳转到对应默认页
    if (menuKey === 'park') {
      APP.page = 'meituan-dashboard';
    } else if (menuKey === 'shop') {
      APP.page = 'order-list';
    } else {
      APP.page = 'overview';
    }
  }
  renderPCNav();
  renderPCContent(APP.page);
  updateBreadcrumb(APP.page);
  showToast(`已切换至：${role.name}`);
}

// ============ PC 导航渲染 ============
function renderPCNav() {
  const nav = document.getElementById('pcNav');
  const menuKey = getMenuKey(APP.view);
  const vis = MENU_VISIBILITY[menuKey];

  let html = '';
  for (const section of FULL_MENU) {
    // 过滤本 section 是否有可见项
    const visibleItems = section.items.filter(item => {
      if (item.sub) {
        return item.sub.some(s => vis[s.id]);
      }
      return vis[item.id];
    });
    if (visibleItems.length === 0) continue;

    html += `<div class="pc-nav-section">
      <div class="pc-nav-section-title">${section.section}</div>`;

    for (const item of visibleItems) {
      const hasSub = !!item.sub;
      const isExpanded = APP.expanded.has(item.id);
      const subActive = hasSub && item.sub.some(s => s.page === APP.page);
      const isActive = (!hasSub && item.page === APP.page) || subActive;

      html += `<div class="pc-nav-item ${isActive?'active':''}" data-id="${item.id}" data-page="${item.page||''}" data-has-sub="${hasSub}">
        <span class="nav-icon">${item.icon}</span>
        ${item.label}
        ${hasSub ? `<span class="nav-arrow">${isExpanded?'▾':'▸'}</span>` : ''}
      </div>`;

      if (hasSub && isExpanded) {
        html += '<div class="pc-nav-sub">';
        for (const sub of item.sub) {
          if (!vis[sub.id]) continue;
          html += `<div class="pc-nav-item ${sub.page === APP.page?'active':''}" data-page="${sub.page}">${sub.label}</div>`;
        }
        html += '</div>';
      }
    }
    html += '</div>';
  }
  nav.innerHTML = html;

  nav.querySelectorAll('.pc-nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const hasSub = el.dataset.hasSub === 'true';
      const id = el.dataset.id;
      const page = el.dataset.page;

      if (hasSub) {
        if (APP.expanded.has(id)) APP.expanded.delete(id);
        else APP.expanded.add(id);
        renderPCNav();
      } else if (page) {
        goPage(page);
      }
    });
  });
}

function goPage(page) {
  APP.page = page;
  // 展开父菜单
  for (const section of FULL_MENU) {
    for (const item of section.items) {
      if (item.sub && item.sub.some(s => s.page === page)) {
        APP.expanded.add(item.id);
      }
    }
  }
  renderPCNav();
  renderPCContent(page);
  updateBreadcrumb(page);
  document.getElementById('pcContent').scrollTop = 0;
}

function updateBreadcrumb(page) {
  const bc = document.getElementById('pcBreadcrumb');
  const view = VIEW_TITLES[APP.view];
  let parts = [`<span>${view.title}</span>`, '<span class="sep">/</span>'];
  for (const section of FULL_MENU) {
    for (const item of section.items) {
      if (item.page === page) {
        parts.push(`<span class="current">${item.label}</span>`);
        bc.innerHTML = parts.join(' ');
        return;
      }
      if (item.sub) {
        for (const sub of item.sub) {
          if (sub.page === page) {
            parts.push(`<span>${item.label}</span>`, '<span class="sep">/</span>', `<span class="current">${sub.label}</span>`);
            bc.innerHTML = parts.join(' ');
            return;
          }
        }
      }
    }
  }
  parts.push(`<span class="current">${page}</span>`);
  bc.innerHTML = parts.join(' ');
}

// ============ PC 页面渲染调度 ============
function renderPCContent(page) {
  const container = document.getElementById('pcContent');
  const renderers = {
    'overview':         renderOverview,
    'databoard':        renderDataboard,
    'park-list':        renderParkList,
    'park-add':         renderParkAdd,
    'shop-list':        renderShopList,
    'shop-stats':       renderShopStats,
    'shop-types':       renderShopTypes,
    'user-list':        renderUserList,
    'user-stats':       renderUserStats,
    'recharge-records': renderRechargeRecords,
    'order-list':       renderOrderList,
    'verify':           renderVerify,
    'refund':           renderRefund,
    'sales-stats':      renderSalesStats,
    'flow-stats':       renderFlowStats,
    'park-account':     renderParkAccount,
    'withdraw':         renderWithdraw,
    'reconcile':        renderReconcile,
    'employee-list':    renderEmployeeList,
    'position-list':    renderPositionList,
    'gate-list':        renderGateList,
    'face-list':        renderFaceList,
    'entry-records':    renderEntryRecords,
    'activity-list':    renderActivityList,
    'activity-create':  renderActivityCreate,
    'role-perm':        renderRolePerm,
    'mp-client-mgmt':   renderMpClientMgmt,
    'mp-merchant-mgmt': renderMpMerchantMgmt,
    'mp-admin-mgmt':    renderMpAdminMgmt,
    'mp-config':        renderMpConfig,
    'logs':             renderLogs,
    'meituan-dashboard':  renderMeituanDashboard,
    'meituan-records':    renderMeituanRecords,
    'meituan-settlement': renderMeituanSettlement,
    'meituan-config':     renderMeituanConfig,
    'douyin-dashboard':  renderDouyinDashboard,
    'douyin-records':    renderDouyinRecords,
    'douyin-settlement': renderDouyinSettlement,
    'douyin-config':     renderDouyinConfig,
  };
  const fn = renderers[page];
  container.innerHTML = fn ? fn() : `
    <div class="page-header"><div class="page-title">${page}</div></div>
    <div class="card"><div class="empty"><div class="empty-icon">🏗</div><p>此页面将在迭代中完善</p></div></div>
  `;
}

// ============ 移动端 Tab 切换 ============
document.getElementById('adminTabbar').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab-item'); if (!tab) return;
  document.querySelectorAll('#adminTabbar .tab-item').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  renderMpAdmin(tab.dataset.page);
});

document.getElementById('merchantTabbar').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab-item'); if (!tab) return;
  document.querySelectorAll('#merchantTabbar .tab-item').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  renderMpMerchant(tab.dataset.page);
});

document.getElementById('clientTabbar').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab-item'); if (!tab) return;
  // 中间「会员码」按钮 - 弹出二维码而非切换页面
  if (tab.dataset.page === 'memberqr') {
    openMemberQr();
    return;
  }
  // 切换 tab 时重置子页面 state
  if (tab.dataset.page === 'refund') MP_CLIENT.refundStep = 1;
  mpClientTab(tab.dataset.page);
});

function openMemberQr() {
  document.getElementById('memberQrBal').textContent = MP_CLIENT.balance.toFixed(2);
  // 重置为付款码
  document.querySelectorAll('.memberqr-tab').forEach((t,i) => t.classList.toggle('active', i===0));
  const box = document.querySelector('.memberqr-codebox');
  if(box) box.classList.remove('show-barcode');
  generateQrCode();
  document.getElementById('memberQrOverlay').classList.add('open');
}
function closeMemberQr() {
  document.getElementById('memberQrOverlay').classList.remove('open');
}
function switchQrMode(el, mode) {
  el.parentElement.querySelectorAll('.memberqr-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const box = document.querySelector('.memberqr-codebox');
  if (mode === 'member') {
    box.classList.add('show-barcode');
  } else if (mode === 'points') {
    box.classList.remove('show-barcode');
    renderPointsQr();
  } else {
    box.classList.remove('show-barcode');
    generateQrCode();
  }
}
function generateQrCode() {
  const g = document.getElementById('qrData');
  if (!g) return;
  let html = '';
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < 20; c++) {
      if (r < 7 && c < 7) continue;
      if (r < 7 && c > 12) continue;
      if (r > 12 && c < 7) continue;
      const seed = (r * 31 + c * 17 + r * c + Date.now() % 100) % 7;
      if (seed < 3) html += '<rect x="' + (c * 5) + '" y="' + (r * 5) + '" width="5" height="5" fill="#000"/>';
    }
  }
  g.innerHTML = html;
  // 生成条形码
  const bc = document.getElementById('memberBarcode');
  if (bc) {
    let bars = '';
    for (let i = 0; i < 50; i++) {
      bars += '<div style="width:' + (1 + Math.floor(Math.random() * 3)) + 'px;height:' + (30 + Math.floor(Math.random() * 20)) + 'px;background:#000"></div>';
    }
    bc.innerHTML = bars;
  }
}
function renderPointsQr() {
  const g = document.getElementById('qrData');
  if (!g) return;
  let html = '';
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < 20; c++) {
      if (r < 7 && c < 7) continue;
      if (r < 7 && c > 12) continue;
      if (r > 12 && c < 7) continue;
      const seed = (r * 13 + c * 29 + r * c) % 8;
      if (seed < 2) html += '<rect x="' + (c * 5) + '" y="' + (r * 5) + '" width="5" height="5" fill="#000"/>';
    }
  }
  g.innerHTML = html;
  showToast('积分码已生成 · 当前积分 128');
}
function refreshQrCode() {
  generateQrCode();
  showToast('二维码已刷新');
}
document.getElementById('memberQrOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'memberQrOverlay') closeMemberQr();
});

// ============ Modal ============
function showModal({title, body, footer, wide}) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalFoot').innerHTML = footer || '';
  document.getElementById('modalEl').style.minWidth = wide ? '720px' : '520px';
  document.getElementById('modalMask').classList.add('open');
}
function closeModal() {
  document.getElementById('modalMask').classList.remove('open');
}
document.getElementById('modalMask').addEventListener('click', (e) => {
  if (e.target.id === 'modalMask') closeModal();
});

// ============ Toast ============
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ============ 全局按钮交互补全 ============
// 为所有未绑定 onclick 的 btn / page-btn / btn-link / mp-btn 等按钮提供默认交互
document.addEventListener('click', function(e) {
  const btn = e.target.closest('button');
  if (!btn) return;

  // 跳过已有明确 onclick / form 内 submit / tab / platform-tab
  if (btn.hasAttribute('onclick')) return;
  if (btn.type === 'submit') return;
  if (btn.closest('.platform-tabs')) return;
  if (btn.closest('.miniapp-tabbar')) return;
  if (btn.closest('.memberqr-overlay')) return;
  // 跳过 close / icon-btn（PC header 区已有通用处理）
  if (btn.classList.contains('close-btn') || btn.classList.contains('icon-btn')) return;
  // 跳过 modal 内部 footer 按钮（已由各 Modal 构造）
  if (btn.closest('.modal-foot')) return;

  const text = (btn.textContent || '').trim();

  // 分派常见操作
  if (text.includes('查询')) {
    showToast('查询完成 · 共 0 条结果');
  } else if (text.includes('重置')) {
    showToast('筛选条件已重置');
  } else if (text.includes('导出')) {
    showToast('导出中，请稍候...');
  } else if (text.includes('新增') || text.includes('添加') || text.includes('创建') || text.startsWith('+')) {
    showToast('正在打开新建表单...');
  } else if (text.includes('编辑')) {
    showToast('正在打开编辑...');
  } else if (text.includes('详情') || text.includes('查看')) {
    showToast('正在加载详情...');
  } else if (text.includes('删除') || text.includes('禁用') || text.includes('解绑')) {
    showToast('操作已提交 · 请确认');
  } else if (text.includes('启用') || text.includes('上架')) {
    showToast('已启用');
  } else if (text.includes('下架') || text.includes('取消')) {
    showToast('操作已取消');
  } else if (text.includes('保存') || text.includes('发布')) {
    showToast('已保存');
  } else if (text.includes('配置') || text.includes('设置')) {
    showToast('正在打开配置...');
  } else if (text.includes('刷新') || text.includes('⟲')) {
    showToast('已刷新');
  } else if (text.includes('上传')) {
    showToast('请选择文件...');
  } else if (text.includes('查看文档')) {
    showToast('正在打开文档链接...');
  } else if (text.includes('通过') || text.includes('同意')) {
    showToast('已通过');
  } else if (text.includes('驳回') || text.includes('拒绝')) {
    showToast('已驳回');
  } else if (text.includes('审核')) {
    showToast('正在打开审核面板...');
  } else if (text.includes('登录') || text.includes('注册')) {
    showToast('正在跳转登录...');
  } else if (text.includes('确认') || text.includes('提交')) {
    showToast('已提交');
  } else if (text.includes('返回') || text.includes('‹')) {
    window.history.back();
  } else if (text.includes('清空') || text.includes('清除')) {
    showToast('已清空');
  } else if (text.includes('下一步') || text.includes('继续')) {
    showToast('正在进入下一步...');
  } else if (text.includes('全部') && text.includes('退款')) {
    showToast('已填入最大可退金额');
  } else {
    // fallback
    showToast('功能「' + text.slice(0, 12) + '」已触发');
  }
});

// ============ 主题设置 ============
const THEME = {
  mode: 'light',
  bg: 'default',
  color: '#1677ff',
};

function openThemeSettings() {
  showModal({
    title: '主题设置',
    body: `
      <div style="display:flex;flex-direction:column;gap:20px">
        <div>
          <div style="font-size:14px;font-weight:600;margin-bottom:10px">风格模式</div>
          <div style="display:flex;gap:8px">
            <button onclick="applyTheme('light')" class="btn btn-sm ${THEME.mode==='light'?'btn-primary':''}" style="flex:1">☀️ 浅色模式</button>
            <button onclick="applyTheme('dark')" class="btn btn-sm ${THEME.mode==='dark'?'btn-primary':''}" style="flex:1">🌙 深色模式</button>
          </div>
        </div>
        <div>
          <div style="font-size:14px;font-weight:600;margin-bottom:10px">背景风格</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <div onclick="applyBg('default')" style="padding:16px;background:#f0f2f5;border-radius:8px;border:2px solid ${THEME.bg==='default'?'var(--ant-primary)':'#d9d9d9'};cursor:pointer;text-align:center;font-size:13px">默认灰白</div>
            <div onclick="applyBg('warm')" style="padding:16px;background:linear-gradient(135deg,#f5f0e8,#faf6f0);border-radius:8px;border:2px solid ${THEME.bg==='warm'?'var(--ant-primary)':'#d9d9d9'};cursor:pointer;text-align:center;font-size:13px">暖棕稻田</div>
            <div onclick="applyBg('cool')" style="padding:16px;background:linear-gradient(135deg,#e8f4f8,#f0f8fa);border-radius:8px;border:2px solid ${THEME.bg==='cool'?'var(--ant-primary)':'#d9d9d9'};cursor:pointer;text-align:center;font-size:13px">清冷翠绿</div>
          </div>
        </div>
        <div>
          <div style="font-size:14px;font-weight:600;margin-bottom:10px">主题色</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['#1677ff','#52c41a','#fa8c16','#722ed1','#eb2f96','#13c2c2'].map(c => `
              <div onclick="applyColor('${c}')" style="width:36px;height:36px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${THEME.color===c?'#000':'transparent'};box-shadow:0 2px 6px rgba(0,0,0,0.15)"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `,
    footer: `<button class="btn" onclick="closeModal()">关闭</button><button class="btn btn-primary" onclick="closeModal();showToast('主题已保存')">确定</button>`,
  });
}

function applyTheme(mode) {
  THEME.mode = mode;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.style.setProperty('--ant-bg-layout', '#141414');
    root.style.setProperty('--ant-bg-elev', '#1f1f1f');
    root.style.setProperty('--ant-bg', '#141414');
    root.style.setProperty('--ant-text-1', 'rgba(255,255,255,0.85)');
    root.style.setProperty('--ant-text-2', 'rgba(255,255,255,0.65)');
    root.style.setProperty('--ant-text-3', 'rgba(255,255,255,0.45)');
    root.style.setProperty('--ant-border', '#434343');
    root.style.setProperty('--ant-border-secondary', '#303030');
    root.style.setProperty('--ant-fill-tertiary', 'rgba(255,255,255,0.04)');
    root.style.setProperty('--ant-fill-quaternary', 'rgba(255,255,255,0.08)');
    document.querySelector('.pc-main').style.background = '#141414';
    document.querySelector('.pc-sider').style.background = '#1f1f1f';
  } else {
    root.style.setProperty('--ant-bg-layout', '#f0f2f5');
    root.style.setProperty('--ant-bg-elev', '#ffffff');
    root.style.setProperty('--ant-bg', '#f5f5f5');
    root.style.setProperty('--ant-text-1', 'rgba(0,0,0,0.88)');
    root.style.setProperty('--ant-text-2', 'rgba(0,0,0,0.65)');
    root.style.setProperty('--ant-text-3', 'rgba(0,0,0,0.45)');
    root.style.setProperty('--ant-border', '#d9d9d9');
    root.style.setProperty('--ant-border-secondary', '#f0f0f0');
    root.style.setProperty('--ant-fill-tertiary', '#f5f5f5');
    root.style.setProperty('--ant-fill-quaternary', '#fafafa');
    document.querySelector('.pc-main').style.background = '#f0f2f5';
    document.querySelector('.pc-sider').style.background = '#fff';
  }
  openThemeSettings();
}

function applyBg(type) {
  THEME.bg = type;
  const main = document.querySelector('.pc-main');
  const bgMap = {
    default: '#f0f2f5',
    warm: 'linear-gradient(135deg, #f5f0e8 0%, #faf6f0 50%, #f0ebe0 100%)',
    cool: 'linear-gradient(135deg, #e8f4f8 0%, #f0f8fa 50%, #e0f0e8 100%)',
  };
  main.style.background = bgMap[type] || bgMap.default;
  if (THEME.mode === 'dark') main.style.background = '#141414';
  openThemeSettings();
}

function applyColor(color) {
  THEME.color = color;
  const root = document.documentElement;
  root.style.setProperty('--ant-primary', color);
  root.style.setProperty('--mp-red', color);
  openThemeSettings();
}

// ============ 初始化 ============
function init() {
  // PC
  renderPCNav();
  renderPCContent('overview');
  updateBreadcrumb('overview');
  // Mobile
  renderMpAdmin('dashboard');
  renderMpMerchant('dashboard');
  renderMpClient('home');
}

init();
