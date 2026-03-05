<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200/40 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10">
      <div class="relative inline-block">
        <h1 class="text-[12rem] font-black text-slate-200 leading-none select-none tracking-tighter">
          404
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-6xl animate-bounce">🚧</span>
        </div>
      </div>

      <div class="mt-8 space-y-2">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">
          哎呀，页面丢失了
        </h2>
        <p class="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
          你尝试访问的路径不存在，或者它已经像过时的代码一样被重构了。
        </p>
      </div>

      <div class="mt-10 flex items-center justify-center gap-4">
        <button 
          @click="goBack"
          class="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          返回上一页
        </button>
        <button 
          @click="goHome"
          class="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          回到工作台
        </button>
      </div>
    </div>

    <div class="absolute bottom-8 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
      DevToolbox / Error Handler
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

h1 {
  /* 增加文字阴影让 404 看起来更立体 */
  text-shadow: 4px 4px 0px rgba(226, 232, 240, 0.5);
}
</style>