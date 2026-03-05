<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const meta = route.meta as { title: string; icon: string; desc: string };

// 难度配置
const LEVELS = {
  EASY: { rows: 9, cols: 9, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  HARD: { rows: 16, cols: 30, mines: 99 }
};

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

const currentLevel = ref('EASY');
const board = ref<Cell[][]>([]);
const gameState = ref<'idle' | 'playing' | 'won' | 'lost'>('idle');
const flagsUsed = ref(0);
const timer = ref(0);
let timerInterval: any = null;

// 初始化棋盘
const initBoard = () => {
  const { rows, cols } = LEVELS[currentLevel.value as keyof typeof LEVELS];
  const newBoard: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({ r, c, isMine: false, isRevealed: false, isFlagged: false, neighborCount: 0 });
    }
    newBoard.push(row);
  }
  board.value = newBoard;
  gameState.value = 'idle';
  flagsUsed.value = 0;
  timer.value = 0;
  clearInterval(timerInterval);
};

// 布放地雷 (第一次点击后触发，确保第一下不是雷)
const placeMines = (excludeR: number, excludeC: number) => {
  const { rows, cols, mines } = LEVELS[currentLevel.value as keyof typeof LEVELS];
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!(board as any).value[r][c].isMine && (r !== excludeR || c !== excludeC)) {
      (board as any).value[r][c].isMine = true;
      minesPlaced++;
    }
  }

  // 计算邻近雷数
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((board as any).value[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if ((board as any).value[r + dr]?.[c + dc]?.isMine) count++;
        }
      }
      (board as any).value[r][c].neighborCount = count;
    }
  }
};

// 点击单元格
const handleCellClick = (r: number, c: number) => {
  if (gameState.value === 'lost' || gameState.value === 'won' || (board as any).value[r][c].isFlagged) return;

  if (gameState.value === 'idle') {
    placeMines(r, c);
    gameState.value = 'playing';
    timerInterval = setInterval(() => timer.value++, 1000);
  }

  revealCell(r, c);
  checkGameState();
};

// 递归揭开
const revealCell = (r: number, c: number) => {
  const cell = board.value[r]?.[c];
  if (!cell || cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;

  if (cell.isMine) {
    gameOver(false);
    return;
  }

  if (cell.neighborCount === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        revealCell(r + dr, c + dc);
      }
    }
  }
};

// 右键标记
const handleRightClick = (e: MouseEvent, r: number, c: number) => {
  e.preventDefault();
  if (gameState.value !== 'playing' && gameState.value !== 'idle') return;
  const cell = (board as any).value[r][c];
  if (cell.isRevealed) return;

  cell.isFlagged = !cell.isFlagged;
  flagsUsed.value += cell.isFlagged ? 1 : -1;
};

const checkGameState = () => {
  const { rows, cols } = LEVELS[currentLevel.value as keyof typeof LEVELS];
  let unrevealedSafeCells = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!(board as any).value[r][c].isMine && !(board as any).value[r][c].isRevealed) unrevealedSafeCells++;
    }
  }
  if (unrevealedSafeCells === 0) gameOver(true);
};

const gameOver = (win: boolean) => {
  gameState.value = win ? 'won' : 'lost';
  clearInterval(timerInterval);
  // 输了显示所有雷
  if (!win) {
    board.value.forEach(row => row.forEach(cell => {
      if (cell.isMine) cell.isRevealed = true;
    }));
  }
};

const getNumberColor = (num: number) => {
  const colors = ['', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-indigo-800', 'text-red-800', 'text-teal-600', 'text-black', 'text-gray-500'];
  return colors[num] || '';
};

watch(currentLevel, () => initBoard());

onMounted(() => initBoard());
onUnmounted(() => clearInterval(timerInterval));
</script>

<template>
  <div class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
    <header class="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="text-2xl">{{ meta.icon }}</div>
        <div>
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-widest">{{ meta.title }}</h2>
          <p class="text-[11px] text-slate-400 font-medium">{{ meta.desc }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <select v-model="currentLevel" class="px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white font-bold text-slate-600 focus:border-indigo-400">
          <option value="EASY">初级 (9x9)</option>
          <option value="MEDIUM">中级 (16x16)</option>
          <option value="HARD">高级 (16x30)</option>
        </select>
        <button @click="initBoard" class="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all">
          重置游戏
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-auto p-8 flex flex-col items-center gap-6">
      <div class="flex gap-4 w-full max-w-fit bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div class="px-6 py-2 bg-slate-50 rounded-xl border border-slate-100 text-center min-w-[100px]">
          <p class="text-[10px] font-bold text-slate-400 uppercase">剩余地雷</p>
          <p class="text-xl font-black text-slate-700 font-mono">{{ LEVELS[currentLevel as keyof typeof LEVELS].mines - flagsUsed }}</p>
        </div>
        <div class="flex items-center justify-center text-3xl px-4 cursor-pointer hover:scale-110 transition-transform" @click="initBoard">
          {{ gameState === 'lost' ? '😵' : (gameState === 'won' ? '😎' : '🙂') }}
        </div>
        <div class="px-6 py-2 bg-slate-50 rounded-xl border border-slate-100 text-center min-w-[100px]">
          <p class="text-[10px] font-bold text-slate-400 uppercase">用时</p>
          <p class="text-xl font-black text-slate-700 font-mono">{{ timer.toString().padStart(3, '0') }}</p>
        </div>
      </div>

      <div 
        class="bg-slate-200 p-1.5 rounded-xl shadow-inner border-t-2 border-l-2 border-white/50 border-b-2 border-r-2 border-slate-300"
        @contextmenu.prevent
      >
        <div v-for="(row, r) in board" :key="r" class="flex">
          <div 
            v-for="(cell, c) in row" 
            :key="c"
            @click="handleCellClick(r, c)"
            @contextmenu="handleRightClick($event, r, c)"
            :class="[
              'w-8 h-8 flex items-center justify-center font-mono text-lg font-black transition-all cursor-default select-none',
              cell.isRevealed 
                ? 'bg-slate-100 border border-slate-200' 
                : 'bg-white border-2 border-slate-300 border-b-slate-400 border-r-slate-400 hover:bg-slate-50'
            ]"
          >
            <template v-if="cell.isRevealed">
              <span v-if="cell.isMine" class="text-sm">💣</span>
              <span v-else-if="cell.neighborCount > 0" :class="getNumberColor(cell.neighborCount)">
                {{ cell.neighborCount }}
              </span>
            </template>
            <span v-else-if="cell.isFlagged" class="text-sm">🚩</span>
          </div>
        </div>
      </div>

      <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-xl max-w-md">
        <div class="flex gap-3">
          <span class="text-indigo-500">💡</span>
          <p class="text-[11px] text-indigo-700 leading-relaxed font-medium">
            <strong>操作提示：</strong>左键点击格子揭开，右键点击格子标记地雷。第一次点击永远是安全的。数字代表周围 8 个格子内地雷的总数。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 模拟经典的浮雕感 */
.bg-white.border-2 {
  border-top-color: #ffffff;
  border-left-color: #ffffff;
  border-bottom-color: #94a3b8;
  border-right-color: #94a3b8;
}

.bg-slate-100.border {
  border-color: #e2e8f0;
}
</style>