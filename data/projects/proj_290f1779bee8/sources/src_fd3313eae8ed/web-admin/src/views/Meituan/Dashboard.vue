<template>
  <div class="page-header">
    <div class="page-title">☷ 美团核销仪表盘</div>
    <div class="page-subtitle">美团/大众点评团购券核销数据概览 · 对接状态与实时核销监控</div>
  </div>

  <div class="stat-grid c4">
    <div class="stat-card">
      <div class="stat-label">接入门店</div>
      <div class="stat-value">2/3<span class="unit">家</span></div>
      <div class="stat-icon" style="background:#f6ffed;color:#52c41a">▢</div>
      <div class="stat-extra">1 家待绑定</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">今日核销</div>
      <div class="stat-value">{{ d.todayVerify || 0 }}<span class="unit">笔</span></div>
      <div class="stat-icon" style="background:#e6f4ff;color:#1677ff">✓</div>
      <div class="stat-extra"><span style="color:var(--ant-success)">▲ +3</span> 较昨日</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">累计核销金额</div>
      <div class="stat-value">¥{{ d.totalAmount || '0.00' }}</div>
      <div class="stat-icon" style="background:#fff7e6;color:#fa8c16">¥</div>
      <div class="stat-extra">美团平台券</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">撤销/退款</div>
      <div class="stat-value">{{ d.revokeCount || 0 }}<span class="unit">笔</span></div>
      <div class="stat-icon" style="background:#fff2f0;color:#ff4d4f">⤺</div>
      <div class="stat-extra">可发起撤销</div>
    </div>
  </div>

  <div class="stat-grid c4">
    <div class="stat-card">
      <div class="stat-label">门店映射</div>
      <div class="stat-value">2/3<span class="unit">家</span></div>
      <div class="stat-icon" style="background:#f9f0ff;color:#722ed1">⌷</div>
      <div class="stat-extra">已绑定 2</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">套餐映射</div>
      <div class="stat-value">3<span class="unit">个</span></div>
      <div class="stat-icon" style="background:#e6fffb;color:#13c2c2">◈</div>
      <div class="stat-extra">已关联收银系统</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">API 调用 (今日)</div>
      <div class="stat-value">47<span class="unit">次</span></div>
      <div class="stat-icon" style="background:#e6f4ff;color:#1677ff">⇄</div>
      <div class="stat-extra">成功率 100%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">待结算金额</div>
      <div class="stat-value">¥{{ d.pendingAmount || '0.00' }}</div>
      <div class="stat-icon" style="background:#fff7e6;color:#fa8c16">¥</div>
      <div class="stat-extra">待结算</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <div class="card">
      <div class="card-head"><div class="card-title">近 7 天核销趋势</div></div>
      <div class="card-body">
        <div class="chart-bars">
          <div v-for="(v, i) in trendData" :key="i" class="bar-col">
            <span class="bar-val">{{ v.val }}</span>
            <div class="bar" :style="{ height: (v.val / 10 * 180) + 'px', background: 'linear-gradient(180deg,#fa8c16,#d46b08)' }"></div>
            <span class="bar-label">{{ v.day }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">门店对接状态</div></div>
      <div class="card-body">
        <div v-for="s in storeStatus" :key="s.shop" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--ant-border-secondary)">
          <div :style="{
            width:'40px',height:'40px',borderRadius:'8px',
            background: s.status === '已绑定' ? 'linear-gradient(135deg,#52c41a,#389e0d)' : 'linear-gradient(135deg,#d9d9d9,#bfbfbf)',
            color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:600
          }">{{ s.shop[0] }}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:500">{{ s.shop }}</div>
            <div style="font-size:12px;color:var(--ant-text-3);margin-top:2px">{{ s.status === '已绑定' ? `已同步 · 累计核销 ${s.verifyCount} 笔` : '需扫码完成门店绑定' }}</div>
          </div>
          <span :class="['tag', s.status === '已绑定' ? 'success' : 'warning']">{{ s.status }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head"><div class="card-title">对接流程 · 四步接入</div></div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        <div v-for="s in steps" :key="s.title" :style="{ border:'1px solid var(--ant-border-secondary)', borderRadius:'8px', padding:'16px', background: s.bg }">
          <div :style="{ fontSize:'11px', color: s.color, fontWeight:600, marginBottom:'6px' }">{{ s.step }}</div>
          <div :style="{ fontSize:'14px', fontWeight:600, marginBottom:'6px', color: s.color }">{{ s.title }}</div>
          <div style="font-size:12px;color:var(--ant-text-2);line-height:1.6">{{ s.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const d = ref<any>({})
const trendData = [
  { day: '5/8', val: 5 }, { day: '5/9', val: 3 }, { day: '5/10', val: 7 },
  { day: '5/11', val: 4 }, { day: '5/12', val: 6 }, { day: '5/13', val: 8 },
  { day: '5/14', val: 8 }
]
const storeStatus = ref<any[]>([])
const steps = [
  { step: '第一步', title: '入驻与授权', desc: '完成美团技术服务合作中心入驻，获取开发者账号 (appId / appSecret)', color: '#1677ff', bg: '#e6f4ff' },
  { step: '第二步', title: '门店映射', desc: '接入门店映射 UI SDK，商家扫码完成门店绑定，获取 appAuthToken', color: '#52c41a', bg: '#f6ffed' },
  { step: '第三步', title: '套餐映射', desc: '调用门店套餐映射接口，将美团团购套餐与收银系统菜品关联', color: '#fa8c16', bg: '#fff7e6' },
  { step: '第四步', title: '验券能力接入', desc: '接入验券准备/执行验券接口，完成团购券核销闭环', color: '#ff4d4f', bg: '#fff2f0' }
]

onMounted(async () => {
  try {
    const [dashRes, storeRes]: any[] = await Promise.all([
      request.get('/meituan/dashboard'),
      request.get('/meituan/stores'),
    ])
    if (dashRes.code === 0) d.value = dashRes.data || {}
    if (storeRes.code === 0) storeStatus.value = (storeRes.data || []).map((s: any) => ({
      shop: s.shop?.name || s.external_store_name || '--',
      status: s.auth_status === 1 ? '已绑定' : '待绑定',
      verifyCount: 0
    }))
  } catch { /* ignore */ }
})
</script>
