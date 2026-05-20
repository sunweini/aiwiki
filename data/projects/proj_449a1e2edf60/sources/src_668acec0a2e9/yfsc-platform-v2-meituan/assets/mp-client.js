// ============================================================
// 小程序 · 客户端 (C 端) — 按截图风格
// ============================================================

// 8 大分类 SVG 线条图标 (匹配上传截图风格)
const CATEGORY_ICONS = {
  rice: `<svg viewBox="0 0 48 48" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 24 Q8 38 24 38 Q40 38 40 24"/>
    <ellipse cx="24" cy="24" rx="16" ry="4"/>
    <path d="M14 20 Q14 16 18 16 Q22 14 24 16 Q26 14 30 16 Q34 16 34 20" />
    <ellipse cx="20" cy="18" rx="1" ry="1.5"/><ellipse cx="24" cy="16.5" rx="1" ry="1.5"/><ellipse cx="28" cy="18" rx="1" ry="1.5"/>
    <line x1="6" y1="40" x2="42" y2="40"/>
  </svg>`,
  wine: `<svg viewBox="0 0 48 48" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="13" y="9" width="6" height="5"/>
    <path d="M11 14 L11 38 Q11 41 14 41 L18 41 Q21 41 21 38 L21 14 Z"/>
    <ellipse cx="16" cy="22" rx="3" ry="1" stroke-width="1"/>
    <line x1="13" y1="26" x2="19" y2="26" stroke-width="0.8"/>
    <path d="M28 14 L30 26 Q30 30 34 30 Q38 30 38 26 L40 14 Z"/>
    <line x1="34" y1="30" x2="34" y2="40"/>
    <line x1="30" y1="40" x2="38" y2="40"/>
  </svg>`,
  can: `<svg viewBox="0 0 48 48" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="24" cy="13" rx="13" ry="3"/>
    <path d="M11 13 L11 37 Q11 40 24 40 Q37 40 37 37 L37 13"/>
    <path d="M14 19 Q14 17 16 17 L32 17 Q34 17 34 19 L34 33 Q34 35 32 35 L16 35 Q14 35 14 33 Z" stroke-width="1.2"/>
    <circle cx="24" cy="26" r="3" stroke-width="1.2"/>
  </svg>`,
  snack: `<svg viewBox="0 0 48 48" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="14" cy="18" r="6"/>
    <circle cx="14" cy="18" r="1" fill="#333" stroke="none"/>
    <circle cx="16" cy="15" r="0.8" fill="#333" stroke="none"/>
    <circle cx="12" cy="20" r="0.8" fill="#333" stroke="none"/>
    <path d="M22 14 L34 14 Q36 14 36 16 L36 36 Q36 38 34 38 L22 38 Q20 38 20 36 L20 16 Q20 14 22 14 Z"/>
    <line x1="20" y1="20" x2="36" y2="20"/>
    <line x1="20" y1="28" x2="36" y2="28"/>
    <line x1="24" y1="14" x2="24" y2="38" stroke-dasharray="1 2"/>
    <line x1="32" y1="14" x2="32" y2="38" stroke-dasharray="1 2"/>
  </svg>`,
  ticket: `<svg viewBox="0 0 48 48" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 14 L40 14 Q42 14 42 16 L42 22 Q39 22 39 24 Q39 26 42 26 L42 32 Q42 34 40 34 L8 34 Q6 34 6 32 L6 26 Q9 26 9 24 Q9 22 6 22 L6 16 Q6 14 8 14 Z"/>
    <line x1="14" y1="20" x2="22" y2="20"/>
    <line x1="14" y1="24" x2="26" y2="24"/>
    <line x1="14" y1="28" x2="20" y2="28"/>
    <line x1="32" y1="14" x2="32" y2="34" stroke-dasharray="1.5 2"/>
  </svg>`,
  dish: `<svg viewBox="0 0 48 48" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 10 Q19 14 16 18"/>
    <path d="M22 8 Q25 12 22 16"/>
    <path d="M28 10 Q31 14 28 18"/>
    <path d="M34 12 Q37 16 34 20"/>
    <path d="M8 34 Q8 22 24 22 Q40 22 40 34"/>
    <line x1="6" y1="36" x2="42" y2="36"/>
    <circle cx="24" cy="22" r="1.2" fill="#333" stroke="none"/>
  </svg>`,
  house: `<svg viewBox="0 0 48 48" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 24 L24 10 L40 24 L40 38 Q40 40 38 40 L10 40 Q8 40 8 38 Z"/>
    <line x1="6" y1="24" x2="10" y2="20"/>
    <line x1="42" y1="24" x2="38" y2="20"/>
    <path d="M24 32 Q21 28 18.5 30 Q16 32 18 35 L24 38 L30 35 Q32 32 29.5 30 Q27 28 24 32 Z"/>
  </svg>`,
  gift: `<svg viewBox="0 0 48 48" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="12" y="20" width="24" height="18" rx="1"/>
    <rect x="10" y="15" width="28" height="6"/>
    <line x1="24" y1="15" x2="24" y2="38"/>
    <path d="M24 15 Q22 9 17 11 Q14 13 18 15"/>
    <path d="M24 15 Q26 9 31 11 Q34 13 30 15"/>
    <path d="M42 14 A8 8 0 0 1 42 30" stroke-dasharray="2 2"/>
    <polyline points="40,30 42,30 42,28"/>
    <path d="M6 30 A8 8 0 0 1 6 14" stroke-dasharray="2 2"/>
    <polyline points="8,14 6,14 6,16"/>
  </svg>`,
};

const MP_CLIENT = {
  page: 'home',
  rechargeAmount: 100,
  rechargeCustom: '',
  refundStep: 1,
  refundAmount: 50,
  refundReason: '',
  balance: 130.00,
};

const TAB_PAGES = ['home', 'cart', 'me'];

