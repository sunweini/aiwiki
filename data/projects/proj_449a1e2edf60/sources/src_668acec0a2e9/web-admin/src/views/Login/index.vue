<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">袁夫稻田 &middot; 智慧园区管理平台</h1>
      <div class="login-form">
        <div class="form-item">
          <label class="form-label">用户名</label>
          <input
            class="input"
            style="height:40px;font-size:15px"
            v-model="form.username"
            placeholder="请输入用户名"
            @keyup.enter="handleLogin"
            autocomplete="username"
          >
        </div>
        <div class="form-item">
          <label class="form-label">密码</label>
          <input
            class="input"
            style="height:40px;font-size:15px"
            :type="showPassword ? 'text' : 'password'"
            v-model="form.password"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
            autocomplete="current-password"
          >
        </div>
        <button
          class="btn btn-primary btn-lg btn-block"
          :disabled="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login, getMenu } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { useMenuStore } from '@/store/menu'

const router = useRouter()
const auth = useAuthStore()
const menuStore = useMenuStore()
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!form.username || !form.password) {
    showToast('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const res: any = await login(form.username, form.password)
    if (res.code === 0) {
      auth.setAuth(res.data.access_token, res.data.refresh_token, res.data.employee)
      try {
        const menuRes: any = await getMenu('platform')
        if (menuRes.code === 0) {
          menuStore.setMenu(menuRes.data)
        }
      } catch { /* ignore menu fetch failure */ }
      router.push('/')
    } else {
      showToast(res.message || '登录失败')
    }
  } catch (e: any) {
    showToast(e.response?.data?.message || '网络错误')
  } finally {
    loading.value = false
  }
}

function showToast(msg: string) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2000)
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand-green), var(--brand-gold));
}
.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.title {
  text-align: center;
  font-size: 22px;
  color: var(--brand-green);
  margin-bottom: 32px;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.login-form .form-item {
  margin-bottom: 20px;
}
</style>
