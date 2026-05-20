// ============================================================
// 小程序 · 管理端 (园区管理员)
// ============================================================
const MP_ADMIN = {
  page: 'dashboard',
  currentPark: 'park-hm',
};

function mpAdminSwitchPark() {
  MP_ADMIN.currentPark = MP_ADMIN.currentPark === 'park-hm' ? 'park-wh' : 'park-hm';
  renderMpAdmin(MP_ADMIN.page);
  showToast('已切换到：' + (MP_ADMIN.currentPark==='park-hm'?'黄梅袁夫稻田':'武汉袁夫稻田'));
}

function renderMpAdmin(page) {
  MP_ADMIN.page = page;
  const body = document.getElementById('adminBody');
  const fns = {
    'dashboard': mpAdminDashboard,
    'shops':     mpAdminShops,
    'scan':      mpAdminScan,
    'message':   mpAdminMessage,
    'me':        mpAdminMe,
  };
  body.innerHTML = (fns[page] || (() => '<div class="empty">建设中</div>'))();
  // 滚到顶部
  body.scrollTop = 0;
}

function mpAdminDashboard() {
  const park = MP_ADMIN.currentPark;
  const parkName = park === 'park-hm' ? '黄梅袁夫稻田' : '武汉袁夫稻田';
  const parkData = {
    'park-hm': { sales:1286, orders:33, flow:128, shops:3, users:2837, refunds:3, monthSales:12340 },
    'park-wh': { sales:667, orders:18, flow:52, shops:2, users:1045, refunds:1, monthSales:5680 },
  };
  const d = parkData[park];
  return `
    <div class="mp-data-hero">
      <div class="dh-title">${parkName} · 2026-05-14</div>
      <div style="font-size:18px;font-weight:600;margin-top:4px">今日经营概览</div>
      <div class="dh-row">
        <div><div class="dh-val">¥${d.sales.toLocaleString()}</div><div class="dh-label">今日销售额</div></div>
        <div><div class="dh-val">${d.orders}</div><div class="dh-label">订单数</div></div>
        <div><div class="dh-val">${d.flow}</div><div class="dh-label">客流量</div></div>
      </div>
    </div>

    <div class="mp-data-grid">
      <div class="dg-card"><div class="dg-val">${d.shops}</div><div class="dg-label">商户总数</div></div>
      <div class="dg-card"><div class="dg-val">${d.users.toLocaleString()}</div><div class="dg-label">累计用户</div></div>
      <div class="dg-card"><div class="dg-val" style="color:var(--mp-red)">${d.refunds}</div><div class="dg-label">待处理退款</div></div>
      <div class="dg-card"><div class="dg-val">¥${d.monthSales.toLocaleString()}</div><div class="dg-label">本月销售额</div></div>
    </div>

    <div class="mp-section-title">快捷功能</div>
    <div class="mp-quick-actions">
      <div class="qa-item" onclick="mpAdminTab('scan')"><div class="qa-icon">${antIcon('scan')}</div>扫码核销</div>
      <div class="qa-item" onclick="showToast('充值查询 · ${parkName}')"><div class="qa-icon">${antIcon('dollar')}</div>充值查询</div>
      <div class="qa-item" onclick="showToast('订单管理 · ${parkName}')"><div class="qa-icon">${antIcon('file')}</div>订单管理</div>
      <div class="qa-item" onclick="showToast('客流查看 · ${parkName}')"><div class="qa-icon">${antIcon('lineChart')}</div>客流查看</div>
      <div class="qa-item" onclick="mpAdminTab('shops')"><div class="qa-icon">${antIcon('shop')}</div>商户切换</div>
      <div class="qa-item" onclick="showToast('活动审核 · ${parkName}')"><div class="qa-icon">${antIcon('gift')}</div>活动审核</div>
      <div class="qa-item" onclick="showToast('退款审核 · ${parkName}')"><div class="qa-icon">${antIcon('undo')}</div>退款审核</div>
      <div class="qa-item" onclick="mpAdminSwitchPark()"><div class="qa-icon">${antIcon('swap')}</div>切换园区</div>
    </div>

    <div class="mp-section-title">今日动态</div>
    <div class="mp-record-list">
      <div class="mp-record-row">
        <div class="rr-icon consume">${antIcon('download')}</div>
        <div class="rr-info"><div class="rr-title">稻田守望者 在 火车餐厅 消费</div><div class="rr-sub">14:22 · 已支付</div></div>
        <div class="rr-amount minus">-¥86.50</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon">${antIcon('check')}</div>
        <div class="rr-info"><div class="rr-title">田园生活家 完成核销</div><div class="rr-sub">13:15 · 树下咖啡</div></div>
        <div class="rr-amount minus">¥32.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon">${antIcon('undo')}</div>
        <div class="rr-info"><div class="rr-title">游客小新 申请退款</div><div class="rr-sub">11:40 · 待审核</div></div>
        <div class="rr-amount" style="color:var(--mp-orange)">¥22.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon refund">${antIcon('plus')}</div>
        <div class="rr-info"><div class="rr-title">稻田守望者 充值</div><div class="rr-sub">10:22 · 赠 ¥30</div></div>
        <div class="rr-amount plus">+¥200.00</div>
      </div>
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpAdminShops() {
  const park = MP_ADMIN.currentPark;
  const hmShops = [
    { name:'火车餐厅', img:'🚂', bg:'#fff3e0', sales:860, orders:22, flow:68, status:'营业中' },
    { name:'树下咖啡', img:'☕', bg:'#e8d5b7', sales:326, orders:9, flow:42, status:'营业中' },
    { name:'稻田手作坊', img:'🧺', bg:'#fff0f6', sales:100, orders:2, flow:18, status:'休息中' },
  ];
  const whShops = [
    { name:'江夏火车厨', img:'🚂', bg:'#fff3e0', sales:420, orders:12, flow:35, status:'营业中' },
    { name:'稻田鲜货铺', img:'🏪', bg:'#e8f5e9', sales:247, orders:6, flow:17, status:'营业中' },
  ];
  const shops = park === 'park-hm' ? hmShops : whShops;
  const totalShops = shops.length;
  const activeShops = shops.filter(s => s.status === '营业中').length;

  return `
    <div class="mp-merchant-tabs">
      <button class="mp-merchant-tab active">全部 (${totalShops})</button>
      <button class="mp-merchant-tab">营业中 (${activeShops})</button>
      <button class="mp-merchant-tab">休息中 (${totalShops-activeShops})</button>
    </div>

    <div class="mp-section-title">${park==='park-hm'?'黄梅袁夫稻田':'武汉袁夫稻田'} · 商户切换</div>
    <div style="background:#fff;margin:0 12px 12px;border-radius:12px;overflow:hidden">
      ${shops.map(s => `
        <div class="mp-shop-card" onclick="showToast('已切换到${s.name}视角')">
          <div class="sc-img" style="background:${s.bg}">${s.img}</div>
          <div class="sc-info">
            <div class="sc-name">${s.name}</div>
            <div class="sc-desc">今日 ¥${s.sales} · 订单 ${s.orders} · 客流 ${s.flow}</div>
            <span class="mp-tag ${s.status==='营业中'?'green':'gray'}" style="margin-top:4px">${s.status}</span>
          </div>
          <span class="sc-arrow">›</span>
        </div>
      `).join('')}
    </div>

    <div class="mp-section-title">商户排行 (本月)</div>
    <div class="mp-card" style="padding:14px 16px">
      ${[
        {n:'火车餐厅',v:8420,p:90},
        {n:'树下咖啡',v:4280,p:46},
        {n:'稻田手作坊',v:640,p:7},
      ].map((s,i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
          <span style="width:18px;height:18px;border-radius:4px;background:${i===0?'var(--mp-red)':i===1?'var(--mp-orange)':'#999'};color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center">${i+1}</span>
          <span style="flex:1;font-size:14px">${s.n}</span>
          <div style="width:80px;height:6px;background:#f5f5f5;border-radius:3px;overflow:hidden;margin:0 8px">
            <div style="height:100%;width:${s.p}%;background:linear-gradient(90deg,var(--mp-red),var(--mp-orange))"></div>
          </div>
          <span style="font-weight:600;font-size:14px;width:64px;text-align:right">¥${s.v.toLocaleString()}</span>
        </div>
      `).join('')}
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpAdminScan() {
  const mode = MP_ADMIN.scanMode || 'verify';
  const park = MP_ADMIN.currentPark || 'park-hm';
  return `
    <!-- 模式切换 (同商户端) -->
    <div style="background:#fff;padding:12px 16px;border-bottom:0.5px solid var(--mp-border)">
      <div style="display:flex;gap:4px;padding:3px;background:var(--mp-fill);border-radius:8px;flex-wrap:wrap">
        <button onclick="mpAdminSwitchScanMode('verify')" style="flex:1;min-width:72px;padding:7px 6px;border:none;border-radius:6px;background:${mode==='verify'?'#fff':'transparent'};color:${mode==='verify'?'var(--mp-red)':'var(--mp-text-2)'};font-weight:${mode==='verify'?500:400};box-shadow:${mode==='verify'?'0 1px 4px rgba(0,0,0,0.06)':'none'};font-size:12px">
          ✓ 订单核销
        </button>
        <button onclick="mpAdminSwitchScanMode('collect')" style="flex:1;min-width:72px;padding:7px 6px;border:none;border-radius:6px;background:${mode==='collect'?'#fff':'transparent'};color:${mode==='collect'?'var(--mp-red)':'var(--mp-text-2)'};font-weight:${mode==='collect'?500:400};box-shadow:${mode==='collect'?'0 1px 4px rgba(0,0,0,0.06)':'none'};font-size:12px">
          ¥ 收款核销
        </button>
        <button onclick="mpAdminSwitchScanMode('meituan')" style="flex:1;min-width:72px;padding:7px 6px;border:none;border-radius:6px;background:${mode==='meituan'?'#fff':'transparent'};color:${mode==='meituan'?'var(--mp-orange)':'var(--mp-text-2)'};font-weight:${mode==='meituan'?500:400};box-shadow:${mode==='meituan'?'0 1px 4px rgba(0,0,0,0.06)':'none'};font-size:12px">
          ☷ 美团验券
        </button>
        <button onclick="mpAdminSwitchScanMode('douyin')" style="flex:1;min-width:72px;padding:7px 6px;border:none;border-radius:6px;background:${mode==='douyin'?'#fff':'transparent'};color:${mode==='douyin'?'#010101':'var(--mp-text-2)'};font-weight:${mode==='douyin'?500:400};box-shadow:${mode==='douyin'?'0 1px 4px rgba(0,0,0,0.06)':'none'};font-size:12px">
          ♫ 抖音验券
        </button>
      </div>
      <div style="font-size:11px;color:var(--mp-text-3);margin-top:6px;text-align:center">
        ${mode==='verify'?'扫描用户出示的订单核销码完成核销':mode==='collect'?'扫描用户付款码 + 手动输入金额完成收款':mode==='meituan'?'扫描美团团购券二维码':'扫描抖音团购券二维码'}
      </div>
    </div>

    ${mode==='meituan' ? `<div style="padding:16px;background:linear-gradient(180deg,#fa8c16,#d46b08);color:#fff;min-height:300px"><div style="text-align:center;padding:30px 0"><div style="width:200px;height:200px;border:3px solid rgba(255,255,255,0.5);border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);margin:0 auto"><div style="font-size:64px;opacity:0.8">⊞</div></div><div style="margin-top:20px;font-size:16px">扫描美团团购券码</div><div style="font-size:12px;opacity:0.8;margin-top:4px">支持美团/大众点评团购券</div></div></div>`
    : mode==='douyin' ? `<div style="padding:16px;background:linear-gradient(180deg,#010101,#1a1a1a);color:#fff;min-height:300px"><div style="text-align:center;padding:30px 0"><div style="width:200px;height:200px;border:3px solid rgba(255,255,255,0.35);border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);margin:0 auto"><div style="font-size:64px;opacity:0.75">⊞</div></div><div style="margin-top:20px;font-size:16px">扫描抖音团购券码</div><div style="font-size:12px;opacity:0.75;margin-top:4px">支持套餐/次卡/代金券</div></div></div>`
    : `
    <div style="padding:20px 16px;background:linear-gradient(180deg,#1677ff 0%,#0958d9 100%);color:#fff">
      <div style="text-align:center;padding:8px 0 16px">
        <div style="width:180px;height:180px;border:3px solid rgba(255,255,255,0.5);border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);margin:0 auto;position:relative">
          <div style="font-size:64px;opacity:0.8">${mode==='collect'?'¥':'⊞'}</div>
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#fff,transparent);animation:scanline 2s linear infinite"></div>
        </div>
        <div style="margin-top:18px;font-size:15px">${mode==='collect'?'扫描用户付款码':'扫描用户核销码'}</div>
      </div>
    </div>
    <style>@keyframes scanline { 0%,100%{transform:translateY(0)} 50%{transform:translateY(168px)} }</style>
    `}

    <div style="padding:14px 12px">
      <div class="mp-card flush" style="padding:14px;margin-bottom:10px">
        <div style="font-size:14px;font-weight:500;margin-bottom:10px">手动输入核销</div>
        <div style="display:flex;gap:8px">
          <input class="input" placeholder="${mode==='meituan'?'输入美团券码':mode==='douyin'?'输入抖音券码':'输入核销码'}" style="flex:1;height:38px;padding:8px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;font-family:monospace">
          <button class="mp-btn" onclick="showToast('核销成功')">核销</button>
        </div>
      </div>
    </div>

    <div class="mp-section-title">${park==='park-hm'?'黄梅':'武汉'} · 最近核销</div>
    <div class="mp-record-list">
      <div class="mp-record-row">
        <div class="rr-icon">${antIcon('check')}</div>
        <div class="rr-info"><div class="rr-title">${park==='park-hm'?'小麦的麦':'周八'} · ${park==='park-hm'?'火车特色套餐':'江夏特色套餐'}</div><div class="rr-sub">2026-05-14 10:25 · 核销人 ${park==='park-hm'?'王五':'周八'}</div></div>
        <div class="rr-amount minus">${park==='park-hm'?'¥128.00':'¥188.00'}</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon">${antIcon('check')}</div>
        <div class="rr-info"><div class="rr-title">${park==='park-hm'?'田园生活家':'李大伟'} · ${park==='park-hm'?'精品咖啡 ×2':'鲜货礼盒'}</div><div class="rr-sub">2026-05-14 13:15 · 核销人 ${park==='park-hm'?'赵六':'孙七'}</div></div>
        <div class="rr-amount minus">${park==='park-hm'?'¥32.00':'¥68.00'}</div>
      </div>
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpAdminSwitchScanMode(m) {
  MP_ADMIN.scanMode = m;
  renderMpAdmin('scan');
}

function mpAdminMessage() {
  return `
    <div class="mp-section-title">通知中心</div>
    <div class="mp-record-list">
      <div class="mp-record-row">
        <div class="rr-icon" style="background:var(--mp-red-bg);color:var(--mp-red)">${antIcon('warning')}</div>
        <div class="rr-info">
          <div class="rr-title">游客小新 · 申请订单退款</div>
          <div class="rr-sub">11:40 · 待您审核 ¥22.00</div>
        </div>
        <span class="mp-btn sm">审核</span>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#fff7e6;color:var(--mp-orange)">${antIcon('bell')}</div>
        <div class="rr-info">
          <div class="rr-title">总部活动 · 夏日稻田音乐节</div>
          <div class="rr-sub">已推送，请审核后下发至商户</div>
        </div>
        <span class="mp-tag orange">待处理</span>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#f0f9eb;color:#67c23a">${antIcon('dollar')}</div>
        <div class="rr-info">
          <div class="rr-title">提现申请 · 火车餐厅</div>
          <div class="rr-sub">¥1,200.00 · 招商银行</div>
        </div>
        <span class="mp-btn sm outline">查看</span>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#e6f4ff;color:var(--mp-text-2)">${antIcon('info')}</div>
        <div class="rr-info">
          <div class="rr-title">系统消息</div>
          <div class="rr-sub">闸机 #3 已离线超过 24 小时</div>
        </div>
        <span class="mp-tag gray">已读</span>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#e6fffb;color:#13c2c2">${antIcon('gift')}</div>
        <div class="rr-info">
          <div class="rr-title">营销中心</div>
          <div class="rr-sub">充值送好礼活动累计参与 420 人</div>
        </div>
        <span class="mp-tag gray">已读</span>
      </div>
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpAdminMe() {
  const park = MP_ADMIN.currentPark;
  const parkName = park === 'park-hm' ? '黄梅袁夫稻田' : '武汉袁夫稻田';
  const adminName = park === 'park-hm' ? '李四' : '周八';
  const adminAvatar = park === 'park-hm' ? '李' : '周';
  const shopsCount = park === 'park-hm' ? 3 : 2;
  const employeesCount = park === 'park-hm' ? 6 : 4;
  return `
    <div class="mp-profile-hero">
      <div class="row">
        <div class="pf-avatar">${adminAvatar}</div>
        <div style="flex:1">
          <div class="pf-name">${adminName}</div>
          <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px">园区管理员 · ${parkName}</div>
        </div>
        <button class="h-btn" style="background:rgba(255,255,255,0.15);border:none;color:#fff;padding:6px 14px;border-radius:14px;font-size:12px;height:28px;width:auto">权限管理</button>
      </div>
    </div>

    <div style="margin:12px;display:grid;grid-template-columns:repeat(3,1fr);background:#fff;border-radius:12px;padding:14px 0">
      <div style="text-align:center;border-right:1px solid #f0f0f0">
        <div style="font-size:18px;font-weight:600">${shopsCount}</div>
        <div style="font-size:12px;color:var(--mp-text-3);margin-top:2px">管辖商户</div>
      </div>
      <div style="text-align:center;border-right:1px solid #f0f0f0">
        <div style="font-size:18px;font-weight:600">${employeesCount}</div>
        <div style="font-size:12px;color:var(--mp-text-3);margin-top:2px">在岗员工</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:18px;font-weight:600">99.4%</div>
        <div style="font-size:12px;color:var(--mp-text-3);margin-top:2px">SLA</div>
      </div>
    </div>

    <div class="mp-menu-card">
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('bell')}</span>消息通知<span class="mm-extra">3 条未读</span><span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('key')}</span>角色与权限<span class="mm-extra">查看可访问模块</span><span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('phone')}</span>移动端入口二维码<span class="mm-arrow">›</span></div>
      <div class="mp-menu-row" onclick="mpAdminSwitchPark()"><span class="mm-icon">${antIcon('swap')}</span>切换园区<span class="mm-extra">${parkName} › 切换</span><span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('setting')}</span>系统设置<span class="mm-arrow">›</span></div>
    </div>

    <div class="mp-menu-card">
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('info')}</span>关于我们<span class="mm-arrow">›</span></div>
      <div class="mp-menu-row" style="color:var(--mp-red)"><span class="mm-icon">${antIcon('logout')}</span>退出登录<span class="mm-arrow"></span></div>
    </div>
    <div style="height: 12px"></div>
  `;
}

// Tab 切换
function mpAdminTab(page) {
  document.querySelectorAll('#adminTabbar .tab-item').forEach(t => t.classList.toggle('active', t.dataset.page === page));
  renderMpAdmin(page);
}
