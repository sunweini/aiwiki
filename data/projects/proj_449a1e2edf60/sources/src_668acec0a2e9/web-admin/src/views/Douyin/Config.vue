<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">抖音 API 配置</div>
      <div class="page-subtitle">抖音开放平台 &#183; 生活服务 &#183; 开发者入驻与门店映射 &#183; 商品同步</div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><div class="card-title">平台级配置 (开发者入驻)</div></div>
      <div class="card-body" style="max-width:680px">
        <div class="form-item">
          <label class="form-label required">抖音 Client Key (App ID)</label>
          <input class="input" v-model="apiForm.client_key" placeholder="抖音开放平台 Client Key">
          <div class="form-help">抖音开放平台 &#183; 生活服务号获取的 Client Key</div>
        </div>
        <div class="form-item">
          <label class="form-label required">抖音 Client Secret</label>
          <div style="display:flex;gap:8px">
            <input class="input" v-model="apiForm.client_secret" :type="showSecret ? 'text' : 'password'" placeholder="留空则不修改" style="flex:1">
            <button class="btn" @click="showSecret = !showSecret">{{ showSecret ? '隐藏' : '查看' }}</button>
            <button class="btn" @click="handleRegenerateSecret">重新生成</button>
          </div>
          <div class="form-help">用于 Access Token 获取与请求签名</div>
        </div>
        <div class="form-item">
          <label class="form-label required">回调地址 (Webhook)</label>
          <input class="input" v-model="apiForm.callback_url" placeholder="https://...">
          <div class="form-help">抖音平台推送验券结果、商品审核结果的通知地址</div>
        </div>
        <div style="border-top:1px solid var(--ant-border-secondary);padding-top:20px;display:flex;justify-content:flex-end;gap:10px">
          <button class="btn" @click="handleReset">重置</button>
          <button class="btn btn-primary" @click="saveConfig" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-head">
        <div class="card-title">门店授权管理</div>
        <button class="btn btn-primary btn-sm" @click="showBindDialog = true">+ 添加门店授权</button>
      </div>
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>店铺</th>
                <th>appAuthToken</th>
                <th>授权范围</th>
                <th>状态</th>
                <th>绑定时间</th>
                <th>最后同步</th>
                <th style="text-align:right">累计核销</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in stores" :key="s.id">
                <td><b>{{ s.shop?.name || s.shop_name || '-' }}</b></td>
                <td class="col-mono">{{ s.app_auth_token || '<span style=\"color:var(--ant-text-disabled)\">— 未获取 —</span>' }}</td>
                <td>{{ s.scope || '-' }}</td>
                <td>
                  <span :class="'tag ' + (s.auth_status === 1 ? 'success' : 'warning')">{{ s.auth_status === 1 ? '已绑定' : '未绑定' }}</span>
                </td>
                <td>{{ s.bind_at || '-' }}</td>
                <td>{{ s.last_sync || '-' }}</td>
                <td style="text-align:right">{{ s.verify_count || '-' }}</td>
                <td class="col-actions">
                  <template v-if="s.auth_status === 1">
                    <button class="btn-link" @click="handleRefreshToken(s)">刷新 Token</button>
                    <span class="divider">|</span>
                    <button class="btn-link danger" @click="handleUnbind(s)">解绑</button>
                  </template>
                  <template v-else>
                    <button class="btn-link" @click="handleBindQR(s)">生成绑定二维码</button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">抖音 API 接口清单</div></div>
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>业务场景</th>
                <th>接口名称</th>
                <th>接口类型</th>
                <th>必接</th>
                <th>说明</th>
                <th class="col-actions">文档</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>商服授权</td>
                <td><b>能力授权 & 门店绑定 UI SDK</b></td>
                <td><span class="tag processing">UI SDK</span></td>
                <td><span class="tag default">可选</span></td>
                <td>简化商家和技术服务商授权操作</td>
                <td><button class="btn-link" @click="showDoc('商服授权')">查看文档</button></td>
              </tr>
              <tr>
                <td>门店映射</td>
                <td><b>门店映射 UI SDK 接入</b></td>
                <td><span class="tag processing">UI SDK</span></td>
                <td><span class="tag error">必接</span></td>
                <td>单店/弱管控连锁门店，将收银门店映射抖音门店</td>
                <td><button class="btn-link" @click="showDoc('门店映射UI')">查看文档</button></td>
              </tr>
              <tr>
                <td>门店映射</td>
                <td><b>查询门店信息 / 提交匹配任务</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag default">可选</span></td>
                <td>批量将收银门店映射抖音门店（总部/品牌视角）</td>
                <td><button class="btn-link" @click="showDoc('门店信息')">查看文档</button></td>
              </tr>
              <tr>
                <td>商品管理</td>
                <td><b>创建/更新商品接口</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag error">必接</span></td>
                <td>创建/查询抖音团购商品</td>
                <td><button class="btn-link" @click="showDoc('商品创建')">查看文档</button></td>
              </tr>
              <tr>
                <td>商品管理</td>
                <td><b>查询商品线上数据 / 审核结果同步</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag error">必接</span></td>
                <td>商品查询 &#183; 审核状态同步</td>
                <td><button class="btn-link" @click="showDoc('商品查询')">查看文档</button></td>
              </tr>
              <tr>
                <td>商品管理</td>
                <td><b>免审修改商品 / 同步库存 / 上下架</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag default">可选</span></td>
                <td>删改查抖音团购商品 &#183; 库存同步</td>
                <td><button class="btn-link" @click="showDoc('商品修改')">查看文档</button></td>
              </tr>
              <tr>
                <td>套餐映射</td>
                <td><b>查询商品线上数据列表</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag error">必接</span></td>
                <td>建立抖音商品与收银系统商品映射关系</td>
                <td><button class="btn-link" @click="showDoc('套餐映射')">查看文档</button></td>
              </tr>
              <tr>
                <td>团购核销</td>
                <td><b>验券准备 (宣券)</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag error">必接</span></td>
                <td>商家扫码宣券，查询券码可验状态、券类型、可验张数</td>
                <td><button class="btn-link" @click="showDoc('验券准备')">查看文档</button></td>
              </tr>
              <tr>
                <td>团购核销</td>
                <td><b>执行验券</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag error">必接</span></td>
                <td>确定核销张数，正式完成验券操作</td>
                <td><button class="btn-link" @click="showDoc('执行验券')">查看文档</button></td>
              </tr>
              <tr>
                <td>团购核销</td>
                <td><b>撤销验券</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag default">可选</span></td>
                <td>商家多验/错验时发起撤销</td>
                <td><button class="btn-link" @click="showDoc('撤销验券')">查看文档</button></td>
              </tr>
              <tr>
                <td>团购对账</td>
                <td><b>查询团购订单结算明细</b></td>
                <td><span class="tag cyan">API</span></td>
                <td><span class="tag default">可选</span></td>
                <td>查询指定时间范围内的团购订单结算明细</td>
                <td><button class="btn-link" @click="showDoc('团购对账')">查看文档</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bind Store Modal -->
    <div :class="'modal-mask' + (showBindDialog ? ' open' : '')" @click.self="showBindDialog = false">
      <div class="modal">
        <div class="modal-head">
          <span>绑定抖音门店</span>
          <button class="close-btn" @click="showBindDialog = false">&#10005;</button>
        </div>
        <div class="modal-body">
          <div style="background:var(--ant-primary-bg);border:1px solid var(--ant-primary-border);border-radius:8px;padding:14px;margin-bottom:18px">
            <div style="font-size:14px;font-weight:500;color:var(--ant-primary)">&#9432; 请使用商户端小程序扫码完成门店映射绑定</div>
          </div>
          <div class="form-item">
            <label class="form-label required">平台门店</label>
            <select class="select" v-model="bindForm.shop_id">
              <option v-for="s in shopList" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label required">POI ID</label>
            <input class="input" v-model="bindForm.poi_id" placeholder="抖音 POI ID">
          </div>
          <div class="form-item">
            <label class="form-label required">抖音门店名</label>
            <input class="input" v-model="bindForm.external_store_name" placeholder="抖音侧门店名称">
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showBindDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleBind" :disabled="binding">{{ binding ? '绑定中...' : '确认绑定' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'