function renderMpClient(page) {
  MP_CLIENT.page = page;
  const body = document.getElementById('clientBody');
  const header = {
    'home':     { title: '袁夫稻田线上商城', back: false },
    'cart':     { title: '购物车', back: false },
    'me':       { title: '个人中心', back: false },
    'recharge': { title: '充值', back: true },
    'recharge-records': { title: '充值记录', back: true },
    'refund':   { title: '余额退款', back: true },
    'refund-records': { title: '退款记录', back: true },
    'orders':   { title: '我的订单', back: true },
    'address':  { title: '地址管理', back: true },
  }[page] || { title: '袁夫稻田', back: true };

  document.getElementById('clientHeaderTitle').textContent = header.title;
  const leftBtn = document.getElementById('clientHeaderLeft');
  leftBtn.innerHTML = header.back ? '‹' : '☰';
  leftBtn.onclick = header.back ? mpClientBack : null;

  // tab bar hidden for sub-pages
  document.getElementById('clientTabbar').style.display = TAB_PAGES.includes(page) ? '' : 'none';

  const fns = {
    'home':     mpClientHome,
    'cart':     mpClientCart,
    'me':       mpClientMe,
    'recharge': mpClientRecharge,
    'recharge-records': mpClientRechargeRecords,
    'refund':   mpClientRefund,
    'refund-records': mpClientRefundRecords,
    'orders':   mpClientOrders,
    'address':  mpClientAddress,
  };
  body.innerHTML = (fns[page] || (() => '<div class="empty">建设中</div>'))();
  body.scrollTop = 0;
}

function mpClientBack() {
  // 简化：所有子页面返回到 me
  if (['recharge', 'refund', 'orders', 'address', 'recharge-records', 'refund-records'].includes(MP_CLIENT.page)) {
    mpClientTab('me');
  } else {
    mpClientTab('home');
  }
}

function mpClientTab(page) {
  document.querySelectorAll('#clientTabbar .tab-item').forEach(t => t.classList.toggle('active', t.dataset.page === page));
  renderMpClient(page);
}

// ============ 首页 (按截图布局) ============
function mpClientHome() {
  return `
    <!-- 客服横幅 -->
    <div class="mp-banner">
      <div class="b-avatars">
        <div class="b-avatar">🐰</div>
        <div class="b-avatar">🥚</div>
      </div>
      <div class="b-body">
        <div class="b-line1">点击添加企微客服 <span class="tag-inline">@袁夫稻田</span></div>
        <div class="b-line2">在线时间 9:00 - 18:00</div>
      </div>
      <div class="b-arrow">›</div>
    </div>

    <!-- 4 宫格 -->
    <div class="mp-grid">
      <div class="mp-grid-item">
        <div class="mg-icon-line">${CATEGORY_ICONS.rice}</div>
        <div class="mg-label">袁夫米面</div>
      </div>
      <div class="mp-grid-item">
        <div class="mg-icon-line">${CATEGORY_ICONS.wine}</div>
        <div class="mg-label">袁夫有酒</div>
      </div>
      <div class="mp-grid-item">
        <div class="mg-icon-line">${CATEGORY_ICONS.can}</div>
        <div class="mg-label">袁夫味品</div>
      </div>
      <div class="mp-grid-item">
        <div class="mg-icon-line">${CATEGORY_ICONS.snack}</div>
        <div class="mg-label">袁夫零食</div>
      </div>
    </div>

    <!-- 新品专区 -->
    ${mpClientSectionHeader('新品专区')}
    <div class="mp-product-row">
      ${productCard({bg:'#fef0e0', illust:'noodle',  price:'12.8', presale:true})}
      ${productCard({bg:'#f5ede0', illust:'jar',     price:'28.8', presale:false})}
      ${productCard({bg:'#e8efd8', illust:'ricebag', price:'39.9', presale:true})}
      ${productCard({bg:'#fff0e0', illust:'porridge',price:'18.8', presale:true})}
    </div>

    <!-- 袁夫米面 -->
    ${mpClientSectionHeader('袁夫米面')}
    <div class="mp-product-row">
      ${productCard({bg:'#f5e8c2', illust:'ricebag', price:'68.0', presale:false})}
      ${productCard({bg:'#fff5db', illust:'ricepack',price:'45.0', presale:false})}
      ${productCard({bg:'#fef0e0', illust:'noodle',  price:'22.8', presale:false})}
    </div>

    <!-- 袁夫味品 -->
    ${mpClientSectionHeader('袁夫味品')}
    <div class="mp-product-row" style="padding-bottom:24px">
      ${productCard({bg:'#fde8d8', illust:'jar', price:'28.0', presale:false})}
      ${productCard({bg:'#f5ede0', illust:'jar', price:'32.8', presale:false})}
      ${productCard({bg:'#fde0d8', illust:'jar', price:'18.0', presale:false})}
    </div>
  `;
}

// 商品卡 — 模拟上传截图的真实商品照片样式
function productCard({bg, illust, price, presale}) {
  return `
    <div class="mp-product">
      <div class="p-img" style="background:${bg}">
        <div class="p-brand-strip">袁夫稻田</div>
        ${PRODUCT_ILLUSTRATIONS[illust] || ''}
        ${presale ? '<div class="p-presale">预售</div>' : ''}
      </div>
      <div class="p-meta">
        <span class="p-price"><span style="font-size:12px">¥</span>${price}</span>
        <span class="p-cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4 L6 4 L8 16 L20 16 L22 8 L7 8"/></svg>
        </span>
      </div>
    </div>
  `;
}

