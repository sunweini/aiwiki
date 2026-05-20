<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">园区账户</div>
      <div class="page-subtitle">{{ isPlatform ? '平台总部 · 全局资金分布 · 点击卡片查看明细' : '本园区资金总览 · 含线上/线下/团购收入' }}</div>
    </div>

    <!-- Row 1: 总收益 / 线上收入 / 线下收入 / 美团团购收入 -->
    <div class="stat-grid c4">
      <div class="stat-card" @click="openDetail('total')">
        <div class="stat-icon" style="background:#1677ff;color:#fff">&#165;</div>
        <div class="stat-label">{{ isPlatform ? '全平台总收益' : '园区总收益' }}</div>
        <div class="stat-value"><span class="unit">&#165;</span>{{ account.totalRevenue?.toFixed(2) || '0.00' }}</div>
        <div class="stat-extra"><span class="delta-up">&#8593; 12%</span> 较昨日</div>
      </div>
      <div class="stat-card" @click="openDetail('online')">
        <div class="stat-icon" style="background:#52c41a;color:#fff">&#9684;</div>
        <div class="stat-label">线上收入</div>
        <div class="stat-value"><span class="unit">&#165;</span>{{ account.onlineRevenue?.toFixed(2) || '0.00' }}</div>
        <div class="stat-extra">小程序/扫码支付</div>
      </div>
      <div class="stat-card" @click="openDetail('offline')">
        <div class="stat-icon" style="background:#fa8c16;color:#fff">&#128181;</div>
        <div class="stat-label">线下收入</div>
        <div class="stat-value"><span class="unit">&#165;</span>{{ account.offlineRevenue?.toFixed(2) || '0.00' }}</div>
        <div class="stat-extra">现金/POS/手动录入</div>
      </div>
      <div class="stat-card" @click="openDetail('meituan')">
        <div class="stat-icon" style="background:linear-gradient(135deg,#fa8c16,#d46b08);color:#fff">&#9783;</div>
        <div class="stat-label">美团团购收入</div>
        <div class="stat-value"><span class="unit">&#165;</span>{{ account.meituanRevenue?.toFixed(2) || '0.00' }}</div>
        <div class="stat-extra"><span class="delta-up">&#8593; 8%</span> 今日核销</div>
      </div>
    </div>

    <!-- Row 2: 抖音团购收入 / 账户余额 / 已提现 / 累计入账 -->
    <div class="stat-grid c4">
      <div class="stat-card" @click="openDetail('douyin')">
        <div class="stat-icon" style="background:linear-gradient(135deg,#010101,#333);color:#fff">&#9835;</div>
        <div class="stat-label">抖音团购收入</div>
        <div class="stat-value"><span class="unit">&#165;</span>{{ account.douyinRevenue?.toFixed(2) || '0.00' }}</div>
        <div class="stat-extra"><span class="delta-up">&#8593; 15%</span> 今日核销</div>
      </div>
      <div class="stat-card" @click="openDetail('balance')">
        <div class="stat-icon" style="background:#52c41a;color:#fff">&#36;</div>
        <div class="stat-label">账户余额</div>
        <div class="stat-value"><span class="unit">&#165;</span>{{ account.balance?.toFixed(2) || '0.00' }}</div>
        <div class="stat-extra">含冻结金额</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#722ed1;color:#fff">&#8607;</div>
        <div class="stat-label">已提现</div>
        <div class="stat-value"><span class="unit">&#165;</span>{{ account.withdrawn?.toFixed(2) || '0.00' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#1677ff;color:#fff">&#8721;</div>
        <div class="stat-label">累计入账</div>
        <div class="stat-value"><span class="unit">&#165;</span>{{ account.totalIn?.toFixed(2) || '0.00' }}</div>
      </div>
    </div>

    <!-- Platform View: 各园区收益分拆 -->
    <template v-if="isPlatform">
      <div class="card">
        <div class="card-head">
          <div class="card-title">各园区收益总览</div>
          <button class="btn btn-sm">导出全平台报表</button>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
          <div
            v-for="park in parkList"
            :key="park.key"
            :style="{
              border: '1px solid var(--ant-border-secondary)',
              borderRadius: '8px',
              padding: '16px',
              background: `linear-gradient(135deg, ${park.bgFrom}, #fff)`
            }"
          >
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              <div
                :style="{
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: park.iconBg, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '600', flexShrink: '0'
                }"
              >{{ park.name[0] }}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:15px">{{ park.name }}</div>
                <div style="font-size:12px;color:var(--ant-text-3)">{{ park.shops?.length || 0 }} 家商户</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:20px;font-weight:600;color:var(--ant-text-1)" class="money">&#165;{{ park.totalRevenue?.toFixed(2) || '0.00' }}</div>
                <div style="font-size:11px;color:var(--ant-text-3)">总收益</div>
              </div>
              <button class="btn btn-sm btn-primary" @click="switchToPark(park)">查看详情</button>
              <button class="btn btn-sm">导出</button>
            </div>

            <!-- Park mini stats -->
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
              <div style="text-align:center;padding:10px 6px;background:#fafafa;border-radius:6px">
                <div style="font-size:11px;color:var(--ant-text-3)">线上</div>
                <div style="font-size:16px;font-weight:600;color:var(--ant-text-1);margin-top:2px" class="money">&#165;{{ park.onlineRevenue?.toFixed(2) || '0.00' }}</div>
              </div>
              <div style="text-align:center;padding:10px 6px;background:#fafafa;border-radius:6px">
                <div style="font-size:11px;color:var(--ant-text-3)">线下</div>
                <div style="font-size:16px;font-weight:600;color:#fa8c16;margin-top:2px" class="money">&#165;{{ park.offlineRevenue?.toFixed(2) || '0.00' }}</div>
              </div>
              <div style="text-align:center;padding:10px 6px;background:#fff7e6;border-radius:6px">
                <div style="font-size:11px;color:var(--ant-text-3)">&#9783; 美团</div>
                <div style="font-size:16px;font-weight:600;color:#d46b08;margin-top:2px" class="money">&#165;{{ park.meituanRevenue?.toFixed(2) || '0.00' }}</div>
              </div>
              <div style="text-align:center;padding:10px 6px;background:#f5f5f5;border-radius:6px">
                <div style="font-size:11px;color:var(--ant-text-3)">&#9835; 抖音</div>
                <div style="font-size:16px;font-weight:600;color:#010101;margin-top:2px" class="money">&#165;{{ park.douyinRevenue?.toFixed(2) || '0.00' }}</div>
              </div>
              <div :style="{ textAlign: 'center', padding: '10px 6px', borderRadius: '6px', background: (park.balance || 0) > 0 ? '#f6ffed' : '#fafafa' }">
                <div style="font-size:11px;color:var(--ant-text-3)">余额</div>
                <div style="font-size:16px;font-weight:600;color:#52c41a;margin-top:2px" class="money">&#165;{{ park.balance?.toFixed(2) || '0.00' }}</div>
              </div>
            </div>

            <!-- Merchant detail table per park -->
            <div style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--ant-border-secondary)">
              <div class="table-wrap">
                <table class="ant-table" style="margin:0">
                  <thead>
                    <tr>
                      <th>商户</th>
                      <th style="text-align:right">线上</th>
                      <th style="text-align:right">线下</th>
                      <th style="text-align:right">&#9783; 美团</th>
                      <th style="text-align:right">&#9835; 抖音</th>
                      <th style="text-align:right">余额</th>
                      <th style="text-align:right">已提现</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="s in park.shops" :key="s.id">
                      <td><b>{{ s.name }}</b></td>
                      <td style="text-align:right" class="money">&#165;{{ s.online?.toFixed(2) || '0.00' }}</td>
                      <td style="text-align:right" class="money">&#165;{{ s.offline?.toFixed(2) || '0.00' }}</td>
                      <td style="text-align:right;color:#d46b08" class="money">&#165;{{ s.meituan?.toFixed(2) || '0.00' }}</td>
                      <td style="text-align:right;color:#010101" class="money">&#165;{{ s.douyin?.toFixed(2) || '0.00' }}</td>
                      <td style="text-align:right;color:#52c41a;font-weight:600" class="money">&#165;{{ s.balance?.toFixed(2) || '0.00' }}</td>
                      <td style="text-align:right" class="money">&#165;{{ s.withdrawn?.toFixed(2) || '0.00' }}</td>
                    </tr>
                    <tr v-if="!park.shops || park.shops.length === 0">
                      <td colspan="7" style="text-align:center;color:var(--ant-text-3);padding:24px">暂无商户数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Park View: 商户账户明细 -->
    <template v-else>
      <div class="card">
        <div class="card-head">
          <div class="card-title">商户账户明细</div>
          <button class="btn btn-sm" @click="fetchAccount">刷新</button>
        </div>
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>店铺名称</th>
                <th style="text-align:right">账户余额</th>
                <th style="text-align:right">冻结金额</th>
                <th style="text-align:right">可用余额</th>
                <th style="text-align:right">线上</th>
                <th style="text-align:right">线下</th>
                <th style="text-align:right">&#9783; 美团</th>
                <th style="text-align:right">&#9835; 抖音</th>
                <th style="text-align:right">累计收益</th>
                <th style="text-align:right">已提现</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in account.shops" :key="s.id">
                <td><b>{{ s.name }}</b></td>
                <td style="text-align:right" class="money">&#165;{{ s.balance?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right" class="money">&#165;{{ s.frozen?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right" class="money success">&#165;{{ ((s.balance || 0) - (s.frozen || 0)).toFixed(2) }}</td>
                <td style="text-align:right" class="money">&#165;{{ s.online?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right" class="money">&#165;{{ s.offline?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right;color:#d46b08" class="money">&#165;{{ s.meituan?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right;color:#010101" class="money">&#165;{{ s.douyin?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right;font-weight:600" class="money">&#165;{{ ((s.online || 0) + (s.offline || 0) + (s.meituan || 0) + (s.douyin || 0)).toFixed(2) }}</td>
                <td style="text-align:right" class="money success">&#165;{{ s.withdrawn?.toFixed(2) || '0.00' }}</td>
              </tr>
              <tr v-if="!account.shops || account.shops.length === 0">
                <td colspan="10" style="text-align:center;color:var(--ant-text-3);padding:40px">暂无商户数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Detail Modal -->
    <div class="modal-mask" :class="{ open: showDetailModal }" @click.self="showDetailModal = false">
      <div class="modal">
        <div class="modal-head">
          <span>{{ detailTitle }}</span>
          <button class="close-btn" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="detailType === 'total'" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px">
            <div style="grid-column:1/-1;padding:14px;background:#f6ffed;border-radius:8px;text-align:center">
              <div style="font-size:12px;color:var(--ant-text-3);margin-bottom:4px">总收益</div>
              <div style="font-size:28px;font-weight:700;color:var(--ant-text-1)" class="money">&#165;{{ account.totalRevenue?.toFixed(2) || '0.00' }}</div>
            </div>
            <div style="padding:12px;background:#fafafa;border-radius:8px">
              <div style="color:var(--ant-text-3);font-size:12px">线上收入</div>
              <div style="font-size:18px;font-weight:600" class="money">&#165;{{ account.onlineRevenue?.toFixed(2) || '0.00' }}</div>
            </div>
            <div style="padding:12px;background:#fafafa;border-radius:8px">
              <div style="color:var(--ant-text-3);font-size:12px">线下收入</div>
              <div style="font-size:18px;font-weight:600" class="money">&#165;{{ account.offlineRevenue?.toFixed(2) || '0.00' }}</div>
            </div>
            <div style="padding:12px;background:#fff7e6;border-radius:8px">
              <div style="color:#d46b08;font-size:12px">&#9783; 美团团购</div>
              <div style="font-size:18px;font-weight:600;color:#d46b08" class="money">&#165;{{ account.meituanRevenue?.toFixed(2) || '0.00' }}</div>
            </div>
            <div style="padding:12px;background:#f5f5f5;border-radius:8px">
              <div style="color:#010101;font-size:12px">&#9835; 抖音团购</div>
              <div style="font-size:18px;font-weight:600;color:#010101" class="money">&#165;{{ account.douyinRevenue?.toFixed(2) || '0.00' }}</div>
            </div>
          </div>
          <div v-else-if="detailType === 'balance'">
            <div style="padding:14px;background:#f6ffed;border-radius:8px;text-align:center">
              <div style="font-size:12px;color:var(--ant-text-3);margin-bottom:4px">账户余额</div>
              <div style="font-size:28px;font-weight:700;color:#52c41a" class="money">&#165;{{ account.balance?.toFixed(2) || '0.00' }}</div>
              <div style="font-size:12px;color:var(--ant-text-3);margin-top:4px">含冻结金额</div>
            </div>
          </div>
          <div v-else class="empty">
            <div class="empty-icon">&#128202;</div>
            <div>选择收入类型查看明细</div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showDetailModal = false">关闭</button>
          <button class="btn btn-primary">导出明细</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getAccount } from '@/api/finance'
