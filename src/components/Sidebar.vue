<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps<{
  tools: Array<{ id: string; title: string; icon: string; description: string; path: string }>;
}>();

const activeId = computed(() => route.name?.toString() || '');

</script>

<template>
  <aside class="w-72 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm">
    <div class="p-6">
      <div class="flex items-center gap-3 px-2">
        <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <span class="text-xl">🛠️</span>
        </div>
        <h1 class="text-xl font-bold tracking-tight text-slate-800"><RouterLink to="/">DevToolbox</RouterLink></h1>
      </div>
    </div>

    <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
      <div class="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">开发辅助</div>
      <RouterLink :to="tool.path"
        v-for="tool in tools"
        :key="tool.id"
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
          tool.id === activeId 
            ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        ]"
      >
        <div v-if="tool.id === activeId" class="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"></div>
        
        <span class="text-xl group-hover:scale-110 transition-transform">{{ tool.icon }}</span>
        <span class="font-medium text-sm">{{ tool.title }}</span>
      </RouterLink>
    </nav>

    <div class="p-4 border-t border-slate-100">
      <div class="flex items-center justify-between px-2 text-xs text-slate-400">
        <span>v1.0.0</span>
        <span class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Ready
        </span>
      </div>
    </div>
  </aside>
</template>