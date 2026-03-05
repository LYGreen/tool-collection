<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const meta = route.meta as { title: string; icon: string; desc: string };

// 游戏配置
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const canvasRef = ref<HTMLCanvasElement | null>(null);
const score = ref(0);
const highScore = ref(Number(localStorage.getItem('snake-high-score')) || 0);
const gameState = ref<'idle' | 'playing' | 'paused' | 'gameover'>('idle');

// 蛇的状态
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let gameInterval: any = null;

const initGame = () => {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score.value = 0;
  generateFood();
  draw();
};

const generateFood = () => {
  food = {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  };
  // 防止食物生成在蛇身上
  if (snake.some(s => s.x === food.x && s.y === food.y)) generateFood();
};

const startGame = () => {
  if (gameState.value === 'playing') return;
  if (gameState.value === 'gameover' || gameState.value === 'idle') initGame();
  gameState.value = 'playing';
  gameInterval = setInterval(moveSnake, INITIAL_SPEED - Math.min(score.value * 2, 100));
};

const pauseGame = () => {
  gameState.value = 'paused';
  clearInterval(gameInterval);
};

const moveSnake = () => {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // 撞墙或撞自己
  if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || 
      snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // 吃到食物
  if (head.x === food.x && head.y === food.y) {
    score.value += 10;
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('snake-high-score', highScore.value.toString());
    }
    generateFood();
    // 动态加速
    clearInterval(gameInterval);
    gameInterval = setInterval(moveSnake, Math.max(50, INITIAL_SPEED - score.value / 2));
  } else {
    snake.pop();
  }
  draw();
};

const gameOver = () => {
  gameState.value = 'gameover';
  clearInterval(gameInterval);
};

const draw = () => {
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx) return;

  // 清空画布
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 400, 400);

  // 画网格线 (辅助感)
  ctx.strokeStyle = '#f1f5f9';
  for(let i=0; i<=400; i+=20) {
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(400,i); ctx.stroke();
  }

  // 画食物
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(food.x * 20 + 2, food.y * 20 + 2, 16, 16, 4);
  ctx.fill();

  // 画蛇
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#4f46e5' : '#818cf8';
    ctx.beginPath();
    ctx.roundRect(part.x * 20 + 1, part.y * 20 + 1, 18, 18, index === 0 ? 6 : 4);
    ctx.fill();
  });
};

const handleKeydown = (e: KeyboardEvent) => {
  const keys: Record<string, {x: number, y: number}> = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };
  if (keys[e.key]) {
    const move = keys[e.key];
    // 禁止直接回头
    if (move.x !== -direction.x && move.y !== -direction.y) {
      nextDirection = move;
    }
    e.preventDefault();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  initGame();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  clearInterval(gameInterval);
});
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
      
      <div class="flex items-center gap-6">
        <div class="flex gap-4">
          <div class="text-center">
            <p class="text-[9px] font-bold text-slate-400 uppercase">Score</p>
            <p class="text-lg font-black text-indigo-600 leading-none">{{ score }}</p>
          </div>
          <div class="text-center">
            <p class="text-[9px] font-bold text-slate-400 uppercase">Best</p>
            <p class="text-lg font-black text-slate-400 leading-none">{{ highScore }}</p>
          </div>
        </div>
        <button 
          @click="gameState === 'playing' ? pauseGame() : startGame()"
          class="px-6 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          {{ gameState === 'playing' ? '暂停' : (gameState === 'gameover' ? '再来一局' : '开始游戏') }}
        </button>
      </div>
    </header>

    <div class="flex-1 flex items-center justify-center p-6">
      <div class="relative group">
        <canvas 
          ref="canvasRef" 
          width="400" 
          height="400" 
          class="bg-white rounded-2xl shadow-2xl border-4 border-white ring-1 ring-slate-200 overflow-hidden"
        ></canvas>

        <div v-if="gameState !== 'playing'" class="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/60 rounded-2xl flex flex-col items-center justify-center transition-all">
          <div v-if="gameState === 'gameover'" class="text-center animate-bounce">
            <p class="text-4xl mb-2">😵</p>
            <h3 class="text-xl font-black text-slate-800 uppercase tracking-tighter">Game Over</h3>
          </div>
          <div v-if="gameState === 'idle'" class="text-center">
            <p class="text-4xl mb-4 animate-pulse">🎮</p>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">使用方向键控制</p>
          </div>
          <button 
            @click="startGame" 
            class="mt-6 px-8 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:scale-105 transition-transform"
          >
            {{ gameState === 'paused' ? '继续游戏' : '立即开始' }}
          </button>
        </div>
      </div>

      <div class="ml-10 w-48 space-y-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">操作指南</h4>
          <div class="grid grid-cols-3 gap-1 mb-4">
            <div></div>
            <div class="p-2 border border-slate-100 rounded bg-slate-50 text-center text-xs">↑</div>
            <div></div>
            <div class="p-2 border border-slate-100 rounded bg-slate-50 text-center text-xs">←</div>
            <div class="p-2 border border-slate-100 rounded bg-slate-50 text-center text-xs">↓</div>
            <div class="p-2 border border-slate-100 rounded bg-slate-50 text-center text-xs">→</div>
          </div>
          <p class="text-[10px] text-slate-400 leading-relaxed font-medium">
            提示：随着分数增加，蛇的移动速度会越来越快。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
canvas {
  image-rendering: pixelated; /* 保持像素感 */
}
</style>