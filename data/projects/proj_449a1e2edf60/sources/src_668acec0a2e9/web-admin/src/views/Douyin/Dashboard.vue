<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">&#9835; 抖音核销仪表盘</div>
      <div class="page-subtitle">抖音生活服务 · 团购套餐/次卡/代金券/组合券包核销数据概览</div>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-label">接入门店</div>
        <div class="stat-value"><span class="unit">家</span>{{ dashboard?.bound_stores || 0 }}/{{ dashboard?.total_stores || 0 }}</div>
        <div class="stat-icon" style="background:#f6ffed;color:#52c41a">&#9633;</div>
        <div class="stat-extra"><span class="delta-up">{{ dashboard?.pending_bind || 0 }} 家待绑定</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今日核销</div>
        <div class="stat-value"><span class="unit">笔</span>{{ dashboard?.today_verify || 0 }}</div>
        <div class="stat-icon" style="background:#f5f5f5;color:#010101">&#10003;</div>
        <div class="stat-extra">团购+代金券+次卡</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">累计核销金额</div>
        <div class="stat-value" style="color:#ff4d4f">&#165;{{ dashboard?.total_amount?.toFixed(2) || '0.00' }}</div>
        <div class="stat-icon" style="background:#fff2f0;color:#ff4d4f">&#165;</div>
        <div class="stat-extra">累计 {{ dashboard?.total_verify || 0 }} 笔</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">部分核销/撤销</div>
        <div class="stat-value"><span class="unit">笔</span>{{ (dashboard?.partial_count || 0) + (dashboard?.revoke_count || 0) }}</div>
        <div class="stat-icon" style="background:#fffbe6;color:#faad14">&#10554;</div>
        <div class="stat-extra">次卡 {{ dashboard?.partial_count || 0 }} &#183; 撤销 {{ dashboard?.revoke_count || 0 }}</div>
      </div>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-label">门店映射</div>
        <div class="stat-value"><span class="unit">家</span>{{ dashboard?.bound_stores || 0 }}/{{ dashboard?.total_stores || 0 }}</div>
        <div class="stat-icon" style="background:#f5f5f5;color:#010101">&#8951;</div>
        <div class="stat-extra">已绑定 {{ dashboard?.bound_stores || 0 }} &#183; UISDK 接入</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">商品管理</div>
        <div class="stat-value"><span class="unit">个</span>{{ dashboard?.product_count || 0 }}</div>
        <div class="stat-icon" style="background:#fff2f0;color:#ff4d4f">&#9672;</div>
        <div class="stat-extra">抖音团购商品已同步</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">套餐映射</div>
        <div class="stat-value"><span class="unit">组</span>{{ dashboard?.mapping_count || 0 }}</div>
        <div class="stat-icon" style="background:#f9f0ff;color:#722ed1">&#8644;</div>
        <div class="stat-extra">抖音商品&#8596;收银菜品</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待结算金额</div>
        <div class="stat-value" style="color:#fa8c16">&#165;{{ dashboard?.pending_amount?.toFixed(2) || '0.00' }}</div>
        <div class="stat-icon" style="background:#fff7e6;color:#fa8c16">&#9203;</div>
        <div class="stat-extra">{{ dashboard?.pending_count || 0 }} 笔待结算 &#183; 费率 5%</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card">
        <div class="card-head"><div class="card-title">近 7 天核销趋势</div></div>
        <div class="card-body">
          <div class="chart-bars">
            <div class="bar-col" v-for="(item, i) in sevenDays" :key="i">
              <span class="bar-val">{{ item.value }}</span>
              <div class="bar" :style="{ height: (item.value / maxBar) * 180 + 'px', background: 'linear-gradient(180deg, #010101, #333)' }"></div>
              <span class="bar-label">{{ item.day }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">门店对接状态</div></div>
        <div class="card-body">
          <div v-for="store in storeList" :key="store.id" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--ant-border-secondary)">
            <div :style="{ width:'40px', height:'40px', borderRadius:'8px', background: store.auth_status === 1 ? 'linear-gradient(135deg, #010101, #333)' : 'linear-gradient(135deg, #d9d9d9, #bfbfbf)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'600' }">{{ store.shop_name?.[0] || '?' }}</div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:500">{{ store.shop_name }}</div>
              <div style="font-size:12px;color:var(--ant-text-3);margin-top:2px">{{ store.auth_status === 1 ? '累计核销 ' + (store.verify_count || 0) + ' 笔' : '需扫码完成门店授权绑定' }}</div>
            </div>
            <span :class="'tag ' + (store.auth_status === 1 ? 'success' : 'warning')">{{ store.auth_status === 1 ? '已绑定' : '未绑定' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">抖音团购核销流程</div></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          <div v-for="step in flowSteps" :key="step.step" :style="{ border:'1px solid var(--ant-border-secondary)', borderRadius:'8px', padding:'16px', background: step.bg }">
            <div :style="{ fontSize:'11px', color: step.color, fontWeight:'600', marginBottom:'6px' }">{{ step.step }}</div>
            <div :style="{ fontSize:'14px', fontWeight:'600', marginBottom:'6px', color: step.color }">{{ step.title }}</div>
            <div style="font-size:12px;color:var(--ant-text-2);line-height:1.6">{{ step.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head"><div class="card-title">券类型分布</div></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
          <div v-for="t in couponTypes" :key="t.type" style="text-align:center;padding:16px;border:1px solid var(--ant-border-secondary);border-radius:8px">
            <div :style="{ width:'48px', height:'48px', borderRadius:'50%', background: t.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', margin:'0 auto 10px', opacity:'0.85' }">{{ t.count }}</div>
            <div style="font-size:14px;font-weight:600;color:var(--ant-text-1)">{{ t.type }}</div>
            <div style="font-size:11px;color:var(--ant-text-3);margin-top:4px">{{ t.desc }}</div>
            <div :style="{ fontSize:'12px', color: t.color, fontWeight:'600', marginTop:'6px' }">{{ t.pct }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import request from '@/api/request'

const dashboard = ref<any>(null)
const storeList = ref<any[]>([])
const trendData = ref<any[]>([])

const flowSteps = [
  { step: '第一步', title: '授权与门店映射', desc: '完成抖音开放平台开发者入驻，接入门店映射 UI SDK，扫码完成门店绑定', color: '#010101', bg: '#f5f5f5' },
  { step: '第二步', title: '商品与套餐映射', desc: '同步抖音团购商品，建立套餐/次卡/代金券与收银系统商品映射关系', color: '#ff4d4f', bg: '#fff2f0' },
  { step: '第三步', title: '团购核销', desc: '商家扫码宣券 &#8594; 确定验证张数 &#8594; 发起验券 &#8594; 核销完成自动下单制作', color: '#52c41a', bg: '#f6ffed' },
  { step: '第四步', title: '撤销与对账', desc: '支持错验/多验撤销，T+1 结算对账，查询团购订单结算明细', color: '#fa8c16', bg: '#fff7e6' },
]

const couponTypes = [
  { type: '团购套餐', count: 3, pct: '50%', color: '#ff4d4f', desc: '套餐/双人餐等固定组合' },
  { type: '代金券', count: 1, pct: '17%', color: '#fa8c16', desc: '满减抵扣 &#183; 适用全部商品' },
  { type: '次卡', count: 1, pct: '17%', color: '#1677ff', desc: '多次核销 &#183; 剩余次数管理' },
  { type: '组合券包', count: 1, pct: '17%', color: '#722ed1', desc: '多券组合 &#183; 分次核销' },
]

const sevenDays = computed(() => {
  const days = trendData.value.length ? trendData.value : [
    { day: '5/8', value: 8 }, { day: '5/9', value: 6 }, { day: '5/10', value: 10 },
    { day: '5/11', value: 7 }, { day: '5/12', value: 9 }, { day: '5/13', value: 12 },
    { day: '5/14', value: dashboard.value?.today_verify || 4 },
  ]
  return days
})

const maxBar = 15

onMounted(async () => {
  try {
    const res: any = await request.get('/douyin/dashboard')
    if (res.code === 0) {
      dashboard.value = res.data
      if (res.data.trend) {
        trendData.value = res.data.trend.map((d: any) => ({ day: d.date, value: d.count }))
      }
      if (res.data.stores) {
        storeList.value = res.data.stores
      }
    }
  } catch { /* ignore */ }
})

onUnmounted(() => {})
</script>
