<script setup lang="ts">

import Sidebar from './components/Sidebar.vue'
import { useRouter } from 'vue-router'

interface Tool {
  id: string;
  title: string;
  icon: string;
  description: string;
  path: string;
}

const router = useRouter();
const tools = router.getRoutes()
  .filter(r => r.path.startsWith('/tools/'))
  .map(r => ({
    id: r.name,
    title: r.meta.title,
    icon: r.meta.icon,
    description: r.meta.desc,
    path: r.path,
  })) as Tool[];

</script>

<template>
  <div class="h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
    <Sidebar :tools="tools" />
    <!-- <ToolPanel :activeTool="activeTool" /> -->
    <router-view />
  </div>
</template>