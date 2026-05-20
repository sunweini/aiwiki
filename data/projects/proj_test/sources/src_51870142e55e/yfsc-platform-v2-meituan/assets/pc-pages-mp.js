// ============================================================
// PC 页面 — 小程序管理 (客户端 / 商户端 / 管理端)
// ============================================================

// ============ 客户端管理 ============
function renderMpClientMgmt() {
  return `
    <div class="page-header">
      <div class="page-title">小程序 · 客户端管理</div>
      <div class="page-subtitle">面向 C 端用户的小程序运营、版本、首页配置与数据监控</div>
    </div>

    <!-- 关键指标 -->
    <div class="stat-grid c4">
      ${statCard('累计用户', 2837, {unit:'', icon:'◉', color:'#1677ff', delta:'12', deltaType:'up', extra:'今日新增'})}
      ${statCard('日活用户 DAU', 412, {unit:'', icon:'◍', color:'#52c41a', delta:'8.2%', deltaType:'up'})}
      ${statCard('储值余额池', 24680.50, {icon:'¥', color:'#722ed1', extra:'用户账户合计'})}
      ${statCard('当前版本', 'v2.3.1', {unit:'', icon:'⌖', color:'#fa8c16', extra:'2026-05-12 发布'})}
    </div>

    <!-- 二级 Tabs -->
    <div class="card" style="margin-bottom:0;border-radius:8px 8px 0 0;border-bottom:none">
      <div class="card-body" style="padding:0">
        <div style="display:flex;border-bottom:1px solid var(--ant-border-secondary);padding:0 20px">
          ${['首页配置','启动页与弹窗','营销与会员','版本与发布','用户消息推送'].map((t,i) => `
            <button class="btn-link" style="padding:14px 16px;border-bottom:2px solid ${i===0?'var(--ant-primary)':'transparent'};color:${i===0?'var(--ant-primary)':'var(--ant-text-2)'};font-weight:${i===0?500:400};border-radius:0">${t}</button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- 首页配置 panel -->
    <div class="card" style="border-radius:0 0 8px 8px">
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 380px;gap:24px">
          <!-- 左：配置项 -->
          <div>
            <div style="font-size:14px;font-weight:500;margin-bottom:12px">8 大分类入口</div>
            <table class="ant-table" style="margin-bottom:24px">
              <thead><tr><th style="width:60px">排序</th><th>名称</th><th>关联类型</th><th>图标</th><th>状态</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                ${[
                  {n:'袁夫米面',type:'商品分类',icon:'rice',on:true},
                  {n:'袁夫有酒',type:'商品分类',icon:'wine',on:true},
                  {n:'袁夫味品',type:'商品分类',icon:'can',on:true},
                  {n:'袁夫零食',type:'商品分类',icon:'snack',on:true},
                  {n:'门票预订',type:'门票预订',icon:'ticket',on:true},
                  {n:'餐厅预订',type:'商户列表',icon:'dish',on:true},
                  {n:'民宿预订',type:'民宿预订',icon:'house',on:false},
                  {n:'积分商城',type:'积分商城',icon:'gift',on:true},
                ].map((it,i) => `
                  <tr>
                    <td>${i+1}</td>
                    <td><b>${it.n}</b></td>
                    <td>${it.type}</td>
                    <td><span class="code-chip">${it.icon}.svg</span></td>
                    <td>${it.on?'<span class="tag success">已启用</span>':'<span class="tag default">已禁用</span>'}</td>
                    <td class="col-actions">
                      <button class="btn-link">编辑</button>
                      <span class="divider">|</span>
                      <button class="btn-link">${it.on?'禁用':'启用'}</button>
                      <span class="divider">|</span>
                      <button class="btn-link">↑</button>
                      <button class="btn-link">↓</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="font-size:14px;font-weight:500;margin-bottom:12px">分组板块 (新品专区/分类楼层)</div>
            <table class="ant-table">
              <thead><tr><th style="width:60px">排序</th><th>板块标题</th><th>类型</th><th>商品数</th><th>状态</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr><td>1</td><td><b>新品专区</b></td><td><span class="tag processing">轮播商品</span></td><td>4</td><td><span class="tag success">已启用</span></td><td class="col-actions"><button class="btn-link">配置商品</button> <span class="divider">|</span> <button class="btn-link">编辑</button></td></tr>
                <tr><td>2</td><td><b>袁夫米面</b></td><td><span class="tag cyan">楼层</span></td><td>6</td><td><span class="tag success">已启用</span></td><td class="col-actions"><button class="btn-link">配置商品</button> <span class="divider">|</span> <button class="btn-link">编辑</button></td></tr>
                <tr><td>3</td><td><b>袁夫味品</b></td><td><span class="tag cyan">楼层</span></td><td>3</td><td><span class="tag success">已启用</span></td><td class="col-actions"><button class="btn-link">配置商品</button> <span class="divider">|</span> <button class="btn-link">编辑</button></td></tr>
              </tbody>
            </table>
            <div style="margin-top:12px"><button class="btn">+ 新建板块</button></div>
          </div>

          <!-- 右：预览 -->
          <div>
            <div style="font-size:14px;font-weight:500;margin-bottom:12px;display:flex;justify-content:space-between">
              <span>实时预览</span>
              <span style="font-size:12px;color:var(--ant-text-3)">390 × 780</span>
            </div>
            <div style="border:1px solid var(--ant-border);border-radius:24px;padding:14px;background:#fafafa">
              <div style="background:#fff;border-radius:12px;height:560px;overflow:hidden;display:flex;flex-direction:column">
                <div style="background:#1677ff;color:#fff;padding:8px;text-align:center;font-size:12px">袁夫稻田线上商城</div>
                <div style="padding:12px;background:#fff;border-bottom:0.5px solid #f0f0f0">
                  <div style="background:#fafafa;border-radius:8px;padding:10px;display:flex;align-items:center;gap:8px;font-size:11px">
                    <span style="width:24px;height:24px;border-radius:50%;background:#f5e8d8"></span>
                    点击添加企微客服 <span style="margin-left:auto;width:18px;height:18px;background:#1677ff;border-radius:50%"></span>
                  </div>
                </div>
                <div style="padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#fff">
                  ${['米面','有酒','味品','零食','门票','餐厅','民宿','积分'].map(t => `
                    <div style="text-align:center;font-size:10px"><div style="width:36px;height:36px;border-radius:50%;background:#f0f0f0;margin:0 auto 4px"></div>${t}</div>
                  `).join('')}
                </div>
                <div style="padding:8px 12px;background:#fff">
                  <div style="font-size:12px;font-weight:600">新品专区</div>
                </div>
                <div style="display:flex;gap:6px;padding:0 12px;background:#fff">
                  ${[1,2,3].map(() => `<div style="width:80px;height:90px;background:linear-gradient(135deg,#fff5e6,#ffe0c2);border-radius:6px;position:relative;flex-shrink:0"><div style="position:absolute;top:0;left:0;right:0;height:14px;background:#e94a3f;border-radius:6px 6px 0 0;font-size:8px;color:#fff;text-align:center;line-height:14px">袁夫稻田</div></div>`).join('')}
                </div>
                <div style="margin-top:auto;display:flex;background:#fff;border-top:0.5px solid #f0f0f0;padding:6px 0">
                  ${['首页','分类','会员码','购物车','我的'].map((t,i) => `
                    <div style="flex:1;text-align:center;font-size:10px;${i===2?'position:relative;color:#1677ff;font-weight:500':''}">
                      ${i===2?'<div style="width:38px;height:38px;border-radius:50%;background:#1677ff;color:#fff;margin:-18px auto 2px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(22,119,255,0.4)">⊞</div>':'<div style="width:18px;height:18px;background:#ddd;border-radius:4px;margin:0 auto 2px"></div>'}
                      ${t}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:12px">发布更新</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户增长 -->
    <div class="card">
      <div class="card-head"><div class="card-title">客户端用户增长 (近 14 天)</div></div>
      <div class="card-body">${greenBarChart([2780, 2785, 2792, 2798, 2805, 2812, 2816, 2820, 2825, 2829, 2831, 2832, 2834, 2837], ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14'])}</div>
    </div>
  `;
}

// ============ 商户端管理 ============
function renderMpMerchantMgmt() {
  return `
    <div class="page-header">
      <div class="page-title">小程序 · 商户端管理</div>
      <div class="page-subtitle">管理入驻商户的小程序账号、核销与提现行为、版本下发</div>
    </div>

    <div class="stat-grid c4">
      ${statCard('入驻商户', 5, {unit:'家', icon:'▢', color:'#1677ff', extra:'营业中 4 · 暂停 1'})}
      ${statCard('商户端账户', 12, {unit:'人', icon:'⌬', color:'#52c41a', delta:'2', deltaType:'up', extra:'本周新增'})}
      ${statCard('今日核销订单', 24, {unit:'笔', icon:'✓', color:'#722ed1', delta:'8.3%', deltaType:'up'})}
      ${statCard('当前版本', 'v1.8.4', {unit:'', icon:'⌖', color:'#fa8c16', extra:'2026-05-10 发布'})}
    </div>

    <!-- 二级 Tabs -->
    <div class="card" style="margin-bottom:0;border-radius:8px 8px 0 0;border-bottom:none">
      <div class="card-body" style="padding:0">
        <div style="display:flex;border-bottom:1px solid var(--ant-border-secondary);padding:0 20px">
          ${['商户账户','商户授权与角色','收款/核销策略','版本与发布','操作日志'].map((t,i) => `
            <button class="btn-link" style="padding:14px 16px;border-bottom:2px solid ${i===0?'var(--ant-primary)':'transparent'};color:${i===0?'var(--ant-primary)':'var(--ant-text-2)'};font-weight:${i===0?500:400};border-radius:0">${t}</button>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="border-radius:0 0 8px 8px">
      <div class="filter-bar" style="margin:16px 20px;background:var(--ant-fill-quaternary);border:none">
        <input class="input" placeholder="姓名/手机号" style="width:180px">
        <select class="select"><option>全部商户</option><option>火车餐厅</option><option>树下咖啡</option></select>
        <select class="select"><option>全部角色</option><option>商户管理员</option><option>商户收银员</option></select>
        <button class="btn btn-primary btn-sm">查询</button>
        <div class="spacer"></div>
        <button class="btn btn-primary">+ 新增商户账户</button>
      </div>
      <table class="ant-table">
        <thead><tr><th>商户</th><th>姓名</th><th>手机号</th><th>角色</th><th>权限</th><th>今日核销</th><th>状态</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          <tr><td><b>🚂 火车餐厅</b></td><td>王五</td><td>139****5678</td><td><span class="tag purple">商户管理员</span></td><td>核销 / 收款 / 提现 / 员工管理</td><td>12 笔 · ¥686</td><td><span class="tag success">已绑定</span></td><td class="col-actions"><button class="btn-link">权限</button> <span class="divider">|</span> <button class="btn-link">禁用</button> <span class="divider">|</span> <button class="btn-link danger">解绑</button></td></tr>
          <tr><td><b>🚂 火车餐厅</b></td><td>赵六</td><td>139****5699</td><td><span class="tag cyan">商户收银员</span></td><td>核销 / 收款</td><td>8 笔 · ¥420</td><td><span class="tag success">已绑定</span></td><td class="col-actions"><button class="btn-link">权限</button> <span class="divider">|</span> <button class="btn-link">禁用</button> <span class="divider">|</span> <button class="btn-link danger">解绑</button></td></tr>
          <tr><td><b>☕ 树下咖啡</b></td><td>孙七</td><td>188****8888</td><td><span class="tag purple">商户管理员</span></td><td>核销 / 收款 / 提现</td><td>4 笔 · ¥180</td><td><span class="tag success">已绑定</span></td><td class="col-actions"><button class="btn-link">权限</button> <span class="divider">|</span> <button class="btn-link">禁用</button> <span class="divider">|</span> <button class="btn-link danger">解绑</button></td></tr>
          <tr><td><b>🧺 稻田手作坊</b></td><td>钱八</td><td>137****2233</td><td><span class="tag purple">商户管理员</span></td><td>核销 / 收款</td><td>-</td><td><span class="tag warning">待绑定</span></td><td class="col-actions"><button class="btn-link">发送邀请</button> <span class="divider">|</span> <button class="btn-link">权限</button></td></tr>
          <tr><td><b>🏪 稻田鲜货铺</b></td><td>李大伟</td><td>136****4567</td><td><span class="tag cyan">商户收银员</span></td><td>核销 / 收款</td><td>-</td><td><span class="tag default">已禁用</span></td><td class="col-actions"><button class="btn-link">启用</button> <span class="divider">|</span> <button class="btn-link danger">解绑</button></td></tr>
        </tbody>
      </table>
    </div>

    <!-- 商户端业务统计 -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card"><div class="card-head"><div class="card-title">核销与收款 (近 7 天)</div></div>
        <div class="card-body">
          <div class="chart-bars">
            ${[18,22,16,28,32,24,24].map((v,i) => `<div class="bar-col"><span class="bar-val">${v}</span><div class="bar" style="height:${(v/35)*180}px"></div><span class="bar-label">${['5/8','5/9','5/10','5/11','5/12','5/13','5/14'][i]}</span></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="card"><div class="card-head"><div class="card-title">商户端功能使用率</div></div>
        <div class="card-body">
          ${[
            {f:'扫码核销订单', pct:92, val:'92%'},
            {f:'手动输入金额收款', pct:78, val:'78%'},
            {f:'订单管理 / 退款', pct:64, val:'64%'},
            {f:'提现申请', pct:52, val:'52%'},
            {f:'营业数据查看', pct:88, val:'88%'},
          ].map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
              <span style="width:130px;font-size:13px">${s.f}</span>
              <div style="flex:1;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden">
                <div style="height:100%;background:linear-gradient(90deg,#1677ff,#69b1ff);width:${s.pct}%"></div>
              </div>
              <span style="width:48px;text-align:right;font-weight:500">${s.val}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============ 管理端管理 ============
function renderMpAdminMgmt() {
  return `
    <div class="page-header">
      <div class="page-title">小程序 · 管理端管理</div>
      <div class="page-subtitle">配置园区管理员移动端的功能模块、消息推送、版本</div>
    </div>

    <div class="stat-grid c4">
      ${statCard('在线管理员', 3, {unit:'人', icon:'◍', color:'#1677ff', extra:'共 5 名管理员'})}
      ${statCard('今日扫码次数', 32, {unit:'次', icon:'⊞', color:'#52c41a', delta:'18%', deltaType:'up'})}
      ${statCard('待处理消息', 7, {unit:'条', icon:'✉', color:'#fa8c16', extra:'退款 3 · 活动 2 · 提现 2'})}
      ${statCard('当前版本', 'v1.5.2', {unit:'', icon:'⌖', color:'#722ed1', extra:'2026-05-08 发布'})}
    </div>

    <!-- 二级 Tabs -->
    <div class="card" style="margin-bottom:0;border-radius:8px 8px 0 0;border-bottom:none">
      <div class="card-body" style="padding:0">
        <div style="display:flex;border-bottom:1px solid var(--ant-border-secondary);padding:0 20px">
          ${['管理员账户','移动端功能开关','消息推送策略','版本与发布','操作日志'].map((t,i) => `
            <button class="btn-link" style="padding:14px 16px;border-bottom:2px solid ${i===0?'var(--ant-primary)':'transparent'};color:${i===0?'var(--ant-primary)':'var(--ant-text-2)'};font-weight:${i===0?500:400};border-radius:0">${t}</button>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="border-radius:0 0 8px 8px">
      <div class="filter-bar" style="margin:16px 20px;background:var(--ant-fill-quaternary);border:none">
        <input class="input" placeholder="姓名/手机号" style="width:180px">
        <select class="select"><option>全部园区</option><option>黄梅</option><option>武汉</option></select>
        <select class="select"><option>全部角色</option><option>园区管理员</option><option>园区经理</option></select>
        <button class="btn btn-primary btn-sm">查询</button>
        <div class="spacer"></div>
        <button class="btn">📤 推送消息</button>
        <button class="btn btn-primary">+ 新增管理员</button>
      </div>
      <table class="ant-table">
        <thead><tr><th>姓名</th><th>手机号</th><th>所属园区</th><th>角色</th><th>已分配权限模块</th><th>最近活跃</th><th>状态</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          <tr><td><b>李四</b></td><td>139****7890</td><td>黄梅袁夫稻田</td><td><span class="tag processing">园区管理员</span></td><td>全部 (13)</td><td>2026-05-14 14:22</td><td><span class="tag success">在线</span></td><td class="col-actions"><button class="btn-link">权限</button> <span class="divider">|</span> <button class="btn-link">禁用</button></td></tr>
          <tr><td><b>陈经理</b></td><td>138****2233</td><td>黄梅袁夫稻田</td><td><span class="tag cyan">园区经理</span></td><td>数据 / 商户 / 扫码 / 消息 (4)</td><td>2026-05-14 09:50</td><td><span class="tag success">在线</span></td><td class="col-actions"><button class="btn-link">权限</button> <span class="divider">|</span> <button class="btn-link">禁用</button></td></tr>
          <tr><td><b>周八</b></td><td>136****0136</td><td>武汉袁夫稻田</td><td><span class="tag processing">园区管理员</span></td><td>全部 (13)</td><td>2026-05-13 17:10</td><td><span class="tag default">离线</span></td><td class="col-actions"><button class="btn-link">权限</button> <span class="divider">|</span> <button class="btn-link">禁用</button></td></tr>
        </tbody>
      </table>
    </div>

    <!-- 功能开关示例 -->
    <div class="card">
      <div class="card-head"><div class="card-title">移动端功能模块开关 · 一键下发</div>
        <button class="btn btn-primary btn-sm" onclick="showToast('配置已下发到所有管理端')">保存并下发</button>
      </div>
      <div class="card-body" style="padding:0">
        <table class="ant-table">
          <thead><tr><th>模块</th><th>说明</th><th>开启状态</th><th>授权角色</th><th class="col-actions">操作</th></tr></thead>
          <tbody>
            ${[
              {m:'首页 · 数据概览',d:'今日销售额/订单数/客流',on:true,roles:'园区管理员、园区经理'},
              {m:'商户切换',d:'快速切换查看不同商户经营数据',on:true,roles:'园区管理员、园区经理'},
              {m:'扫码核销',d:'扫描用户付款码/核销码',on:true,roles:'园区管理员'},
              {m:'消息中心',d:'退款、提现、活动审核通知',on:true,roles:'园区管理员'},
              {m:'我的 · 权限管理',d:'查看自己的可访问模块',on:true,roles:'所有'},
              {m:'闸机远程开门',d:'远程触发闸机开启',on:false,roles:'园区管理员'},
            ].map(it => `
              <tr>
                <td><b>${it.m}</b></td>
                <td style="color:var(--ant-text-3);font-size:13px">${it.d}</td>
                <td>
                  <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer">
                    <span style="width:36px;height:20px;background:${it.on?'var(--ant-primary)':'#d9d9d9'};border-radius:10px;position:relative;transition:background 0.2s">
                      <span style="position:absolute;top:2px;left:${it.on?'18px':'2px'};width:16px;height:16px;background:#fff;border-radius:50%;transition:left 0.2s;box-shadow:0 2px 4px rgba(0,0,0,0.2)"></span>
                    </span>
                    <span style="font-size:13px;color:${it.on?'var(--ant-primary)':'var(--ant-text-3)'}">${it.on?'已启用':'已关闭'}</span>
                  </label>
                </td>
                <td style="font-size:13px;color:var(--ant-text-2)">${it.roles}</td>
                <td class="col-actions"><button class="btn-link">配置授权</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
