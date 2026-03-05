<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 模拟路由 Meta 信息（供参考）
const meta = route.meta as { title: string; icon: string; desc: string };

const inputData = ref('');
const error = ref('');
const copied = ref(false);

// 使用 computed 实时处理。只要 inputData 变化，这里就会重新计算。
const highlightedJson = computed(() => {
  const rawValue = inputData.value.trim();
  if (!rawValue) {
    error.value = '';
    return '<span class="text-slate-500">等待输入...</span>';
  }

  try {
    const obj = JSON.parse(rawValue);
    error.value = '';
    const formatted = JSON.stringify(obj, null, 2);
    return highlightSyntax(formatted);
  } catch (e: any) {
    error.value = '无效的 JSON: ' + e.message;
    return '';
  }
});

// 核心高亮逻辑：确保生成的 HTML 类名与 Tailwind 匹配
function highlightSyntax(json: string) {
  // 转义 HTML 防止 XSS
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

const handleCopy = () => {
  if (error.value || !inputData.value) return;
  navigator.clipboard.writeText(JSON.stringify(JSON.parse(inputData.value), null, 2));
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};
</script>

<template>
  <div class="flex-1 flex flex-col h-screen overflow-hidden">
    <header class="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{ meta.icon }}</span>
        <div>
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">{{ meta.title }}</h2>
          <p class="text-xs text-slate-400">{{ meta.desc }}</p>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button 
          @click="inputData = ''"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          清空
        </button>
        <button 
          @click="handleCopy"
          :disabled="!!error || !inputData"
          class="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-md shadow-indigo-100"
        >
          {{ copied ? '已复制 ✨' : '复制结果' }}
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden p-6 bg-slate-50 gap-6">
      <div class="flex-1 flex flex-col gap-2">
        <div class="flex items-center justify-between px-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Input Raw JSON</span>
        </div>
        <textarea
          v-model="inputData"
          class="flex-1 w-full p-6 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none font-mono text-sm leading-relaxed transition-all resize-none"
          placeholder="在此粘贴代码..."
        ></textarea>
      </div>

      <div class="flex-1 flex flex-col gap-2">
        <div class="flex items-center justify-between px-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Formatted View</span>
          <span v-if="error" class="text-[10px] font-bold text-rose-500 animate-pulse">Invalid JSON</span>
        </div>
        <div class="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div class="absolute inset-0 overflow-auto p-6 custom-scrollbar">
            <div :style="{ display: error ? 'block' : 'none' }" class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
              <p class="font-mono text-sm text-rose-400">{{ error }}</p>
            </div>
            <pre 
              :style="{ display: error ? 'none' : 'block' }"
              class="font-mono text-sm leading-relaxed break-all whitespace-pre-wrap"
              v-html="highlightedJson"
            ></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 浅色模式滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0; /* slate-200 */
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1; /* slate-300 */
}

/* --- 核心配色：白色背景优化版 --- */
:deep(.json-key) { 
  color: #d73a49; /* 砖红色：更沉稳，适合浅色背景 */
  font-weight: 600; 
}     
:deep(.json-string) { 
  color: #22863a; /* 深绿色：对比度更高 */
}                  
:deep(.json-number) { 
  color: #005cc5; /* 深蓝色：替代橙色，避免在白色背景上发虚 */
}                  
:deep(.json-boolean) { 
  color: #e36209; /* 深橙色：布尔值区分度 */
}                 
:deep(.json-null) { 
  color: #6a737d; /* 灰紫色：辅助信息色 */
}
</style>