import { ElMessage } from 'element-plus'

const account = ref<any>({
  totalRevenue: 0,
  onlineRevenue: 0,
  offlineRevenue: 0,
  meituanRevenue: 0,
  douyinRevenue: 0,
  balance: 0,
  withdrawn: 0,
  totalIn: 0,
  shops: [],
})

const isPlatform = ref(true)
const parkList = ref<any[]>([])

const showDetailModal = ref(false)
const detailType = ref('')
const detailTitle = ref('')

async function fetchAccount() {
  try {
    const res: any = await getAccount({})
    if (res.code === 0) {
      const data = res.data
      if (data.platform) {
        isPlatform.value = true
        account.value = data.platform
        parkList.value = data.parks || []
      } else {
        isPlatform.value = false
        account.value = data
        parkList.value = []
      }
    }
  } catch {
    ElMessage.error('获取账户数据失败')
  }
}

function openDetail(type: string) {
  detailType.value = type
  showDetailModal.value = true
  const titles: Record<string, string> = {
    total: '总收入明细',
    online: '线上收入明细',
    offline: '线下收入明细',
    meituan: '美团团购收入明细',
    douyin: '抖音团购收入明细',
    balance: '账户余额',
    withdrawn: '已提现明细',
    totalIn: '累计入账明细',
  }
  detailTitle.value = titles[type] || '收入明细'
}

function switchToPark(park: any) {
  isPlatform.value = false
  account.value = park
  ElMessage.info(`切换到 ${park.name}`)
}

onMounted(fetchAccount)
</script>
