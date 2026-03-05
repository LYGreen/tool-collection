<script setup lang="ts">

const props = defineProps<{
    activeTool?: { id: string; name: string; description?: string } | null | undefined
}>()

</script>

<template>
  <main class="flex-1 h-full overflow-hidden flex flex-col bg-slate-50">
    <header v-if="activeTool" class="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center px-8 justify-between">
      <h2 class="text-lg font-bold text-slate-800">{{ activeTool.name }}</h2>
      <div class="flex gap-2">
        <button class="p-2 text-slate-400 hover:text-slate-600">✨</button>
        <button class="p-2 text-slate-400 hover:text-slate-600">⚙️</button>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-8">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div :key="activeTool?.id" class="max-w-5xl mx-auto">
          <div v-if="activeTool" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
            <div class="mb-6">
              <h3 class="text-xl font-bold text-slate-800 mb-1">{{ activeTool.name }}</h3>
              <p class="text-slate-500 text-sm">{{ activeTool.description }}</p>
            </div>
            
            <div class="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-slate-400 italic">
              <div class="text-4xl mb-4">🚧</div>
              功能模块开发中...
            </div>
          </div>

          <div v-else class="h-[80vh] flex flex-col items-center justify-center text-slate-400">
            <div class="text-6xl mb-4">👈</div>
            <p class="text-lg">请从左侧列表选择一个工具</p>
          </div>
        </div>
      </Transition>
    </div>
  </main>
</template>

<style scoped>
</style>