// 商品插画 (SVG 模拟产品照片观感)
const PRODUCT_ILLUSTRATIONS = {
  noodle: `<svg viewBox="0 0 168 130" style="position:absolute;inset:0;width:100%;height:100%">
    <!-- 桌面 -->
    <rect x="0" y="80" width="168" height="50" fill="#e8d4b0" opacity="0.5"/>
    <!-- 碗 -->
    <ellipse cx="84" cy="80" rx="50" ry="28" fill="#f5f0e8"/>
    <ellipse cx="84" cy="78" rx="46" ry="20" fill="#f9e4b2"/>
    <!-- 面条 -->
    <path d="M50 68 Q60 70 70 68 Q80 70 90 68 Q100 70 110 68 Q118 72 122 76" stroke="#f4d575" stroke-width="2" fill="none"/>
    <path d="M52 72 Q62 74 72 72 Q82 74 92 72 Q102 74 112 72 Q120 76 124 80" stroke="#f4d575" stroke-width="2" fill="none"/>
    <!-- 青菜 -->
    <ellipse cx="110" cy="65" rx="10" ry="6" fill="#7fb069" transform="rotate(-20 110 65)"/>
    <ellipse cx="115" cy="60" rx="7" ry="5" fill="#9bc168" transform="rotate(-25 115 60)"/>
    <!-- 鸡蛋黄 -->
    <ellipse cx="70" cy="72" rx="8" ry="6" fill="#ffd16b"/>
    <ellipse cx="70" cy="72" rx="3" ry="2" fill="#ff9f4f"/>
  </svg>`,
  jar: `<svg viewBox="0 0 168 130" style="position:absolute;inset:0;width:100%;height:100%">
    <!-- 木质背景 -->
    <rect x="0" y="0" width="168" height="130" fill="${''}" opacity="0"/>
    <!-- 罐子主体 -->
    <ellipse cx="84" cy="38" rx="34" ry="6" fill="#a87a4b"/>
    <path d="M50 38 L50 102 Q50 110 84 110 Q118 110 118 102 L118 38" fill="#f5f0e6" stroke="#d0c2a8" stroke-width="1"/>
    <ellipse cx="84" cy="38" rx="34" ry="6" fill="#c79a6e"/>
    <!-- 标签 -->
    <rect x="58" y="60" width="52" height="28" fill="#fff" stroke="#c8a878" stroke-width="0.5"/>
    <text x="84" y="78" text-anchor="middle" font-size="11" font-weight="600" fill="#5b4a30" font-family="serif">袁夫稻田</text>
    <text x="84" y="86" text-anchor="middle" font-size="5" fill="#8a7860">净含量 450g</text>
    <!-- 勺子 -->
    <path d="M120 42 Q138 30 145 42 Q138 50 132 52 L130 60" stroke="#a87a4b" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  ricebag: `<svg viewBox="0 0 168 130" style="position:absolute;inset:0;width:100%;height:100%">
    <!-- 树叶背景 -->
    <ellipse cx="20" cy="10" rx="40" ry="20" fill="#7fb069" opacity="0.4"/>
    <ellipse cx="150" cy="20" rx="35" ry="25" fill="#5b8c2a" opacity="0.5"/>
    <ellipse cx="160" cy="100" rx="30" ry="40" fill="#7fb069" opacity="0.3"/>
    <!-- 米袋 -->
    <path d="M50 50 L120 50 L122 110 L48 110 Z" fill="#fffbf0"/>
    <path d="M50 50 Q60 42 70 50 Q80 42 90 50 Q100 42 110 50 Q115 46 120 50" fill="#fffbf0" stroke="#d8c8a0" stroke-width="0.5"/>
    <!-- 标签 -->
    <rect x="62" y="68" width="46" height="32" fill="#fff" stroke="#bf4040" stroke-width="0.5"/>
    <text x="85" y="84" text-anchor="middle" font-size="11" font-weight="600" fill="#bf4040" font-family="serif">袁夫</text>
    <text x="85" y="94" text-anchor="middle" font-size="8" fill="#5b8c2a">稻田</text>
    <!-- 提手 -->
    <ellipse cx="85" cy="50" rx="14" ry="3" fill="none" stroke="#d8c8a0" stroke-width="1"/>
  </svg>`,
  ricepack: `<svg viewBox="0 0 168 130" style="position:absolute;inset:0;width:100%;height:100%">
    <rect x="0" y="60" width="168" height="70" fill="#f5e8c2" opacity="0.6"/>
    <!-- 米袋 -->
    <path d="M42 30 L96 30 L98 110 L40 110 Z" fill="#fffbf0"/>
    <rect x="44" y="34" width="50" height="4" fill="#d0c2a8" rx="2"/>
    <text x="69" y="68" text-anchor="middle" font-size="11" font-weight="600" fill="#bf4040" font-family="serif">袁夫</text>
    <text x="69" y="80" text-anchor="middle" font-size="9" fill="#7a8a4a">稻田米</text>
    <!-- 第二个袋 -->
    <path d="M88 38 L138 38 L140 110 L86 110 Z" fill="#fff5db"/>
    <rect x="90" y="42" width="46" height="3" fill="#c8b890" rx="1.5"/>
    <text x="113" y="74" text-anchor="middle" font-size="9" font-weight="600" fill="#bf4040" font-family="serif">袁夫</text>
  </svg>`,
  porridge: `<svg viewBox="0 0 168 130" style="position:absolute;inset:0;width:100%;height:100%">
    <ellipse cx="84" cy="85" rx="55" ry="20" fill="#a87a4b" opacity="0.3"/>
    <!-- 木碗 -->
    <ellipse cx="84" cy="78" rx="48" ry="22" fill="#c79a6e"/>
    <ellipse cx="84" cy="76" rx="44" ry="16" fill="#fffbf0"/>
    <!-- 粥 -->
    <ellipse cx="84" cy="76" rx="38" ry="12" fill="#f5e8c2"/>
    <ellipse cx="75" cy="72" rx="2" ry="1.5" fill="#fff"/>
    <ellipse cx="92" cy="74" rx="2" ry="1.5" fill="#fff"/>
    <ellipse cx="85" cy="78" rx="2" ry="1.5" fill="#fff"/>
    <ellipse cx="100" cy="76" rx="2" ry="1.5" fill="#fff"/>
  </svg>`,
};

function mpClientSectionHeader(name) {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px">
      <div style="font-size:16px;font-weight:600;color:var(--mp-text-1);display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:14px;background:var(--mp-red);border-radius:2px"></span>
        ${name}
      </div>
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mp-text-3)">
        <span style="display:inline-block;width:24px;height:18px;background:#f5e8d8;border-radius:9px;text-align:center;font-size:14px">🐰</span>
        <span>›</span>
      </div>
    </div>
  `;
}

