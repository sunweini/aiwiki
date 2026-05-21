// ============================================================
// PC 页面 (1/3) — 总览 / 数据看板 / 园区 / 店铺
// ============================================================

// Helper
function statCard(label, value, opts={}) {
  const {unit='¥', delta, deltaType, extra, icon, color, hideUnit=false} = opts;
  const isCurrency = unit === '¥' || unit === '$';
  const valStr = typeof value === 'number' ? value.toLocaleString('zh-CN', {minimumFractionDigits: isCurrency?2:0, maximumFractionDigits: isCurrency?2:0}) : value;
  let valueHtml;
  if (hideUnit || !unit) {
    valueHtml = valStr;
  } else if (isCurrency) {
    valueHtml = `<span class="unit">${unit}</span>${valStr}`;
  } else {
    valueHtml = `${valStr}<span class="unit" style="margin-left:4px;margin-right:0">${unit}</span>`;
  }
  return `
    <div class="stat-card">
      ${icon ? `<div class="stat-icon" style="background:${color || 'var(--ant-primary-bg)'};color:${color ? '#fff' : 'var(--ant-primary)'}">${icon}</div>` : ''}
      <div class="stat-label">${label}</div>
      <div class="stat-value">${valueHtml}</div>
      ${delta ? `<div class="stat-extra"><span class="${deltaType==='up'?'delta-up':'delta-down'}">${deltaType==='up'?'↑':'↓'} ${delta}</span> ${extra || ''}</div>` : (extra ? `<div class="stat-extra">${extra}</div>` : '')}
    </div>
  `;
}

// 绿色柱状图 (替代折线图)
function greenBarChart(values, days, opts={}) {
  const max = Math.max(...values);
  return `
    <div class="chart-bars" style="height:240px;padding:16px 24px">
      ${values.map((v, i) => {
        const pct = max > 0 ? (v / max) * 180 : 10;
        const shades = ['#52c41a','#389e0d','#237804','#73d13d','#5b8c00','#4a7a00'];
        return `<div class="bar-col" style="flex:1;min-width:0">
          <span class="bar-val" style="font-size:11px;color:var(--ant-text-2);font-weight:500;margin-bottom:4px">${v}</span>
          <div class="bar" style="height:${pct}px;background:linear-gradient(180deg,#73d13d,#389e0d);border-radius:4px 4px 0 0;min-width:12px;max-width:28px;margin:0 auto;transition:height 0.3s"></div>
          <span class="bar-label" style="font-size:11px;color:var(--ant-text-3);margin-top:6px">${days[i]}</span>
        </div>`;
      }).join('')}
    </div>
  `;
}

