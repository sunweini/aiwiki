<template>
  <div class="page-header">
    <div class="page-title">园区总览</div>
    <div class="page-subtitle">欢迎回来，{{ userName }}。以下为全局经营概况。</div>
  </div>

  <div class="stat-grid c4">
    <div class="stat-card">
      <div class="stat-label">总园区数</div>
      <div class="stat-value">2</div>
      <div class="stat-icon" style="background: #e6f4ff; color: #1677ff">🏢</div>
      <div class="stat-extra">营业中 2 · 筹备中 0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">总商户数</div>
      <div class="stat-value">5</div>
      <div class="stat-icon" style="background: #f6ffed; color: #52c41a">🏪</div>
      <div class="stat-extra">餐饮 3 · 零售 1 · 体验 1</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">总用户数</div>
      <div class="stat-value">2,837</div>
      <div class="stat-icon" style="background: #f9f0ff; color: #722ed1">👤</div>
      <div class="stat-extra"><span style="color:var(--ant-success)">▲ +12</span> 今日新增</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">今日总销售额</div>
      <div class="stat-value">¥1,286.50</div>
      <div class="stat-icon" style="background: #fff7e6; color: #fa8c16">💰</div>
      <div class="stat-extra"><span style="color:var(--ant-success)">▲ 12.5%</span> 较昨日</div>
    </div>
  </div>

  <div class="stat-grid c4">
    <div class="stat-card">
      <div class="stat-label">今日订单数</div>
      <div class="stat-value">33</div>
      <div class="stat-icon" style="background: #e6fffb; color: #13c2c2">📄</div>
      <div class="stat-extra"><span style="color:var(--ant-success)">▲ 8%</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">今日客流量</div>
      <div class="stat-value">128</div>
      <div class="stat-icon" style="background: #fff0f6; color: #eb2f96">📈</div>
      <div class="stat-extra"><span style="color:var(--ant-success)">▲ 15%</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">储值余额池</div>
      <div class="stat-value">¥24,680.50</div>
      <div class="stat-icon" style="background: #e6f4ff; color: #1677ff">💰</div>
      <div class="stat-extra">累计在用户账户</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">待退款金额</div>
      <div class="stat-value">¥142.00</div>
      <div class="stat-icon" style="background: #fff2f0; color: #ff4d4f">⤺</div>
      <div class="stat-extra">3 笔待处理</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px">
    <div class="card">
      <div class="card-head">
        <div class="card-title">近 7 天销售趋势</div>
        <div class="card-extra">单位：元</div>
      </div>
      <div class="card-body">
        <div class="chart-bars">
          <div v-for="(v, i) in salesTrend" :key="i" class="bar-col">
            <span class="bar-val">{{ v.val }}</span>
            <div class="bar" :style="{ height: (v.val / 1500 * 180) + 'px', background: 'linear-gradient(180deg,#73d13d,#389e0d)' }"></div>
            <span class="bar-label">{{ v.day }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">园区销售额分布</div></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:16px;align-items:center">
        <div class="donut"></div>
        <div style="width:100%">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px">
            <span style="width:12px;height:12px;background:#1677ff;border-radius:2px"></span>
            <span style="flex:1">黄梅袁夫稻田</span><span style="font-weight:600">76.7%</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px">
            <span style="width:12px;height:12px;background:#c8963e;border-radius:2px"></span>
            <span style="flex:1">武汉袁夫稻田</span><span style="font-weight:600">23.3%</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:13px">
            <span style="width:12px;height:12px;background:#722ed1;border-radius:2px"></span>
            <span style="flex:1">即将上线 · 江夏二期</span><span style="font-weight:600">—</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <div class="card-title">园区经营概况</div>
      <button class="btn btn-sm" @click="$router.push('/parks')">查看全部 →</button>
    </div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div v-for="(p, i) in parks" :key="p.code" :style="{
          border: '1px solid var(--ant-border-secondary)',
          borderRadius: '8px',
          padding: '16px',
          background: i === 0 ? 'linear-gradient(135deg,#f6ffed,#fff)' : 'linear-gradient(135deg,#fff7e6,#fff)'
        }">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div :style="{
              width: '40px', height: '40px', borderRadius: '8px',
              background: i === 0 ? 'linear-gradient(135deg,#52c41a,#389e0d)' : 'linear-gradient(135deg,#fa8c16,#d46b08)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 600
            }">{{ p.name[0] }}</div>
            <div style="flex:1">
              <div style="font-weight:600;font-size:15px">{{ p.name }}</div>
              <div style="font-size:12px;color:var(--ant-text-3)">{{ p.address || '' }}</div>
            </div>
            <span class="tag success">营业中</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:12px">
            <div><div style="color:var(--ant-text-3)">商户</div><div style="font-weight:600;font-size:16px;margin-top:2px">{{ p.shop_count || '--' }}</div></div>
            <div><div style="color:var(--ant-text-3)">今日销售</div><div style="font-weight:600;font-size:16px;margin-top:2px;color:#fa541c">¥--</div></div>
            <div><div style="color:var(--ant-text-3)">本月销售</div><div style="font-weight:600;font-size:16px;margin-top:2px">¥--</div></div>
          </div>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn btn-sm">切换到此园区视角</button>
            <button class="btn btn-sm btn-primary">查看详情</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listParks } from '@/api/parks'

const userName = ref('张三')
const parks = ref<any[]>([])
const salesTrend = [
  { day: '5/8', val: 980 }, { day: '5/9', val: 1150 }, { day: '5/10', val: 1320 },
  { day: '5/11', val: 1080 }, { day: '5/12', val: 1450 }, { day: '5/13', val: 1120 },
  { day: '5/14', val: 1286 }
]

onMounted(async () => {
  try {
    const res: any = await listParks({ page: 1, page_size: 10 })
    if (res.code === 0) parks.value = res.data.items || []
  } catch { /* ignore */ }
})
</script>
