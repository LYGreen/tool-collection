<script setup lang="ts">
import { ref, reactive } from 'vue'

const loading = ref(false)
const methods = ['GET', 'POST', 'PUT', 'DELETE']

const request = reactive({
  url: '',
  method: 'GET',
  headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
  body: ''
})

const response = ref<{ status: number; data: any; time: number } | null>(null)

const addHeader = () => request.headers.push({ key: '', value: '', enabled: true })
const removeHeader = (index: number) => request.headers.splice(index, 1)

const sendRequest = async () => {
  if (!request.url) return
  loading.value = true
  const start = Date.now()
  try {
    const res = await fetch(request.url, {
      method: request.method,
      headers: request.headers.reduce((acc, h) => {
        if (h.enabled && h.key) acc[h.key] = h.value
        return acc
      }, {} as any),
      body: request.method !== 'GET' ? request.body : null
    })
    const data = await res.json()
    response.value = { status: res.status, data, time: Date.now() - start }
  } catch (err: any) {
    response.value = { status: 500, data: { error: err.message }, time: Date.now() - start }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col pb-4 gap-4 w-full">
    <div class="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
      <select v-model="request.method" class="bg-white border-none rounded-lg px-4 py-2 font-bold text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500">
        <option v-for="m in methods" :key="m">{{ m }}</option>
      </select>
      <input v-model="request.url" type="text" placeholder="输入请求 URL..." class="flex-1 bg-transparent outline-none border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-0 p-2 text-sm" />
      <button @click="sendRequest" :disabled="loading" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-100">
        {{ loading ? '发送中...' : '发送请求' }}
      </button>
    </div>

    <div class="flex-1 flex gap-4 min-h-0 p-6">
      <div class="flex-1 flex flex-col gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Headers</span>
            <button @click="addHeader" class="text-xs text-indigo-600 hover:text-indigo-700">+ 增加</button>
          </div>
          <div class="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <div v-for="(h, i) in request.headers" :key="i" class="flex gap-2">
              <input v-model="h.key" placeholder="Key" class="flex-1 text-xs border border-slate-200 rounded px-2 py-1 focus:border-indigo-300 outline-none" />
              <input v-model="h.value" placeholder="Value" class="flex-1 text-xs border border-slate-200 rounded px-2 py-1 focus:border-indigo-300 outline-none" />
              <button @click="removeHeader(i)" class="text-slate-300 hover:text-red-400">×</button>
            </div>
          </div>
        </div>
        
        <div class="flex-1 flex flex-col">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Request Body</span>
          <textarea v-model="request.body" class="flex-1 w-full p-3 font-mono text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none resize-none" placeholder='{ "id": 1 }'></textarea>
        </div>
      </div>

      <div class="flex-1 flex flex-col border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <div class="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Response</span>
          
          <div v-if="response" class="flex gap-3">
            <span class="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700 font-mono font-bold">
              {{ response.status }} OK
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
              {{ response.time }}ms
            </span>
          </div>
        </div>

        <div class="flex-1 p-4 overflow-auto custom-scrollbar">
          <pre v-if="response" class="text-xs font-mono text-slate-700 leading-relaxed">{{ JSON.stringify(response.data, null, 2) }}</pre>
          
          <div v-else class="h-full flex flex-col items-center justify-center text-slate-300">
            <span class="text-3xl mb-2 opacity-50">📡</span>
            <p class="text-xs font-medium">等待发送请求...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>