function lineChart(values, days, opts={}) {
  const max = Math.max(...values);
  const w = 600, h = 240, padL = 40, padR = 20, padT = 20, padB = 30;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const pts = values.map((v, i) => {
    const x = padL + (i / (values.length - 1)) * innerW;
    const y = padT + innerH - (v / max) * innerH;
    return [x, y];
  });
  const pathD = pts.map((p, i) => `${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ');
  const areaD = pathD + ` L${pts[pts.length-1][0]},${padT+innerH} L${pts[0][0]},${padT+innerH} Z`;
  const yTicks = 4;
  const yLabels = [];
  for (let i = 0; i <= yTicks; i++) {
    const v = Math.round(max * (i / yTicks));
    const y = padT + innerH - (i / yTicks) * innerH;
    yLabels.push(`<line x1="${padL}" y1="${y}" x2="${w-padR}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>
      <text x="${padL-6}" y="${y+4}" text-anchor="end" font-size="11" fill="#999">${v}</text>`);
  }
  return `
    <svg class="line-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1677ff" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#1677ff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${yLabels.join('')}
      <path d="${areaD}" fill="url(#lg1)"/>
      <path d="${pathD}" fill="none" stroke="#1677ff" stroke-width="2"/>
      ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#fff" stroke="#1677ff" stroke-width="2"/>`).join('')}
      ${days.map((d, i) => `<text x="${pts[i][0]}" y="${h-10}" text-anchor="middle" font-size="11" fill="#999">${d}</text>`).join('')}
    </svg>
  `;
}

// ============ 园区总览 ============
function renderOverview() {
  return `
    <div class="page-header">
      <div class="page-title">园区总览</div>
      <div class="page-subtitle">欢迎回来，${ROLES[VIEW_TO_ROLE[APP.view]].user}。以下为全局经营概况。</div>
    </div>

    <div class="stat-grid c4">
      ${statCard('总园区数', 2, {unit:'', icon:antStat('building'), color:'#1677ff', extra:'营业中 2 · 筹备中 0'})}
      ${statCard('总商户数', 5, {unit:'', icon:antStat('shop'), color:'#52c41a', extra:'餐饮 3 · 零售 1 · 体验 1'})}
      ${statCard('总用户数', 2837, {unit:'', icon:antStat('user'), color:'#722ed1', delta:'+12', deltaType:'up', extra:'今日新增'})}
      ${statCard('今日总销售额', 1286.50, {icon:antStat('dollar'), color:'#fa8c16', delta:'12.5%', deltaType:'up', extra:'较昨日'})}
    </div>

    <div class="stat-grid c4">
      ${statCard('今日订单数', 33, {unit:'', icon:antStat('file'), color:'#13c2c2', delta:'8%', deltaType:'up'})}
      ${statCard('今日客流量', 128, {unit:'', icon:antStat('lineChart'), color:'#eb2f96', delta:'15%', deltaType:'up'})}
      ${statCard('储值余额池', 24680.50, {icon:antStat('dollar'), color:'#1677ff', extra:'累计在用户账户'})}
      ${statCard('待退款金额', 142.00, {icon:'⤺', color:'#ff4d4f', extra:'3 笔待处理'})}
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card">
        <div class="card-head">
          <div class="card-title">近 7 天销售趋势</div>
          <div class="card-extra">单位：元</div>
        </div>
        <div class="card-body">
          ${greenBarChart([980, 1150, 1320, 1080, 1450, 1120, 1286], ['5/8','5/9','5/10','5/11','5/12','5/13','5/14'])}
        </div>
      </div>
      <div class="card">
        <div class="card-head">
          <div class="card-title">园区销售额分布</div>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:16px;align-items:center">
          <div class="donut"></div>
          <div style="width:100%">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px">
              <span style="width:12px;height:12px;background:#1677ff;border-radius:2px"></span>
              <span style="flex:1">黄梅袁夫稻田</span>
              <span style="font-weight:600">76.7%</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px">
              <span style="width:12px;height:12px;background:#c8963e;border-radius:2px"></span>
              <span style="flex:1">武汉袁夫稻田</span>
              <span style="font-weight:600">23.3%</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:13px">
              <span style="width:12px;height:12px;background:#722ed1;border-radius:2px"></span>
              <span style="flex:1">即将上线 · 江夏二期</span>
              <span style="font-weight:600">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div class="card-title">园区经营概况</div>
        <button class="btn btn-sm" onclick="goPage('park-list')">查看全部 →</button>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          ${PARKS.map((p, i) => `
            <div style="border:1px solid var(--ant-border-secondary);border-radius:8px;padding:16px;background:linear-gradient(135deg,${i===0?'#f6ffed':'#fff7e6'},#fff)">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <div style="width:40px;height:40px;border-radius:8px;background:${i===0?'linear-gradient(135deg,#52c41a,#389e0d)':'linear-gradient(135deg,#fa8c16,#d46b08)'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600">${p.name[0]}</div>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:15px">${p.name}</div>
                  <div style="font-size:12px;color:var(--ant-text-3)">${p.addr}</div>
                </div>
                <span class="tag success">${p.status}</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:12px">
                <div><div style="color:var(--ant-text-3)">商户</div><div style="font-weight:600;font-size:16px;margin-top:2px">${p.shopCount}</div></div>
                <div><div style="color:var(--ant-text-3)">今日销售</div><div style="font-weight:600;font-size:16px;margin-top:2px;color:#fa541c">¥${i===0?'986.50':'300.00'}</div></div>
                <div><div style="color:var(--ant-text-3)">本月销售</div><div style="font-weight:600;font-size:16px;margin-top:2px">¥${i===0?'12,340':'5,680'}</div></div>
              </div>
              <div style="margin-top:12px;display:flex;gap:8px">
                <button class="btn btn-sm" onclick="switchView('${i===0?'park-hm':'park-wh'}')">切换到此园区视角</button>
                <button class="btn btn-sm btn-primary">查看详情</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">实时业务动态</div></div>
      <div class="card-body" style="padding:0">
        <table class="ant-table">
          <thead><tr><th>时间</th><th>类型</th><th>详情</th><th>金额</th><th>状态</th></tr></thead>
          <tbody>
            <tr><td>14:22</td><td><span class="tag processing">订单</span></td><td>稻田守望者 在 火车餐厅 下单</td><td class="money danger">¥86.50</td><td><span class="tag success">已支付</span></td></tr>
            <tr><td>13:15</td><td><span class="tag cyan">核销</span></td><td>田园生活家 在 树下咖啡 核销</td><td class="money">¥32.00</td><td><span class="tag success">已核销</span></td></tr>
            <tr><td>11:40</td><td><span class="tag warning">退款</span></td><td>游客小新 申请订单退款</td><td class="money">¥22.00</td><td><span class="tag warning">待审核</span></td></tr>
            <tr><td>10:22</td><td><span class="tag purple">充值</span></td><td>稻田守望者 充值（赠 ¥30）</td><td class="money success">+¥200.00</td><td><span class="tag success">成功</span></td></tr>
            <tr><td>09:12</td><td><span class="tag error">余额退款</span></td><td>稻田守望者 申请余额退款</td><td class="money">¥50.00</td><td><span class="tag success">已退回</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============ 数据看板 ============
// 时间周期数据
const DATABOARD_DATA = {
  today:    { orders:33,  sales:1286.50, avg:38.98, flow:128,  deltaOrders:'8%', deltaSales:'12.5%', deltaAvg:'3.2%down', deltaFlow:'15%' },
  week:     { orders:198, sales:7820.00, avg:39.49, flow:842,  deltaOrders:'5%', deltaSales:'8.2%', deltaAvg:'1.8%', deltaFlow:'12%' },
  month:    { orders:856, sales:28560.50,avg:33.36, flow:3247, deltaOrders:'12%',deltaSales:'18%', deltaAvg:'2.1%', deltaFlow:'10%' },
  quarter:  { orders:2480,sales:82100.00,avg:33.10, flow:9580, deltaOrders:'15%',deltaSales:'22%', deltaAvg:'1.5%', deltaFlow:'18%' },
};

const DATABOARD_TRENDS = {
  today: {
    salesVals: [980, 1150, 1320, 1080, 1450, 1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1350, 1286],
    flowVals:  [68, 82, 95, 73, 128, 142, 128, 138, 109, 128, 142, 156, 128, 145, 128],
    userVals:  [2780, 2792, 2805, 2812, 2820, 2825, 2830, 2832, 2834, 2835, 2836, 2836, 2837, 2837, 2837],
    days:      ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14','5/15'],
  },
  week: {
    salesVals: [1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1350, 1286, 1420, 1380, 1520, 1450, 1480],
    flowVals:  [95, 128, 142, 128, 138, 109, 128, 142, 156, 128, 145, 142, 158, 148, 152],
    userVals:  [2795, 2805, 2812, 2820, 2825, 2830, 2832, 2834, 2835, 2836, 2836, 2837, 2837, 2838, 2840],
    days:      ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14','5/15'],
  },
  month: {
    salesVals: [980, 1150, 1320, 1080, 1450, 1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1350, 1286],
    flowVals:  [68, 82, 95, 73, 128, 142, 128, 138, 109, 128, 142, 156, 128, 145, 128],
    userVals:  [2780, 2792, 2805, 2812, 2820, 2825, 2830, 2832, 2834, 2835, 2836, 2836, 2837, 2837, 2837],
    days:      ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14','5/15'],
  },
  quarter: {
    salesVals: [850, 920, 1100, 1050, 1280, 1150, 1320, 1450, 1380, 1520, 1480, 1680, 1550, 1720, 1650],
    flowVals:  [55, 68, 82, 72, 95, 88, 128, 142, 135, 156, 148, 168, 155, 178, 165],
    userVals:  [2650, 2670, 2700, 2720, 2740, 2760, 2780, 2795, 2810, 2820, 2830, 2835, 2840, 2845, 2850],
    days:      ['2/1','2/10','2/20','3/1','3/10','3/20','4/1','4/10','4/20','4/25','5/1','5/5','5/8','5/12','5/15'],
  },
};

APP.databoardPeriod = APP.databoardPeriod || 'today';

function renderDataboard() {
  const period = APP.databoardPeriod;
  const d = DATABOARD_DATA[period];
  const t = DATABOARD_TRENDS[period];

  return `
    <div class="page-header">
      <div class="page-title">数据看板</div>
      <div class="page-subtitle">销售、客流、用户增长 · 多维度分析 · 15天趋势</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        ${['today','week','month','quarter'].map(p => {
          const labels = {today:'今日', week:'本周', month:'本月', quarter:'本季度'};
          return `<button class="btn btn-sm ${period===p?'btn-primary':''}" onclick="switchDataboardPeriod('${p}')">${labels[p]}</button>`;
        }).join('')}
      </div>
      <div class="spacer"></div>
      <button class="btn btn-sm" onclick="showToast('导出 Excel 中...')">${antIcon('download')} 导出 Excel</button>
    </div>

    <div class="stat-grid c4">
      ${statCard('订单总数', d.orders, {unit:'', icon:antStat('file'), color:'#1677ff', delta:d.deltaOrders, deltaType:d.deltaOrders.includes('down')?'down':'up'})}
      ${statCard('总销售额', d.sales, {icon:antStat('dollar'), color:'#fa8c16', delta:d.deltaSales, deltaType:'up'})}
      ${statCard('平均客单价', d.avg, {icon:'◴', color:'#52c41a', delta:d.deltaAvg.replace('down',''), deltaType:d.deltaAvg.includes('down')?'down':'up'})}
      ${statCard('总客流量', d.flow, {unit:'', icon:antStat('lineChart'), color:'#722ed1', delta:d.deltaFlow, deltaType:'up'})}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card"><div class="card-head"><div class="card-title">销售趋势 (15天)</div></div>
        <div class="card-body">${greenBarChart(t.salesVals, t.days)}</div>
      </div>
      <div class="card"><div class="card-head"><div class="card-title">客流趋势 (15天)</div></div>
        <div class="card-body">
          <div class="chart-bars">
            ${t.flowVals.map((v,i) => {
              const max = Math.max(...t.flowVals);
              return `<div class="bar-col"><span class="bar-val">${v}</span><div class="bar" style="height:${(v/max)*180}px"></div><span class="bar-label">${t.days[i]}</span></div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="card"><div class="card-head"><div class="card-title">用户增长趋势 (15天)</div><div class="card-extra">累计用户</div></div>
      <div class="card-body">${greenBarChart(t.userVals, t.days)}</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card"><div class="card-head"><div class="card-title">商户销售排行</div></div>
        <div class="card-body">
          ${[
            {name:'火车餐厅', val:586, pct:60},
            {name:'树下咖啡', val:400, pct:42},
            {name:'江夏火车厨', val:230, pct:25},
            {name:'稻田鲜货铺', val:70, pct:8},
            {name:'稻田手作坊', val:0, pct:0},
          ].map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
              <span style="width:90px;font-size:13px">${s.name}</span>
              <div style="flex:1;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden">
                <div style="height:100%;background:linear-gradient(90deg,#1677ff,#69b1ff);width:${s.pct}%"></div>
              </div>
              <span style="width:80px;text-align:right;font-weight:500;font-variant-numeric:tabular-nums">¥${s.val.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card"><div class="card-head"><div class="card-title">用户活跃 24h 分布</div></div>
        <div class="card-body">
          <div style="display:flex;align-items:flex-end;gap:3px;height:180px;padding:0 8px">
            ${Array.from({length:24}).map((_, h) => {
              const heat = h<6 ? 0.1 : h<11 ? 0.3 + Math.random()*0.3 : h<14 ? 0.7 + Math.random()*0.3 : h<17 ? 0.5+Math.random()*0.3 : h<21 ? 0.6+Math.random()*0.4 : 0.2;
              return `<div style="flex:1;height:${heat*100}%;background:linear-gradient(180deg,#52c41a,#389e0d);border-radius:2px 2px 0 0" title="${h}时"></div>`;
            }).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ant-text-3);padding:4px 8px">
            <span>0时</span><span>6时</span><span>12时</span><span>18时</span><span>23时</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchDataboardPeriod(p) {
  APP.databoardPeriod = p;
  renderPCContent('databoard');
}

// ============ 园区列表 ============
function renderParkList() {
  return `
    <div class="page-header">
      <div class="page-title">园区列表</div>
      <div class="page-subtitle">管理平台旗下所有园区</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <input class="input" placeholder="园区名称 / 编码" style="width:200px">
      </div>
      <div class="filter-item">
        <select class="select"><option>全部状态</option><option>营业中</option><option>筹备中</option><option>已关闭</option></select>
      </div>
      <button class="btn btn-primary btn-sm">${antIcon('search')} 查询</button>
      <button class="btn btn-sm">重置</button>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="goPage('park-add')">+ 新增园区</button>
    </div>

    <div class="card">
      <table class="ant-table">
        <thead><tr><th>园区名称</th><th>编码</th><th>地址</th><th>商户数</th><th>状态</th><th>创建时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          ${PARKS.map(p => `
            <tr>
              <td><b>${p.name}</b></td>
              <td class="col-mono">${p.code}</td>
              <td>${p.addr}</td>
              <td>${p.shopCount}</td>
              <td><span class="tag success">${p.status}</span></td>
              <td>${p.createdAt}</td>
              <td class="col-actions">
                <button class="btn-link">编辑</button>
                <span class="divider">|</span>
                <button class="btn-link">数据快照</button>
                <span class="divider">|</span>
                <button class="btn-link" onclick="switchView('${p.id===1?'park-hm':'park-wh'}')">切换视角</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination">
        <span>共 ${PARKS.length} 条</span>
        <select class="select" style="width:100px"><option>10 条/页</option></select>
        <button class="page-btn" disabled>‹</button>
        <button class="page-btn active">1</button>
        <button class="page-btn" disabled>›</button>
      </div>
    </div>
  `;
}

function renderParkAdd() {
  return `
    <div class="page-header">
      <div class="page-title">新增园区</div>
      <div class="page-subtitle">填写园区基础信息，保存后可在园区列表中查看</div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="form-row">
          <div class="form-item">
            <label class="form-label required">园区名称</label>
            <input class="input" placeholder="如：黄梅袁夫稻田">
          </div>
          <div class="form-item">
            <label class="form-label required">园区编码</label>
            <input class="input" placeholder="自动生成或手动输入" value="PARK_HM_002">
            <div class="form-help">用于系统内部识别，创建后不可修改</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label class="form-label">联系人</label>
            <input class="input" placeholder="请输入联系人姓名">
          </div>
          <div class="form-item">
            <label class="form-label">联系电话</label>
            <input class="input" placeholder="请输入联系电话">
          </div>
        </div>
        <div class="form-item">
          <label class="form-label required">园区地址</label>
          <input class="input" placeholder="请输入详细地址">
        </div>
        <div class="form-row">
          <div class="form-item">
            <label class="form-label">营业时间</label>
            <input class="input" placeholder="如 09:00 - 21:00">
          </div>
          <div class="form-item">
            <label class="form-label">园区 LOGO</label>
            <div style="display:flex;gap:10px;align-items:center">
              <div style="width:80px;height:80px;border:1px dashed var(--ant-border);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--ant-text-3);background:var(--ant-fill-quaternary);flex-direction:column;font-size:12px;gap:4px">
                <span style="font-size:20px">+</span>上传
              </div>
              <div class="form-help">推荐尺寸 200×200，jpg/png</div>
            </div>
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">园区简介</label>
          <textarea class="textarea" placeholder="请输入园区简介（最多 500 字）"></textarea>
        </div>
        <div class="form-item">
          <label class="form-label">状态</label>
          <div style="display:flex;gap:14px;font-size:14px">
            <label><input type="radio" name="ps" checked style="margin-right:4px"> 营业中</label>
            <label><input type="radio" name="ps" style="margin-right:4px"> 筹备中</label>
            <label><input type="radio" name="ps" style="margin-right:4px"> 已关闭</label>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--ant-border-secondary);padding-top:20px;margin-top:8px">
          <button class="btn" onclick="goPage('park-list')">取消</button>
          <button class="btn btn-primary" onclick="showToast('园区已保存');goPage('park-list')">保存</button>
        </div>
      </div>
    </div>
  `;
}

// ============ 店铺管理 ============
function renderShopList() {
  return `
    <div class="page-header">
      <div class="page-title">店铺列表</div>
      <div class="page-subtitle">管理${APP.view==='platform'?'全部园区':'本园区'}的所有商户/店铺</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item"><input class="input" placeholder="店铺名称"></div>
      <div class="filter-item"><select class="select"><option>全部状态</option><option>营业中</option><option>休息中</option><option>已关闭</option></select></div>
      <div class="filter-item"><select class="select"><option>全部类型</option><option>餐饮</option><option>零售</option><option>体验</option></select></div>
      ${APP.view==='platform' ? `<div class="filter-item"><select class="select"><option>全部园区</option><option>黄梅</option><option>武汉</option></select></div>` : ''}
      <button class="btn btn-primary btn-sm">${antIcon('search')} 查询</button>
      <button class="btn btn-sm">重置</button>
      <div class="spacer"></div>
      <button class="btn btn-primary">+ 添加店铺</button>
    </div>

    <div class="card">
      <table class="ant-table">
        <thead><tr><th>店铺名称</th><th>所属园区</th><th>地址</th><th>类型</th><th>状态</th><th>创建时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          ${SHOPS.map(s => `
            <tr>
              <td><b>${s.name}</b></td>
              <td>${s.park}</td>
              <td>${s.addr}</td>
              <td><span class="tag ${s.type==='餐饮'?'processing':s.type==='零售'?'purple':'cyan'}">${s.type}</span></td>
              <td><span class="tag ${s.status==='营业中'?'success':'default'}">${s.status}</span></td>
              <td>${s.createdAt}</td>
              <td class="col-actions">
                <button class="btn-link" onclick="openShopEdit(${s.id})">编辑</button>
                <span class="divider">|</span>
                <button class="btn-link" onclick="openShopQr(${s.id})">二维码</button>
                <span class="divider">|</span>
                <button class="btn-link danger">${s.status==='营业中'?'下架':'上架'}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination">
        <span>共 ${SHOPS.length} 条</span>
        <button class="page-btn active">1</button>
      </div>
    </div>
  `;
}

// ============ 店铺编辑/二维码弹窗 ============
function openShopEdit(id) {
  const s = SHOPS.find(x => x.id === id);
  if (!s) return;
  showModal({
    title: '编辑店铺 · ' + s.name,
    body: `
      <div>
        <div class="form-row">
          <div class="form-item">
            <label class="form-label required">店铺名称</label>
            <input class="input" value="${s.name}">
          </div>
          <div class="form-item">
            <label class="form-label required">店铺类型</label>
            <select class="select"><option ${s.type==='餐饮'?'selected':''}>餐饮</option><option ${s.type==='零售'?'selected':''}>零售</option><option ${s.type==='体验'?'selected':''}>体验</option></select>
          </div>
        </div>
        <div class="form-item">
          <label class="form-label required">地址</label>
          <input class="input" value="${s.addr}">
        </div>
        <div style="border-top:1px solid var(--ant-border-secondary);margin:16px 0;padding-top:16px">
          <div style="font-size:14px;font-weight:600;margin-bottom:12px">💳 收款信息</div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">收款银行</label>
              <select class="select"><option>招商银行</option><option>工商银行</option><option>建设银行</option><option>农业银行</option></select>
            </div>
            <div class="form-item">
              <label class="form-label">银行账号</label>
              <input class="input" value="6214****6908" placeholder="银行账号">
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">收款人</label>
              <input class="input" value="黄轩辉" placeholder="收款人姓名">
            </div>
            <div class="form-item">
              <label class="form-label">收款人手机</label>
              <input class="input" value="139****5678" placeholder="手机号">
            </div>
          </div>
        </div>
        <div style="border-top:1px solid var(--ant-border-secondary);margin:16px 0;padding-top:16px">
          <div style="font-size:14px;font-weight:600;margin-bottom:12px">📞 联系方式</div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">联系人</label>
              <input class="input" value="黄轩辉" placeholder="联系人">
            </div>
            <div class="form-item">
              <label class="form-label">联系电话</label>
              <input class="input" value="13912345678" placeholder="联系电话">
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">营业时间</label>
            <input class="input" value="10:00 - 21:00" placeholder="如 10:00 - 21:00">
          </div>
        </div>
      </div>
    `,
    footer: `<button class="btn" onclick="closeModal()">取消</button><button class="btn btn-primary" onclick="closeModal();showToast('店铺「${s.name}」已保存')">保存</button>`,
  });
}

function openShopQr(id) {
  const s = SHOPS.find(x => x.id === id);
  if (!s) return;
  showModal({
    title: '收款二维码 · ' + s.name,
    body: `
      <div style="text-align:center;padding:20px">
        <div style="font-size:16px;font-weight:600;margin-bottom:6px">${s.name}</div>
        <div style="font-size:12px;color:var(--ant-text-3);margin-bottom:16px">${s.park} · ${s.type}</div>
        <div style="width:220px;height:220px;border:1px solid var(--ant-border);border-radius:12px;padding:10px;background:#fff;margin:0 auto;display:flex;align-items:center;justify-content:center">
          <svg viewBox="0 0 100 100" width="200" height="200">
            <rect width="100" height="100" fill="#fff"/>
            <rect x="3" y="3" width="29" height="29" fill="none" stroke="#000" stroke-width="5"/><rect x="10" y="10" width="15" height="15" fill="#000" rx="2"/>
            <rect x="68" y="3" width="29" height="29" fill="none" stroke="#000" stroke-width="5"/><rect x="75" y="10" width="15" height="15" fill="#000" rx="2"/>
            <rect x="3" y="68" width="29" height="29" fill="none" stroke="#000" stroke-width="5"/><rect x="10" y="75" width="15" height="15" fill="#000" rx="2"/>
            <rect x="38" y="38" width="24" height="24" fill="#fff"/><rect x="40" y="40" width="20" height="20" rx="3" fill="#1677ff"/><text x="50" y="54" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">禾</text>
          </svg>
        </div>
        <div style="font-size:13px;color:var(--ant-text-2);margin-top:14px;font-family:monospace">${s.name} · 收款码</div>
        <div style="font-size:11px;color:var(--ant-text-3);margin-top:4px">扫码向本店付款 · 每分钟自动刷新</div>
      </div>
    `,
    footer: `<button class="btn" onclick="closeModal()">关闭</button><button class="btn btn-primary" onclick="closeModal();showToast('二维码已下载')">${antIcon('download')} 下载二维码</button>`,
  });
}

function renderShopStats() {
  return `
    <div class="page-header">
      <div class="page-title">店铺统计</div>
    </div>
    <div class="stat-grid c4">
      ${statCard('店铺总数', 5, {unit:'', icon:antStat('shop'), color:'#1677ff'})}
      ${statCard('营业中', 4, {unit:'', icon:antStat('check'), color:'#52c41a'})}
      ${statCard('休息中', 1, {unit:'', icon:antStat('pause'), color:'#faad14'})}
      ${statCard('已关闭', 0, {unit:'', icon:antStat('stop'), color:'#ff4d4f'})}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card"><div class="card-head"><div class="card-title">店铺状态分布</div></div>
        <div class="card-body" style="display:flex;justify-content:center;padding:30px 20px">
          <div style="width:200px;height:200px;border-radius:50%;background:conic-gradient(#52c41a 0 80%,#faad14 80% 100%);position:relative">
            <div style="position:absolute;inset:30%;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column">
              <div style="font-size:24px;font-weight:600">5</div>
              <div style="font-size:12px;color:var(--ant-text-3)">家店铺</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card"><div class="card-head"><div class="card-title">店铺类型分布</div></div>
        <div class="card-body">
          ${[{label:'餐饮',count:3,pct:60,color:'#1677ff'},{label:'零售',count:1,pct:20,color:'#722ed1'},{label:'体验',count:1,pct:20,color:'#13c2c2'}].map(t => `
            <div style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
                <span><span style="display:inline-block;width:8px;height:8px;background:${t.color};border-radius:2px;margin-right:6px"></span>${t.label}</span>
                <span>${t.count} 家 · ${t.pct}%</span>
              </div>
              <div style="height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden">
                <div style="height:100%;background:${t.color};width:${t.pct}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderShopTypes() {
  return `
    <div class="page-header">
      <div class="page-title">店铺类型</div>
      <div class="page-subtitle">维护店铺分类，用于店铺创建时选择</div>
    </div>
    <div class="filter-bar">
      <input class="input" placeholder="类型名称" style="width:200px">
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-primary">+ 新增类型</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr><th>名称</th><th>编码</th><th>描述</th><th>状态</th><th>创建人</th><th>创建时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          <tr><td><b>餐饮</b></td><td class="col-mono">DINING</td><td>餐厅、咖啡馆等餐饮类商户</td><td><span class="tag success">启用</span></td><td>张三</td><td>2026-01-21 16:37</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">禁用</button></td></tr>
          <tr><td><b>零售</b></td><td class="col-mono">RETAIL</td><td>农产品、纪念品等零售类商户</td><td><span class="tag success">启用</span></td><td>张三</td><td>2026-02-15 10:20</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">禁用</button></td></tr>
          <tr><td><b>体验</b></td><td class="col-mono">EXPERIENCE</td><td>稻田体验、手工坊等体验类商户</td><td><span class="tag success">启用</span></td><td>张三</td><td>2026-02-15 10:21</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">禁用</button></td></tr>
          <tr><td><b>住宿</b></td><td class="col-mono">LODGING</td><td>民宿、客栈等住宿类商户</td><td><span class="tag default">未启用</span></td><td>张三</td><td>2026-03-10 14:50</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link">启用</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
