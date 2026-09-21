<script setup>
import { computed } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

// Generate 112 days (16 weeks x 7 days) ending on the current week's Sunday
const heatmapCells = computed(() => {
  const daysToShow = 112
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = store.todayStr

  const dayOfWeek = today.getDay() // 0 is Sunday
  const endOffset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + endOffset)

  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - daysToShow + 1)

  const cells = []
  for (let i = 0; i < daysToShow; i++) {
    const cur = new Date(startDate)
    cur.setDate(startDate.getDate() + i)
    cur.setHours(0, 0, 0, 0)

    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    const isFuture = cur.getTime() > today.getTime()
    const isToday = dateStr === todayStr
    const checkin = store.checkins[dateStr]
    const isDone = !!(checkin && checkin.done)

    cells.push({
      dateStr,
      dayNum: d,
      isFuture,
      isToday,
      isDone,
      type: checkin?.type || 'rest'
    })
  }
  return cells
})

function onCellClick(cell) {
  if (cell.isFuture) return
  if (!store.checkins[cell.dateStr]) {
    const info = store.getCycleForDate(cell.dateStr)
    store.checkins[cell.dateStr] = { done: true, type: info.type }
  } else {
    delete store.checkins[cell.dateStr]
  }
  store.queuePushCloud()
}
</script>

<template>
  <div class="heatmap-view-container">
    <div class="heatmap-card">
      <div class="card-header-row" style="margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="card-title-text">🟩 112天训练热力图</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--text-muted);">
          <span style="display: inline-block; width: 10px; height: 10px; background: #e2e8f0; border-radius: 2px;"></span> 休息
          <span style="display: inline-block; width: 10px; height: 10px; background: var(--cute-coral); border-radius: 2px;"></span> 打卡
        </div>
      </div>

      <!-- Centered Symmetric Grid -->
      <div class="heatmap-grid-wrap">
        <div class="heatmap-grid">
          <div 
            v-for="cell in heatmapCells"
            :key="cell.dateStr"
            class="heatmap-cell"
            :class="{
              'done': cell.isDone,
              'today': cell.isToday,
              'disabled': cell.isFuture
            }"
            :title="cell.isFuture ? `${cell.dateStr} (未到日期)` : `${cell.dateStr} ${cell.isDone ? '已打卡' : '未打卡'}`"
            @click="onCellClick(cell)"
          >
            <span class="cell-day">{{ cell.dayNum }}</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 14px; font-size: 0.75rem; color: var(--text-muted); text-align: center;">
        💡 绿色边框为今日，灰暗格子为未来日期（防误触不可点击），点击历史日期可随时补卡/撤卡。
      </div>
    </div>
  </div>
</template>

<style scoped>
.heatmap-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 16px 14px;
}
.heatmap-grid-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
  padding: 4px 0;
}
.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 5px;
  width: 100%;
  max-width: 540px;
}
@media (max-width: 480px) {
  .heatmap-grid {
    grid-template-columns: repeat(14, 1fr);
    gap: 4px;
  }
}
.heatmap-cell {
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  position: relative;
}
.heatmap-cell:hover:not(.disabled) {
  transform: scale(1.15);
  z-index: 2;
}
.heatmap-cell.done {
  background: var(--cute-coral);
  border-color: var(--cute-coral-dark);
  color: #fff;
  box-shadow: 0 2px 6px rgba(255, 107, 87, 0.3);
}
.heatmap-cell.today {
  border: 2px solid #2d2424;
}
.heatmap-cell.disabled {
  opacity: 0.25;
  cursor: not-allowed;
  pointer-events: none;
}
.cell-day {
  font-size: 8px;
  font-weight: 700;
  color: inherit;
}
</style>
