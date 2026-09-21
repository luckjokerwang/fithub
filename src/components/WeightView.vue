<script setup>
import { computed } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()
const weights = computed(() => store.weights)

// Calculate SVG polyline points
const chartData = computed(() => {
  if (weights.value.length < 2) return null

  const vals = weights.value.map(w => w.weight)
  const minW = Math.min(...vals) - 0.5
  const maxW = Math.max(...vals) + 0.5
  const rangeW = maxW - minW || 1

  const width = 500
  const height = 150
  const padX = 35
  const padY = 25
  const usableW = width - padX * 2
  const usableH = height - padY * 2

  const points = weights.value.map((w, idx) => {
    const x = padX + (idx / (weights.value.length - 1)) * usableW
    const y = height - padY - ((w.weight - minW) / rangeW) * usableH
    return { x, y, ...w }
  })

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${points[0].x},${height - padY} ` + polyPoints + ` ${points[points.length - 1].x},${height - padY}`

  return { width, height, points, polyPoints, areaPoints }
})
</script>

<template>
  <div class="weight-view-container">
    <div class="weight-card">
      <div class="card-header-row" style="margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="card-title-text">📈 体重趋势跟踪</span>
        </div>
        <button class="btn-cute-main" style="padding: 5px 12px; font-size: 0.76rem;" @click="store.weightModal.visible = true">
          ＋ 记一次体重
        </button>
      </div>

      <!-- SVG Chart -->
      <div v-if="chartData" class="chart-box">
        <svg :viewBox="`0 0 ${chartData.width} ${chartData.height}`" class="weight-svg-chart">
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ff6b57" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#ff6b57" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <polygon :points="chartData.areaPoints" fill="url(#weightGrad)" />
          <polyline :points="chartData.polyPoints" fill="none" stroke="var(--cute-coral)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <g v-for="p in chartData.points" :key="p.date">
            <circle :cx="p.x" :cy="p.y" r="5" fill="#fff" stroke="var(--cute-coral)" stroke-width="2.5" />
            <text :x="p.x" :y="p.y - 8" text-anchor="middle" font-size="11" font-weight="700" fill="#2d2424">{{ p.weight }}</text>
          </g>
        </svg>
      </div>
      <div v-else class="chart-placeholder">
        暂无足够历史体重数据，点击上方“＋ 记一次体重”记录今天体重吧！
      </div>

      <!-- Recent Records List -->
      <div class="weight-records-list">
        <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-title); margin-bottom: 8px;">
          📝 历史记录明细
        </div>
        <div 
          v-for="w in [...weights].reverse()" 
          :key="w.date"
          class="weight-record-item"
        >
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-title);">{{ w.date }}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">{{ w.note || '无备注' }}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.95rem; font-weight: 800; color: var(--cute-coral-dark);">{{ w.weight }} kg</span>
            <button class="btn-del-weight" @click="store.deleteWeight(w.date)">✕</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weight-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 16px 14px;
}
.chart-box {
  width: 100%;
  height: 160px;
  margin-bottom: 16px;
}
.weight-svg-chart {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.chart-placeholder {
  text-align: center;
  padding: 30px;
  color: var(--text-muted);
  font-size: 0.82rem;
}
.weight-records-list {
  border-top: 1px dashed var(--border-card);
  padding-top: 12px;
}
.weight-record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #fdfaf6;
  border-radius: var(--radius-btn);
  margin-bottom: 6px;
}
.btn-del-weight {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 2px 6px;
}
</style>
