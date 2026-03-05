<script setup lang="ts">
import { ref } from 'vue';
import { jsPDF } from 'jspdf';
import { useRoute } from 'vue-router';

const route = useRoute();

const meta = route.meta as { title: string; icon: string; desc: string };

interface ImageItem {
  id: string;
  src: string;
  name: string;
  width: number;
  height: number;
}

const images = ref<ImageItem[]>([]);
const isGenerating = ref(false);
const pdfName = ref('converted_document');

const handleUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) addFiles(Array.from(target.files));
};

const addFiles = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          images.value.push({
            id: Math.random().toString(36).substr(2, 9),
            src: img.src,
            name: file.name,
            width: img.width,
            height: img.height
          });
        };
      };
      reader.readAsDataURL(file);
    }
  });
};

const generatePDF = async () => {
  if (images.value.length === 0) return;
  isGenerating.value = true;

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < images.value.length; i++) {
      if (i > 0) pdf.addPage();
      
      const imgData = images.value[i] as ImageItem;
      
      // --- 核心算法：保持比例计算 ---
      const imgRatio = imgData.width / imgData.height;
      const pageRatio = pageWidth / pageHeight;
      
      let printWidth, printHeight;

      if (imgRatio > pageRatio) {
        // 图片太宽，以宽度为准缩放
        printWidth = pageWidth;
        printHeight = pageWidth / imgRatio;
      } else {
        // 图片太高，以高度为准缩放
        printHeight = pageHeight;
        printWidth = pageHeight * imgRatio;
      }

      // 居中计算坐标
      const x = (pageWidth - printWidth) / 2;
      const y = (pageHeight - printHeight) / 2;

      pdf.addImage(imgData.src, 'JPEG', x, y, printWidth, printHeight, undefined, 'FAST');
    }

    pdf.save(`${pdfName.value || 'document'}.pdf`);
  } catch (err) {
    console.error('PDF 转换失败', err);
  } finally {
    isGenerating.value = false;
  }
};

const removeImage = (id: string) => {
  images.value = images.value.filter(img => img.id !== id);
};
</script>

<template>
  <div class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 text-slate-900">
    <header class="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="text-2xl">{{ meta.icon }}</div>
        <div>
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-widest">{{ meta.title }}</h2>
          <p class="text-[11px] text-slate-400 font-medium">{{ meta.desc }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <input v-model="pdfName" class="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none w-40 focus:border-indigo-400" />
        <button 
          @click="generatePDF"
          :disabled="images.length === 0 || isGenerating"
          class="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 transition-all flex items-center gap-2 shadow-md shadow-indigo-100"
        >
          <span v-if="isGenerating" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          {{ isGenerating ? '正在转换' : '生成 PDF' }}
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden p-6 gap-6">
      <div class="flex-1 flex flex-col gap-4">
        <div 
          @dragover.prevent @drop.prevent="e => addFiles(Array.from(e.dataTransfer?.files || []))"
          @click="($refs.fileInput as any).click()"
          class="h-40 border-2 border-dashed border-slate-200 bg-white rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group"
        >
          <input type="file" ref="fileInput" multiple accept="image/*" class="hidden" @change="handleUpload" />
          <span class="text-2xl group-hover:scale-110 transition-transform">📸</span>
          <p class="text-xs font-bold text-slate-500">点击或拖拽添加图片</p>
        </div>

        <div class="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div class="px-5 py-3 border-b border-slate-100 flex justify-between bg-slate-50/50">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">待处理图片 ({{ images.length }})</span>
          </div>
          <div class="flex-1 overflow-auto p-5 custom-scrollbar">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="img in images" :key="img.id" class="relative aspect-[3/4] group rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                <img :src="img.src" class="w-full h-full object-contain bg-slate-200/50" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button @click="removeImage(img.id)" class="bg-rose-500 text-white p-2 rounded-full text-xs shadow-lg">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-64 space-y-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 class="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">转换策略</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span class="text-emerald-500">✓</span> 自动等比缩放
            </div>
            <div class="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span class="text-emerald-500">✓</span> 页面居中对齐
            </div>
            <div class="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span class="text-emerald-500">✓</span> 保护隐私(不上传)
            </div>
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