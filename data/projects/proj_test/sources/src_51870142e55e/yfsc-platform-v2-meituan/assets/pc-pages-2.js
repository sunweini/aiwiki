// ============================================================
// PC 页面 (2/3) — 用户 / 消费 / 财务 / 销售/客流统计
// ============================================================

// ============ 客户列表 ============
function renderUserList() {
  return `
    <div class="page-header">
      <div class="page-title">客户列表</div>
      <div class="page-subtitle">管理 C 端注册客户、查看余额与消费、人脸录入状态</div>
    </div>
    <div class="filter-bar">
      <div class="filter-item"><input class="input" placeholder="客户昵称"></div>
      <div class="filter-item"><input class="input" placeholder="手机号"></div>
      <div class="filter-item"><select class="select"><option>全部人脸状态</option><option>已录入</option><option>未录入</option></select></div>
      <button class="btn btn-primary btn-sm">${antIcon('search')} 查询</button>
      <button class="btn btn-sm">重置</button>
      <div class="spacer"></div>
      <button class="btn">${antIcon('download')} 导出</button>
      <button class="btn btn-primary">+ 手动添加</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr>
          <th>客户ID</th><th>昵称</th><th>手机号</th><th>OpenID</th>
          <th style="text-align:right">余额</th><th style="text-align:right">累计消费</th>
          <th>人脸状态</th><th>注册时间</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          ${USERS.map(u => `
            <tr>
              <td><span class="code-chip">${u.id}</span></td>
              <td><b>${u.nick}</b></td>
              <td>${u.phone}</td>
              <td class="col-mono">${u.openid}</td>
              <td style="text-align:right" class="money ${u.balance>0?'success':''}">¥${u.balance.toFixed(2)}</td>
              <td style="text-align:right" class="money">¥${u.consumption.toFixed(2)}</td>
              <td><span class="tag ${u.faceState==='已录入'?'success':'default'}">${u.faceState}</span></td>
              <td>${u.regAt}</td>
              <td class="col-actions">
                <button class="btn-link">详情</button>
                <span class="divider">|</span>
                <button class="btn-link">充值记录</button>
                <span class="divider">|</span>
                <button class="btn-link danger">禁用</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination">
        <span>共 2,837 条</span>
        <select class="select" style="width:100px"><option>10 条/页</option></select>
        <button class="page-btn">‹</button>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn">3</button>
        <button class="page-btn">...</button>
        <button class="page-btn">284</button>
        <button class="page-btn">›</button>
      </div>
    </div>
  `;
}

function renderUserStats() {
  return `
    <div class="page-header"><div class="page-title">客户统计</div></div>
    <div class="filter-bar">
      <span style="font-size:13px;color:var(--ant-text-2)">日期范围</span>
      <input class="input" placeholder="开始日期" value="2026-04-14" style="width:140px">
      <span>至</span>
      <input class="input" placeholder="结束日期" value="2026-05-14" style="width:140px">
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm">${antIcon('download')} 导出</button>
    </div>
    <div class="stat-grid c4">
      ${statCard('总用户数', 2837, {unit:'', icon:antStat('user'), color:'#1677ff'})}
      ${statCard('今日新增', 12, {unit:'', icon:antStat('plus'), color:'#52c41a', delta:'20%', deltaType:'up'})}
      ${statCard('今日活跃', 40, {unit:'', icon:antStat('target'), color:'#722ed1'})}
      ${statCard('平均活跃天数', '15.5', {unit:'', icon:antStat('chart'), color:'#fa8c16'})}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card"><div class="card-head"><div class="card-title">用户增长趋势</div></div>
        <div class="card-body">${greenBarChart([2780, 2792, 2805, 2812, 2820, 2825, 2837], ['5/8','5/9','5/10','5/11','5/12','5/13','5/14'])}</div>
      </div>
      <div class="card"><div class="card-head"><div class="card-title">用户活跃分布</div></div>
        <div class="card-body" style="display:flex;align-items:center;justify-content:center;gap:30px">
          <div style="width:160px;height:160px;border-radius:50%;background:conic-gradient(#1677ff 0 35%,#52c41a 35% 60%,#fa8c16 60% 80%,#722ed1 80% 100%);position:relative">
            <div style="position:absolute;inset:30%;background:#fff;border-radius:50%"></div>
          </div>
          <div style="font-size:13px">
            ${[{l:'高频活跃',c:'#1677ff',p:'35%'},{l:'每周活跃',c:'#52c41a',p:'25%'},{l:'月度活跃',c:'#fa8c16',p:'20%'},{l:'休眠用户',c:'#722ed1',p:'20%'}].map(x => `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:10px;height:10px;background:${x.c};border-radius:2px"></span>${x.l}<b style="margin-left:auto">${x.p}</b></div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="card"><div class="card-head"><div class="card-title">统计明细</div></div>
      <table class="ant-table">
        <thead><tr><th>日期</th><th>新增用户</th><th>活跃用户</th><th>累计用户</th><th>留存率</th></tr></thead>
        <tbody>
          <tr><td>2026-05-14</td><td>12</td><td>40</td><td>2,837</td><td>87%</td></tr>
          <tr><td>2026-05-13</td><td>15</td><td>42</td><td>2,825</td><td>85%</td></tr>
          <tr><td>2026-05-12</td><td>8</td><td>38</td><td>2,820</td><td>83%</td></tr>
          <tr><td>2026-05-11</td><td>7</td><td>35</td><td>2,812</td><td>86%</td></tr>
          <tr><td>2026-05-10</td><td>13</td><td>41</td><td>2,805</td><td>89%</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============ 充值记录 ============
function renderRechargeRecords() {
  return `
    <div class="page-header">
      <div class="page-title">充值记录</div>
      <div class="page-subtitle">用户余额充值流水、赠送金额、退款记录</div>
    </div>
    <div class="filter-bar">
      <div class="filter-item"><input class="input" placeholder="手机号 / 交易号"></div>
      <div class="filter-item"><select class="select"><option>全部状态</option><option>成功</option><option>失败</option><option>已退款</option></select></div>
      <div class="filter-item"><select class="select"><option>全部支付方式</option><option>微信支付</option><option>余额</option></select></div>
      <span style="font-size:13px;color:var(--ant-text-2)">📅</span>
      <input class="input" placeholder="开始日期" style="width:140px">
      <span>~</span>
      <input class="input" placeholder="结束日期" style="width:140px">
      <button class="btn btn-primary btn-sm">查询</button>
      <button class="btn btn-sm">重置</button>
    </div>
    <div class="stat-grid c4">
      ${statCard('累计充值总额', 28560.00, {icon:antStat('dollar'), color:'#1677ff'})}
      ${statCard('累计赠送金额', 3820.00, {icon:antStat('gift'), color:'#fa8c16'})}
      ${statCard('今日充值', 800.00, {icon:antStat('dollar'), color:'#52c41a', delta:'24%', deltaType:'up'})}
      ${statCard('已退款金额', 542.00, {icon:'⤺', color:'#ff4d4f'})}
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr>
          <th>充值单号</th><th>手机号</th><th style="text-align:right">金额</th><th style="text-align:right">赠送</th>
          <th>支付方式</th><th>状态</th><th>交易号</th><th>备注</th><th>时间</th>
        </tr></thead>
        <tbody>
          ${RECHARGES.map(r => `
            <tr>
              <td class="col-mono">${r.id}</td>
              <td>${r.phone}</td>
              <td style="text-align:right" class="money ${r.amount>0?'success':'danger'}">${r.amount>0?'+':''}¥${Math.abs(r.amount).toFixed(2)}</td>
              <td style="text-align:right" class="money">${r.gift>0?'+¥'+r.gift.toFixed(2):'-'}</td>
              <td>${r.pay}</td>
              <td><span class="tag ${r.status==='成功'?'success':r.status==='已退款'?'error':'default'}">${r.status}</span></td>
              <td class="col-mono">${r.txn}</td>
              <td>${r.remark || '-'}</td>
              <td>${r.at}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination">
        <span>共 156 条</span>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn">3</button>
        <button class="page-btn">...</button>
        <button class="page-btn">16</button>
      </div>
    </div>
  `;
}

// ============ 订单列表 / 核销 / 退款 ============
function renderOrderList() {
  return `
    <div class="page-header">
      <div class="page-title">订单列表</div>
      <div class="page-subtitle">管理所有消费订单、查看支付状态与核销情况</div>
    </div>
    <div class="filter-bar">
      <input class="input" placeholder="订单号 / 用户昵称" style="width:200px">
      <select class="select"><option>全部状态</option><option>待支付</option><option>已支付</option><option>已核销</option><option>已退款</option><option>退款处理中</option></select>
      <select class="select"><option>全部支付方式</option><option>余额</option><option>微信支付</option></select>
      <span style="font-size:13px;color:var(--ant-text-2)">📅</span>
      <input class="input" placeholder="开始日期" style="width:140px">
      <span>~</span>
      <input class="input" placeholder="结束日期" style="width:140px">
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm">${antIcon('download')} 导出</button>
    </div>
    <div class="stat-grid c4">
      ${statCard('今日订单', 33, {unit:'', icon:antStat('file'), color:'#1677ff'})}
      ${statCard('已支付', 28, {unit:'', icon:antStat('check'), color:'#52c41a'})}
      ${statCard('已核销', 24, {unit:'', icon:'◑', color:'#722ed1'})}
      ${statCard('已退款', 3, {unit:'', icon:antStat('undo'), color:'#ff4d4f'})}
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr><th>订单号</th><th>用户</th><th>商户</th><th style="text-align:right">金额</th><th>支付方式</th><th>状态</th><th>下单时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          ${shopData(ORDERS,'shop').map(o => `
            <tr>
              <td class="col-mono">${o.no}</td>
              <td>${o.user}</td>
              <td>${o.shop}</td>
              <td style="text-align:right;font-weight:600" class="money">¥${o.amount.toFixed(2)}</td>
              <td>${o.pay}</td>
              <td><span class="tag ${o.status==='已支付'?'processing':o.status==='已核销'?'success':o.status==='已退款'?'default':'warning'}">${o.status}</span></td>
              <td>${o.time}</td>
              <td class="col-actions">
                <button class="btn-link">详情</button>
                ${o.status==='已支付'?'<span class="divider">|</span><button class="btn-link">核销</button>':''}
                ${o.status==='已支付'||o.status==='已核销'?'<span class="divider">|</span><button class="btn-link danger">退款</button>':''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination">
        <span>共 33 条</span>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
      </div>
    </div>
  `;
}

function renderVerify() {
  return `
    <div class="page-header">
      <div class="page-title">核销管理</div>
      <div class="page-subtitle">扫码核销订单/优惠券，查看核销记录</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:16px">
      <div class="card">
        <div class="card-head"><div class="card-title">扫码核销</div></div>
        <div class="card-body" style="display:flex;flex-direction:column;align-items:center;padding:30px 20px">
          <div style="width:200px;height:200px;border:2px dashed var(--ant-border);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--ant-text-3);background:var(--ant-fill-quaternary);gap:12px">
            <span style="font-size:48px">⊞</span>
            <span style="font-size:13px">扫描用户核销码</span>
          </div>
          <input class="input" placeholder="或输入核销码" style="margin-top:16px;max-width:240px">
          <button class="btn btn-primary" style="margin-top:10px">立即核销</button>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">最近核销记录</div></div>
        <table class="ant-table">
          <thead><tr><th>核销码</th><th>订单/用户</th><th>商品</th><th>金额</th><th>核销人</th><th>核销时间</th></tr></thead>
          <tbody>
            <tr><td class="col-mono">HX26051413150</td><td>田园生活家</td><td>精品咖啡 ×2</td><td class="money">¥32.00</td><td>赵六</td><td>2026-05-14 13:15</td></tr>
            <tr><td class="col-mono">HX26051410250</td><td>小麦的麦</td><td>火车特色套餐</td><td class="money">¥128.00</td><td>王五</td><td>2026-05-14 10:25</td></tr>
            <tr><td class="col-mono">HX26051409150</td><td>稻香一缕</td><td>美式咖啡</td><td class="money">¥46.00</td><td>赵六</td><td>2026-05-14 09:15</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderRefund() {
  return `
    <div class="page-header">
      <div class="page-title">退款处理</div>
      <div class="page-subtitle">订单退款 + 余额退款 审核、原路退回</div>
    </div>

    <div class="filter-bar">
      <input class="input" placeholder="退款单号 / 订单号" style="width:200px">
      <select class="select"><option>全部状态</option><option>待审核</option><option>已通过</option><option>已驳回</option></select>
      <select class="select"><option>全部类型</option><option>订单退款</option><option>余额退款</option></select>
      <button class="btn btn-primary btn-sm">查询</button>
    </div>

    <div class="stat-grid c4">
      ${statCard('待审核', 1, {unit:'笔', icon:'⏳', color:'#faad14', extra:'共 ¥22.00'})}
      ${statCard('本月已通过', 12, {unit:'笔', icon:'✓', color:'#52c41a', extra:'共 ¥542.00'})}
      ${statCard('本月已驳回', 2, {unit:'笔', icon:'✕', color:'#ff4d4f'})}
      ${statCard('退款成功率', '85.7%', {unit:'', icon:antStat('chart'), color:'#1677ff'})}
    </div>

    <div class="card">
      <table class="ant-table">
        <thead><tr><th>退款单号</th><th>关联订单</th><th>用户</th><th>类型</th><th style="text-align:right">退款金额</th><th>退款原因</th><th>状态</th><th>申请时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          ${REFUNDS.map(r => `
            <tr>
              <td class="col-mono">${r.id}</td>
              <td class="col-mono">${r.order}</td>
              <td>${r.user}</td>
              <td><span class="tag ${r.type==='余额退款'?'purple':'processing'}">${r.type}</span></td>
              <td style="text-align:right;font-weight:600" class="money">¥${r.amount.toFixed(2)}</td>
              <td>${r.reason}</td>
              <td><span class="tag ${r.status==='已通过'?'success':r.status==='已驳回'?'error':'warning'}">${r.status}</span></td>
              <td>${r.applyAt}</td>
              <td class="col-actions">
                ${r.status==='待审核' ? `
                  <button class="btn-link" onclick="openRefundReview('${r.id}')">审核</button>
                ` : `
                  <button class="btn-link">查看详情</button>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination"><span>共 ${REFUNDS.length} 条</span><button class="page-btn active">1</button></div>
    </div>
  `;
}

// ============ 销售统计 ============
function renderSalesStats() {
  return `
    <div class="page-header"><div class="page-title">销售统计</div><div class="page-subtitle">销售概览 · 销售趋势 · 储值统计</div></div>
    <div class="filter-bar">
      <span style="font-size:13px;color:var(--ant-text-2)">📅</span>
      <input class="input" value="2026-04-14" style="width:140px">
      <span>~</span>
      <input class="input" value="2026-05-14" style="width:140px">
      <select class="select"><option>全部店铺</option><option>火车餐厅</option><option>树下咖啡</option></select>
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm">${antIcon('download')} 导出 Excel</button>
    </div>

    <div class="stat-grid c4">
      ${statCard('订单总数', 856, {unit:'', icon:antStat('file'), color:'#1677ff', delta:'12%', deltaType:'up'})}
      ${statCard('总销售额', 28560.50, {icon:antStat('dollar'), color:'#fa8c16', delta:'18%', deltaType:'up'})}
      ${statCard('平均订单金额', 33.36, {icon:antStat('dollar'), color:'#52c41a'})}
      ${statCard('储值消费额', 12480.00, {icon:antStat('dollar'), color:'#722ed1', extra:'占总销售 43.7%'})}
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">储值统计</div></div>
      <div class="card-body">
        <div class="stat-grid c4" style="margin-bottom:0">
          ${statCard('充值总额', 28560.00, {icon:antStat('dollar'), color:'#1677ff'})}
          ${statCard('充值用户数', 186, {unit:'', icon:antStat('user'), color:'#52c41a'})}
          ${statCard('储值消费金额', 12480.00, {icon:antStat('dollar'), color:'#fa8c16'})}
          ${statCard('储值剩余余额', 24680.50, {icon:antStat('dollar'), color:'#722ed1'})}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div class="card-title">销售趋势</div>
        <div style="display:flex;gap:4px">
          <button class="btn btn-xs btn-primary">按日</button>
          <button class="btn btn-xs">按周</button>
          <button class="btn btn-xs">按月</button>
        </div>
      </div>
      <div class="card-body">${greenBarChart([980, 1150, 1320, 1080, 1450, 1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1286],
        ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14'])}</div>
    </div>
  `;
}

// ============ 客流统计 ============
function renderFlowStats() {
  return `
    <div class="page-header"><div class="page-title">客流统计</div><div class="page-subtitle">客流数据来源于闸机扫码 / 人脸通行自动采集</div></div>
    <div class="filter-bar">
      <span style="font-size:13px;color:var(--ant-text-2)">📅</span>
      <input class="input" value="2026-04-14" style="width:140px">
      <span>~</span>
      <input class="input" value="2026-05-14" style="width:140px">
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm">${antIcon('download')} 导出</button>
    </div>
    <div class="stat-grid c4">
      ${statCard('今日客流', 128, {unit:'', icon:'⛬', color:'#1677ff', delta:'15%', deltaType:'up'})}
      ${statCard('本周客流', 842, {unit:'', icon:antStat('lineChart'), color:'#52c41a'})}
      ${statCard('本月客流', 3247, {unit:'', icon:antStat('team'), color:'#722ed1'})}
      ${statCard('同比变化', '+18%', {unit:'', icon:antStat('arrowUp'), color:'#fa8c16'})}
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">客流趋势</div>
        <div style="display:flex;gap:4px">
          <button class="btn btn-xs btn-primary">按日</button>
          <button class="btn btn-xs">按周</button>
          <button class="btn btn-xs">按月</button>
        </div>
      </div>
      <div class="card-body">
        <div class="chart-bars">
          ${[68,82,95,73,128,142,156,138,109,128,142,156,128,128].map((v,i) => {
            const max = 180;
            return `<div class="bar-col"><span class="bar-val">${v}</span><div class="bar" style="height:${(v/max)*180}px;background:linear-gradient(180deg,#52c41a,#389e0d)"></div><span class="bar-label">5/${i+1}</span></div>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card"><div class="card-head"><div class="card-title">24h 高峰时段分布</div></div>
        <div class="card-body">
          <div style="display:flex;align-items:flex-end;gap:3px;height:160px">
            ${Array.from({length:24}).map((_,h) => {
              const heat = h<6 ? 0.05 : h<9 ? 0.15 : h<11 ? 0.4 : h<14 ? 0.85 : h<17 ? 0.55 : h<20 ? 0.92 : h<22 ? 0.5 : 0.15;
              return `<div style="flex:1;height:${heat*100}%;background:linear-gradient(180deg,#1677ff,#0958d9);border-radius:2px 2px 0 0" title="${h}时 · ${Math.round(heat*30)}人"></div>`;
            }).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ant-text-3);margin-top:6px">
            <span>0时</span><span>6时</span><span>12时</span><span>18时</span><span>23时</span>
          </div>
        </div>
      </div>
      <div class="card"><div class="card-head"><div class="card-title">客流详情</div></div>
        <table class="ant-table">
          <thead><tr><th>时段</th><th>入园</th><th>出园</th><th>在园</th></tr></thead>
          <tbody>
            <tr><td>2026-05-14 14:00</td><td>12</td><td>8</td><td>86</td></tr>
            <tr><td>2026-05-14 13:00</td><td>18</td><td>5</td><td>82</td></tr>
            <tr><td>2026-05-14 12:00</td><td>25</td><td>15</td><td>69</td></tr>
            <tr><td>2026-05-14 11:00</td><td>20</td><td>4</td><td>59</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============ 财务 — 园区账户 ============
function renderParkAccount() {
  const isPlatform = APP.view === 'platform';
  let finance;
  if (isPlatform) {
    finance = PARK_FINANCE.platform;
  } else if (APP.view === 'park-hm') {
    finance = PARK_FINANCE.parks['park-hm'];
  } else if (APP.view === 'park-wh') {
    finance = PARK_FINANCE.parks['park-wh'];
  } else {
    // 商户视角取所属园区
    finance = PARK_FINANCE.parks['park-hm'];
  }

  return `
    <div class="page-header">
      <div class="page-title">园区账户</div>
      <div class="page-subtitle">${isPlatform ? '平台总部 · 全局资金分布 · 点击卡片查看明细' : '本园区资金总览 · 含线上/线下/团购收入'}</div>
    </div>

    <!-- 关键指标卡片 (可点击查看明细) -->
    <div class="stat-grid c4">
      <div class="stat-card" onclick="openRevenueDetail('total')" style="cursor:pointer">
        <div class="stat-icon" style="background:#1677ff;color:#fff">¥</div>
        <div class="stat-label">${isPlatform ? '全平台总收益' : '园区总收益'}</div>
        <div class="stat-value"><span class="unit">¥</span>${finance.totalRevenue.toFixed(2)}</div>
        <div class="stat-extra"><span class="delta-up">↑ 12%</span> 较昨日</div>
      </div>
      <div class="stat-card" onclick="openRevenueDetail('online')" style="cursor:pointer">
        <div class="stat-icon" style="background:#52c41a;color:#fff">◴</div>
        <div class="stat-label">线上收入</div>
        <div class="stat-value"><span class="unit">¥</span>${(finance.onlineRevenue || 0).toFixed(2)}</div>
        <div class="stat-extra">小程序/扫码支付</div>
      </div>
      <div class="stat-card" onclick="openRevenueDetail('offline')" style="cursor:pointer">
        <div class="stat-icon" style="background:#fa8c16;color:#fff">💵</div>
        <div class="stat-label">线下收入</div>
        <div class="stat-value"><span class="unit">¥</span>${(finance.offlineRevenue || 0).toFixed(2)}</div>
        <div class="stat-extra">现金/POS/手动录入</div>
      </div>
      <div class="stat-card" onclick="openRevenueDetail('meituan')" style="cursor:pointer">
        <div class="stat-icon" style="background:linear-gradient(135deg,#fa8c16,#d46b08);color:#fff">☷</div>
        <div class="stat-label">美团团购收入</div>
        <div class="stat-value"><span class="unit">¥</span>${(finance.meituanRevenue || 0).toFixed(2)}</div>
        <div class="stat-extra"><span class="delta-up">↑ 8%</span> 今日核销</div>
      </div>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card" onclick="openRevenueDetail('douyin')" style="cursor:pointer">
        <div class="stat-icon" style="background:linear-gradient(135deg,#010101,#333);color:#fff">♫</div>
        <div class="stat-label">抖音团购收入</div>
        <div class="stat-value"><span class="unit">¥</span>${(finance.douyinRevenue || 0).toFixed(2)}</div>
        <div class="stat-extra"><span class="delta-up">↑ 15%</span> 今日核销</div>
      </div>
      ${statCard('账户余额', finance.balance, {icon:antStat('dollar'), color:'#52c41a', extra:'含冻结金额'})}
      ${statCard('已提现', finance.withdrawn, {icon:'↗', color:'#722ed1'})}
      ${statCard('累计入账', finance.totalIn || (finance.totalRevenue + finance.balance + finance.withdrawn), {icon:'∑', color:'#1677ff'})}
    </div>

    <!-- 平台视角: 各园区收益分拆 -->
    ${isPlatform ? `
    <div class="card">
      <div class="card-head"><div class="card-title">各园区收益总览</div>
        <button class="btn btn-sm" onclick="showToast('导出全平台财务报表中...')">${antIcon('download')} 导出全平台报表</button>
      </div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
        ${Object.entries(PARK_FINANCE.parks).map(([key, park]) => `
          <div style="border:1px solid var(--ant-border-secondary);border-radius:8px;padding:16px;background:linear-gradient(135deg,${key==='park-hm'?'#f6ffed':'#fff7e6'},#fff)">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              <div style="width:40px;height:40px;border-radius:8px;background:${key==='park-hm'?'linear-gradient(135deg,#52c41a,#389e0d)':'linear-gradient(135deg,#1677ff,#0958d9)'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600">${park.name[0]}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:15px">${park.name}</div>
                <div style="font-size:12px;color:var(--ant-text-3)">${park.shops.length} 家商户</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:20px;font-weight:600;color:var(--ant-text-1)" class="money">¥${park.totalRevenue.toFixed(2)}</div>
                <div style="font-size:11px;color:var(--ant-text-3)">总收益</div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="switchView('${key}');goPage('park-account')">查看详情</button>
              <button class="btn btn-sm" onclick="showToast('正在导出 ${park.name} 财务报表...')">${antIcon('download')} 导出</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
              <div style="text-align:center;padding:10px 6px;background:#fafafa;border-radius:6px">
                <div style="font-size:11px;color:var(--ant-text-3)">线上</div>
                <div style="font-size:16px;font-weight:600;color:var(--ant-text-1);margin-top:2px" class="money">¥${park.onlineRevenue.toFixed(2)}</div>
              </div>
              <div style="text-align:center;padding:10px 6px;background:#fafafa;border-radius:6px">
                <div style="font-size:11px;color:var(--ant-text-3)">线下</div>
                <div style="font-size:16px;font-weight:600;color:#fa8c16;margin-top:2px" class="money">¥${park.offlineRevenue.toFixed(2)}</div>
              </div>
              <div style="text-align:center;padding:10px 6px;background:#fff7e6;border-radius:6px;cursor:pointer" onclick="openRevenueDetail('meituan-park-${key}')">
                <div style="font-size:11px;color:var(--ant-text-3)">☷ 美团</div>
                <div style="font-size:16px;font-weight:600;color:#d46b08;margin-top:2px" class="money">¥${park.meituanRevenue.toFixed(2)}</div>
              </div>
              <div style="text-align:center;padding:10px 6px;background:#f5f5f5;border-radius:6px;cursor:pointer" onclick="openRevenueDetail('douyin-park-${key}')">
                <div style="font-size:11px;color:var(--ant-text-3)">♫ 抖音</div>
                <div style="font-size:16px;font-weight:600;color:#010101;margin-top:2px" class="money">¥${park.douyinRevenue.toFixed(2)}</div>
              </div>
              <div style="text-align:center;padding:10px 6px;background:${park.balance>0?'#f6ffed':'#fafafa'};border-radius:6px">
                <div style="font-size:11px;color:var(--ant-text-3)">余额</div>
                <div style="font-size:16px;font-weight:600;color:#52c41a;margin-top:2px" class="money">¥${park.balance.toFixed(2)}</div>
              </div>
            </div>
            <!-- 各园区商户明细 -->
            <div style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--ant-border-secondary)">
              <table class="ant-table" style="margin:0">
                <thead><tr>
                  <th>商户</th><th style="text-align:right">线上</th><th style="text-align:right">线下</th><th style="text-align:right">☷ 美团</th><th style="text-align:right">♫ 抖音</th><th style="text-align:right">余额</th><th style="text-align:right">已提现</th>
                </tr></thead>
                <tbody>
                  ${park.shops.map(s => `
                    <tr>
                      <td><b>${s.name}</b></td>
                      <td style="text-align:right" class="money">¥${s.online.toFixed(2)}</td>
                      <td style="text-align:right" class="money">¥${s.offline.toFixed(2)}</td>
                      <td style="text-align:right;color:#d46b08" class="money">¥${s.meituan.toFixed(2)}</td>
                      <td style="text-align:right;color:#010101" class="money">¥${s.douyin.toFixed(2)}</td>
                      <td style="text-align:right;color:#52c41a;font-weight:600" class="money">¥${s.balance.toFixed(2)}</td>
                      <td style="text-align:right" class="money">¥${s.withdrawn.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : `
    <!-- 园区视角: 商户账户明细 -->
    <div class="card">
      <div class="card-head"><div class="card-title">商户账户明细</div>
        <button class="btn btn-sm" onclick="showToast('已刷新')">${antIcon('reload')} 刷新</button>
      </div>
      <table class="ant-table">
        <thead><tr>
          <th>店铺名称</th><th style="text-align:right">账户余额</th><th style="text-align:right">冻结金额</th><th style="text-align:right">可用余额</th>
          <th style="text-align:right">线上</th><th style="text-align:right">线下</th><th style="text-align:right">☷ 美团</th><th style="text-align:right">♫ 抖音</th>
          <th style="text-align:right">累计收益</th><th style="text-align:right">已提现</th>
        </tr></thead>
        <tbody>
          ${finance.shops.map(s => `
            <tr>
              <td><b>${s.name}</b></td>
              <td style="text-align:right" class="money">¥${s.balance.toFixed(2)}</td>
              <td style="text-align:right" class="money">¥${s.frozen.toFixed(2)}</td>
              <td style="text-align:right" class="money success">¥${(s.balance - s.frozen).toFixed(2)}</td>
              <td style="text-align:right" class="money">¥${s.online.toFixed(2)}</td>
              <td style="text-align:right" class="money">¥${s.offline.toFixed(2)}</td>
              <td style="text-align:right;color:#d46b08" class="money">¥${s.meituan.toFixed(2)}</td>
              <td style="text-align:right;color:#010101" class="money">¥${s.douyin.toFixed(2)}</td>
              <td style="text-align:right;font-weight:600" class="money">¥${(s.online + s.offline + s.meituan + s.douyin).toFixed(2)}</td>
              <td style="text-align:right" class="money success">¥${s.withdrawn.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `}
  `;
}

function openRevenueDetail(type) {
  let title, body;
  if (type === 'total') {
    const f = APP.view === 'platform' ? PARK_FINANCE.platform : (PARK_FINANCE.parks[APP.view] || PARK_FINANCE.parks['park-hm']);
    title = '总收入明细';
    body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px">
        <div style="grid-column:1/-1;padding:14px;background:#f6ffed;border-radius:8px;text-align:center">
          <div style="font-size:12px;color:var(--ant-text-3);margin-bottom:4px">总收益</div>
          <div style="font-size:28px;font-weight:700;color:var(--ant-text-1)" class="money">¥${f.totalRevenue.toFixed(2)}</div>
        </div>
        <div style="padding:12px;background:#fafafa;border-radius:8px"><div style="color:var(--ant-text-3);font-size:12px">线上收入</div><div style="font-size:18px;font-weight:600" class="money">¥${(f.onlineRevenue||0).toFixed(2)}</div></div>
        <div style="padding:12px;background:#fafafa;border-radius:8px"><div style="color:var(--ant-text-3);font-size:12px">线下收入</div><div style="font-size:18px;font-weight:600" class="money">¥${(f.offlineRevenue||0).toFixed(2)}</div></div>
        <div style="padding:12px;background:#fff7e6;border-radius:8px"><div style="color:#d46b08;font-size:12px">☷ 美团团购</div><div style="font-size:18px;font-weight:600;color:#d46b08" class="money">¥${(f.meituanRevenue||0).toFixed(2)}</div></div>
        <div style="padding:12px;background:#f5f5f5;border-radius:8px"><div style="color:#010101;font-size:12px">♫ 抖音团购</div><div style="font-size:18px;font-weight:600;color:#010101" class="money">¥${(f.douyinRevenue||0).toFixed(2)}</div></div>
      </div>
    `;
  } else if (type === 'meituan') {
    title = '美团团购收入明细';
    body = renderGroupBuyDetail('meituan');
  } else if (type === 'douyin') {
    title = '抖音团购收入明细';
    body = renderGroupBuyDetail('douyin');
  } else if (type.startsWith('meituan-park-')) {
    const key = type.replace('meituan-park-', '');
    const park = PARK_FINANCE.parks[key];
    title = park.name + ' · 美团团购收入';
    body = `<div style="font-size:20px;font-weight:700;color:#d46b08;margin-bottom:14px" class="money">¥${park.meituanRevenue.toFixed(2)}</div>` + park.shops.map(s => `<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px"><span>${s.name}</span><span class="money" style="color:#d46b08">¥${s.meituan.toFixed(2)}</span></div>`).join('');
  } else if (type.startsWith('douyin-park-')) {
    const key = type.replace('douyin-park-', '');
    const park = PARK_FINANCE.parks[key];
    title = park.name + ' · 抖音团购收入';
    body = `<div style="font-size:20px;font-weight:700;color:#010101;margin-bottom:14px" class="money">¥${park.douyinRevenue.toFixed(2)}</div>` + park.shops.map(s => `<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px"><span>${s.name}</span><span class="money" style="color:#010101">¥${s.douyin.toFixed(2)}</span></div>`).join('');
  } else {
    title = '收入明细';
    body = '<div class="empty">选择收入类型查看</div>';
  }

  showModal({
    title,
    body,
    footer: `<button class="btn" onclick="closeModal()">关闭</button><button class="btn btn-primary" onclick="closeModal();showToast('明细报表已导出')">${antIcon('download')} 导出明细</button>`
  });
}

function renderGroupBuyDetail(platform) {
  const records = platform === 'meituan' ? MEITUAN_VERIFY_RECORDS : DOUYIN_VERIFY_RECORDS;
  const todayRecords = records.filter(r => r.verifyAt.includes('2026-05-14') && r.status === '已核销');
  const todayTotal = todayRecords.reduce((s, r) => s + r.salePrice, 0);

  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px;margin-bottom:16px">
      <div style="padding:12px;background:${platform==='meituan'?'#fff7e6':'#f5f5f5'};border-radius:8px;text-align:center">
        <div style="font-size:12px;color:var(--ant-text-3);margin-bottom:4px">今日核销</div>
        <div style="font-size:22px;font-weight:700" class="money">¥${todayTotal.toFixed(2)}</div>
        <div style="font-size:11px;color:var(--ant-text-3);margin-top:2px">${todayRecords.length} 笔</div>
      </div>
      <div style="padding:12px;background:#fafafa;border-radius:8px;text-align:center">
        <div style="font-size:12px;color:var(--ant-text-3);margin-bottom:4px">本月累计</div>
        <div style="font-size:22px;font-weight:700" class="money">¥${records.filter(r=>r.status==='已核销').reduce((s,r)=>s+r.salePrice,0).toFixed(2)}</div>
        <div style="font-size:11px;color:var(--ant-text-3);margin-top:2px">${records.filter(r=>r.status==='已核销').length} 笔</div>
      </div>
    </div>
    <table class="ant-table">
      <thead><tr><th>时间</th><th>用户</th><th>商品</th><th>店铺</th><th style="text-align:right">金额</th><th>状态</th></tr></thead>
      <tbody>
        ${todayRecords.map(r => `
          <tr>
            <td>${r.verifyAt.split(' ')[1] || r.verifyAt}</td>
            <td>${r.user}</td>
            <td>${r.product}</td>
            <td>${r.shop}</td>
            <td style="text-align:right;font-weight:600" class="money">¥${r.salePrice.toFixed(2)}</td>
            <td><span class="tag success">${r.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ============ 财务 — 提现管理 (增强版) ============
function renderWithdraw() {
  return `
    <div class="page-header"><div class="page-title">提现管理</div><div class="page-subtitle">商户提现审核 · 银行信息确认 · 自动生成对账单 · 小程序通知</div></div>
    <div style="display:grid;grid-template-columns:1fr;gap:16px">
      <div class="card">
        <div class="card-head"><div class="card-title">待审核提现申请</div></div>
        <table class="ant-table">
          <thead><tr><th>申请编号</th><th>店铺</th><th>所属园区</th><th style="text-align:right">提现金额</th><th>开户银行</th><th>银行账号</th><th>开户姓名</th><th>申请时间</th><th class="col-actions">操作</th></tr></thead>
          <tbody>
            ${shopData(WITHDRAW_APPLICATIONS).filter(w => w.status === 'pending').map(w => `
              <tr>
                <td class="col-mono">${w.id}</td>
                <td><b>${w.shop}</b></td>
                <td>${w.shopPark}</td>
                <td style="text-align:right;font-weight:600" class="money">¥${w.amount.toFixed(2)}</td>
                <td>${w.bankName}</td>
                <td class="col-mono">${w.bankAccount}</td>
                <td>${w.bankHolder}</td>
                <td>${w.applyAt}</td>
                <td class="col-actions">
                  <button class="btn-link" onclick="openWithdrawApprove('${w.id}')">通过</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" onclick="showToast('已驳回提现申请 ${w.id}')">驳回</button>
                </td>
              </tr>
            `).join('')}
            ${shopData(WITHDRAW_APPLICATIONS).filter(w => w.status === 'pending').length === 0 ? '<tr><td colspan="9" style="text-align:center;color:var(--ant-text-3)">暂无待审核申请</td></tr>' : ''}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">提现历史</div>
          <button class="btn btn-sm" onclick="showToast('导出提现历史报表...')">${antIcon('download')} 导出</button>
        </div>
        <table class="ant-table">
          <thead><tr><th>申请编号</th><th>店铺</th><th>所属园区</th><th style="text-align:right">金额</th><th>开户银行</th><th>开户姓名</th><th>对账单</th><th>状态</th><th>审核人</th><th>审核时间</th><th>打款时间</th></tr></thead>
          <tbody>
            ${shopData(WITHDRAW_HISTORY).map(w => `
              <tr>
                <td class="col-mono">${w.id}</td>
                <td><b>${w.shop}</b></td>
                <td>${w.shopPark}</td>
                <td style="text-align:right" class="money">¥${w.amount.toFixed(2)}</td>
                <td>${w.bankName}</td>
                <td>${w.bankHolder}</td>
                <td>${w.reconciliationId ? `<span class="col-mono">${w.reconciliationId}</span> <button class="btn-link" onclick="showToast('正在下载对账单 ${w.reconciliationId}...')">${antIcon('download')}</button>` : '-'}</td>
                <td><span class="tag ${w.status==='paid'?'success':w.status==='rejected'?'error':'warning'}">${w.status==='paid'?'已打款':w.status==='rejected'?'已驳回':'待打款'}</span></td>
                <td>${w.reviewer}</td>
                <td>${w.reviewedAt}</td>
                <td>${w.paidAt || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openWithdrawApprove(id) {
  const w = WITHDRAW_APPLICATIONS.find(x => x.id === id);
  if (!w) return;
  showModal({
    title: '提现审核 · ' + w.id,
    body: `
      <div style="padding:10px 0">
        <div style="background:var(--ant-primary-bg);border:1px solid var(--ant-primary-border);border-radius:8px;padding:14px;margin-bottom:18px">
          <div style="font-size:14px;font-weight:500;color:var(--ant-primary)">📋 审核通过后将自动生成对账单并通知商户</div>
          <div style="font-size:12px;color:var(--ant-text-2);margin-top:4px">对账单将通过小程序消息推送至商户端 · 商户确认后自动下账</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px">
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">申请编号</div><div class="col-mono">${w.id}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">店铺 · 园区</div><div><b>${w.shop}</b> · ${w.shopPark}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">提现金额</div><div style="font-size:22px;font-weight:700;color:var(--ant-error)" class="money">¥${w.amount.toFixed(2)}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">申请人</div><div>${w.bankHolder}</div></div>
        </div>

        <div style="border-top:1px solid var(--ant-border-secondary);margin-top:16px;padding-top:16px">
          <div style="font-size:14px;font-weight:600;margin-bottom:10px">🏦 银行账户信息</div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">开户银行</label>
              <input class="input" value="${w.bankName}">
            </div>
            <div class="form-item">
              <label class="form-label">银行账号</label>
              <input class="input" value="${w.bankAccount}">
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">开户姓名</label>
            <input class="input" value="${w.bankHolder}">
          </div>
        </div>

        <div style="border-top:1px solid var(--ant-border-secondary);margin-top:16px;padding-top:16px">
          <div style="font-size:14px;font-weight:600;margin-bottom:10px">📄 自动生成对账单</div>
          <div style="padding:12px;background:var(--ant-fill-quaternary);border-radius:8px;font-size:13px">
            <div style="display:flex;justify-content:space-between;padding:6px 0"><span>对账编号</span><span class="col-mono">DZ${Date.now().toString().slice(-12)}</span></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0"><span>商户</span><span>${w.shop}</span></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0"><span>对账周期</span><span>2026-05-01 ~ 2026-05-14</span></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0"><span>提现金额</span><span style="font-weight:600;color:var(--ant-error)" class="money">¥${w.amount.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0"><span>通知方式</span><span>小程序商户端 · 消息推送</span></div>
          </div>
        </div>

        <div style="margin-top:16px;padding:12px;background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;font-size:12px;color:#d48806;line-height:1.7">
          <b>⏳ 流程说明</b><br>
          · 点击「通过」→ 生成对账单 → 推送小程序通知给商户<br>
          · 商户在商户端小程序确认对账单<br>
          · 确认后系统自动下账：扣减园区余额 & 平台总部余额<br>
          · 当前申请状态变为「待打款」→ 财务打款后点击「确认打款」<br>
          · 完成后归档至提现历史
        </div>
      </div>
    `,
    footer: `
      <button class="btn" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="closeModal();approveWithdraw('${w.id}')">✅ 通过 · 生成对账单并通知商户</button>
    `
  });
}

function approveWithdraw(id) {
  // 从待审核移除，归档到历史
  const idx = WITHDRAW_APPLICATIONS.findIndex(x => x.id === id);
  if (idx >= 0) {
    const w = WITHDRAW_APPLICATIONS.splice(idx, 1)[0];
    WITHDRAW_HISTORY.unshift({
      id: w.id,
      shop: w.shop,
      shopPark: w.shopPark,
      amount: w.amount,
      bankName: w.bankName,
      bankAccount: w.bankAccount,
      bankHolder: w.bankHolder,
      status: 'pending_pay',
      reconciliationId: 'DZ' + Date.now().toString().slice(-12),
      reviewer: '李四',
      reviewedAt: new Date().toISOString().slice(0,16).replace('T',' '),
      paidAt: '-',
    });
    // 扣减余额
    if (PARK_FINANCE.platform) {
      PARK_FINANCE.platform.balance -= w.amount;
      PARK_FINANCE.platform.totalRevenue -= w.amount;
    }
    const parkKey = w.shopPark === '黄梅袁夫稻田' ? 'park-hm' : 'park-wh';
    if (PARK_FINANCE.parks[parkKey]) {
      PARK_FINANCE.parks[parkKey].balance -= w.amount;
      PARK_FINANCE.parks[parkKey].totalRevenue -= w.amount;
    }
    showToast('✅ 提现已通过 · 对账单已生成 · 小程序通知已发送至 ' + w.shop);
    setTimeout(() => renderPCContent('withdraw'), 600);
  }
}

// ============ 财务 — 对账单 (含团购收入) ============
function renderReconcile() {
  return `
    <div class="page-header"><div class="page-title">对账单</div><div class="page-subtitle">园区与商户的资金对账汇总 · 含线上/线下/团购(美团+抖音)</div></div>
    <div class="filter-bar">
      <span style="font-size:13px;color:var(--ant-text-2)">对账周期</span>
      <select class="select"><option>2026-05</option><option>2026-04</option></select>
      <select class="select"><option>全部商户</option><option>火车餐厅</option><option>树下咖啡</option></select>
      <button class="btn btn-primary btn-sm" onclick="showToast('对账单已生成')">生成对账单</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" onclick="showToast('导出对账单中...')">${antIcon('download')} 导出</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr>
          <th>对账编号</th><th>商户</th><th>对账周期</th><th style="text-align:right">线上收入</th><th style="text-align:right">线下收入</th><th style="text-align:right">☷ 美团团购</th><th style="text-align:right">♫ 抖音团购</th><th style="text-align:right">退款</th><th style="text-align:right">净收益</th><th>状态</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          <tr>
            <td class="col-mono">DZ20260501-FCCT</td><td><b>火车餐厅</b></td><td>2026-05-01 ~ 2026-05-14</td>
            <td style="text-align:right" class="money">¥586.50</td><td style="text-align:right" class="money">¥240.00</td>
            <td style="text-align:right;color:#d46b08" class="money">¥206.90</td><td style="text-align:right;color:#010101" class="money">¥346.00</td>
            <td style="text-align:right" class="money danger">-¥86.50</td>
            <td style="text-align:right;font-weight:600" class="money success">¥1,292.90</td>
            <td><span class="tag success">已确认</span></td>
            <td class="col-actions"><button class="btn-link" onclick="showToast('查看对账单详情')">查看</button> <span class="divider">|</span> <button class="btn-link" onclick="showToast('下载对账单 DZ20260501-FCCT')">下载</button></td>
          </tr>
          <tr>
            <td class="col-mono">DZ20260501-SXKF</td><td><b>树下咖啡</b></td><td>2026-05-01 ~ 2026-05-14</td>
            <td style="text-align:right" class="money">¥326.00</td><td style="text-align:right" class="money">¥80.00</td>
            <td style="text-align:right;color:#d46b08" class="money">¥80.90</td><td style="text-align:right;color:#010101" class="money">¥99.00</td>
            <td style="text-align:right" class="money danger">-¥46.00</td>
            <td style="text-align:right;font-weight:600" class="money success">¥539.90</td>
            <td><span class="tag warning">待确认</span></td>
            <td class="col-actions"><button class="btn-link">查看</button> <span class="divider">|</span> <button class="btn-link" onclick="showToast('对账单 DZ20260501-SXKF 已确认')">确认</button></td>
          </tr>
          <tr>
            <td class="col-mono">DZ20260501-DTSZ</td><td><b>稻田手作坊</b></td><td>2026-05-01 ~ 2026-05-14</td>
            <td style="text-align:right" class="money">¥74.00</td><td style="text-align:right" class="money">¥0.00</td>
            <td style="text-align:right;color:#d46b08" class="money">¥0.00</td><td style="text-align:right;color:#010101" class="money">¥0.00</td>
            <td style="text-align:right" class="money">¥0.00</td>
            <td style="text-align:right;font-weight:600" class="money success">¥74.00</td>
            <td><span class="tag success">已确认</span></td>
            <td class="col-actions"><button class="btn-link">查看</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
