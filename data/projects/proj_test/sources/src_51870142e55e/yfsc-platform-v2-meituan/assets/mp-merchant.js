// ============================================================
// 小程序 · 商户端 (商户管理员/收银员)
// ============================================================
const MP_MERCHANT = {
  page: 'dashboard',
  orderFilter: 'all',
};

function renderMpMerchant(page) {
  MP_MERCHANT.page = page;
  const body = document.getElementById('merchantBody');
  const fns = {
    'dashboard': mpMerchantDashboard,
    'orders':    mpMerchantOrders,
    'verify':    mpMerchantVerify,
    'finance':   mpMerchantFinance,
    'me':        mpMerchantMe,
    'menu':      mpMerchantMenu,
    'business':  mpMerchantBusiness,
    'withdraw-account': mpMerchantWithdrawAccount,
  };
  body.innerHTML = (fns[page] || (() => '<div class="empty">建设中</div>'))();
  body.scrollTop = 0;
}

function mpMerchantDashboard() {
  return `
    <div class="mp-data-hero">
      <div class="dh-title">🚂 火车餐厅 · 2026-05-14</div>
      <div style="font-size:18px;font-weight:600;margin-top:4px">今日经营</div>
      <div class="dh-row">
        <div><div class="dh-val">¥860</div><div class="dh-label">营业额</div></div>
        <div><div class="dh-val">22</div><div class="dh-label">订单数</div></div>
        <div><div class="dh-val">68</div><div class="dh-label">客流量</div></div>
      </div>
    </div>

    <div class="mp-card flush" style="padding:14px 16px">
      <div style="font-size:14px;font-weight:600;margin-bottom:10px">今日订单概况</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center">
        <div>
          <div style="font-size:20px;font-weight:600;color:var(--mp-orange)">3</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">待支付</div>
        </div>
        <div>
          <div style="font-size:20px;font-weight:600;color:var(--mp-red)">5</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">待核销</div>
        </div>
        <div>
          <div style="font-size:20px;font-weight:600;color:#67c23a">13</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">已完成</div>
        </div>
        <div>
          <div style="font-size:20px;font-weight:600;color:var(--mp-text-2)">1</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">已退款</div>
        </div>
      </div>
    </div>

    <div class="mp-section-title">快捷功能</div>
    <div class="mp-quick-actions">
      <div class="qa-item" onclick="mpMerchantTab('verify')"><div class="qa-icon">${antIcon('scan')}</div>扫码核销</div>
      <div class="qa-item" onclick="mpMerchantTab('orders')"><div class="qa-icon">${antIcon('file')}</div>订单管理</div>
      <div class="qa-item" onclick="mpMerchantTab('finance')"><div class="qa-icon">${antIcon('dollar')}</div>提现申请</div>
      <div class="qa-item" onclick="mpMerchantTab('menu')"><div class="qa-icon">${antIcon('shop')}</div>菜单上架</div>
      <div class="qa-item" onclick="showToast('营业时间已更新')"><div class="qa-icon">${antIcon('clock')}</div>营业时间</div>
      <div class="qa-item"><div class="qa-icon">${antIcon('gift')}</div>活动</div>
      <div class="qa-item" onclick="mpMerchantTab('business')"><div class="qa-icon">${antIcon('chart')}</div>经营数据</div>
      <div class="qa-item" onclick="showToast('店员管理')"><div class="qa-icon">${antIcon('team')}</div>店员管理</div>
    </div>

    <div class="mp-section-title">本月趋势</div>
    <div class="mp-card flush" style="padding:14px">
      <div style="display:flex;align-items:flex-end;gap:4px;height:120px">
        ${[280,320,290,380,420,380,560,480,520,420,580,620,540,860].map((v,i) => {
          const max = 900;
          return `<div style="flex:1;background:linear-gradient(180deg,#1677ff,#0958d9);border-radius:3px 3px 0 0;height:${(v/max)*100}%;min-width:0" title="¥${v}"></div>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--mp-text-3);margin-top:6px">
        <span>5/1</span><span>5/7</span><span>5/14</span>
      </div>
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpMerchantOrders() {
  const filters = [
    {k:'all', t:'全部', n:22},
    {k:'pending', t:'待支付', n:3},
    {k:'paid', t:'待核销', n:5},
    {k:'done', t:'已完成', n:13},
    {k:'refunded', t:'已退款', n:1},
  ];
  return `
    <div class="mp-merchant-tabs">
      ${filters.map(f => `<button class="mp-merchant-tab ${MP_MERCHANT.orderFilter===f.k?'active':''}" onclick="mpMerchantSetFilter('${f.k}')">${f.t} (${f.n})</button>`).join('')}
    </div>

    <div style="padding:12px 12px 0">
      ${[
        {no:'202605141422001',user:'稻田守望者',avatar:'稻',items:'火车特色套餐 ×1, 稻田米浆 ×1',amount:86.50,status:'待核销',time:'14:22',pay:'余额',code:'HX26051414220'},
        {no:'202605141315002',user:'田园生活家',avatar:'田',items:'精品咖啡 ×2',amount:32.00,status:'已核销',time:'13:15',pay:'微信',code:''},
        {no:'202605141025004',user:'小麦的麦',avatar:'麦',items:'火车特色套餐 ×2',amount:128.00,status:'已核销',time:'10:25',pay:'余额',code:''},
        {no:'202605140950006',user:'稻香一缕',avatar:'稻',items:'红烧肉饭 ×1',amount:46.00,status:'退款处理中',time:'09:50',pay:'余额',code:''},
        {no:'202605140915007',user:'小麦的麦',avatar:'麦',items:'稻田米浆 ×3',amount:36.00,status:'待支付',time:'09:15',pay:'-',code:''},
      ].map(o => `
        <div class="mp-card flush" style="padding:14px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="width:36px;height:36px;border-radius:50%;background:#f5e8d8;color:#8b6443;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600">${o.avatar}</div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:600">${o.user}</div>
              <div style="font-size:11px;color:var(--mp-text-3)">${o.time} · ${o.pay}</div>
            </div>
            <span class="mp-tag ${o.status==='已核销'?'green':o.status==='待核销'?'red':o.status==='待支付'?'orange':'gray'}">${o.status}</span>
          </div>
          <div style="font-size:13px;color:var(--mp-text-2);margin-bottom:10px;padding-left:46px">${o.items}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px dashed #f0f0f0;padding-top:10px">
            <span style="font-size:11px;color:var(--mp-text-3);font-family:monospace">${o.no}</span>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:18px;font-weight:600;color:var(--mp-red)">¥${o.amount.toFixed(2)}</span>
              ${o.status==='待核销' ? '<button class="mp-btn sm">核销</button>' : ''}
              ${o.status==='已核销' ? '<button class="mp-btn sm outline">详情</button>' : ''}
              ${o.status==='退款处理中' ? '<button class="mp-btn sm outline">查看</button>' : ''}
              ${o.status==='待支付' ? '<button class="mp-btn sm outline">取消</button>' : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpMerchantSetFilter(k) {
  MP_MERCHANT.orderFilter = k;
  renderMpMerchant('orders');
}

function mpMerchantVerify() {
  const mode = MP_MERCHANT.verifyMode || 'verify';
  return `
    <!-- 模式切换 -->
    <div style="background:#fff;padding:12px 16px;border-bottom:0.5px solid var(--mp-border)">
      <div style="display:flex;gap:4px;padding:3px;background:var(--mp-fill);border-radius:8px;flex-wrap:wrap">
        <button onclick="mpMerchantSwitchScanMode('verify')" style="flex:1;min-width:72px;padding:7px 6px;border:none;border-radius:6px;background:${mode==='verify'?'#fff':'transparent'};color:${mode==='verify'?'var(--mp-red)':'var(--mp-text-2)'};font-weight:${mode==='verify'?500:400};box-shadow:${mode==='verify'?'0 1px 4px rgba(0,0,0,0.06)':'none'};font-size:12px">
          ✓ 订单核销
        </button>
        <button onclick="mpMerchantSwitchScanMode('collect')" style="flex:1;min-width:72px;padding:7px 6px;border:none;border-radius:6px;background:${mode==='collect'?'#fff':'transparent'};color:${mode==='collect'?'var(--mp-red)':'var(--mp-text-2)'};font-weight:${mode==='collect'?500:400};box-shadow:${mode==='collect'?'0 1px 4px rgba(0,0,0,0.06)':'none'};font-size:12px">
          ¥ 收款核销
        </button>
        <button onclick="mpMerchantSwitchScanMode('meituan')" style="flex:1;min-width:72px;padding:7px 6px;border:none;border-radius:6px;background:${mode==='meituan'?'#fff':'transparent'};color:${mode==='meituan'?'var(--mp-orange)':'var(--mp-text-2)'};font-weight:${mode==='meituan'?500:400};box-shadow:${mode==='meituan'?'0 1px 4px rgba(0,0,0,0.06)':'none'};font-size:12px">
          ☷ 美团验券
        </button>
        <button onclick="mpMerchantSwitchScanMode('douyin')" style="flex:1;min-width:72px;padding:7px 6px;border:none;border-radius:6px;background:${mode==='douyin'?'#fff':'transparent'};color:${mode==='douyin'?'#010101':'var(--mp-text-2)'};font-weight:${mode==='douyin'?500:400};box-shadow:${mode==='douyin'?'0 1px 4px rgba(0,0,0,0.06)':'none'};font-size:12px">
          ♫ 抖音验券
        </button>
      </div>
      <div style="font-size:11px;color:var(--mp-text-3);margin-top:6px;text-align:center">
        ${mode==='verify' ? '扫描用户出示的订单核销码完成核销' : mode==='collect' ? '扫描用户付款码 + 手动输入金额完成收款' : mode==='meituan' ? '扫描美团团购券二维码 · 验证券码有效性并完成核销' : '扫描抖音团购券二维码 · 宣券验证券码 · 支持套餐/次卡/代金券'}
      </div>
    </div>

    ${mode === 'meituan' ? mpMerchantMeituanScan() : mode === 'douyin' ? mpMerchantDouyinScan() : `
    <div style="padding:20px 16px;background:linear-gradient(180deg,#1677ff 0%,#0958d9 100%);color:#fff">
      <div style="text-align:center;padding:8px 0 16px">
        <div style="width:180px;height:180px;border:3px solid rgba(255,255,255,0.5);border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);margin:0 auto;position:relative">
          <div style="font-size:64px;opacity:0.8">${mode==='collect'?'¥':'⊞'}</div>
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#fff,transparent);animation:scanline 2s linear infinite"></div>
        </div>
        <div style="margin-top:18px;font-size:15px">${mode==='collect'?'扫描用户付款码':'扫描用户核销码'}</div>
        <div style="font-size:12px;opacity:0.7;margin-top:4px">${mode==='collect'?'用户在「会员码」展示付款码':'对准用户出示的核销二维码'}</div>
      </div>
    </div>
    <style>@keyframes scanline { 0%,100%{transform:translateY(0)} 50%{transform:translateY(168px)} }</style>

    ${mode === 'collect' ? mpMerchantCollectPanel() : mpMerchantVerifyPanel()}
    `}
  `;
}

// 扫码核销面板
function mpMerchantVerifyPanel() {
  return `
    <div style="padding:14px 12px">
      <div class="mp-card flush" style="padding:14px">
        <div style="font-size:14px;font-weight:500;margin-bottom:10px">手动核销</div>
        <div style="display:flex;gap:8px">
          <input class="input" placeholder="输入核销码 (HX...)" style="flex:1;height:38px;padding:8px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;font-family:monospace">
          <button class="mp-btn" onclick="showToast('核销成功')">核销</button>
        </div>
      </div>
    </div>

    <div class="mp-section-title">今日已核销 (5)</div>
    <div class="mp-record-list">
      <div class="mp-record-row">
        <div class="rr-icon refund">${antIcon('check')}</div>
        <div class="rr-info"><div class="rr-title">田园生活家</div><div class="rr-sub">精品咖啡 ×2 · 13:15 · HX26051413150</div></div>
        <div class="rr-amount minus">¥32.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon refund">${antIcon('check')}</div>
        <div class="rr-info"><div class="rr-title">小麦的麦</div><div class="rr-sub">火车特色套餐 ×2 · 10:25 · HX26051410250</div></div>
        <div class="rr-amount minus">¥128.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon refund">${antIcon('check')}</div>
        <div class="rr-info"><div class="rr-title">稻香一缕</div><div class="rr-sub">美式咖啡 · 09:15 · HX26051409150</div></div>
        <div class="rr-amount minus">¥46.00</div>
      </div>
    </div>
    <div style="height: 12px"></div>
  `;
}

// 收款核销面板 (手动输入金额)
function mpMerchantCollectPanel() {
  const amt = MP_MERCHANT.collectAmount || '';
  return `
    <div style="padding:14px 12px">
      <div class="mp-card flush" style="padding:14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px dashed var(--mp-border)">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--mp-red-bg);color:var(--mp-red);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600">稻</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:500">稻田守望者 <span style="font-size:11px;color:var(--mp-text-3)">(187****9908)</span></div>
            <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">VIP2 · 余额 ¥130.00 · 已识别</div>
          </div>
          <span class="mp-tag green">已识别</span>
        </div>

        <div style="padding-top:14px">
          <div style="font-size:13px;color:var(--mp-text-2);margin-bottom:8px">收款金额</div>
          <div style="display:flex;align-items:center;background:var(--mp-fill);border-radius:8px;padding:14px;gap:8px">
            <span style="font-size:30px;font-weight:300;color:var(--mp-text-1);line-height:1">¥</span>
            <input id="collectAmountInput" type="text" inputmode="decimal" placeholder="0.00" value="${amt}"
              oninput="MP_MERCHANT.collectAmount=this.value"
              style="flex:1;border:none;background:transparent;outline:none;font-size:30px;font-weight:500;color:var(--mp-text-1);letter-spacing:-1px;font-variant-numeric:tabular-nums;width:100%">
          </div>
          <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
            ${[10, 20, 50, 100, 200].map(v => `
              <button onclick="MP_MERCHANT.collectAmount='${v}';mpMerchantTab('verify')"
                style="padding:6px 14px;border:1px solid var(--mp-border-deep);background:#fff;border-radius:14px;font-size:13px;color:var(--mp-text-1)">+¥${v}</button>
            `).join('')}
            <button onclick="MP_MERCHANT.collectAmount='';mpMerchantTab('verify')"
              style="padding:6px 12px;border:1px solid var(--mp-border-deep);background:#fff;border-radius:14px;font-size:13px;color:var(--mp-text-3)">清空</button>
          </div>
        </div>

        <div style="margin-top:14px">
          <div style="font-size:13px;color:var(--mp-text-2);margin-bottom:8px">备注（可选）</div>
          <input type="text" placeholder="如：堂食 / 外带 / 餐位号" style="width:100%;height:36px;padding:6px 12px;border:1px solid var(--mp-border-deep);border-radius:8px;font-size:13px;outline:none">
        </div>

        <div style="margin-top:14px">
          <div style="font-size:13px;color:var(--mp-text-2);margin-bottom:8px">扣款方式</div>
          <label style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--mp-red);background:var(--mp-red-bg);border-radius:8px;margin-bottom:6px;cursor:pointer">
            <span style="width:16px;height:16px;border-radius:50%;border:2px solid var(--mp-red);display:flex;align-items:center;justify-content:center"><span style="width:8px;height:8px;background:var(--mp-red);border-radius:50%"></span></span>
            <span style="flex:1;font-size:14px">优先从余额扣款</span>
            <span style="font-size:13px;color:var(--mp-text-3)">余额 ¥130.00</span>
          </label>
          <label style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--mp-border-deep);border-radius:8px;cursor:pointer">
            <span style="width:16px;height:16px;border-radius:50%;border:2px solid #d9d9d9"></span>
            <span style="flex:1;font-size:14px">余额不足时使用微信支付</span>
          </label>
        </div>
      </div>
    </div>

    <div style="background:#fff;padding:12px 16px 20px;border-top:0.5px solid var(--mp-border);display:flex;gap:10px">
      <button class="mp-btn block gray" style="flex:1" onclick="MP_MERCHANT.collectAmount='';mpMerchantTab('verify')">取消</button>
      <button class="mp-btn block" style="flex:2" onclick="mpMerchantConfirmCollect()">
        确认收款 ${amt ? '¥'+parseFloat(amt).toFixed(2) : ''}
      </button>
    </div>
  `;
}

function mpMerchantSwitchScanMode(m) {
  MP_MERCHANT.verifyMode = m;
  if (m !== 'collect') MP_MERCHANT.collectAmount = '';
  renderMpMerchant('verify');
}

function mpMerchantConfirmCollect() {
  const amt = parseFloat(MP_MERCHANT.collectAmount);
  if (!amt || amt <= 0) { showToast('请输入收款金额'); return; }
  showToast(`收款成功 ¥${amt.toFixed(2)} · 从余额扣款`);
  MP_MERCHANT.collectAmount = '';
  setTimeout(() => mpMerchantTab('orders'), 800);
}

// ============ 美团验券扫码 ============
function mpMerchantMeituanScan() {
  const step = MP_MERCHANT.meituanStep || 'scan';
  if (step === 'scan') return mpMeituanScanView();
  if (step === 'confirm') return mpMeituanConfirmView();
  if (step === 'done') return mpMeituanDoneView();
  return mpMeituanScanView();
}

function mpMeituanScanView() {
  return `
    <div style="padding:16px;background:linear-gradient(180deg,#fa8c16 0%,#d46b08 100%);color:#fff;min-height:400px">
      <div style="text-align:center;padding:20px 0">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:20px">
          <span style="font-size:28px">☷</span>
          <span style="font-size:18px;font-weight:600">美团 · 大众点评</span>
        </div>
        <div style="width:200px;height:200px;border:3px solid rgba(255,255,255,0.5);border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);margin:0 auto;position:relative">
          <div style="font-size:64px;opacity:0.8">⊞</div>
          <div style="position:absolute;top:-3px;left:-3px;width:30px;height:30px;border-top:3px solid #fff;border-left:3px solid #fff;border-radius:6px 0 0 0"></div>
          <div style="position:absolute;top:-3px;right:-3px;width:30px;height:30px;border-top:3px solid #fff;border-right:3px solid #fff;border-radius:0 6px 0 0"></div>
          <div style="position:absolute;bottom:-3px;left:-3px;width:30px;height:30px;border-bottom:3px solid #fff;border-left:3px solid #fff;border-radius:0 0 0 6px"></div>
          <div style="position:absolute;bottom:-3px;right:-3px;width:30px;height:30px;border-bottom:3px solid #fff;border-right:3px solid #fff;border-radius:0 0 6px 0"></div>
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#fff,transparent);animation:scanline 2s linear infinite"></div>
        </div>
        <div style="margin-top:20px;font-size:16px;font-weight:500">扫描美团/大众点评团购券码</div>
        <div style="font-size:12px;opacity:0.8;margin-top:6px">对准用户出示的团购券二维码 / 条形码</div>
      </div>
    </div>
    <style>@keyframes scanline { 0%,100%{transform:translateY(0)} 50%{transform:translateY(188px)} }</style>

    <div style="padding:14px 12px">
      <div class="mp-card flush" style="padding:14px">
        <div style="font-size:14px;font-weight:500;margin-bottom:10px">手动输入券码</div>
        <div style="display:flex;gap:8px">
          <input class="input" placeholder="输入 12 位美团券码" style="flex:1;height:38px;padding:8px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;font-family:monospace;text-transform:uppercase">
          <button class="mp-btn" style="background:#fa8c16;color:#fff" onclick="mpMeituanPreVerify()">验券</button>
        </div>
      </div>
    </div>

    <div class="mp-card flush" style="padding:14px;margin:8px 12px">
      <div style="font-size:14px;font-weight:500;margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span>📋</span> 最近美团团购核销
      </div>
      <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #f5f5f5">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500">稻田双人套餐</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">券码 MT-YF-8821-5023 · 14:22</div>
        </div>
        <span style="font-size:16px;font-weight:600;color:var(--mp-orange)">¥128.00</span>
        <span class="mp-tag green" style="margin-left:8px">已核销</span>
      </div>
      <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #f5f5f5">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500">树下咖啡体验券</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">券码 MT-YF-9942-7163 · 13:15</div>
        </div>
        <span style="font-size:16px;font-weight:600;color:var(--mp-orange)">¥39.90</span>
        <span class="mp-tag green" style="margin-left:8px">已核销</span>
      </div>
      <div style="display:flex;align-items:center;padding:10px 0">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500">火车特色套餐</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">券码 MT-YF-7710-5532 · 10:25</div>
        </div>
        <span style="font-size:16px;font-weight:600;color:var(--mp-text-2)">¥99.00</span>
        <span class="mp-tag gray" style="margin-left:8px">已撤销</span>
      </div>
    </div>

    <div style="margin:0 12px;padding:12px 14px;background:#fff7e6;border-radius:8px;border:1px solid #ffd591;font-size:12px;color:#d48806;line-height:1.7">
      <b>美团验券说明</b><br>
      · 扫描用户展示的美团/大众点评团购券二维码<br>
      · 系统自动调用「验券准备」接口预检查券码状态<br>
      · 确认无误后「执行验券」完成核销<br>
      · 核销后可在 24 小时内发起撤销
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpMeituanPreVerify() {
  MP_MERCHANT.meituanStep = 'confirm';
  MP_MERCHANT.meituanData = {
    code: 'MT-YF-8821-5023',
    product: '稻田双人套餐',
    originPrice: 198.00,
    salePrice: 128.00,
    user: '稻田守望者',
    phone: '187****9908',
    validFrom: '2026-05-01',
    validTo: '2026-06-30',
    status: '可核销',
  };
  renderMpMerchant('verify');
}

function mpMeituanConfirmView() {
  const d = MP_MERCHANT.meituanData || {};
  return `
    <div style="padding:16px;background:linear-gradient(180deg,#fff7e6 0%,#fff 200px)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span style="font-size:24px">☷</span>
        <span style="font-size:16px;font-weight:600">美团 · 验券确认</span>
      </div>

      <div class="mp-card flush" style="padding:16px;margin-bottom:12px;background:linear-gradient(135deg,#f6ffed,#fff)">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px dashed #f0f0f0">
          <div style="width:48px;height:48px;border-radius:50%;background:#fff7e6;color:#fa8c16;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600">券</div>
          <div style="flex:1">
            <div style="font-size:16px;font-weight:600;color:var(--mp-text-1)">${d.product}</div>
            <div style="font-size:12px;color:var(--mp-text-3);margin-top:2px">美团 · 大众点评团购券</div>
          </div>
          <span class="mp-tag green">${d.status}</span>
        </div>

        <div style="padding-top:14px">
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">券码</span>
            <span style="font-family:monospace;font-weight:500">${d.code}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">原价</span>
            <span style="text-decoration:line-through;color:var(--mp-text-3)">¥${d.originPrice.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">团购价</span>
            <span style="font-size:18px;font-weight:600;color:var(--mp-orange)">¥${d.salePrice.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">有效期</span>
            <span>${d.validFrom} ~ ${d.validTo}</span>
          </div>
        </div>
      </div>

      <div class="mp-card flush" style="padding:16px;margin-bottom:12px">
        <div style="font-size:14px;font-weight:500;margin-bottom:10px">核销信息</div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
          <span style="color:var(--mp-text-3)">用户</span><span>${d.user} (${d.phone})</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
          <span style="color:var(--mp-text-3)">核销店铺</span><span>火车餐厅</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
          <span style="color:var(--mp-text-3)">核销人</span><span>王五</span>
        </div>
      </div>
    </div>

    <div style="background:#fff;padding:12px 16px 20px;border-top:0.5px solid var(--mp-border);display:flex;gap:10px">
      <button class="mp-btn block gray" style="flex:1" onclick="mpMeituanBack()">返回</button>
      <button class="mp-btn block" style="flex:2;background:#fa8c16;color:#fff" onclick="mpMeituanExecute()">
        确认核销 · ¥${d.salePrice.toFixed(2)}
      </button>
    </div>
  `;
}

function mpMeituanExecute() {
  MP_MERCHANT.meituanStep = 'done';
  renderMpMerchant('verify');
  showToast('美团验券成功 ✓ 券码 ' + (MP_MERCHANT.meituanData?.code || ''));
}

function mpMeituanDoneView() {
  const d = MP_MERCHANT.meituanData || {};
  return `
    <div style="padding:40px 20px 20px;text-align:center">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#fa8c16,#d46b08);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:42px;box-shadow:0 8px 20px rgba(250,140,22,0.3)">✓</div>
      <div style="font-size:20px;font-weight:600">美团验券成功</div>
      <div style="font-size:13px;color:var(--mp-text-3);margin-top:8px">券码 ${d.code} 已完成核销</div>

      <div style="margin-top:24px;background:#fff;border-radius:12px;padding:20px;text-align:left">
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed #ebebeb">
          <span style="font-size:13px;color:var(--mp-text-3);width:80px">核销单号</span>
          <span style="font-family:monospace;font-size:12px">MT20260514${Date.now().toString().slice(-6)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed #ebebeb">
          <span style="font-size:13px;color:var(--mp-text-3);width:80px">商品</span>
          <span style="font-size:14px;font-weight:500">${d.product}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed #ebebeb">
          <span style="font-size:13px;color:var(--mp-text-3);width:80px">核销金额</span>
          <span style="font-size:18px;font-weight:600;color:var(--mp-orange)">¥${d.salePrice.toFixed(2)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0">
          <span style="font-size:13px;color:var(--mp-text-3);width:80px">状态</span>
          <span class="mp-tag green">已核销</span>
        </div>
      </div>

      <div style="margin-top:20px;padding:12px 14px;background:#fff7e6;border-radius:8px;border:1px solid #ffd591;font-size:12px;color:#d48806;line-height:1.7;text-align:left">
        <b>温馨提示</b><br>
        · 已核销的券码如需撤销，请在 24 小时内操作<br>
        · 核销数据将同步至美团平台进行结算<br>
        · 用户可在美团/大众点评 App 查看核销状态
      </div>
    </div>

    <div style="background:#fff;padding:12px 16px 20px;border-top:0.5px solid var(--mp-border);display:flex;gap:10px">
      <button class="mp-btn block gray" style="flex:1" onclick="mpMeituanReset()">继续验券</button>
      <button class="mp-btn block" style="flex:1;background:#fa8c16;color:#fff" onclick="mpMerchantTab('orders')">查看订单</button>
    </div>
  `;
}

function mpMeituanBack() {
  MP_MERCHANT.meituanStep = 'scan';
  renderMpMerchant('verify');
}

function mpMeituanReset() {
  MP_MERCHANT.meituanStep = 'scan';
  MP_MERCHANT.meituanData = null;
  renderMpMerchant('verify');
}

// ============ 抖音验券扫码 ============
function mpMerchantDouyinScan() {
  const step = MP_MERCHANT.douyinStep || 'scan';
  if (step === 'scan') return mpDouyinScanView();
  if (step === 'confirm') return mpDouyinConfirmView();
  if (step === 'done') return mpDouyinDoneView();
  return mpDouyinScanView();
}

function mpDouyinScanView() {
  return `
    <div style="padding:16px;background:linear-gradient(180deg,#010101 0%,#1a1a1a 100%);color:#fff;min-height:400px">
      <div style="text-align:center;padding:20px 0">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:20px">
          <span style="font-size:24px">♫</span>
          <span style="font-size:16px;font-weight:600">抖音 · 生活服务</span>
        </div>
        <div style="width:200px;height:200px;border:3px solid rgba(255,255,255,0.35);border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);margin:0 auto;position:relative">
          <div style="font-size:64px;opacity:0.75">⊞</div>
          <div style="position:absolute;top:-3px;left:-3px;width:28px;height:28px;border-top:3px solid #ff4d4f;border-left:3px solid #ff4d4f;border-radius:6px 0 0 0"></div>
          <div style="position:absolute;top:-3px;right:-3px;width:28px;height:28px;border-top:3px solid #00f2fe;border-right:3px solid #00f2fe;border-radius:0 6px 0 0"></div>
          <div style="position:absolute;bottom:-3px;left:-3px;width:28px;height:28px;border-bottom:3px solid #00f2fe;border-left:3px solid #00f2fe;border-radius:0 0 0 6px"></div>
          <div style="position:absolute;bottom:-3px;right:-3px;width:28px;height:28px;border-bottom:3px solid #ff4d4f;border-right:3px solid #ff4d4f;border-radius:0 0 6px 0"></div>
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#ff4d4f,transparent);animation:scanline 2s linear infinite"></div>
        </div>
        <div style="margin-top:20px;font-size:16px;font-weight:500">扫描抖音团购券码</div>
        <div style="font-size:12px;opacity:0.75;margin-top:6px">支持团购套餐 · 次卡 · 代金券 · 组合券包</div>
      </div>
    </div>
    <style>@keyframes scanline { 0%,100%{transform:translateY(0)} 50%{transform:translateY(188px)} }</style>

    <div style="padding:14px 12px">
      <div class="mp-card flush" style="padding:14px">
        <div style="font-size:14px;font-weight:500;margin-bottom:10px">手动输入券码 / 扫码宣券</div>
        <div style="display:flex;gap:8px">
          <input class="input" placeholder="输入抖音券码" style="flex:1;height:38px;padding:8px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;font-family:monospace;text-transform:uppercase">
          <button class="mp-btn" style="background:#010101;color:#fff" onclick="mpDouyinPreVerify()">宣券</button>
        </div>
        <div style="font-size:11px;color:var(--mp-text-3);margin-top:6px">宣券：调用「验券准备」接口，查询券码可验状态与可验张数</div>
      </div>
    </div>

    <div class="mp-card flush" style="padding:14px;margin:8px 12px">
      <div style="font-size:14px;font-weight:500;margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span>📋</span> 最近抖音团购核销
      </div>
      <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #f5f5f5">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500"><span class="mp-tag red" style="font-size:10px;margin-right:4px">团购</span>稻田丰收双人餐</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">券码 DY-GROUP-A8K2-M9P1 · 18:20</div>
        </div>
        <span style="font-size:16px;font-weight:600;color:var(--mp-text-1)">¥158.00</span>
        <span class="mp-tag green" style="margin-left:8px">已核销</span>
      </div>
      <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #f5f5f5">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500"><span class="mp-tag" style="font-size:10px;margin-right:4px;background:#fff7e6;color:#fa8c16;border-color:#ffd591">代金券</span>满100减20代金券</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">券码 DY-VOUCHER-B1N6-S3D8 · 14:20</div>
        </div>
        <span style="font-size:16px;font-weight:600;color:var(--mp-text-1)">¥9.90</span>
        <span class="mp-tag green" style="margin-left:8px">已核销</span>
      </div>
      <div style="display:flex;align-items:center;padding:10px 0">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500"><span class="mp-tag" style="font-size:10px;margin-right:4px;background:#e6f4ff;color:#1677ff;border-color:#91caff">次卡</span>稻田米浆次卡 (4/10)</div>
          <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px">券码 DY-CARD-T9W4-L8H6 · 15:00</div>
        </div>
        <span style="font-size:16px;font-weight:600;color:var(--mp-text-1)">¥199.00</span>
        <span class="mp-tag" style="margin-left:8px;background:#e6f4ff;color:#1677ff;border-color:#91caff">部分核销</span>
      </div>
    </div>

    <div style="margin:0 12px;padding:12px 14px;background:#f5f5f5;border-radius:8px;border:1px solid #e5e5e5;font-size:12px;color:var(--mp-text-2);line-height:1.7">
      <b style="color:#010101">抖音验券说明</b><br>
      · 扫描用户展示的抖音团购券二维码<br>
      · 系统自动调用「验券准备(宣券)」接口查询券码信息<br>
      · 确认可验张数后，调用「执行验券」完成核销<br>
      · 次卡/组合券包支持多次核销<br>
      · 核销后可在 24 小时内发起撤销
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpDouyinPreVerify() {
  MP_MERCHANT.douyinStep = 'confirm';
  MP_MERCHANT.douyinData = {
    code: 'DY-GROUP-A8K2-M9P1',
    product: '稻田丰收双人餐',
    couponType: '团购套餐',
    originPrice: 228.00,
    salePrice: 158.00,
    user: '稻田守望者',
    phone: '187****9908',
    validFrom: '2026-05-01',
    validTo: '2026-06-30',
    maxCount: 1,
    verifyCount: 1,
    status: '可核销',
  };
  renderMpMerchant('verify');
}

function mpDouyinConfirmView() {
  const d = MP_MERCHANT.douyinData || {};
  return `
    <div style="padding:16px;background:linear-gradient(180deg,#f5f5f5 0%,#fff 200px)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span style="font-size:24px">♫</span>
        <span style="font-size:16px;font-weight:600">抖音 · 验券确认</span>
        <span class="mp-tag ${d.couponType==='团购套餐'?'red':d.couponType==='代金券'?'orange':d.couponType==='次卡'?'green':'gray'}" style="margin-left:8px">${d.couponType || ''}</span>
      </div>

      <div class="mp-card flush" style="padding:16px;margin-bottom:12px;background:linear-gradient(135deg,#f6ffed,#fff)">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px dashed #f0f0f0">
          <div style="width:48px;height:48px;border-radius:50%;background:#f5f5f5;color:#010101;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600">♫</div>
          <div style="flex:1">
            <div style="font-size:16px;font-weight:600;color:var(--mp-text-1)">${d.product}</div>
            <div style="font-size:12px;color:var(--mp-text-3);margin-top:2px">抖音 · 生活服务</div>
          </div>
          <span class="mp-tag green">${d.status}</span>
        </div>

        <div style="padding-top:14px">
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">券码</span>
            <span style="font-family:monospace;font-weight:500">${d.code}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">原价</span>
            <span style="text-decoration:line-through;color:var(--mp-text-3)">¥${d.originPrice.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">团购价</span>
            <span style="font-size:18px;font-weight:600;color:var(--mp-text-1)">¥${d.salePrice.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">有效期</span>
            <span>${d.validFrom} ~ ${d.validTo}</span>
          </div>
          ${d.couponType === '次卡' || d.couponType === '组合券包' ? `
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">核销进度</span>
            <span style="font-weight:600">${d.verifyCount || 0} / ${d.maxCount} 次</span>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="mp-card flush" style="padding:16px;margin-bottom:12px">
        <div style="font-size:14px;font-weight:500;margin-bottom:10px">核销信息</div>
        ${d.couponType === '次卡' || d.couponType === '组合券包' ? `
        <div style="padding:10px 0;border-bottom:1px solid #f5f5f5">
          <div style="font-size:13px;color:var(--mp-text-3);margin-bottom:8px">本次核销张数</div>
          <div style="display:flex;align-items:center;gap:12px">
            <button onclick="MP_MERCHANT.douyinData.verifyCount=Math.max(1,(MP_MERCHANT.douyinData.verifyCount||1)-1);mpDouyinRefreshConfirm()" style="width:36px;height:36px;border:1px solid var(--mp-border-deep);border-radius:50%;background:#fff;font-size:18px;display:flex;align-items:center;justify-content:center">−</button>
            <span style="font-size:22px;font-weight:600;min-width:40px;text-align:center">${d.verifyCount || 1}</span>
            <button onclick="MP_MERCHANT.douyinData.verifyCount=Math.min(MP_MERCHANT.douyinData.maxCount,(MP_MERCHANT.douyinData.verifyCount||1)+1);mpDouyinRefreshConfirm()" style="width:36px;height:36px;border:1px solid var(--mp-border-deep);border-radius:50%;background:#fff;font-size:18px;display:flex;align-items:center;justify-content:center">+</button>
            <span style="font-size:12px;color:var(--mp-text-3);margin-left:4px">剩余可验 ${d.maxCount - (d.verifyCount || 1)} 次</span>
          </div>
        </div>
        ` : ''}
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
          <span style="color:var(--mp-text-3)">用户</span><span>${d.user} (${d.phone})</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
          <span style="color:var(--mp-text-3)">核销店铺</span><span>火车餐厅</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
          <span style="color:var(--mp-text-3)">核销人</span><span>王五</span>
        </div>
      </div>
    </div>

    <div style="background:#fff;padding:12px 16px 20px;border-top:0.5px solid var(--mp-border);display:flex;gap:10px">
      <button class="mp-btn block gray" style="flex:1" onclick="mpDouyinBack()">返回</button>
      <button class="mp-btn block" style="flex:2;background:#010101;color:#fff" onclick="mpDouyinExecute()">
        确认核销 · ¥${(d.salePrice * (d.verifyCount || 1)).toFixed(2)}
      </button>
    </div>
  `;
}

function mpDouyinRefreshConfirm() {
  renderMpMerchant('verify');
}

function mpDouyinExecute() {
  MP_MERCHANT.douyinStep = 'done';
  renderMpMerchant('verify');
  const d = MP_MERCHANT.douyinData || {};
  showToast('抖音验券成功 ♫ 券码 ' + (d.code || ''));
}

function mpDouyinDoneView() {
  const d = MP_MERCHANT.douyinData || {};
  const totalPrice = d.salePrice * (d.verifyCount || 1);
  return `
    <div style="padding:40px 20px 20px;text-align:center">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#010101,#333);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:42px;box-shadow:0 8px 20px rgba(0,0,0,0.2)">✓</div>
      <div style="font-size:20px;font-weight:600">抖音验券成功</div>
      <div style="font-size:13px;color:var(--mp-text-3);margin-top:8px">券码 ${d.code} 已完成核销 · ${d.couponType || ''}</div>

      <div style="margin-top:24px;background:#fff;border-radius:12px;padding:20px;text-align:left">
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed #ebebeb">
          <span style="font-size:13px;color:var(--mp-text-3);width:80px">核销单号</span>
          <span style="font-family:monospace;font-size:12px">DY20260514${Date.now().toString().slice(-6)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed #ebebeb">
          <span style="font-size:13px;color:var(--mp-text-3);width:80px">商品</span>
          <span style="font-size:14px;font-weight:500">${d.product}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed #ebebeb">
          <span style="font-size:13px;color:var(--mp-text-3);width:80px">核销金额</span>
          <span style="font-size:18px;font-weight:600;color:var(--mp-text-1)">¥${totalPrice.toFixed(2)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0">
          <span style="font-size:13px;color:var(--mp-text-3);width:80px">状态</span>
          <span class="mp-tag green">已核销</span>
        </div>
      </div>

      <div style="margin-top:20px;padding:12px 14px;background:#f5f5f5;border-radius:8px;border:1px solid #e5e5e5;font-size:12px;color:var(--mp-text-2);line-height:1.7;text-align:left">
        <b style="color:#010101">温馨提示</b><br>
        · 已核销的券码如需撤销，请在 24 小时内操作<br>
        · 核销数据将同步至抖音生活服务平台进行结算<br>
        · 用户可在抖音 App「我的订单」查看核销状态
      </div>
    </div>

    <div style="background:#fff;padding:12px 16px 20px;border-top:0.5px solid var(--mp-border);display:flex;gap:10px">
      <button class="mp-btn block gray" style="flex:1" onclick="mpDouyinReset()">继续验券</button>
      <button class="mp-btn block" style="flex:1;background:#010101;color:#fff" onclick="mpMerchantTab('orders')">查看订单</button>
    </div>
  `;
}

function mpDouyinBack() {
  MP_MERCHANT.douyinStep = 'scan';
  renderMpMerchant('verify');
}

function mpDouyinReset() {
  MP_MERCHANT.douyinStep = 'scan';
  MP_MERCHANT.douyinData = null;
  renderMpMerchant('verify');
}

function mpMerchantFinance() {
  return `
    <div style="padding:20px 16px 22px;background:linear-gradient(135deg,#1677ff,#0958d9);color:#fff;margin-bottom:-12px">
      <div style="font-size:13px;opacity:0.85">可用余额</div>
      <div style="font-size:36px;font-weight:600;margin-top:6px;font-variant-numeric:tabular-nums;letter-spacing:-1px">¥ 2,180.50</div>
      <div style="display:flex;gap:24px;font-size:11px;opacity:0.85;margin-top:8px">
        <span>冻结金额 ¥0.00</span>
        <span>累计收益 ¥6,420.50</span>
      </div>
      <div style="display:flex;gap:10px;margin-top:18px">
        <button class="mp-btn block" style="background:#fff;color:#1677ff;flex:1" onclick="mpMerchantWithdraw()">${antIcon('wallet')} 申请提现</button>
        <button class="mp-btn block" style="background:rgba(255,255,255,0.18);color:#fff;border:1px solid rgba(255,255,255,0.4);flex:1">${antIcon('chart')} 收益明细</button>
      </div>
    </div>

    <div class="mp-data-grid" style="margin-top:24px">
      <div class="dg-card"><div class="dg-val">¥860</div><div class="dg-label">今日营业额</div></div>
      <div class="dg-card"><div class="dg-val">¥240</div><div class="dg-label">线下收入</div></div>
      <div class="dg-card"><div class="dg-val">¥4,260</div><div class="dg-label">已提现</div></div>
      <div class="dg-card"><div class="dg-val" style="color:var(--mp-orange)">¥0.00</div><div class="dg-label">待入账</div></div>
    </div>

    <div class="mp-section-title">提现历史</div>
    <div class="mp-record-list">
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#f0f9eb;color:#67c23a">${antIcon('arrowUp')}</div>
        <div class="rr-info"><div class="rr-title">提现至招商银行 6214****6908</div><div class="rr-sub">2026-05-12 09:30 · 已打款</div></div>
        <div class="rr-amount minus">¥2,400.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#f0f9eb;color:#67c23a">${antIcon('arrowUp')}</div>
        <div class="rr-info"><div class="rr-title">提现至招商银行 6214****6908</div><div class="rr-sub">2026-04-30 16:00 · 已打款</div></div>
        <div class="rr-amount minus">¥1,860.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#fff7e6;color:var(--mp-orange)">${antIcon('clock')}</div>
        <div class="rr-info"><div class="rr-title">提现申请审核中</div><div class="rr-sub">2026-05-14 15:07 · 待园区审核</div></div>
        <div class="rr-amount" style="color:var(--mp-orange)">¥1,200.00</div>
      </div>
    </div>
    <div style="height: 12px"></div>
  `;
}

// ============ 菜单上架管理 ============
function mpMerchantMenu() {
  const categories = ['招牌推荐', '主食', '小吃', '饮品', '甜品', '套餐'];
  const menuItems = [
    { name:'火车特色套餐',  cat:'招牌推荐', price:128.00, status:'on', img:'🚂', desc:'含红烧肉饭+稻田米浆+时蔬' },
    { name:'稻田双人餐',    cat:'套餐',     price:198.00, status:'on', img:'🍱', desc:'双人份·火车特色菜品' },
    { name:'红烧肉饭',      cat:'主食',     price:38.00,  status:'on', img:'🍚', desc:'招牌红烧肉·配米饭' },
    { name:'稻田米浆',      cat:'饮品',     price:18.00,  status:'on', img:'🥤', desc:'现磨鲜制·冷/热可选' },
    { name:'手工豆腐花',    cat:'甜品',     price:12.00,  status:'on', img:'🍮', desc:'传统手工·甜/咸可选' },
    { name:'精品咖啡',      cat:'饮品',     price:28.00,  status:'off',img:'☕', desc:'手冲单品·树下特供' },
    { name:'时令蔬菜沙拉',  cat:'小吃',     price:22.00,  status:'on', img:'🥗', desc:'当季时蔬·现拌' },
    { name:'糯米糍粑',      cat:'小吃',     price:15.00,  status:'on', img:'🍡', desc:'手工糯米·红糖浇汁' },
  ];
  return `
    <div style="background:#fff;padding:12px 16px;border-bottom:0.5px solid var(--mp-border)">
      <div style="font-size:15px;font-weight:600">🍱 菜单上架管理</div>
      <div style="font-size:12px;color:var(--mp-text-3);margin-top:4px">共 ${menuItems.length} 项 · 上架中 ${menuItems.filter(m=>m.status==='on').length} 项</div>
    </div>
    <div class="mp-merchant-tabs">
      ${categories.map((c,i) => `<button class="mp-merchant-tab ${i===0?'active':''}" onclick="showToast('切换分类: ${c}')">${c}</button>`).join('')}
    </div>
    <div style="padding:12px">
      ${menuItems.map(m => `
        <div class="mp-card flush" style="padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
          <div style="width:56px;height:56px;border-radius:10px;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0">${m.img}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="font-size:14px;font-weight:500">${m.name}</span>
              <span class="mp-tag ${m.status==='on'?'green':'gray'}" style="font-size:10px">${m.status==='on'?'上架':'下架'}</span>
            </div>
            <div style="font-size:11px;color:var(--mp-text-3);margin-bottom:4px">${m.desc}</div>
            <span style="font-size:16px;font-weight:600;color:var(--mp-red)">¥${m.price.toFixed(2)}</span>
          </div>
          <button class="mp-btn sm ${m.status==='on'?'outline':'gray'}" style="flex-shrink:0;white-space:nowrap;font-size:12px" onclick="showToast('${m.status==='on'?'已下架':'已上架'}: ${m.name}')">
            ${m.status==='on'?'下架':'上架'}
          </button>
        </div>
      `).join('')}
    </div>
    <div style="position:sticky;bottom:0;background:#fff;padding:12px 16px 24px;border-top:0.5px solid var(--mp-border)">
      <button class="mp-btn block" onclick="showToast('新增菜品表单已打开')">+ 新增菜品</button>
    </div>
  `;
}

// ============ 经营数据清单 ============
function mpMerchantBusiness() {
  return `
    <div style="background:#fff;padding:12px 16px;border-bottom:0.5px solid var(--mp-border)">
      <div style="font-size:15px;font-weight:600">${antIcon('chart')} 经营数据清单</div>
      <div style="font-size:12px;color:var(--mp-text-3);margin-top:4px">2026-05-14 · 火车餐厅</div>
    </div>
    <div class="mp-data-hero">
      <div class="dh-title">今日经营概览</div>
      <div class="dh-row">
        <div><div class="dh-val">¥860</div><div class="dh-label">营业额</div></div>
        <div><div class="dh-val">22</div><div class="dh-label">订单数</div></div>
        <div><div class="dh-val">68</div><div class="dh-label">客流量</div></div>
      </div>
    </div>
    <div class="mp-data-grid">
      <div class="dg-card"><div class="dg-val">¥620</div><div class="dg-label">线上 (美团+抖音)</div></div>
      <div class="dg-card"><div class="dg-val">¥240</div><div class="dg-label">线下收入</div></div>
      <div class="dg-card"><div class="dg-val" style="color:var(--mp-orange)">¥346</div><div class="dg-label">☷ 美团团购</div></div>
      <div class="dg-card"><div class="dg-val" style="color:#010101">¥207</div><div class="dg-label">♫ 抖音团购</div></div>
    </div>
    <div class="mp-section-title">今日订单明细</div>
    <div class="mp-record-list">
      <div class="mp-record-row"><div class="rr-icon consume">${antIcon('download')}</div><div class="rr-info"><div class="rr-title">稻田守望者 · 火车特色套餐</div><div class="rr-sub">14:22 · 余额 · 已支付</div></div><div class="rr-amount minus">-¥86.50</div></div>
      <div class="mp-record-row"><div class="rr-icon" style="background:#fff7e6;color:var(--mp-orange)">☷</div><div class="rr-info"><div class="rr-title">稻田守望者 · 美团·稻田双人套餐</div><div class="rr-sub">14:22 · 美团券 MT-YF-8821</div></div><div class="rr-amount minus">-¥128.00</div></div>
      <div class="mp-record-row"><div class="rr-icon">${antIcon('check')}</div><div class="rr-info"><div class="rr-title">田园生活家 · 精品咖啡 ×2</div><div class="rr-sub">13:15 · 微信支付 · 已核销</div></div><div class="rr-amount minus">-¥32.00</div></div>
      <div class="mp-record-row"><div class="rr-icon" style="background:#f5f5f5;color:#010101">♫</div><div class="rr-info"><div class="rr-title">小麦的麦 · 抖音·丰收双人餐</div><div class="rr-sub">18:20 · 抖音券 DY-GROUP-A8K2</div></div><div class="rr-amount minus">-¥158.00</div></div>
      <div class="mp-record-row"><div class="rr-icon consume">${antIcon('download')}</div><div class="rr-info"><div class="rr-title">稻香一缕 · 红烧肉饭</div><div class="rr-sub">09:50 · 余额 · 退款处理中</div></div><div class="rr-amount" style="color:var(--mp-orange)">¥46.00</div></div>
    </div>
    <div class="mp-section-title">本月统计</div>
    <div style="margin:0 12px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <div class="mp-card" style="padding:14px;text-align:center">
        <div style="font-size:20px;font-weight:600">¥12,340</div><div style="font-size:11px;color:var(--mp-text-3);margin-top:4px">月营业额</div>
      </div>
      <div class="mp-card" style="padding:14px;text-align:center">
        <div style="font-size:20px;font-weight:600;color:var(--mp-orange)">¥3,820</div><div style="font-size:11px;color:var(--mp-text-3);margin-top:4px">美团月收入</div>
      </div>
      <div class="mp-card" style="padding:14px;text-align:center">
        <div style="font-size:20px;font-weight:600;color:#010101">¥4,850</div><div style="font-size:11px;color:var(--mp-text-3);margin-top:4px">抖音月收入</div>
      </div>
    </div>
    <div style="height: 12px"></div>
  `;
}

// ============ 提现账户管理 ============
function mpMerchantWithdrawAccount() {
  return `
    <div style="background:#fff;padding:12px 16px;border-bottom:0.5px solid var(--mp-border)">
      <div style="font-size:15px;font-weight:600">💳 提现账户</div>
      <div style="font-size:12px;color:var(--mp-text-3);margin-top:4px">设置收款银行账户信息</div>
    </div>
    <div style="padding:14px 12px">
      <div class="mp-card flush" style="padding:16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:12px;background:var(--mp-red-bg);border-radius:8px">
          <span style="font-size:24px">💳</span>
          <div>
            <div style="font-size:13px;font-weight:500">当前绑定账户</div>
            <div style="font-size:12px;color:var(--mp-text-2);margin-top:2px">招商银行 · 6214****6908 · 黄轩辉</div>
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">开户银行</label>
          <select class="select" style="width:100%;height:40px;padding:6px 12px;border:1px solid var(--mp-border-deep);border-radius:8px;font-size:14px">
            <option>招商银行</option><option>工商银行</option><option>建设银行</option><option>农业银行</option><option>中国银行</option><option>交通银行</option><option>邮储银行</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">银行账号</label>
          <input class="input" value="6214830169088888" placeholder="请输入银行卡号" style="height:40px;border:1px solid var(--mp-border-deep);border-radius:8px;width:100%">
        </div>
        <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-item">
            <label class="form-label">收款人姓名</label>
            <input class="input" value="黄轩辉" placeholder="持卡人姓名" style="height:40px;border:1px solid var(--mp-border-deep);border-radius:8px;width:100%">
          </div>
          <div class="form-item">
            <label class="form-label">收款人手机</label>
            <input class="input" value="13912345678" placeholder="银行预留手机号" style="height:40px;border:1px solid var(--mp-border-deep);border-radius:8px;width:100%">
          </div>
        </div>
      </div>
    </div>
    <div style="background:#fff;padding:12px 16px 24px;border-top:0.5px solid var(--mp-border)">
      <button class="mp-btn block" onclick="showToast('提现账户已保存')">保存账户信息</button>
    </div>
  `;
}

function mpMerchantWithdraw() {
  showToast('提现申请已提交，待园区审核');
}

function mpMerchantMe() {
  return `
    <div class="mp-profile-hero">
      <div class="row">
        <div class="pf-avatar">王</div>
        <div style="flex:1">
          <div class="pf-name">王五</div>
          <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px">商户管理员 · 火车餐厅</div>
        </div>
      </div>
    </div>

    <div style="margin:12px;display:grid;grid-template-columns:repeat(3,1fr);background:#fff;border-radius:12px;padding:14px 0">
      <div style="text-align:center;border-right:1px solid #f0f0f0">
        <div style="font-size:18px;font-weight:600">22</div>
        <div style="font-size:12px;color:var(--mp-text-3);margin-top:2px">今日订单</div>
      </div>
      <div style="text-align:center;border-right:1px solid #f0f0f0">
        <div style="font-size:18px;font-weight:600">¥860</div>
        <div style="font-size:12px;color:var(--mp-text-3);margin-top:2px">今日营业额</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:18px;font-weight:600">2</div>
        <div style="font-size:12px;color:var(--mp-text-3);margin-top:2px">在岗员工</div>
      </div>
    </div>

    <div class="mp-menu-card">
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('shop')}</span>店铺信息<span class="mm-extra">营业中</span><span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('clock')}</span>营业时间<span class="mm-extra">10:00 - 21:00</span><span class="mm-arrow">›</span></div>
      <div class="mp-menu-row" onclick="mpMerchantTab('menu')"><span class="mm-icon">${antIcon('shop')}</span>菜单/商品管理<span class="mm-extra">18 项</span><span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('team')}</span>员工权限<span class="mm-extra">2 名收银员</span><span class="mm-arrow">›</span></div>
      <div class="mp-menu-row" onclick="mpMerchantTab('withdraw-account')"><span class="mm-icon">${antIcon('creditCard')}</span>提现账户<span class="mm-extra">招商银行</span><span class="mm-arrow">›</span></div>
    </div>

    <div class="mp-menu-card">
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('bell')}</span>消息通知<span class="mm-extra">2 条未读</span><span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('lock')}</span>账户安全<span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('info')}</span>关于我们<span class="mm-arrow">›</span></div>
      <div class="mp-menu-row" style="color:var(--mp-red)"><span class="mm-icon">${antIcon('logout')}</span>退出登录<span class="mm-arrow"></span></div>
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpMerchantTab(page) {
  document.querySelectorAll('#merchantTabbar .tab-item').forEach(t => t.classList.toggle('active', t.dataset.page === page));
  renderMpMerchant(page);
}