// ============ 商品分类 ============
function mpClientCategory() {
  const cats = [
    {n:'袁夫米面', icon:'rice',  bg:'#fff8e7'},
    {n:'袁夫有酒', icon:'wine',  bg:'#fbe9e7'},
    {n:'袁夫味品', icon:'can',   bg:'#fff3e0'},
    {n:'袁夫零食', icon:'snack', bg:'#fff8e1'},
    {n:'门票预订', icon:'ticket',bg:'#e8f5e9'},
    {n:'餐厅预订', icon:'dish',  bg:'#fff5e6'},
    {n:'民宿预订', icon:'house', bg:'#fde0dc'},
    {n:'积分商城', icon:'gift',  bg:'#f3e5f5'},
  ];
  const items = [
    {n:'稻田大米 5kg',    illust:'ricebag',  price:68.0, desc:'有机种植 · 当季新米'},
    {n:'袁夫糙米 2.5kg',  illust:'ricepack', price:45.0, desc:'富含膳食纤维'},
    {n:'手工挂面 500g',   illust:'noodle',   price:22.8, desc:'传统工艺 · 劲道爽滑'},
    {n:'袁夫米浆 ×6 瓶',  illust:'porridge', price:38.0, desc:'现磨鲜制 · 冷链直达'},
    {n:'糯米礼盒 2kg',    illust:'ricebag',  price:88.0, desc:'特级糯米 · 节庆首选'},
    {n:'稻田米粉 800g',   illust:'noodle',   price:32.0, desc:'纯米制作 · 不含添加剂'},
  ];
  return `
    <div style="display:flex;height:100%;background:#fff">
      <div style="width:90px;background:#fafafa;overflow-y:auto;flex-shrink:0">
        ${cats.map((c, i) => `
          <div onclick="mpClientCategorySelect(${i})"
            style="padding:16px 4px;text-align:center;font-size:13px;cursor:pointer;${i===0?'background:#fff;color:var(--mp-red);font-weight:500':'color:var(--mp-text-2)'};border-left:3px solid ${i===0?'var(--mp-red)':'transparent'}">
            ${c.n}
          </div>
        `).join('')}
      </div>
      <div style="flex:1;padding:12px;overflow-y:auto">
        <!-- 顶部分类大图 (使用 SVG 矢量图) -->
        <div style="display:flex;align-items:center;gap:14px;background:${cats[0].bg};border-radius:10px;padding:14px;margin-bottom:14px">
          <div style="width:64px;height:64px;display:flex;align-items:center;justify-content:center">${CATEGORY_ICONS[cats[0].icon]}</div>
          <div>
            <div style="font-size:16px;font-weight:600;color:var(--mp-text-1)">${cats[0].n}</div>
            <div style="font-size:12px;color:var(--mp-text-2);margin-top:4px">精选稻米、面食、米浆系列</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
          ${items.map(it => `
            <div style="background:#fff;border-radius:10px;border:0.5px solid var(--mp-border);overflow:hidden">
              <div style="height:100px;background:#f8f3e8;position:relative;overflow:hidden">
                ${PRODUCT_ILLUSTRATIONS[it.illust] || ''}
              </div>
              <div style="padding:8px 10px 10px">
                <div style="font-size:13px;color:var(--mp-text-1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${it.n}</div>
                <div style="font-size:11px;color:var(--mp-text-3);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${it.desc}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
                  <span style="font-size:15px;font-weight:600;color:var(--mp-red)">¥${it.price.toFixed(1)}</span>
                  <span style="width:22px;height:22px;border-radius:50%;background:var(--mp-red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:300">+</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function mpClientCategorySelect(i) {
  showToast('分类切换');
}

// ============ 购物车 ============
function mpClientCart() {
  const items = [
    {n:'稻田大米 5kg', img:'🌾', price:68, qty:1, sel:true},
    {n:'稻田酒 500ml', img:'🍶', price:128, qty:2, sel:true},
    {n:'自制蜂蜜 ×500g', img:'🍯', price:38, qty:1, sel:false},
  ];
  const total = items.filter(x=>x.sel).reduce((s,x)=>s+x.price*x.qty,0);
  return `
    <div style="padding:0 0 90px">
      <div style="background:#fff;padding:10px 16px;font-size:13px;display:flex;justify-content:space-between;color:var(--mp-text-2);border-bottom:1px solid var(--mp-border)">
        <span>共 ${items.length} 件商品</span>
        <span style="color:var(--mp-red)">编辑</span>
      </div>
      ${items.map((it, i) => `
        <div style="background:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f5f5f5">
          <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${it.sel?'var(--mp-red)':'#d9d9d9'};background:${it.sel?'var(--mp-red)':'#fff'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px">${it.sel?'✓':''}</div>
          <div style="width:72px;height:72px;border-radius:8px;background:linear-gradient(135deg,#fff5e6,#f0d8a0);display:flex;align-items:center;justify-content:center;font-size:36px">${it.img}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:500;color:var(--mp-text-1)">${it.n}</div>
            <div style="font-size:11px;color:var(--mp-text-3);margin-top:4px">袁夫稻田 · 自营</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
              <span style="font-size:16px;font-weight:600;color:var(--mp-red)">¥${it.price.toFixed(2)}</span>
              <div style="display:flex;align-items:center;gap:8px;border:1px solid var(--mp-border);border-radius:14px;padding:2px 8px">
                <button style="border:none;background:transparent;width:18px;height:18px;font-size:14px;color:var(--mp-text-2)">−</button>
                <span style="font-size:13px;min-width:14px;text-align:center">${it.qty}</span>
                <button style="border:none;background:transparent;width:18px;height:18px;font-size:14px;color:var(--mp-text-1)">+</button>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- 固定底栏 -->
    <div style="position:absolute;bottom:80px;left:0;right:0;background:#fff;border-top:1px solid var(--mp-border);padding:10px 16px;display:flex;align-items:center;gap:10px">
      <div style="width:22px;height:22px;border-radius:50%;border:2px solid var(--mp-red);background:var(--mp-red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px">✓</div>
      <span style="font-size:13px">全选</span>
      <div style="flex:1;text-align:right">
        <div style="font-size:13px;color:var(--mp-text-2)">合计：<span style="color:var(--mp-red);font-size:18px;font-weight:600">¥${total.toFixed(2)}</span></div>
      </div>
      <button class="mp-btn" style="padding:10px 24px">结算 (${items.filter(x=>x.sel).length})</button>
    </div>
  `;
}

// ============ 个人中心 ============
function mpClientMe() {
  return `
    <div class="mp-profile-hero">
      <div class="row">
        <div class="pf-avatar">👤</div>
        <div style="flex:1">
          <div class="pf-name">点击显示微信头像</div>
          <span class="pf-grow">成长值 0</span>
        </div>
        <div class="pf-actions">
          <button class="lr-btn" style="font-size:12px;padding:5px 14px">登录</button>
        </div>
      </div>
    </div>

    <div class="mp-member-strip">
      <span style="font-size:14px">◆</span>
      <span>成为会员，领 100 积分</span>
      <a class="m-link" onclick="showToast('会员注册')">立即注册 ›</a>
    </div>

    <div class="mp-stat-row">
      <div class="ms-item" onclick="showToast('余额 ¥${MP_CLIENT.balance.toFixed(2)} · 本金 ¥80.00 · 赠送 ¥50.00')">
        <div class="ms-val" style="font-size:22px;font-weight:700;color:var(--mp-red)">${MP_CLIENT.balance.toFixed(2)}</div>
        <div class="ms-label" style="font-weight:500">余额</div>
      </div>
      <div class="ms-item" onclick="openMemberQr()">
        <div class="ms-val" style="font-size:22px;font-weight:700;color:var(--mp-orange)">128</div>
        <div class="ms-label" style="font-weight:500">积分</div>
      </div>
      <div class="ms-item" onclick="renderMpClient('recharge')">
        <div class="ms-val"><span class="ms-yuan">¥</span></div>
        <div class="ms-label">钱包</div>
      </div>
    </div>

    <div class="mp-menu-card">
      <div class="mp-menu-row" onclick="renderMpClient('recharge')">
        <span class="mm-icon">${antIcon('wallet')}</span>账户充值
        <span class="mm-extra" style="color:var(--mp-red)">充 100 送 10</span>
        <span class="mm-arrow">›</span>
      </div>
      <div class="mp-menu-row" onclick="renderMpClient('recharge-records')">
        <span class="mm-icon">${antIcon('chart')}</span>充值记录
        <span class="mm-arrow">›</span>
      </div>
      <div class="mp-menu-row" onclick="renderMpClient('refund')">
        <span class="mm-icon">${antIcon('undo')}</span>余额退款
        <span class="mm-extra">可退至原支付方式</span>
        <span class="mm-arrow">›</span>
      </div>
      <div class="mp-menu-row" onclick="renderMpClient('refund-records')">
        <span class="mm-icon">${antIcon('file')}</span>退款记录
        <span class="mm-arrow">›</span>
      </div>
    </div>

    <div class="mp-menu-card">
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('bell')}</span>消息通知<span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('setting')}</span>设置<span class="mm-arrow">›</span></div>
      <div class="mp-menu-row"><span class="mm-icon">${antIcon('info')}</span>关于我们<span class="mm-arrow">›</span></div>
    </div>
    <div style="height: 12px"></div>
  `;
}

// ============ 充值 ============
function mpClientRecharge() {
  const tiles = [
    {amount: 50,   gift: 0,   tag:''},
    {amount: 100,  gift: 10,  tag:'热门'},
    {amount: 200,  gift: 30,  tag:''},
    {amount: 500,  gift: 100, tag:'超值'},
    {amount: 1000, gift: 250, tag:'最划算'},
    {amount: 0,    gift: 0,   tag:'自定义'},
  ];
  return `
    <div style="background:linear-gradient(135deg,#1677ff,#0958d9);padding:24px 16px;color:#fff">
      <div style="font-size:13px;opacity:0.85">当前余额</div>
      <div style="font-size:36px;font-weight:600;margin-top:4px;font-variant-numeric:tabular-nums;letter-spacing:-1px">¥ ${MP_CLIENT.balance.toFixed(2)}</div>
      <div style="font-size:12px;opacity:0.85;margin-top:4px">累计消费 ¥256.50</div>
    </div>

    <div style="background:#fff;margin:14px 12px 12px;border-radius:12px;padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:15px;font-weight:600">充值金额</span>
        <span style="font-size:11px;color:var(--mp-orange)">🎁 充值有礼，多充多送</span>
      </div>
      <div class="mp-recharge-amount-grid" style="padding:0">
        ${tiles.map((t, i) => {
          const sel = MP_CLIENT.rechargeAmount === t.amount;
          return `
            <div class="mp-recharge-tile ${sel?'active':''}" onclick="mpClientSelectAmount(${t.amount})">
              ${t.tag ? `<div class="rt-ribbon">${t.tag}</div>` : ''}
              ${t.amount === 0 ? `
                <div class="rt-amount" style="font-size:14px">自定义</div>
                <div class="rt-gift">输入金额</div>
              ` : `
                <div class="rt-amount">¥${t.amount}</div>
                ${t.gift > 0 ? `<div class="rt-gift">送 ¥${t.gift}</div>` : '<div class="rt-gift" style="visibility:hidden">.</div>'}
              `}
            </div>
          `;
        }).join('')}
      </div>

      ${MP_CLIENT.rechargeAmount === 0 ? `
        <div style="margin-top:14px;padding:12px;background:#fafafa;border-radius:8px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px;font-weight:600">¥</span>
          <input class="input" placeholder="输入充值金额" value="${MP_CLIENT.rechargeCustom}" style="flex:1;border:none;background:transparent;font-size:18px;font-weight:500;padding:4px" oninput="MP_CLIENT.rechargeCustom=this.value">
        </div>
      ` : ''}
    </div>

    <div style="background:#fff;margin:0 12px 12px;border-radius:12px;padding:14px 16px">
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:14px">
        <span>支付方式</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="color:#07c160;font-size:16px">💚</span>
          <span style="font-weight:500">微信支付</span>
        </div>
      </div>
    </div>

    <div style="background:#fff;margin:0 12px 12px;border-radius:12px;padding:14px 16px;font-size:12px;color:var(--mp-text-2);line-height:1.7">
      <div style="font-weight:600;color:var(--mp-text-1);margin-bottom:6px">充值说明</div>
      <div>· 充值金额到账后可在园区内消费抵扣</div>
      <div>· 消费时<b>优先扣除本金</b>，本金用完后再使用赠送金额</div>
      <div>· 赠送金额仅可消费使用，不支持提现</div>
      <div>· <b style="color:var(--mp-red)">⚠ 退款规则：</b>申请退款时仅退还剩余本金，赠送金额将<b style="color:var(--mp-red)">自动归零且不可恢复</b></div>
      <div>· 可通过<a onclick="renderMpClient('refund')" style="color:var(--mp-red)">「余额退款」</a>原路退回剩余本金</div>
      <div>· 充值后可在「充值记录」中查询交易</div>
    </div>

    <div style="position:absolute;bottom:0;left:0;right:0;background:#fff;padding:12px 16px 24px;border-top:1px solid var(--mp-border)">
      <button class="mp-btn block" style="padding:14px" onclick="mpClientDoRecharge()">
        立即充值 ¥${MP_CLIENT.rechargeAmount === 0 ? (MP_CLIENT.rechargeCustom || '0') : MP_CLIENT.rechargeAmount}
      </button>
    </div>
  `;
}

function mpClientSelectAmount(amt) {
  MP_CLIENT.rechargeAmount = amt;
  renderMpClient('recharge');
}

function mpClientDoRecharge() {
  const amt = MP_CLIENT.rechargeAmount === 0 ? parseFloat(MP_CLIENT.rechargeCustom || 0) : MP_CLIENT.rechargeAmount;
  if (!amt) { showToast('请输入充值金额'); return; }
  showToast(`充值 ¥${amt} 成功 ✓`);
  MP_CLIENT.balance += amt;
  setTimeout(() => renderMpClient('recharge-records'), 600);
}

function mpClientRechargeRecords() {
  return `
    <div class="mp-section-title">充值记录</div>
    <div class="mp-record-list">
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#fff5e6;color:var(--mp-orange)">+</div>
        <div class="rr-info">
          <div class="rr-title">微信充值 (送 ¥30)</div>
          <div class="rr-sub">2026-05-14 10:22 · CZ20260514102230</div>
        </div>
        <div class="rr-amount plus">+¥200.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#fff5e6;color:var(--mp-orange)">+</div>
        <div class="rr-info">
          <div class="rr-title">微信充值 (送 ¥10)</div>
          <div class="rr-sub">2026-05-13 16:30 · TF20260513163019</div>
        </div>
        <div class="rr-amount plus">+¥100.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon refund">⤺</div>
        <div class="rr-info">
          <div class="rr-title">余额退款 (原路退回)</div>
          <div class="rr-sub">2026-05-12 09:12 · TK20260512091215</div>
        </div>
        <div class="rr-amount" style="color:var(--mp-red)">-¥50.00</div>
      </div>
      <div class="mp-record-row">
        <div class="rr-icon" style="background:#fff5e6;color:var(--mp-orange)">+</div>
        <div class="rr-info">
          <div class="rr-title">微信充值 (送 ¥10)</div>
          <div class="rr-sub">2026-05-10 09:15 · CZ20260510091523</div>
        </div>
        <div class="rr-amount plus">+¥100.00</div>
      </div>
    </div>
    <div style="height: 12px"></div>
  `;
}

// ============ 余额退款 ============
function mpClientRefund() {
  const step = MP_CLIENT.refundStep;

  if (step === 1) {
    // 申请页
    return `
      <div class="mp-refund-banner">
        <div class="rb-title">⤺ 余额退款</div>
        <div class="rb-desc">将余额原路退回到充值时的微信账户。退款仅支持本金部分，赠送金额不可退。</div>
      </div>

      <div style="background:#fff;margin:0 12px 12px;border-radius:12px;padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid #f5f5f5">
          <span style="color:var(--mp-text-2);font-size:13px">当前余额</span>
          <span style="font-size:18px;font-weight:600">¥${MP_CLIENT.balance.toFixed(2)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f5f5f5">
          <span style="color:var(--mp-text-2);font-size:13px">本金 (可退)</span>
          <span style="font-size:16px;color:var(--mp-red);font-weight:500">¥80.00</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0">
          <span style="color:var(--mp-text-2);font-size:13px">赠送 (不可退)</span>
          <span style="font-size:14px;color:var(--mp-text-3)">¥50.00</span>
        </div>
      </div>

      <div style="background:#fff;margin:0 12px 12px;border-radius:12px;padding:16px">
        <div style="font-size:14px;font-weight:600;margin-bottom:12px">退款金额</div>
        <div style="display:flex;align-items:center;gap:8px;padding:10px;background:#fafafa;border-radius:8px">
          <span style="font-size:22px;font-weight:600">¥</span>
          <input class="input" value="${MP_CLIENT.refundAmount}" style="flex:1;border:none;background:transparent;font-size:22px;font-weight:600;padding:0" oninput="MP_CLIENT.refundAmount=this.value">
          <button class="mp-btn sm gray" onclick="MP_CLIENT.refundAmount=80;renderMpClient('refund')">全部退款</button>
        </div>
        <div style="font-size:11px;color:var(--mp-text-3);margin-top:8px">最高可退 ¥80.00 · 根据充值订单原路退回</div>
      </div>

      <div style="background:#fff;margin:0 12px 12px;border-radius:12px;padding:16px">
        <div style="font-size:14px;font-weight:600;margin-bottom:12px">退款原因 <span style="color:var(--mp-red)">*</span></div>
        ${['不再使用该账户','重复充值','金额输入错误','其他'].map((r,i) => `
          <div onclick="MP_CLIENT.refundReason='${r}';renderMpClient('refund')" style="display:flex;align-items:center;gap:10px;padding:12px 4px;border-bottom:${i===3?'none':'1px solid #f5f5f5'}">
            <span style="width:18px;height:18px;border-radius:50%;border:2px solid ${MP_CLIENT.refundReason===r?'var(--mp-red)':'#d9d9d9'};display:flex;align-items:center;justify-content:center">
              ${MP_CLIENT.refundReason===r?'<span style="width:8px;height:8px;background:var(--mp-red);border-radius:50%"></span>':''}
            </span>
            <span style="font-size:14px">${r}</span>
          </div>
        `).join('')}
        ${MP_CLIENT.refundReason==='其他' ? `
          <textarea class="textarea" placeholder="请描述具体原因 (最多 200 字)" style="margin-top:10px;width:100%;border:1px solid #ebebeb;border-radius:8px;padding:8px;font-size:13px;min-height:60px"></textarea>
        ` : ''}
      </div>

      <div style="background:#fff;margin:0 12px 12px;border-radius:12px;padding:16px;font-size:12px;color:var(--mp-text-2);line-height:1.7">
        <div style="font-weight:600;color:var(--mp-text-1);margin-bottom:6px">退款说明</div>
        <div>· 退款将原路返回到充值时使用的微信账户</div>
        <div>· 多次充值的，按 <b>"后充先退"</b> 原则匹配充值单</div>
        <div>· 园区管理员将在 1 个工作日内审核</div>
        <div>· 审核通过后，款项 1-3 个工作日内到账</div>
      </div>

      <div style="position:absolute;bottom:0;left:0;right:0;background:#fff;padding:12px 16px 24px;border-top:1px solid var(--mp-border);display:flex;gap:10px">
        <button class="mp-btn block gray" style="flex:1" onclick="mpClientTab('me')">取消</button>
        <button class="mp-btn block" style="flex:2" onclick="mpClientRefundNext()">提交申请</button>
      </div>
    `;
  } else if (step === 2) {
    // 确认页
    return `
      <div class="mp-refund-banner">
        <div class="rb-title">⚠️ 请确认退款信息</div>
        <div class="rb-desc">提交后不可撤销，请确认无误</div>
      </div>

      <div style="background:#fff;margin:0 12px 12px;border-radius:12px;padding:20px">
        <div style="text-align:center;padding:14px 0">
          <div style="font-size:13px;color:var(--mp-text-3)">退款金额</div>
          <div style="font-size:36px;font-weight:700;color:var(--mp-red);font-variant-numeric:tabular-nums;margin-top:6px">¥ ${parseFloat(MP_CLIENT.refundAmount).toFixed(2)}</div>
        </div>
        <div style="border-top:1px dashed #ebebeb;padding-top:14px">
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">退款方式</span><span>原路退回微信</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">微信账户</span><span>稻***者 (138****5678)</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">原充值单</span><span style="font-family:monospace;font-size:12px">CZ2026051410...</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">退款原因</span><span>${MP_CLIENT.refundReason || '不再使用'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span style="color:var(--mp-text-3)">预计到账</span><span>1-3 个工作日</span>
          </div>
        </div>
      </div>

      <div style="background:#fff;margin:0 12px 12px;border-radius:12px;padding:16px">
        <div style="font-size:13px;color:var(--mp-text-2);line-height:1.7">
          点击"确认提交"即表示您同意将本次退款金额按原路退回至微信账户，并知悉<a style="color:var(--mp-red)">《退款服务协议》</a>
        </div>
      </div>

      <div style="position:absolute;bottom:0;left:0;right:0;background:#fff;padding:12px 16px 24px;border-top:1px solid var(--mp-border);display:flex;gap:10px">
        <button class="mp-btn block gray" style="flex:1" onclick="mpClientRefundBack()">返回修改</button>
        <button class="mp-btn block" style="flex:2" onclick="mpClientRefundSubmit()">确认提交</button>
      </div>
    `;
  } else {
    // 成功页
    return `
      <div style="padding:60px 20px 20px;text-align:center">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#67c23a,#52c41a);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:42px;box-shadow:0 8px 20px rgba(82,196,26,0.3)">✓</div>
        <div style="font-size:20px;font-weight:600">退款申请已提交</div>
        <div style="font-size:13px;color:var(--mp-text-3);margin-top:8px">园区管理员将在 1 个工作日内审核</div>

        <div style="margin-top:30px;background:#fff;border-radius:12px;padding:20px;text-align:left">
          <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed #ebebeb">
            <span style="font-size:13px;color:var(--mp-text-3);width:80px">退款单号</span>
            <span style="font-family:monospace;font-size:13px">RF20260514${Date.now().toString().slice(-6)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed #ebebeb">
            <span style="font-size:13px;color:var(--mp-text-3);width:80px">退款金额</span>
            <span style="font-size:18px;font-weight:600;color:var(--mp-red)">¥${parseFloat(MP_CLIENT.refundAmount).toFixed(2)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:14px;padding:14px 0">
            <span style="font-size:13px;color:var(--mp-text-3);width:80px">当前状态</span>
            <span class="mp-tag orange">待审核</span>
          </div>
        </div>

        <div style="margin-top:24px;padding:14px;background:#fff7e6;border-radius:10px;font-size:12px;color:#d48806;line-height:1.7;text-align:left">
          <b>退款进度</b><br>
          · 第 1 步 (已完成)：提交申请<br>
          · 第 2 步 (进行中)：园区审核 (预计 1 工作日)<br>
          · 第 3 步：微信原路退回 (审核通过后 1-3 工作日)
        </div>
      </div>

      <div style="position:absolute;bottom:0;left:0;right:0;background:#fff;padding:12px 16px 24px;border-top:1px solid var(--mp-border);display:flex;gap:10px">
        <button class="mp-btn block gray" style="flex:1" onclick="mpClientTab('me')">返回首页</button>
        <button class="mp-btn block" style="flex:1" onclick="renderMpClient('refund-records')">查看记录</button>
      </div>
    `;
  }
}

function mpClientRefundNext() {
  if (!MP_CLIENT.refundReason) { showToast('请选择退款原因'); return; }
  if (!MP_CLIENT.refundAmount || MP_CLIENT.refundAmount <= 0) { showToast('请输入退款金额'); return; }
  if (MP_CLIENT.refundAmount > 80) { showToast('超过可退金额'); return; }
  MP_CLIENT.refundStep = 2;
  renderMpClient('refund');
}
function mpClientRefundBack() {
  MP_CLIENT.refundStep = 1;
  renderMpClient('refund');
}
function mpClientRefundSubmit() {
  MP_CLIENT.refundStep = 3;
  MP_CLIENT.balance -= parseFloat(MP_CLIENT.refundAmount);
  renderMpClient('refund');
}

function mpClientRefundRecords() {
  return `
    <div class="mp-section-title">退款记录</div>
    <div style="padding:0 12px 12px">
      ${[
        {id:'RF20260514142255', amt:50, status:'待审核', tagClass:'orange', sub:'已提交·等待园区审核'},
        {id:'RF20260512091215', amt:50, status:'已退款', tagClass:'green',  sub:'原路退回 · 微信账户'},
        {id:'RF20260501163022', amt:30, status:'已驳回', tagClass:'gray',   sub:'原因：未达退款门槛'},
      ].map(r => `
        <div class="mp-card flush" style="padding:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:14px;font-weight:600">余额退款</span>
            <span class="mp-tag ${r.tagClass}">${r.status}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:12px;color:var(--mp-text-3);font-family:monospace">${r.id}</span>
            <span style="font-size:18px;font-weight:600;color:var(--mp-red)">¥${r.amt.toFixed(2)}</span>
          </div>
          <div style="font-size:12px;color:var(--mp-text-3)">${r.sub}</div>
          <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
            <button class="mp-btn sm outline">查看详情</button>
            ${r.status==='待审核' ? '<button class="mp-btn sm gray">取消申请</button>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpClientOrders() {
  return `
    <div class="mp-merchant-tabs">
      <button class="mp-merchant-tab active">全部 (6)</button>
      <button class="mp-merchant-tab">待付款 (1)</button>
      <button class="mp-merchant-tab">待发货 (2)</button>
      <button class="mp-merchant-tab">待收货 (1)</button>
      <button class="mp-merchant-tab">已完成 (2)</button>
    </div>
    <div style="padding:12px">
      ${[
        {shop:'袁夫米面专卖', items:[{n:'稻田大米 5kg', img:'🌾', price:68}], status:'待发货', total:68},
        {shop:'袁夫味品', items:[{n:'自制蜂蜜 500g', img:'🍯', price:38}, {n:'稻田咸菜', img:'🫙', price:18}], status:'待收货', total:56},
        {shop:'门票预订', items:[{n:'园区门票 ×2', img:'🎫', price:80}], status:'待付款', total:80},
      ].map(o => `
        <div class="mp-card flush" style="padding:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:14px;font-weight:500">🏪 ${o.shop}</span>
            <span class="mp-tag ${o.status==='待付款'?'orange':o.status==='已完成'?'green':'red'}">${o.status}</span>
          </div>
          ${o.items.map(it => `
            <div style="display:flex;gap:10px;padding:8px 0">
              <div style="width:60px;height:60px;background:linear-gradient(135deg,#fff5e6,#f0d8a0);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:30px">${it.img}</div>
              <div style="flex:1">
                <div style="font-size:14px">${it.n}</div>
                <div style="font-size:13px;color:var(--mp-red);margin-top:6px">¥${it.price.toFixed(2)}</div>
              </div>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;padding-top:10px;border-top:1px dashed #f0f0f0">
            <span style="font-size:13px;color:var(--mp-text-2)">合计 <span style="color:var(--mp-red);font-size:16px;font-weight:600">¥${o.total.toFixed(2)}</span></span>
            ${o.status==='待付款' ? '<button class="mp-btn sm">立即支付</button>' : ''}
            ${o.status==='待发货' ? '<button class="mp-btn sm outline">申请退款</button>' : ''}
            ${o.status==='待收货' ? '<button class="mp-btn sm">确认收货</button>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
    <div style="height: 12px"></div>
  `;
}

function mpClientAddress() {
  return `
    <div style="padding:12px">
      ${[
        {n:'张三',phone:'138****5678',addr:'湖北省武汉市江夏区袁夫稻田园区民宿 B 栋 201',tag:'家',def:true},
        {n:'张三',phone:'138****5678',addr:'湖北省黄冈市黄梅县大河镇袁夫稻田旁',tag:'公司',def:false},
      ].map(a => `
        <div class="mp-card flush" style="padding:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:15px;font-weight:600">${a.n}</span>
            <span style="font-size:13px;color:var(--mp-text-2)">${a.phone}</span>
            <span class="mp-tag ${a.def?'red':'gray'}">${a.def?'默认':a.tag}</span>
          </div>
          <div style="font-size:13px;color:var(--mp-text-2);line-height:1.5">${a.addr}</div>
          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px">
            <button class="mp-btn sm outline">编辑</button>
            <button class="mp-btn sm gray">删除</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="position:absolute;bottom:0;left:0;right:0;background:#fff;padding:12px 16px 24px;border-top:1px solid var(--mp-border)">
      <button class="mp-btn block">+ 新建地址</button>
    </div>
  `;
}
