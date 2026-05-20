<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">系统设置</div>
      <div class="page-subtitle">平台配置、小程序管理、操作日志</div>
    </div>

    <div class="stat-grid c3">
      <div class="card" style="margin-bottom:0;cursor:pointer" @click="$router.push('/mp-config')">
        <div class="card-head">
          <div class="card-title">小程序配置</div>
        </div>
        <div class="card-body">
          <div style="font-size:13px;color:var(--ant-text-3);line-height:2">
            <div>客户端 &middot; 商城小程序</div>
            <div>商户端 &middot; 商户管理</div>
            <div>管理端 &middot; 园区管理</div>
          </div>
          <button class="btn btn-primary btn-sm" style="margin-top:12px">前往配置</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:0;cursor:pointer" @click="$router.push('/logs')">
        <div class="card-head">
          <div class="card-title">操作日志</div>
        </div>
        <div class="card-body">
          <div style="font-size:13px;color:var(--ant-text-3);line-height:2">
            <div>管理员操作记录</div>
            <div>按模块/操作人筛选</div>
            <div>操作明细 JSON 审计</div>
          </div>
          <button class="btn btn-sm" style="margin-top:12px">查看日志</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:0">
        <div class="card-head">
          <div class="card-title">系统信息</div>
        </div>
        <div class="card-body">
          <div style="font-size:13px;color:var(--ant-text-2);line-height:2.2">
            <div><b>平台</b>：袁夫稻田智慧园区 V2</div>
            <div><b>后端</b>：Go + Gin + GORM</div>
            <div><b>前端</b>：Vue 3 + 原生 CSS</div>
            <div><b>数据库</b>：MySQL 8.0 + Redis</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed - navigation handled via router-link
</script>
