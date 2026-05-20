// ============================================================
// PC 页面 (3/3) — 员工 / 闸机 / 活动 / 权限 / 数据迁移 / 系统
// ============================================================

// ============ 员工管理 ============
function renderEmployeeList() {
  return `
    <div class="page-header"><div class="page-title">员工列表</div><div class="page-subtitle">管理${APP.view==='platform'?'平台所有':'本园区/商户'}员工账号</div></div>
    <div class="filter-bar">
      <input class="input" placeholder="姓名 / 用户名" style="width:180px">
      <select class="select"><option>全部园区</option><option>黄梅</option><option>武汉</option></select>
      <select class="select"><option>全部店铺</option></select>
      <select class="select"><option>全部角色</option><option>平台管理员</option><option>园区管理员</option><option>商户管理员</option><option>商户收银员</option></select>
      <input class="input" placeholder="手机号" style="width:160px">
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn">${antIcon('download')} 导出</button>
      <button class="btn btn-primary">+ 新增员工</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr><th>姓名</th><th>用户名</th><th>手机号</th><th>所属园区</th><th>所属店铺</th><th>角色</th><th>岗位</th><th>状态</th><th>创建时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          ${EMPLOYEES.map(e => `
            <tr>
              <td><b>${e.name}</b></td>
              <td class="col-mono">${e.username}</td>
              <td>${e.phone}</td>
              <td>${e.park}</td>
              <td>${e.shop}</td>
              <td><span class="tag ${e.role.includes('平台')?'error':e.role.includes('园区')?'processing':e.role.includes('商户管理')?'purple':'cyan'}">${e.role}</span></td>
              <td>${e.position}</td>
              <td>${e.online?'<span class="tag success">在线</span>':'<span class="tag default">离线</span>'}</td>
              <td>${e.createdAt}</td>
              <td class="col-actions">
                <button class="btn-link">编辑</button>
                <span class="divider">|</span>
                <button class="btn-link">重置密码</button>
                <span class="divider">|</span>
                <button class="btn-link danger">禁用</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination"><span>共 ${EMPLOYEES.length} 条</span><button class="page-btn active">1</button></div>
    </div>
  `;
}

function renderPositionList() {
  return `
    <div class="page-header"><div class="page-title">岗位管理</div></div>
    <div class="filter-bar">
      <input class="input" placeholder="岗位名称" style="width:200px">
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-primary">+ 新增岗位</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr><th>岗位名称</th><th>岗位编码</th><th>所属角色</th><th>员工数</th><th>状态</th><th>创建时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          <tr><td><b>平台运营</b></td><td class="col-mono">PLATFORM_OPER</td><td><span class="tag error">平台超级管理员</span></td><td>1</td><td><span class="tag success">启用</span></td><td>2026-01-05</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">禁用</button></td></tr>
          <tr><td><b>园区经理</b></td><td class="col-mono">PARK_ADMIN</td><td><span class="tag processing">园区管理员</span></td><td>2</td><td><span class="tag success">启用</span></td><td>2026-01-21</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">禁用</button></td></tr>
          <tr><td><b>火车餐厅经理</b></td><td class="col-mono">HCCT-1</td><td><span class="tag purple">商户管理员</span></td><td>1</td><td><span class="tag success">启用</span></td><td>2026-03-11</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">禁用</button></td></tr>
          <tr><td><b>火车餐厅前厅主管</b></td><td class="col-mono">HCCT-2</td><td><span class="tag cyan">商户收银员</span></td><td>1</td><td><span class="tag success">启用</span></td><td>2026-03-11</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">禁用</button></td></tr>
          <tr><td><b>咖啡店长</b></td><td class="col-mono">SHUXIA-01</td><td><span class="tag purple">商户管理员</span></td><td>1</td><td><span class="tag success">启用</span></td><td>2026-04-09</td><td class="col-actions"><button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">禁用</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============ 闸机管理 ============
function renderGateList() {
  return `
    <div class="page-header"><div class="page-title">闸机列表</div></div>
    <div class="filter-bar">
      <input class="input" placeholder="闸机名称 / SN" style="width:200px">
      <select class="select"><option>全部状态</option></select>
      <select class="select"><option>全部方向</option><option>进</option><option>出</option></select>
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-primary">+ 添加闸机</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr><th>序号</th><th>闸机名称</th><th>类型</th><th>方向</th><th>设备SN</th><th>启用状态</th><th>在线状态</th><th>今日通行</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          <tr><td>1</td><td><b>主入口 1#</b></td><td><span class="tag processing">入口</span></td><td>进</td><td class="col-mono">E014370C2321</td><td><span class="tag success">启用</span></td><td><span class="tag success">在线</span></td><td>78</td><td class="col-actions"><button class="btn-link" onclick="showToast('远程开门已执行')">远程开门</button> <span class="divider">|</span> <button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">删除</button></td></tr>
          <tr><td>2</td><td><b>主入口 2#</b></td><td><span class="tag error">出口</span></td><td>出</td><td class="col-mono">E014370C2322</td><td><span class="tag success">启用</span></td><td><span class="tag success">在线</span></td><td>50</td><td class="col-actions"><button class="btn-link">远程开门</button> <span class="divider">|</span> <button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">删除</button></td></tr>
          <tr><td>3</td><td><b>侧门 3#</b></td><td><span class="tag processing">入口</span></td><td>进</td><td class="col-mono">E014370C2323</td><td><span class="tag default">禁用</span></td><td><span class="tag default">离线</span></td><td>0</td><td class="col-actions"><button class="btn-link" disabled>远程开门</button> <span class="divider">|</span> <button class="btn-link">编辑</button> <span class="divider">|</span> <button class="btn-link danger">删除</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderFaceList() {
  return `
    <div class="page-header"><div class="page-title">人脸管理</div><div class="page-subtitle">已录入人脸的用户列表，支持手动录入与配置闸机</div></div>
    <div class="filter-bar">
      <input class="input" placeholder="手机号 / 用户ID" style="width:200px">
      <select class="select"><option>全部状态</option><option>已启用</option><option>已禁用</option></select>
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-primary">+ 录入人脸</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr><th>序号</th><th>用户ID</th><th>手机号</th><th>人脸特征ID</th><th>授权闸机</th><th>状态</th><th>创建时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>3002</td><td>152****6677</td><td class="col-mono">417befe09d2c46e094564c091bc3e9a1</td><td>全部</td><td><span class="tag success">启用</span></td><td>2026-04-24 10:27</td><td class="col-actions"><button class="btn-link">配置闸机</button> <span class="divider">|</span> <button class="btn-link">查看</button> <span class="divider">|</span> <button class="btn-link danger">删除</button></td></tr>
          <tr><td>2</td><td>3004</td><td>138****5678</td><td class="col-mono">d8b202a18f5e4c2384e2914f59b3a721</td><td>主入口</td><td><span class="tag success">启用</span></td><td>2026-04-26 14:50</td><td class="col-actions"><button class="btn-link">配置闸机</button> <span class="divider">|</span> <button class="btn-link">查看</button> <span class="divider">|</span> <button class="btn-link danger">删除</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderEntryRecords() {
  return `
    <div class="page-header"><div class="page-title">进出记录</div></div>
    <div class="filter-bar">
      <select class="select"><option>全部闸机</option></select>
      <select class="select"><option>进出方向</option><option>进</option><option>出</option></select>
      <select class="select"><option>验证方式</option><option>人脸识别</option><option>扫码通行</option><option>远程开门</option></select>
      <input class="input" placeholder="手机号 / 用户ID" style="width:180px">
      <input class="input" placeholder="开始时间" style="width:140px">
      <span>~</span>
      <input class="input" placeholder="结束时间" style="width:140px">
      <button class="btn btn-primary btn-sm">查询</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr><th>序号</th><th>用户ID</th><th>手机号</th><th>闸机</th><th>方向</th><th>特征ID</th><th>相似度</th><th>验证方式</th><th>进出时间</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>3002</td><td>152****6677</td><td>主入口 1#</td><td><span class="tag success">进</span></td><td class="col-mono">417befe0...</td><td>99.82%</td><td><span class="tag processing">人脸识别</span></td><td>2026-05-14 14:25</td></tr>
          <tr><td>2</td><td>3004</td><td>138****5678</td><td>主入口 1#</td><td><span class="tag success">进</span></td><td class="col-mono">d8b202a1...</td><td>98.50%</td><td><span class="tag processing">人脸识别</span></td><td>2026-05-14 13:15</td></tr>
          <tr><td>3</td><td>-</td><td>187****9908</td><td>主入口 1#</td><td><span class="tag success">进</span></td><td>-</td><td>-</td><td><span class="tag cyan">扫码通行</span></td><td>2026-05-14 11:08</td></tr>
          <tr><td>4</td><td>3002</td><td>152****6677</td><td>主入口 2#</td><td><span class="tag warning">出</span></td><td class="col-mono">417befe0...</td><td>99.95%</td><td><span class="tag processing">人脸识别</span></td><td>2026-05-14 10:35</td></tr>
          <tr><td>5</td><td>-</td><td>-</td><td>主入口 1#</td><td><span class="tag success">进</span></td><td>-</td><td>-</td><td><span class="tag warning">远程开门</span></td><td>2026-05-14 10:15</td></tr>
        </tbody>
      </table>
      <div class="pagination"><span>共 1,247 条</span><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">3</button><button class="page-btn">...</button><button class="page-btn">125</button></div>
    </div>
  `;
}

// ============ 活动管理 ============
function renderActivityList() {
  return `
    <div class="page-header"><div class="page-title">活动管理</div><div class="page-subtitle">${APP.view==='platform'?'总部创建活动 → 园区审核 → 推送商户 → 用户参与':'审核总部活动并推送至本园区商户'}</div></div>
    <div class="filter-bar">
      <select class="select"><option>全部状态</option><option>进行中</option><option>已结束</option><option>待审核</option></select>
      <select class="select"><option>全部类型</option><option>优惠券活动</option><option>满减活动</option><option>限时折扣</option><option>节日活动</option><option>会员专享</option></select>
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      ${APP.view==='platform'?'<button class="btn btn-primary" onclick="goPage(\'activity-create\')">+ 创建活动</button>':'<button class="btn btn-primary">推送到商户</button>'}
    </div>

    <div class="stat-grid c4">
      ${statCard('进行中', 3, {unit:'个', icon:'◉', color:'#52c41a'})}
      ${statCard('待审核', 1, {unit:'个', icon:'⏳', color:'#faad14'})}
      ${statCard('已结束', 1, {unit:'个', icon:'◌', color:'#999'})}
      ${statCard('累计参与', 1396, {unit:'人次', icon:'◍', color:'#1677ff'})}
    </div>

    <div class="card">
      <table class="ant-table">
        <thead><tr><th>活动标题</th><th>类型</th><th>适用园区</th><th>适用商户</th><th>活动时间</th><th>状态</th><th style="text-align:right">曝光量</th><th style="text-align:right">参与</th><th style="text-align:right">核销率</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          ${ACTIVITIES.map(a => `
            <tr>
              <td><b>${a.title}</b></td>
              <td><span class="tag ${a.type==='节日活动'?'purple':a.type==='会员专享'?'warning':a.type==='满减活动'?'processing':a.type==='限时折扣'?'error':'cyan'}">${a.type}</span></td>
              <td>${a.parkScope}</td>
              <td>${a.shopScope}</td>
              <td>${a.startAt} ~ ${a.endAt}</td>
              <td><span class="tag ${a.status==='进行中'?'success':a.status==='待审核'?'warning':'default'}">${a.status}</span></td>
              <td style="text-align:right">${a.exposure.toLocaleString()}</td>
              <td style="text-align:right">${a.joins}</td>
              <td style="text-align:right">${a.verifyRate}</td>
              <td class="col-actions">
                <button class="btn-link">效果</button>
                <span class="divider">|</span>
                <button class="btn-link">编辑</button>
                ${a.status==='待审核' && APP.view!=='platform' ? '<span class="divider">|</span><button class="btn-link">审核</button>' : ''}
                ${a.status==='进行中' ? '<span class="divider">|</span><button class="btn-link danger">结束</button>' : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderActivityCreate() {
  return `
    <div class="page-header"><div class="page-title">创建活动</div><div class="page-subtitle">总部策划活动 · 推送到指定园区 → 园区审核 → 推送至商户</div></div>
    <div class="card">
      <div class="card-body">
        <div class="steps" style="margin-bottom:24px">
          <div class="step-item active"><div class="step-circle">1</div><div class="step-label">基本信息</div></div>
          <div class="step-line"></div>
          <div class="step-item"><div class="step-circle">2</div><div class="step-label">活动规则</div></div>
          <div class="step-line"></div>
          <div class="step-item"><div class="step-circle">3</div><div class="step-label">投放范围</div></div>
          <div class="step-line"></div>
          <div class="step-item"><div class="step-circle">4</div><div class="step-label">预览发布</div></div>
        </div>

        <div class="form-row">
          <div class="form-item"><label class="form-label required">活动标题</label><input class="input" placeholder="如：夏日稻田音乐节"></div>
          <div class="form-item"><label class="form-label required">活动类型</label>
            <select class="select"><option>优惠券活动</option><option>满减活动</option><option>限时折扣</option><option>节日活动</option><option>会员专享</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item"><label class="form-label required">开始时间</label><input class="input" placeholder="选择日期"></div>
          <div class="form-item"><label class="form-label required">结束时间</label><input class="input" placeholder="选择日期"></div>
        </div>
        <div class="form-item">
          <label class="form-label">活动封面图</label>
          <div style="width:160px;height:90px;border:1px dashed var(--ant-border);border-radius:6px;background:var(--ant-fill-quaternary);display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--ant-text-3);gap:4px;font-size:12px">
            <span style="font-size:24px">+</span>上传封面
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">活动详情</label>
          <textarea class="textarea" rows="4" placeholder="支持富文本，描述活动详情、参与方式、注意事项等"></textarea>
        </div>
        <div class="form-item">
          <label class="form-label">适用园区</label>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:14px">
            <label><input type="radio" name="ps" checked style="margin-right:4px"> 全部园区</label>
            <label><input type="radio" name="ps" style="margin-right:4px"> 指定园区</label>
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">适用商户</label>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:14px">
            <label><input type="radio" name="ss" checked style="margin-right:4px"> 全部商户</label>
            <label><input type="radio" name="ss" style="margin-right:4px"> 指定商户</label>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--ant-border-secondary);padding-top:20px">
          <button class="btn" onclick="goPage('activity-list')">取消</button>
          <button class="btn">保存草稿</button>
          <button class="btn btn-primary" onclick="showToast('活动已创建并发起审核');goPage('activity-list')">下一步</button>
        </div>
      </div>
    </div>
  `;
}

// ============ 权限管理 (三层 RBAC) ============
function renderRolePerm() {
  return `
    <div class="page-header"><div class="page-title">角色权限管理</div><div class="page-subtitle">基于 RBAC 模型，按"平台 / 园区 / 商户"三层粒度配置权限</div></div>

    <div class="card">
      <div class="card-head"><div class="card-title">系统角色</div>
        <button class="btn btn-primary btn-sm">+ 新增角色</button>
      </div>
      <table class="ant-table">
        <thead><tr><th>角色名称</th><th>角色编码</th><th>层级</th><th>角色描述</th><th>员工数</th><th>创建时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          ${Object.entries(ROLES).map(([code, r]) => `
            <tr>
              <td><b>${r.name}</b></td>
              <td class="col-mono">${code}</td>
              <td><span class="tag ${r.layer==='总部'?'error':r.layer==='园区'?'processing':'cyan'}">${r.layer}</span></td>
              <td style="color:var(--ant-text-3);font-size:13px">${
                code==='ADMIN_PLATFORM'?'平台最高权限，所有功能可访问':
                code==='PLATFORM_OPER'?'查看所有园区数据 / 活动推送 / 系统配置':
                code==='PARK_ADMIN'?'本园区所有管理权限 (商户/用户/财务/统计)':
                code==='PARK_MANAGER'?'本园区经营数据查看 / 部分管理操作':
                code==='SHOP_ADMIN'?'本店铺经营管理 (商品/订单/对账)':
                '本店铺收银 / 核销操作'
              }</td>
              <td>${code==='ADMIN_PLATFORM'?1:code==='PARK_ADMIN'?2:code==='SHOP_ADMIN'?2:code==='SHOP_CASHIER'?1:0}</td>
              <td>2026-01-05</td>
              <td class="col-actions">
                <button class="btn-link" onclick="openPermMatrix('${code}')">配置权限</button>
                <span class="divider">|</span>
                <button class="btn-link">编辑</button>
                ${code!=='ADMIN_PLATFORM' && code!=='MEMBER' ? '<span class="divider">|</span><button class="btn-link danger">删除</button>' : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">权限矩阵 · 全景视图</div>
        <div class="card-extra">✓ = 完全可见可操作 ｜ ◐ = 仅可见 ｜ — = 无权限</div>
      </div>
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table class="perm-matrix">
          <thead>
            <tr>
              <th class="module">功能模块</th>
              <th>平台超级管理员</th><th>总部运营</th>
              <th>园区管理员</th><th>园区经理</th>
              <th>商户管理员</th><th>商户收银员</th>
            </tr>
          </thead>
          <tbody>
            ${[
              {m:'园区总览/数据看板',perms:['yes','yes','yes','yes','no','no']},
              {m:'园区管理 (增/删/改)',perms:['yes','no','no','no','no','no']},
              {m:'店铺管理 (本园区)',perms:['yes','partial','yes','partial','no','no']},
              {m:'店铺管理 (本店)',perms:['yes','yes','yes','yes','yes','no']},
              {m:'用户列表 / 充值记录',perms:['yes','partial','yes','partial','partial','no']},
              {m:'订单管理',perms:['yes','partial','yes','partial','yes','no']},
              {m:'核销操作',perms:['yes','no','yes','no','yes','yes']},
              {m:'退款审核',perms:['yes','no','yes','no','partial','no']},
              {m:'销售/客流统计',perms:['yes','yes','yes','yes','partial','no']},
              {m:'财务管理 / 提现',perms:['yes','partial','yes','no','partial','no']},
              {m:'员工管理',perms:['yes','no','yes','no','partial','no']},
              {m:'闸机/人脸管理',perms:['yes','partial','yes','partial','no','no']},
              {m:'活动推送/审核',perms:['yes','yes','yes','no','no','no']},
              {m:'数据迁移',perms:['yes','no','no','no','no','no']},
              {m:'系统配置 / 角色权限',perms:['yes','no','no','no','no','no']},
              {m:'操作日志',perms:['yes','yes','partial','partial','no','no']},
            ].map(r => `
              <tr>
                <td class="module">${r.m}</td>
                ${r.perms.map(p => `<td class="${p}">${p==='yes'?'✓':p==='no'?'—':'◐'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============ 数据迁移 ============
function renderDataMigration() {
  return `
    <div class="page-header"><div class="page-title">数据迁移管理</div><div class="page-subtitle">将旧平台数据导入新平台 · 字段映射 · 校验报告</div></div>

    <div class="stat-grid c4">
      ${statCard('已迁移记录', 18420, {unit:'条', icon:'⇄', color:'#1677ff'})}
      ${statCard('待迁移', 326, {unit:'条', icon:'⏳', color:'#faad14'})}
      ${statCard('迁移成功率', '99.4%', {unit:'', icon:'✓', color:'#52c41a'})}
      ${statCard('校验异常', 12, {unit:'条', icon:'!', color:'#ff4d4f'})}
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">迁移任务进度</div>
        <div style="display:flex;gap:8px"><button class="btn btn-sm">⟲ 刷新</button><button class="btn btn-primary btn-sm">+ 新建迁移任务</button></div>
      </div>
      <table class="ant-table">
        <thead><tr><th>任务编号</th><th>数据表</th><th>阶段</th><th>记录数</th><th>进度</th><th>状态</th><th>开始时间</th><th class="col-actions">操作</th></tr></thead>
        <tbody>
          <tr><td class="col-mono">MIG-001</td><td>园区信息表 → park</td><td>第一阶段</td><td>2</td><td>${migBar(100)}</td><td><span class="tag success">已完成</span></td><td>2026-05-10 09:00</td><td class="col-actions"><button class="btn-link">查看报告</button></td></tr>
          <tr><td class="col-mono">MIG-002</td><td>店铺类型表 → shop_type</td><td>第一阶段</td><td>4</td><td>${migBar(100)}</td><td><span class="tag success">已完成</span></td><td>2026-05-10 09:05</td><td class="col-actions"><button class="btn-link">查看报告</button></td></tr>
          <tr><td class="col-mono">MIG-003</td><td>店铺表 → shop</td><td>第一阶段</td><td>5</td><td>${migBar(100)}</td><td><span class="tag success">已完成</span></td><td>2026-05-10 09:10</td><td class="col-actions"><button class="btn-link">查看报告</button></td></tr>
          <tr><td class="col-mono">MIG-004</td><td>用户/会员表 → user</td><td>第二阶段</td><td>2,837</td><td>${migBar(100)}</td><td><span class="tag success">已完成</span></td><td>2026-05-11 10:00</td><td class="col-actions"><button class="btn-link">查看报告</button></td></tr>
          <tr><td class="col-mono">MIG-005</td><td>人脸特征数据 → face</td><td>第二阶段</td><td>42</td><td>${migBar(100)}</td><td><span class="tag success">已完成</span></td><td>2026-05-11 10:20</td><td class="col-actions"><button class="btn-link">查看报告</button></td></tr>
          <tr><td class="col-mono">MIG-006</td><td>订单表 → order</td><td>第三阶段</td><td>15,420</td><td>${migBar(98)}</td><td><span class="tag processing">迁移中</span></td><td>2026-05-14 09:00</td><td class="col-actions"><button class="btn-link">查看进度</button> <span class="divider">|</span> <button class="btn-link danger">暂停</button></td></tr>
          <tr><td class="col-mono">MIG-007</td><td>充值记录 → recharge</td><td>第三阶段</td><td>326</td><td>${migBar(0)}</td><td><span class="tag default">待启动</span></td><td>-</td><td class="col-actions"><button class="btn-link">启动</button></td></tr>
          <tr><td class="col-mono">MIG-008</td><td>员工/岗位 → employee</td><td>第四阶段</td><td>0</td><td>${migBar(0)}</td><td><span class="tag default">未开始</span></td><td>-</td><td class="col-actions"><button class="btn-link">配置</button></td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">字段映射示例 · 用户/会员表</div>
        <button class="btn btn-sm">编辑映射</button>
      </div>
      <table class="ant-table">
        <thead><tr><th>新平台字段</th><th>类型</th><th>旧平台字段</th><th>映射规则</th><th>是否必填</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td class="col-mono">user_id</td><td>BIGINT</td><td class="col-mono">用户ID</td><td>保留原ID</td><td><span class="tag error">是</span></td><td>新平台主键</td></tr>
          <tr><td class="col-mono">nickname</td><td>VARCHAR(50)</td><td class="col-mono">用户昵称</td><td>直接映射</td><td><span class="tag default">否</span></td><td>用户昵称</td></tr>
          <tr><td class="col-mono">phone</td><td>VARCHAR(20)</td><td class="col-mono">手机号</td><td>直接映射</td><td><span class="tag error">是</span></td><td>唯一索引</td></tr>
          <tr><td class="col-mono">openid</td><td>VARCHAR(100)</td><td class="col-mono">OpenID</td><td>直接映射</td><td><span class="tag default">否</span></td><td>微信 OpenID</td></tr>
          <tr><td class="col-mono">member_level</td><td>VARCHAR(20)</td><td class="col-mono">会员等级</td><td>vip → VIP, normal → 普通</td><td><span class="tag default">否</span></td><td>枚举值转换</td></tr>
          <tr><td class="col-mono">face_feature_id</td><td>VARCHAR(100)</td><td class="col-mono">AgoraID/特征ID</td><td>直接映射</td><td><span class="tag default">否</span></td><td>人脸识别 ID (声网 Agora)</td></tr>
          <tr><td class="col-mono">balance</td><td>DECIMAL(10,2)</td><td class="col-mono">余额</td><td>直接映射，保留 2 位小数</td><td><span class="tag default">否</span></td><td>账户余额</td></tr>
          <tr><td class="col-mono">total_consumption</td><td>DECIMAL(10,2)</td><td class="col-mono">消费金额</td><td>直接映射</td><td><span class="tag default">否</span></td><td>累计消费</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function migBar(pct) {
  return `<div style="display:flex;align-items:center;gap:8px;width:160px">
    <div style="flex:1;height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${pct===100?'#52c41a':'#1677ff'};transition:width 0.3s"></div></div>
    <span style="font-size:12px;color:var(--ant-text-2);width:32px">${pct}%</span>
  </div>`;
}

// ============ 系统设置 ============
function renderMpConfig() {
  return `
    <div class="page-header">
      <div class="page-title">小程序配置</div>
      <div class="page-subtitle">管理多个微信小程序 · 按端类型分类配置 · 版本发布管理</div>
    </div>

    <!-- 已配置的小程序列表 -->
    <div class="card">
      <div class="card-head">
        <div class="card-title">已接入小程序 (${MINI_PROGRAMS.length})</div>
        <button class="btn btn-primary" onclick="openMpAddForm()">+ 添加小程序</button>
      </div>
      <table class="ant-table">
        <thead><tr>
          <th>小程序名称</th><th>AppID</th><th>端类型</th><th>AppSecret</th><th>当前版本</th><th>发布时间</th><th>状态</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          ${MINI_PROGRAMS.map(mp => `
            <tr>
              <td><b>${mp.name}</b></td>
              <td class="col-mono">${mp.appId}</td>
              <td><span class="tag ${mp.type==='client'?'processing':mp.type==='merchant'?'purple':'cyan'}">${mp.typeLabel}</span></td>
              <td class="col-mono">${mp.appSecret}</td>
              <td>${mp.version}</td>
              <td>${mp.publishedAt}</td>
              <td><span class="tag ${mp.status==='active'?'success':'default'}">${mp.status==='active'?'运行中':'已停用'}</span></td>
              <td class="col-actions">
                <button class="btn-link" onclick="openMpEditForm(${mp.id})">编辑</button>
                <span class="divider">|</span>
                <button class="btn-link" onclick="showToast('版本管理 · ${mp.name}')">版本</button>
                <span class="divider">|</span>
                <button class="btn-link danger" onclick="showToast('已停用 ${mp.name}')">${mp.status==='active'?'停用':'启用'}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 小程序详情卡片 -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
      ${MINI_PROGRAMS.map(mp => `
        <div class="card" style="cursor:pointer" onclick="openMpEditForm(${mp.id})">
          <div class="card-head">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:20px">${mp.type==='client'?'🛍️':mp.type==='merchant'?'🏪':'⚙'}</span>
              <div>
                <div class="card-title" style="font-size:14px">${mp.name}</div>
                <div style="font-size:11px;color:var(--ant-text-3)">${mp.typeLabel} · v${mp.version}</div>
              </div>
            </div>
          </div>
          <div class="card-body" style="padding:14px">
            <div style="font-size:12px;color:var(--ant-text-3);margin-bottom:4px">AppID</div>
            <div class="col-mono" style="font-size:13px">${mp.appId}</div>
            <div style="font-size:12px;color:var(--ant-text-3);margin:8px 0 4px">回调地址</div>
            <div class="col-mono" style="font-size:12px;overflow:hidden;text-overflow:ellipsis">${mp.callbackUrl}</div>
            <div style="font-size:12px;color:var(--ant-text-3);margin:8px 0 4px">商户号</div>
            <div class="col-mono" style="font-size:13px">${mp.mchId}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- 添加/编辑小程序 Modal 函数 -->
  `;
}

function openMpAddForm() {
  showModal({
    title: '添加小程序',
    body: mpConfigForm({}),
    footer: `<button class="btn" onclick="closeModal()">取消</button><button class="btn btn-primary" onclick="closeModal();showToast('小程序已添加')">保存</button>`,
    wide: true,
  });
}

function openMpEditForm(id) {
  const mp = MINI_PROGRAMS.find(m => m.id === id);
  if (!mp) return;
  showModal({
    title: '编辑小程序 · ' + mp.name,
    body: mpConfigForm(mp),
    footer: `<button class="btn" onclick="closeModal()">取消</button><button class="btn btn-primary" onclick="closeModal();showToast('配置已保存 · ' + '${mp.name}')">保存</button>`,
    wide: true,
  });
}

function mpConfigForm(mp) {
  const isNew = !mp.id;
  return `
    <div style="max-width:720px">
      <div class="form-row">
        <div class="form-item">
          <label class="form-label required">小程序名称</label>
          <input class="input" value="${mp.name || ''}" placeholder="如：袁夫稻田·客户端">
        </div>
        <div class="form-item">
          <label class="form-label required">端类型</label>
          <select class="select">
            <option value="client" ${mp.type==='client'?'selected':''}>🛍️ 客户端 (C端用户)</option>
            <option value="merchant" ${mp.type==='merchant'?'selected':''}>🏪 商户端 (商户管理/核销)</option>
            <option value="admin" ${mp.type==='admin'?'selected':''}>⚙ 管理端 (园区管理)</option>
          </select>
          <div class="form-help">选择小程序的使用端类型，不同类型对应不同的功能模块与权限</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label class="form-label required">小程序 AppID</label>
          <input class="input" value="${mp.appId || ''}" placeholder="wx...">
        </div>
        <div class="form-item">
          <label class="form-label required">小程序 AppSecret</label>
          <div style="display:flex;gap:8px">
            <input class="input" value="${mp.appSecret || '••••••••••••••••••••••••••••••••'}" type="password" style="flex:1">
            <button class="btn" onclick="showToast('已复制')">查看</button>
          </div>
        </div>
      </div>
      <div class="form-item">
        <label class="form-label">回调地址 (Webhook)</label>
        <input class="input" value="${mp.callbackUrl || ''}" placeholder="https://api.yuanfu-rice.com/wx/.../callback">
      </div>
      <div class="form-row">
        <div class="form-item">
          <label class="form-label">支付商户号</label>
          <input class="input" value="${mp.mchId || ''}" placeholder="微信支付商户号">
        </div>
        <div class="form-item">
          <label class="form-label">版本号</label>
          <input class="input" value="${mp.version || 'v1.0.0'}" placeholder="v1.0.0">
        </div>
      </div>
      <div class="form-item">
        <label class="form-label">Scope (权限作用域)</label>
        <input class="input" value="snsapi_userinfo,scope.userInfo">
      </div>
    </div>
  `;
}

function renderLogs() {
  return `
    <div class="page-header"><div class="page-title">操作日志</div><div class="page-subtitle">系统级操作日志查询与审计</div></div>
    <div class="filter-bar">
      <input class="input" placeholder="用户名" style="width:140px">
      <select class="select"><option>操作类型</option><option>新增</option><option>修改</option><option>删除</option><option>查询</option></select>
      <select class="select"><option>操作模块</option><option>系统管理</option><option>角色管理</option><option>用户管理</option><option>订单管理</option></select>
      <select class="select"><option>操作状态</option><option>成功</option><option>失败</option></select>
      <input class="input" placeholder="开始时间" style="width:140px">
      <span>~</span>
      <input class="input" placeholder="结束时间" style="width:140px">
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-danger btn-sm">🗑 清除日志</button>
    </div>
    <div class="card">
      <table class="ant-table">
        <thead><tr><th>日志ID</th><th>用户名</th><th>操作类型</th><th>操作模块</th><th>操作描述</th><th>IP地址</th><th>状态</th><th>操作时间</th></tr></thead>
        <tbody>
          <tr><td>2533</td><td>admin01</td><td><span class="tag warning">修改</span></td><td>角色管理</td><td class="col-mono">PUT /auth/role/perm</td><td>172.21.0.2</td><td><span class="tag success">成功</span></td><td>2026-05-14 14:25</td></tr>
          <tr><td>2532</td><td>park-hm</td><td><span class="tag success">新增</span></td><td>活动管理</td><td class="col-mono">POST /activity/create</td><td>172.21.0.5</td><td><span class="tag success">成功</span></td><td>2026-05-14 14:20</td></tr>
          <tr><td>2531</td><td>hcct-mgr</td><td><span class="tag processing">查询</span></td><td>订单管理</td><td class="col-mono">GET /order/list?status=paid</td><td>10.0.0.12</td><td><span class="tag success">成功</span></td><td>2026-05-14 14:15</td></tr>
          <tr><td>2530</td><td>anonymous</td><td><span class="tag warning">登录</span></td><td>系统管理</td><td class="col-mono">POST /auth/login</td><td>10.0.0.18</td><td><span class="tag error">失败</span></td><td>2026-05-14 14:10</td></tr>
          <tr><td>2529</td><td>admin01</td><td><span class="tag error">删除</span></td><td>员工管理</td><td class="col-mono">DELETE /employee/12</td><td>172.21.0.2</td><td><span class="tag success">成功</span></td><td>2026-05-14 13:55</td></tr>
          <tr><td>2528</td><td>park-hm</td><td><span class="tag warning">修改</span></td><td>退款处理</td><td class="col-mono">PUT /refund/RF20260514114009</td><td>172.21.0.5</td><td><span class="tag success">成功</span></td><td>2026-05-14 13:30</td></tr>
        </tbody>
      </table>
      <div class="pagination"><span>共 1,607 条</span><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">3</button><button class="page-btn">...</button><button class="page-btn">161</button></div>
    </div>
  `;
}

// 退款审核 Modal
function openRefundReview(id) {
  const r = REFUNDS.find(x => x.id === id);
  if (!r) return;
  showModal({
    title: `退款审核 · ${r.id}`,
    body: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px">
        <div><div style="color:var(--ant-text-3);margin-bottom:4px">用户</div><div><b>${r.user}</b></div></div>
        <div><div style="color:var(--ant-text-3);margin-bottom:4px">关联订单</div><div class="col-mono">${r.order}</div></div>
        <div><div style="color:var(--ant-text-3);margin-bottom:4px">退款类型</div><div><span class="tag ${r.type==='余额退款'?'purple':'processing'}">${r.type}</span></div></div>
        <div><div style="color:var(--ant-text-3);margin-bottom:4px">退款金额</div><div style="font-size:22px;font-weight:600;color:var(--ant-error)" class="money">¥${r.amount.toFixed(2)}</div></div>
        <div style="grid-column:1/-1"><div style="color:var(--ant-text-3);margin-bottom:4px">用户提交原因</div><div>${r.reason}</div></div>
      </div>
      <div style="border-top:1px solid var(--ant-border-secondary);margin:18px 0;padding-top:18px">
        <div class="form-item">
          <label class="form-label">退款方式</label>
          <div style="font-size:13px;color:var(--ant-text-2);padding:8px 0">
            ${r.type==='余额退款' ? '原路退回至微信支付 (按充值订单原路退回)' : '退回至支付方式 (订单原路退回)'}
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">审核备注</label>
          <textarea class="textarea" rows="2" placeholder="请输入审核备注（驳回时必填）"></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn" onclick="closeModal()">取消</button>
      <button class="btn btn-danger" onclick="closeModal();showToast('已驳回')">驳回</button>
      <button class="btn btn-primary" onclick="closeModal();showToast('已通过 · 退款已发起')">通过并退款</button>
    `
  });
}

// ============ 美团核销管理 ============
function renderMeituanDashboard() {
  const data = shopData(MEITUAN_VERIFY_RECORDS);
  const totalVerify = data.length;
  const todayVerify = data.filter(r => r.verifyAt.includes('2026-05-14')).length;
  const totalAmount = data.reduce((s, r) => s + r.salePrice, 0);
  const revokeCount = data.filter(r => r.status === '已撤销').length;

  return `
    <div class="page-header">
      <div class="page-title">☷ 美团核销仪表盘</div>
      <div class="page-subtitle">美团/大众点评团购券核销数据概览 · 对接状态与实时核销监控</div>
    </div>

    <div class="stat-grid c4">
      ${statCard('接入门店', '2/3', {unit:'家', icon:'▢', color:'#52c41a', extra:'1 家待绑定'})}
      ${statCard('今日核销', todayVerify, {unit:'笔', icon:'✓', color:'#1677ff', delta:'+3', deltaType:'up', extra:'较昨日'})}
      ${statCard('累计核销金额', totalAmount.toFixed(2), {icon:'¥', color:'#fa8c16', extra:'美团平台券'})}
      ${statCard('撤销/退款', revokeCount, {unit:'笔', icon:'⤺', color:'#ff4d4f', extra:'可发起撤销'})}
    </div>

    <div class="stat-grid c4">
      ${statCard('门店映射', '2/3', {unit:'家', icon:'⌷', color:'#722ed1', extra:'已绑定 2'})}
      ${statCard('套餐映射', '3', {unit:'个', icon:'◈', color:'#13c2c2', extra:'已关联收银系统'})}
      ${statCard('API 调用 (今日)', 47, {unit:'次', icon:'⇄', color:'#1677ff', extra:'成功率 100%'})}
      ${statCard('待结算金额', '1718.87', {icon:'¥', color:'#fa8c16', extra:'3 笔待结算'})}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card">
        <div class="card-head">
          <div class="card-title">近 7 天核销趋势</div>
        </div>
        <div class="card-body">
          <div class="chart-bars">
            ${[5,3,7,4,6,8,todayVerify].map((v,i) => {
              const max = 10;
              const days = ['5/8','5/9','5/10','5/11','5/12','5/13','5/14'];
              return `<div class="bar-col"><span class="bar-val">${v}</span><div class="bar" style="height:${(v/max)*180}px;background:linear-gradient(180deg,#fa8c16,#d46b08)"></div><span class="bar-label">${days[i]}</span></div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head">
          <div class="card-title">门店对接状态</div>
        </div>
        <div class="card-body">
          ${shopData(MEITUAN_STORE_CONFIGS).map(s => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--ant-border-secondary)">
              <div style="width:40px;height:40px;border-radius:8px;background:${s.status==='已绑定'?'linear-gradient(135deg,#52c41a,#389e0d)':'linear-gradient(135deg,#d9d9d9,#bfbfbf)'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600">${s.shop[0]}</div>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:500">${s.shop}</div>
                <div style="font-size:12px;color:var(--ant-text-3);margin-top:2px">${s.status==='已绑定'?`已同步 · 累计核销 ${s.verifyCount} 笔`:'需扫码完成门店绑定'}</div>
              </div>
              <span class="tag ${s.status==='已绑定'?'success':'warning'}">${s.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div class="card-title">对接流程 · 四步接入</div>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          ${[
            {step:'第一步',title:'入驻与授权',desc:'完成美团技术服务合作中心入驻，获取开发者账号 (appId / appSecret)',color:'#1677ff',bg:'#e6f4ff'},
            {step:'第二步',title:'门店映射',desc:'接入门店映射 UI SDK，商家扫码完成门店绑定，获取 appAuthToken',color:'#52c41a',bg:'#f6ffed'},
            {step:'第三步',title:'套餐映射',desc:'调用门店套餐映射接口，将美团团购套餐与收银系统菜品关联',color:'#fa8c16',bg:'#fff7e6'},
            {step:'第四步',title:'验券能力接入',desc:'接入验券准备/执行验券接口，完成团购券核销闭环',color:'#ff4d4f',bg:'#fff2f0'},
          ].map(s => `
            <div style="border:1px solid var(--ant-border-secondary);border-radius:8px;padding:16px;background:${s.bg}">
              <div style="font-size:11px;color:${s.color};font-weight:600;margin-bottom:6px">${s.step}</div>
              <div style="font-size:14px;font-weight:600;margin-bottom:6px;color:${s.color}">${s.title}</div>
              <div style="font-size:12px;color:var(--ant-text-2);line-height:1.6">${s.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderMeituanRecords() {
  return `
    <div class="page-header">
      <div class="page-title">验券记录</div>
      <div class="page-subtitle">美团/大众点评团购券核销记录 · 支持撤销验券与码查询</div>
    </div>

    <div class="filter-bar">
      <input class="input" placeholder="券码 / 核销单号" style="width:200px">
      <select class="select"><option>全部状态</option><option>已核销</option><option>已撤销</option></select>
      <select class="select"><option>全部店铺</option><option>火车餐厅</option><option>树下咖啡</option><option>稻田手作坊</option></select>
      <input class="input" placeholder="开始日期" style="width:140px">
      <span>~</span>
      <input class="input" placeholder="结束日期" style="width:140px">
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm">${antIcon('download')} 导出</button>
      <button class="btn btn-primary" onclick="showToast('验券码查询：请输入12位券码')">${antIcon('search')} 验券码查询</button>
    </div>

    <div class="stat-grid c4">
      ${statCard('今日核销', 4, {unit:'笔', icon:'✓', color:'#52c41a'})}
      ${statCard('核销金额', 386.70, {icon:'¥', color:'#1677ff'})}
      ${statCard('撤销/退款', 1, {unit:'笔', icon:'⤺', color:'#ff4d4f'})}
      ${statCard('可撤销 (24h内)', 3, {unit:'笔', icon:'⏳', color:'#faad14'})}
    </div>

    <div class="card">
      <table class="ant-table">
        <thead><tr>
          <th>核销单号</th><th>美团券码</th><th>团购商品</th><th style="text-align:right">原价</th><th style="text-align:right">售价</th>
          <th>用户</th><th>店铺</th><th>状态</th><th>核销人</th><th>核销时间</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          ${shopData(MEITUAN_VERIFY_RECORDS,'shop').map(r => `
            <tr>
              <td class="col-mono">${r.id}</td>
              <td class="col-mono">${r.couponCode}</td>
              <td><b>${r.product}</b></td>
              <td style="text-align:right;text-decoration:line-through;color:var(--ant-text-3)" class="money">¥${r.originPrice.toFixed(2)}</td>
              <td style="text-align:right;font-weight:600;color:var(--ant-error)" class="money">¥${r.salePrice.toFixed(2)}</td>
              <td>${r.user}<br><span style="font-size:12px;color:var(--ant-text-3)">${r.phone}</span></td>
              <td>${r.shop}</td>
              <td><span class="tag ${r.status==='已核销'?'success':'error'}">${r.status}</span></td>
              <td>${r.verifyBy}</td>
              <td>${r.verifyAt}</td>
              <td class="col-actions">
                ${r.status==='已核销' && r.refundable ? `
                  <button class="btn-link" onclick="openMeituanRevoke('${r.id}')">撤销验券</button>
                ` : ''}
                ${r.status==='已撤销' ? `<span class="tag default">已撤销</span>` : ''}
                <span class="divider">|</span>
                <button class="btn-link">详情</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination">
        <span>共 ${shopData(MEITUAN_VERIFY_RECORDS).length} 条</span>
        <button class="page-btn active">1</button>
      </div>
    </div>
  `;
}

function renderMeituanSettlement() {
  return `
    <div class="page-header">
      <div class="page-title">结算明细</div>
      <div class="page-subtitle">美团平台团购订单结算明细与对账 · 按 T+1 周期结算</div>
    </div>

    <div class="filter-bar">
      <select class="select"><option>2026-05</option><option>2026-04</option></select>
      <select class="select"><option>全部店铺</option><option>火车餐厅</option><option>树下咖啡</option><option>稻田手作坊</option></select>
      <select class="select"><option>全部状态</option><option>待结算</option><option>已结算</option></select>
      <button class="btn btn-primary btn-sm">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm">${antIcon('download')} 导出对账单</button>
    </div>

    <div class="stat-grid c4">
      ${statCard('本月结算总额', 2548.00, {icon:'¥', color:'#1677ff'})}
      ${statCard('平台佣金', 254.80, {icon:'¥', color:'#fa8c16', extra:'费率 10%'})}
      ${statCard('净收入', 2293.20, {icon:'¥', color:'#52c41a'})}
      ${statCard('待结算', 1718.87, {icon:'⏳', color:'#faad14', extra:'3 笔'})}
    </div>

    <div class="card">
      <table class="ant-table">
        <thead><tr>
          <th>结算单号</th><th>店铺</th><th>结算日期</th><th style="text-align:right">订单数</th>
          <th style="text-align:right">总额</th><th style="text-align:right">佣金 (10%)</th><th style="text-align:right">净额</th>
          <th>结算周期</th><th>状态</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          ${shopData(MEITUAN_SETTLEMENTS).map(s => `
            <tr>
              <td class="col-mono">${s.id}</td>
              <td><b>${s.shop}</b></td>
              <td>${s.settleDate}</td>
              <td style="text-align:right">${s.orderCount}</td>
              <td style="text-align:right;font-weight:600" class="money">¥${s.totalAmount.toFixed(2)}</td>
              <td style="text-align:right;color:var(--ant-error)" class="money">-¥${s.commission.toFixed(2)}</td>
              <td style="text-align:right;font-weight:600;color:var(--ant-success)" class="money">¥${s.netAmount.toFixed(2)}</td>
              <td>${s.period}</td>
              <td><span class="tag ${s.status==='已结算'?'success':'warning'}">${s.status}</span></td>
              <td class="col-actions">
                <button class="btn-link">查看明细</button>
                <span class="divider">|</span>
                <button class="btn-link">下载</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">本月结算趋势</div></div>
      <div class="card-body">
        <div class="chart-bars">
          ${[120,185,220,158,198,280,310,268,340,290,380,420,450,386].map((v,i) => {
            const max = 500;
            return `<div class="bar-col"><span class="bar-val">${v}</span><div class="bar" style="height:${(v/max)*180}px;background:linear-gradient(180deg,#13c2c2,#08979c)"></div><span class="bar-label">5/${i+1}</span></div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderMeituanConfig() {
  return `
    <div class="page-header">
      <div class="page-title">美团 API 配置</div>
      <div class="page-subtitle">美团技术服务合作中心 · appId / appSecret / 门店 appAuthToken 管理</div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><div class="card-title">平台级配置 (开发者账号)</div></div>
      <div class="card-body" style="max-width:680px">
        <div class="form-item">
          <label class="form-label required">美团 App ID</label>
          <input class="input" value="MT-2026-YFDC-xxxx">
          <div class="form-help">美团技术服务合作中心获取的开发者应用 ID</div>
        </div>
        <div class="form-item">
          <label class="form-label required">美团 App Secret</label>
          <div style="display:flex;gap:8px">
            <input class="input" value="••••••••••••••••••••••••••••••••" type="password" style="flex:1">
            <button class="btn">查看</button>
            <button class="btn">重新生成</button>
          </div>
          <div class="form-help">用于请求签名，请妥善保管</div>
        </div>
        <div class="form-item">
          <label class="form-label">回调地址 (Webhook)</label>
          <input class="input" value="https://api.yuanfu-rice.com/meituan/callback">
          <div class="form-help">美团平台推送验券结果通知的回调地址</div>
        </div>
        <div style="border-top:1px solid var(--ant-border-secondary);padding-top:20px;display:flex;justify-content:flex-end;gap:10px">
          <button class="btn">重置</button>
          <button class="btn btn-primary" onclick="showToast('美团 API 配置已保存')">保存</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div class="card-title">门店授权 Token 管理</div>
        <button class="btn btn-primary btn-sm" onclick="showToast('请使用商户端小程序扫码完成门店映射绑定')">+ 添加门店授权</button>
      </div>
      <table class="ant-table">
        <thead><tr>
          <th>店铺</th><th>appAuthToken</th><th>状态</th><th>绑定时间</th><th>最后同步</th><th style="text-align:right">累计核销</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          ${shopData(MEITUAN_STORE_CONFIGS).map(s => `
            <tr>
              <td><b>${s.shop}</b></td>
              <td class="col-mono">${s.appAuthToken || '<span style="color:var(--ant-text-disabled)">— 未获取 —</span>'}</td>
              <td><span class="tag ${s.status==='已绑定'?'success':'warning'}">${s.status}</span></td>
              <td>${s.bindAt}</td>
              <td>${s.lastSync}</td>
              <td style="text-align:right">${s.verifyCount || '-'}</td>
              <td class="col-actions">
                ${s.status==='已绑定' ? `
                  <button class="btn-link">刷新 Token</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" onclick="showToast('已解绑门店映射')">解绑</button>
                ` : `
                  <button class="btn-link" onclick="showToast('请使用商户端小程序扫码完成门店映射绑定')">生成绑定二维码</button>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head"><div class="card-title">API 接口清单</div></div>
      <table class="ant-table">
        <thead><tr><th>所属模块</th><th>接口名称</th><th>接口类型</th><th>是否必接</th><th>接口描述</th><th class="col-actions">文档</th></tr></thead>
        <tbody>
          <tr><td>门店映射</td><td><b>门店映射 UI SDK 接入</b></td><td><span class="tag processing">UI SDK</span></td><td><span class="tag error">必接</span></td><td>商家扫码完成门店与美团平台的绑定，获取 appAuthToken</td><td><button class="btn-link">查看文档</button></td></tr>
          <tr><td>套餐映射</td><td><b>门店套餐映射</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>查询并配置美团团购套餐与收银系统菜品的映射关系</td><td><button class="btn-link">查看文档</button></td></tr>
          <tr><td>团购验券</td><td><b>验券准备</b></td><td><span class="tag cyan">API</span></td><td><span class="tag error">必接</span></td><td>验券前预检查，查询券码对应套餐信息及可核销状态</td><td><button class="btn-link">查看文档</button></td></tr>
          <tr><td>团购验券</td><td><b>执行验券</b></td><td><span class="tag cyan">API</span></td><td><span class="tag error">必接</span></td><td>正式完成券码核销操作</td><td><button class="btn-link">查看文档</button></td></tr>
          <tr><td>团购验券</td><td><b>撤销验券</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>在规定时间内撤销已完成的核销操作</td><td><button class="btn-link">查看文档</button></td></tr>
          <tr><td>团购验券</td><td><b>已验券码查询</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>查询指定券码的核销状态与历史记录</td><td><button class="btn-link">查看文档</button></td></tr>
          <tr><td>团购对账</td><td><b>查询团购订单结算明细</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>查询指定时间范围内的团购订单结算明细，用于对账</td><td><button class="btn-link">查看文档</button></td></tr>
          <tr><td>团购对账</td><td><b>门店验券历史</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>查询门店指定日期的验券历史记录</td><td><button class="btn-link">查看文档</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function openMeituanRevoke(id) {
  const r = shopData(MEITUAN_VERIFY_RECORDS).find(x => x.id === id);
  if (!r) return;
  showModal({
    title: '撤销验券确认',
    body: `
      <div style="padding:10px 0">
        <div style="background:var(--ant-warning-bg);border:1px solid var(--ant-warning-border);border-radius:8px;padding:14px;margin-bottom:18px">
          <div style="font-size:14px;font-weight:500;color:#d48806">⚠️ 撤销验券操作不可逆</div>
          <div style="font-size:12px;color:#d48806;margin-top:4px">撤销后用户将恢复券码可用状态，可在有效期内重新核销</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px">
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">核销单号</div><div class="col-mono">${r.id}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">美团券码</div><div class="col-mono">${r.couponCode}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">团购商品</div><div><b>${r.product}</b></div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">核销金额</div><div style="font-size:22px;font-weight:600;color:var(--ant-error)" class="money">¥${r.salePrice.toFixed(2)}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">店铺</div><div>${r.shop}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">核销时间</div><div>${r.verifyAt}</div></div>
        </div>
        <div class="form-item" style="margin-top:18px">
          <label class="form-label">撤销原因</label>
          <textarea class="textarea" rows="2" placeholder="请输入撤销原因（必填）"></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn" onclick="closeModal()">取消</button>
      <button class="btn btn-danger solid" onclick="closeModal();showToast('验券已撤销 · 券码 ${r.couponCode} 已恢复可用')">确认撤销</button>
    `
  });
}

// ============ 抖音核销管理 ============
function renderDouyinDashboard() {
  const todayVerify = shopData(DOUYIN_VERIFY_RECORDS).filter(r => r.verifyAt.includes('2026-05-14')).length;
  const totalAmount = shopData(DOUYIN_VERIFY_RECORDS).reduce((s, r) => s + r.salePrice, 0);
  const partialCount = shopData(DOUYIN_VERIFY_RECORDS).filter(r => r.status === '部分核销').length;
  const revokeCount = shopData(DOUYIN_VERIFY_RECORDS).filter(r => r.status === '已撤销').length;

  return `
    <div class="page-header">
      <div class="page-title">♫ 抖音核销仪表盘</div>
      <div class="page-subtitle">抖音生活服务 · 团购套餐/次卡/代金券/组合券包核销数据概览</div>
    </div>

    <div class="stat-grid c4">
      ${statCard('接入门店', '2/3', {unit:'家', icon:'▢', color:'#52c41a', extra:'1 家待绑定'})}
      ${statCard('今日核销', todayVerify, {unit:'笔', icon:'✓', color:'#010101', extra:'团购+代金券+次卡'})}
      ${statCard('累计核销金额', totalAmount.toFixed(2), {icon:'¥', color:'#ff4d4f', extra:'累计 ' + shopData(DOUYIN_VERIFY_RECORDS).length + ' 笔'})}
      ${statCard('部分核销/撤销', partialCount + revokeCount, {unit:'笔', icon:'⤺', color:'#faad14', extra:'次卡 ' + partialCount + ' · 撤销 ' + revokeCount})}
    </div>

    <div class="stat-grid c4">
      ${statCard('门店映射', '2/3', {unit:'家', icon:'⌷', color:'#010101', extra:'已绑定 2 · UISDK 接入'})}
      ${statCard('商品管理', '8', {unit:'个', icon:'◈', color:'#ff4d4f', extra:'抖音团购商品已同步'})}
      ${statCard('套餐映射', '5', {unit:'组', icon:'⇄', color:'#722ed1', extra:'抖音商品↔收银菜品'})}
      ${statCard('待结算金额', '2498.21', {icon:'¥', color:'#fa8c16', extra:'5 笔待结算 · 费率 5%'})}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card">
        <div class="card-head"><div class="card-title">近 7 天核销趋势</div></div>
        <div class="card-body">
          <div class="chart-bars">
            ${[8,6,10,7,9,12,todayVerify].map((v,i) => {
              const max = 15;
              const days = ['5/8','5/9','5/10','5/11','5/12','5/13','5/14'];
              return `<div class="bar-col"><span class="bar-val">${v}</span><div class="bar" style="height:${(v/max)*180}px;background:linear-gradient(180deg,#010101,#333)"></div><span class="bar-label">${days[i]}</span></div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">门店对接状态</div></div>
        <div class="card-body">
          ${shopData(DOUYIN_STORE_CONFIGS).map(s => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--ant-border-secondary)">
              <div style="width:40px;height:40px;border-radius:8px;background:${s.status==='已绑定'?'linear-gradient(135deg,#010101,#333)':'linear-gradient(135deg,#d9d9d9,#bfbfbf)'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600">${s.shop[0]}</div>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:500">${s.shop}</div>
                <div style="font-size:12px;color:var(--ant-text-3);margin-top:2px">${s.status==='已绑定'?`授权范围: ${s.scope} · 累计核销 ${s.verifyCount} 笔`:'需扫码完成门店授权绑定'}</div>
              </div>
              <span class="tag ${s.status==='已绑定'?'success':'warning'}">${s.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">抖音团购核销流程</div></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          ${[
            {step:'第一步',title:'授权与门店映射',desc:'完成抖音开放平台开发者入驻，接入门店映射 UI SDK，扫码完成门店绑定',color:'#010101',bg:'#f5f5f5'},
            {step:'第二步',title:'商品与套餐映射',desc:'同步抖音团购商品，建立套餐/次卡/代金券与收银系统商品映射关系',color:'#ff4d4f',bg:'#fff2f0'},
            {step:'第三步',title:'团购核销',desc:'商家扫码宣券 → 确定验证张数 → 发起验券 → 核销完成自动下单制作',color:'#52c41a',bg:'#f6ffed'},
            {step:'第四步',title:'撤销与对账',desc:'支持错验/多验撤销，T+1 结算对账，查询团购订单结算明细',color:'#fa8c16',bg:'#fff7e6'},
          ].map(s => `
            <div style="border:1px solid var(--ant-border-secondary);border-radius:8px;padding:16px;background:${s.bg}">
              <div style="font-size:11px;color:${s.color};font-weight:600;margin-bottom:6px">${s.step}</div>
              <div style="font-size:14px;font-weight:600;margin-bottom:6px;color:${s.color}">${s.title}</div>
              <div style="font-size:12px;color:var(--ant-text-2);line-height:1.6">${s.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head"><div class="card-title">券类型分布</div></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
          ${[
            {type:'团购套餐', count:3, pct:'50%', color:'#ff4d4f', desc:'套餐/双人餐等固定组合'},
            {type:'代金券', count:1, pct:'17%', color:'#fa8c16', desc:'满减抵扣 · 适用全部商品'},
            {type:'次卡', count:1, pct:'17%', color:'#1677ff', desc:'多次核销 · 剩余次数管理'},
            {type:'组合券包', count:1, pct:'17%', color:'#722ed1', desc:'多券组合 · 分次核销'},
          ].map(t => `
            <div style="text-align:center;padding:16px;border:1px solid var(--ant-border-secondary);border-radius:8px">
              <div style="width:48px;height:48px;border-radius:50%;background:${t.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 10px;opacity:0.85">${t.count}</div>
              <div style="font-size:14px;font-weight:600;color:var(--ant-text-1)">${t.type}</div>
              <div style="font-size:11px;color:var(--ant-text-3);margin-top:4px">${t.desc}</div>
              <div style="font-size:12px;color:${t.color};font-weight:600;margin-top:6px">${t.pct}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderDouyinRecords() {
  return `
    <div class="page-header">
      <div class="page-title">抖音验券记录</div>
      <div class="page-subtitle">团购套餐 · 次卡 · 代金券 · 组合券包 · 核销记录与撤销管理</div>
    </div>

    <div class="filter-bar">
      <input class="input" placeholder="券码 / 核销单号" style="width:200px">
      <select class="select"><option>全部类型</option><option>团购套餐</option><option>代金券</option><option>次卡</option><option>组合券包</option></select>
      <select class="select"><option>全部状态</option><option>已核销</option><option>部分核销</option><option>已撤销</option></select>
      <select class="select"><option>全部店铺</option><option>火车餐厅</option><option>树下咖啡</option><option>稻田手作坊</option></select>
      <input class="input" placeholder="开始日期" style="width:140px">
      <span>~</span>
      <input class="input" placeholder="结束日期" style="width:140px">
      <button class="btn btn-primary btn-sm" onclick="showToast('查询完成 · 共 ' + shopData(DOUYIN_VERIFY_RECORDS).length + ' 条记录')">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" onclick="showToast('导出中...')">${antIcon('download')} 导出</button>
      <button class="btn btn-primary" onclick="showToast('抖音券码查询：请输入券码')">${antIcon('search')} 券码查询</button>
    </div>

    <div class="stat-grid c4">
      ${statCard('今日核销', 4, {unit:'笔', icon:'✓', color:'#52c41a'})}
      ${statCard('核销金额', 464.80, {icon:'¥', color:'#010101'})}
      ${statCard('次卡剩余', '6', {unit:'次', icon:'◈', color:'#1677ff', extra:'1 张次卡进行中'})}
      ${statCard('可撤销 (24h内)', 3, {unit:'笔', icon:'⏳', color:'#faad14'})}
    </div>

    <div class="card">
      <table class="ant-table">
        <thead><tr>
          <th>核销单号</th><th>券码</th><th>券类型</th><th>团购商品</th><th style="text-align:right">原价</th><th style="text-align:right">售价</th>
          <th>用户</th><th>店铺</th><th style="text-align:center">核销进度</th><th>状态</th><th>核销人</th><th>核销时间</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          ${shopData(DOUYIN_VERIFY_RECORDS).map(r => `
            <tr>
              <td class="col-mono">${r.id}</td>
              <td class="col-mono">${r.couponCode}</td>
              <td><span class="tag ${r.couponType==='团购套餐'?'error':r.couponType==='代金券'?'warning':r.couponType==='次卡'?'processing':'purple'}">${r.couponType}</span></td>
              <td><b>${r.product}</b></td>
              <td style="text-align:right;text-decoration:line-through;color:var(--ant-text-3)" class="money">¥${r.originPrice.toFixed(2)}</td>
              <td style="text-align:right;font-weight:600;color:var(--ant-error)" class="money">¥${r.salePrice.toFixed(2)}</td>
              <td>${r.user}<br><span style="font-size:12px;color:var(--ant-text-3)">${r.phone}</span></td>
              <td>${r.shop}</td>
              <td style="text-align:center">${r.couponType==='次卡' || r.couponType==='组合券包' ? `<span style="font-weight:600">${r.verifyCount}/${r.maxCount}</span> 次` : `${r.verifyCount}/${r.maxCount}`}</td>
              <td><span class="tag ${r.status==='已核销'?'success':r.status==='部分核销'?'processing':'error'}">${r.status}</span></td>
              <td>${r.verifyBy}</td>
              <td>${r.verifyAt}</td>
              <td class="col-actions">
                ${r.status==='已核销' && r.refundable ? `
                  <button class="btn-link" onclick="openDouyinRevoke('${r.id}')">撤销验券</button>
                ` : r.status==='部分核销' ? `<button class="btn-link" onclick="showToast('次卡剩余 ${r.maxCount - r.verifyCount} 次可核销')">继续核销</button>` : ''}
                ${r.status==='已撤销' ? `<span class="tag default">已撤销</span>` : ''}
                <span class="divider">|</span>
                <button class="btn-link" onclick="showToast('券码 ${r.couponCode} 详情')">详情</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination">
        <span>共 ${shopData(DOUYIN_VERIFY_RECORDS).length} 条</span>
        <button class="page-btn active">1</button>
      </div>
    </div>
  `;
}

function renderDouyinSettlement() {
  return `
    <div class="page-header">
      <div class="page-title">抖音结算明细</div>
      <div class="page-subtitle">抖音生活服务平台 · T+1 结算周期 · 平台服务费率 5%</div>
    </div>

    <div class="filter-bar">
      <select class="select"><option>2026-05</option><option>2026-04</option></select>
      <select class="select"><option>全部店铺</option><option>火车餐厅</option><option>树下咖啡</option><option>稻田手作坊</option></select>
      <select class="select"><option>全部状态</option><option>待结算</option><option>已结算</option></select>
      <button class="btn btn-primary btn-sm" onclick="showToast('查询完成')">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" onclick="showToast('导出对账单中...')">${antIcon('download')} 导出对账单</button>
    </div>

    <div class="stat-grid c4">
      ${statCard('本月结算总额', 3820.50, {icon:'¥', color:'#010101'})}
      ${statCard('平台服务费', 191.03, {icon:'¥', color:'#ff4d4f', extra:'费率 5%'})}
      ${statCard('净收入', 3629.47, {icon:'¥', color:'#52c41a'})}
      ${statCard('待结算', 2498.21, {icon:'⏳', color:'#faad14', extra:'3 笔'})}
    </div>

    <div class="card">
      <table class="ant-table">
        <thead><tr>
          <th>结算单号</th><th>店铺</th><th>结算日期</th><th style="text-align:right">订单数</th>
          <th style="text-align:right">总额</th><th style="text-align:right">服务费 (5%)</th><th style="text-align:right">净额</th>
          <th>结算周期</th><th>状态</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          ${shopData(DOUYIN_SETTLEMENTS).map(s => `
            <tr>
              <td class="col-mono">${s.id}</td>
              <td><b>${s.shop}</b></td>
              <td>${s.settleDate}</td>
              <td style="text-align:right">${s.orderCount}</td>
              <td style="text-align:right;font-weight:600" class="money">¥${s.totalAmount.toFixed(2)}</td>
              <td style="text-align:right;color:var(--ant-error)" class="money">-¥${s.commission.toFixed(2)}</td>
              <td style="text-align:right;font-weight:600;color:var(--ant-success)" class="money">¥${s.netAmount.toFixed(2)}</td>
              <td>${s.period}</td>
              <td><span class="tag ${s.status==='已结算'?'success':'warning'}">${s.status}</span></td>
              <td class="col-actions">
                <button class="btn-link" onclick="showToast('查看结算明细')">查看明细</button>
                <span class="divider">|</span>
                <button class="btn-link" onclick="showToast('下载结算单')">下载</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head"><div class="card-title">本月结算趋势</div></div>
      <div class="card-body">
        <div class="chart-bars">
          ${[180,260,320,240,290,380,450,390,480,420,550,620,680,520].map((v,i) => {
            const max = 700;
            return `<div class="bar-col"><span class="bar-val">${v}</span><div class="bar" style="height:${(v/max)*180}px;background:linear-gradient(180deg,#010101,#333)"></div><span class="bar-label">5/${i+1}</span></div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderDouyinConfig() {
  return `
    <div class="page-header">
      <div class="page-title">抖音 API 配置</div>
      <div class="page-subtitle">抖音开放平台 · 生活服务 · 开发者入驻与门店映射 · 商品同步</div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><div class="card-title">平台级配置 (开发者入驻)</div></div>
      <div class="card-body" style="max-width:680px">
        <div class="form-item">
          <label class="form-label required">抖音 Client Key (App ID)</label>
          <input class="input" value="dy7c2a3b4e5d6f7890">
          <div class="form-help">抖音开放平台 · 生活服务号获取的 Client Key</div>
        </div>
        <div class="form-item">
          <label class="form-label required">抖音 Client Secret</label>
          <div style="display:flex;gap:8px">
            <input class="input" value="••••••••••••••••••••••••••••••••" type="password" style="flex:1">
            <button class="btn" onclick="showToast('已复制')">查看</button>
            <button class="btn" onclick="showToast('Secret 已重新生成')">重新生成</button>
          </div>
          <div class="form-help">用于 Access Token 获取与请求签名</div>
        </div>
        <div class="form-item">
          <label class="form-label required">回调地址 (Webhook)</label>
          <input class="input" value="https://api.yuanfu-rice.com/douyin/callback">
          <div class="form-help">抖音平台推送验券结果、商品审核结果的通知地址</div>
        </div>
        <div style="border-top:1px solid var(--ant-border-secondary);padding-top:20px;display:flex;justify-content:flex-end;gap:10px">
          <button class="btn" onclick="showToast('已重置')">重置</button>
          <button class="btn btn-primary" onclick="showToast('抖音 API 配置已保存')">保存</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-head">
        <div class="card-title">门店授权管理</div>
        <button class="btn btn-primary btn-sm" onclick="showToast('请使用商户端小程序扫码完成门店映射绑定')">+ 添加门店授权</button>
      </div>
      <table class="ant-table">
        <thead><tr>
          <th>店铺</th><th>appAuthToken</th><th>授权范围</th><th>状态</th><th>绑定时间</th><th>最后同步</th><th style="text-align:right">累计核销</th><th class="col-actions">操作</th>
        </tr></thead>
        <tbody>
          ${shopData(DOUYIN_STORE_CONFIGS).map(s => `
            <tr>
              <td><b>${s.shop}</b></td>
              <td class="col-mono">${s.appAuthToken || '<span style="color:var(--ant-text-disabled)">— 未获取 —</span>'}</td>
              <td>${s.scope}</td>
              <td><span class="tag ${s.status==='已绑定'?'success':'warning'}">${s.status}</span></td>
              <td>${s.bindAt}</td>
              <td>${s.lastSync}</td>
              <td style="text-align:right">${s.verifyCount || '-'}</td>
              <td class="col-actions">
                ${s.status==='已绑定' ? `
                  <button class="btn-link" onclick="showToast('Token 已刷新')">刷新 Token</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" onclick="showToast('已解绑门店映射')">解绑</button>
                ` : `
                  <button class="btn-link" onclick="showToast('请使用商户端小程序扫码完成门店映射绑定')">生成绑定二维码</button>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">抖音 API 接口清单</div></div>
      <table class="ant-table">
        <thead><tr><th>业务场景</th><th>接口名称</th><th>接口类型</th><th>必接</th><th>说明</th><th class="col-actions">文档</th></tr></thead>
        <tbody>
          <tr><td>商服授权</td><td><b>能力授权 & 门店绑定 UI SDK</b></td><td><span class="tag processing">UI SDK</span></td><td><span class="tag default">可选</span></td><td>简化商家和技术服务商授权操作</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>门店映射</td><td><b>门店映射 UI SDK 接入</b></td><td><span class="tag processing">UI SDK</span></td><td><span class="tag error">必接</span></td><td>单店/弱管控连锁门店，将收银门店映射抖音门店</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>门店映射</td><td><b>查询门店信息 / 提交匹配任务</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>批量将收银门店映射抖音门店（总部/品牌视角）</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>商品管理</td><td><b>创建/更新商品接口</b></td><td><span class="tag cyan">API</span></td><td><span class="tag error">必接</span></td><td>创建/查询抖音团购商品</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>商品管理</td><td><b>查询商品线上数据 / 审核结果同步</b></td><td><span class="tag cyan">API</span></td><td><span class="tag error">必接</span></td><td>商品查询 · 审核状态同步</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>商品管理</td><td><b>免审修改商品 / 同步库存 / 上下架</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>删改查抖音团购商品 · 库存同步</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>套餐映射</td><td><b>查询商品线上数据列表</b></td><td><span class="tag cyan">API</span></td><td><span class="tag error">必接</span></td><td>建立抖音商品与收银系统商品映射关系</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>团购核销</td><td><b>验券准备 (宣券)</b></td><td><span class="tag cyan">API</span></td><td><span class="tag error">必接</span></td><td>商家扫码宣券，查询券码可验状态、券类型、可验张数</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>团购核销</td><td><b>执行验券</b></td><td><span class="tag cyan">API</span></td><td><span class="tag error">必接</span></td><td>确定核销张数，正式完成验券操作</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>团购核销</td><td><b>撤销验券</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>商家多验/错验时发起撤销</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
          <tr><td>团购对账</td><td><b>查询团购订单结算明细</b></td><td><span class="tag cyan">API</span></td><td><span class="tag default">可选</span></td><td>查询指定时间范围内的团购订单结算明细</td><td><button class="btn-link" onclick="showToast('打开文档')">查看文档</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function openDouyinRevoke(id) {
  const r = shopData(DOUYIN_VERIFY_RECORDS).find(x => x.id === id);
  if (!r) return;
  showModal({
    title: '撤销验券确认 · 抖音',
    body: `
      <div style="padding:10px 0">
        <div style="background:var(--ant-warning-bg);border:1px solid var(--ant-warning-border);border-radius:8px;padding:14px;margin-bottom:18px">
          <div style="font-size:14px;font-weight:500;color:#d48806">⚠️ 撤销后用户券码将恢复可用状态</div>
          <div style="font-size:12px;color:#d48806;margin-top:4px">撤销操作不可逆，请确认后提交</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px">
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">核销单号</div><div class="col-mono">${r.id}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">抖音券码</div><div class="col-mono">${r.couponCode}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">券类型</div><div><b>${r.couponType}</b></div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">团购商品</div><div><b>${r.product}</b></div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">核销金额</div><div style="font-size:22px;font-weight:600;color:var(--ant-error)" class="money">¥${r.salePrice.toFixed(2)}</div></div>
          <div><div style="color:var(--ant-text-3);margin-bottom:4px">店铺 / 核销人</div><div>${r.shop} · ${r.verifyBy}</div></div>
        </div>
        <div class="form-item" style="margin-top:18px">
          <label class="form-label">撤销原因</label>
          <textarea class="textarea" rows="2" placeholder="请输入撤销原因（必填）"></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn" onclick="closeModal()">取消</button>
      <button class="btn btn-danger solid" onclick="closeModal();showToast('抖音验券已撤销 · 券码 ${r.couponCode} 已恢复可用')">确认撤销</button>
    `
  });
}

// 权限矩阵 Modal (按角色配置)
function openPermMatrix(roleCode) {
  const role = ROLES[roleCode];
  const modules = [
    {key:'overview',name:'园区总览/数据看板'},
    {key:'parks',name:'园区管理'},
    {key:'shops',name:'店铺管理'},
    {key:'users',name:'用户管理'},
    {key:'orders',name:'订单/核销/退款'},
    {key:'stats',name:'销售/客流统计'},
    {key:'finance',name:'财务/提现/对账'},
    {key:'employees',name:'员工/岗位管理'},
    {key:'gates',name:'闸机/人脸/进出'},
    {key:'activities',name:'活动管理/推送'},
    {key:'permissions',name:'角色权限'},
    {key:'migration',name:'数据迁移'},
    {key:'system',name:'系统配置/日志'},
  ];
  const isAdmin = roleCode==='ADMIN_PLATFORM';
  showModal({
    title: `权限配置 · ${role.name}`,
    body: `
      <div style="font-size:13px;color:var(--ant-text-3);margin-bottom:14px">为该角色勾选可访问的功能模块及操作粒度</div>
      <table class="perm-matrix">
        <thead><tr><th class="module">功能模块</th><th>可见</th><th>新增</th><th>修改</th><th>删除</th><th>导出</th></tr></thead>
        <tbody>
          ${modules.map(m => `
            <tr>
              <td class="module">${m.name}</td>
              ${[1,2,3,4,5].map(i => `<td><input type="checkbox" ${isAdmin?'checked':(i===1?'checked':'')}></td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `,
    footer: `
      <button class="btn" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="closeModal();showToast('权限已保存')">保存</button>
    `,
    wide: true
  });
}