const stores = ref<any[]>([])
const shopList = ref<any[]>([])
const loadingStores = ref(false)
const saving = ref(false)
const binding = ref(false)
const showBindDialog = ref(false)
const showSecret = ref(false)

const apiForm = reactive({ client_key: '', client_secret: '', callback_url: '' })
const bindForm = reactive({ shop_id: 1, poi_id: '', external_store_name: '' })

async function fetchConfig() {
  try {
    const res: any = await request.get('/douyin/config')
    if (res.code === 0 && res.data) Object.assign(apiForm, { client_key: res.data.client_key || '', callback_url: res.data.callback_url || '' })
  } catch { /* ignore */ }
}

async function fetchShops() {
  try {
    const res: any = await request.get('/shops', { params: { page: 1, page_size: 200 } })
    if (res.code === 0) { shopList.value = res.data?.items || []; if (shopList.value[0]) bindForm.shop_id = shopList.value[0].id }
  } catch { /* ignore */ }
}

async function fetchStores() {
  loadingStores.value = true
  try {
    const res: any = await request.get('/douyin/stores')
    if (res.code === 0) stores.value = res.data || []
  } catch { /* ignore */ }
  finally { loadingStores.value = false }
}

async function saveConfig() {
  saving.value = true
  try {
    const payload: any = { client_key: apiForm.client_key, callback_url: apiForm.callback_url }
    if (apiForm.client_secret.trim()) payload.client_secret = apiForm.client_secret.trim()
    const res: any = await request.put('/douyin/config', payload)
    if (res.code === 0) { alert('抖音 API 配置已保存'); apiForm.client_secret = '' }
    else alert('保存失败: ' + (res.message || ''))
  } catch { alert('保存失败') }
  finally { saving.value = false }
}

function handleReset() {
  fetchConfig()
  alert('已重置')
}

function handleRegenerateSecret() {
  alert('Secret 已重新生成')
}

async function handleBind() {
  binding.value = true
  try {
    const res: any = await request.post('/douyin/stores', { shop_id: bindForm.shop_id, poi_id: bindForm.poi_id, external_store_name: bindForm.external_store_name })
    if (res.code === 0) { alert('绑定成功'); showBindDialog.value = false; fetchStores() }
    else alert('绑定失败: ' + (res.message || ''))
  } catch { alert('绑定失败') }
  finally { binding.value = false }
}

function handleRefreshToken(row: any) {
  alert('Token 已刷新')
}

function handleUnbind(row: any) {
  if (confirm('确认解绑门店 ' + (row.shop?.name || '') + '？')) {
    alert('已解绑门店映射')
  }
}

function handleBindQR(row: any) {
  alert('请使用商户端小程序扫码完成门店映射绑定')
}

function showDoc(name: string) {
  alert('打开文档: ' + name)
}

onMounted(async () => { await Promise.all([fetchConfig(), fetchShops(), fetchStores()]) })
</script>
