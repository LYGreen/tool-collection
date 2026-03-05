<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Meta 信息，与你的 Sidebar.vue 逻辑匹配
const meta = route.meta as { title: string; icon: string; desc: string };

const quantity = ref(10);
const useUppercase = ref(false);
const removeHyphens = ref(false);
const uuids = ref<string[]>([]);
const copied = ref(false);

// 生成 UUID v4 逻辑
const generateUUIDs = () => {
  const newUuids = [];
  for (let i = 0; i < quantity.value; i++) {
    // 使用原生 Web Crypto API 确保随机性
    let uuid = crypto.randomUUID();
    
    if (removeHyphens.value) {
      uuid = uuid.replace(/-/g, '') as any;
    }
    if (useUppercase.value) {
      uuid = uuid.toUpperCase() as any;
    }
    newUuids.push(uuid);
  }
  uuids.value = newUuids;
};

const handleCopyAll = () => {
  if (uuids.value.length === 0) return;
  navigator.clipboard.writeText(uuids.value.join('\n'));
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};

const handleCopy = (uuid: string) => {
  navigator.clipboard.writeText(uuid);
};

// 初始生成
onMounted(() => {
  generateUUIDs();
});
</script>

<template>
  <div class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
    <header class="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="text-2xl drop-shadow-sm">{{ meta.icon }}</div>
        <div>
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-widest">{{ meta.title }}</h2>
          <p class="text-[11px] text-slate-400 font-medium">{{ meta.desc }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="handleCopyAll"
          :class="[
            'px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm border',
            copied 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
          ]"
        >
          {{ copied ? '已复制全部' : '复制全部' }}
        </button>
        <button 
          @click="generateUUIDs"
          class="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          重新生成
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden p-6 gap-6">
      <div class="w-80 flex flex-col gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">生成设置</label>
            
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs font-medium text-slate-600">生成数量</span>
                  <span class="text-xs font-bold text-indigo-600">{{ quantity }}</span>
                </div>
                <input 
                  type="range" v-model.number="quantity" min="1" max="100" 
                  class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <hr class="border-slate-100" />

              <div class="space-y-3">
                <label class="flex items-center justify-between cursor-pointer group">
                  <span class="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">大写格式</span>
                  <input type="checkbox" v-model="useUppercase" @change="generateUUIDs" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                </label>
                
                <label class="flex items-center justify-between cursor-pointer group">
                  <span class="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">移除连字符 (-)</span>
                  <input type="checkbox" v-model="removeHyphens" @change="generateUUIDs" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
          <p class="text-[11px] text-indigo-600 leading-relaxed font-medium">
            提示：本工具使用浏览器原生的 Crypto API 生成版本 4 (随机) UUID，具有极高的唯一性。
          </p>
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-3">
        <div class="flex items-center px-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Result List</span>
        </div>
        <div class="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div class="absolute inset-0 overflow-auto p-4 custom-scrollbar">
            <div class="grid gap-2">
              <div 
                v-for="(uuid, index) in uuids" 
                :key="index"
                class="group flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all"
              >
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-mono text-slate-300 w-6">{{ index + 1 }}</span>
                  <span class="font-mono text-sm text-slate-700 tracking-tight">{{ uuid }}</span>
                </div>
                <button 
                  @click="handleCopy(uuid)"
                  class="opacity-0 group-hover:opacity-100 px-2 py-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 rounded transition-all"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* 自定义 Range 样式优化 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4f46e5;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>