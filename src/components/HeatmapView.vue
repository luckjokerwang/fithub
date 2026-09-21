<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

// Current viewing year and month (default to today: 2026-09)
const todayDate = new Date()
const viewYear = ref(todayDate.getFullYear())
const viewMonth = ref(todayDate.getMonth() + 1) // 1-indexed

// Color mode: 'split' (分化色) | 'github' (经典4阶绿)
const colorMode = ref('split')

// Selected cell for interactive inspection
const selectedDate = ref(store.todayStr)

// Touch swipe tracking
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e) {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }
}

function onTouchEnd(e) {
  if (e.changedTouches.length === 1) {
    const deltaX = e.changedTouches[0].clientX - touchStartX
    const deltaY = e.changedTouches[0].clientY - touchStartY
    // Only trigger if horizontal swipe is dominant and > 45px
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        nextMonth()
      } else {
        prevMonth()
      }
    }
  }
}

function prevMonth() {
  if (viewMonth.value === 1) {
    viewYear.value--
    viewMonth.value = 12
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 12) {
    viewYear.value++
    viewMonth.value = 1
  } else {
    viewMonth.value++
  }
}

function resetToCurrentMonth() {
  const d = new Date()
  viewYear.value = d.getFullYear()
  viewMonth.value = d.getMonth() + 1
  selectedDate.value = store.todayStr
}

const isCurrentMonthView = computed(() => {
  const d = new Date()
  return viewYear.value === d.getFullYear() && viewMonth.value === (d.getMonth() + 1)
})

const monthTitle = computed(() => {
  return `${viewYear.value}年 ${viewMonth.value}月`
})

// Generate calendar cells for viewYear and viewMonth
const monthCalendar = computed(() => {
  const y = viewYear.value
  const m = viewMonth.value
  const todayStr = store.todayStr
  const todayObj = new Date()
  todayObj.setHours(0, 0, 0, 0)

  // First day of month
  const firstDay = new Date(y, m - 1, 1)
  // Day of week: 0 is Sunday, 1 is Monday...
  let startWeekday = firstDay.getDay()
  // Convert to Monday = 0, Sunday = 6
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1

  // Total days in month
  const totalDays = new Date(y, m, 0).getDate()

  const days = []

  // Leading empty cells
  for (let i = 0; i < startWeekday; i++) {
    days.push({ empty: true, key: `empty-lead-${i}` })
  }

  // Days in month
  for (let d = 1; d <= totalDays; d++) {
    const cur = new Date(y, m - 1, d)
    cur.setHours(0, 0, 0, 0)
    const mStr = String(m).padStart(2, '0')
    const dStr = String(d).padStart(2, '0')
    const dateStr = `${y}-${mStr}-${dStr}`

    const isFuture = cur.getTime() > todayObj.getTime()
    const isToday = dateStr === todayStr
    const checkin = store.checkins[dateStr]
    const isDone = !!(checkin && checkin.done)

    // Calculate sets count
    const daySets = store.sets[dateStr] || {}
    const completedSets = Object.values(daySets).filter(Boolean).length

    // Intensity level (0-4) for GitHub mode
    let level = 0
    if (isDone) {
      if (completedSets >= 12) level = 4
      else if (completedSets >= 8) level = 3
      else if (completedSets >= 4) level = 2
      else level = 2 // default to level 2 if checked in
    }

    const cycleInfo = store.getCycleForDate(dateStr)

    // Normalize cycleType
    let cycleType = checkin?.type || cycleInfo.type
    if (!['push', 'pull', 'legs', 'rest'].includes(cycleType)) {
      cycleType = 'custom'
    }

    days.push({
      empty: false,
      dateStr,
      dayNum: d,
      weekday: cur.getDay() === 0 ? 6 : cur.getDay() - 1,
      isFuture,
      isToday,
      isDone,
      level,
      completedSets,
      cycleType,
      cycleLabel: cycleInfo.label,
      cycleEmoji: cycleInfo.emoji,
      cycleDesc: cycleInfo.desc,
      key: dateStr
    })
  }

  // Trailing empty cells to complete the last week row
  const remainder = days.length % 7
  if (remainder !== 0) {
    const need = 7 - remainder
    for (let i = 0; i < need; i++) {
      days.push({ empty: true, key: `empty-trail-${i}` })
    }
  }

  return days
})

// Statistics for the currently viewed month
const monthStats = computed(() => {
  const days = monthCalendar.value.filter(d => !d.empty)
  let totalDone = 0
  let pastDays = 0

  days.forEach(d => {
    if (!d.isFuture) {
      pastDays++
      if (d.isDone) totalDone++
    }
  })

  // Longest streak in this month
  let maxStreak = 0
  let tempStreak = 0
  days.forEach(d => {
    if (d.isDone) {
      tempStreak++
      if (tempStreak > maxStreak) maxStreak = tempStreak
    } else {
      tempStreak = 0
    }
  })

  const rate = pastDays > 0 ? Math.round((totalDone / pastDays) * 100) : 0

  return {
    totalDone,
    currentStreak: store.streakDays,
    maxStreak,
    rate
  }
})

// Selected cell info
const selectedCellInfo = computed(() => {
  for (const d of monthCalendar.value) {
    if (!d.empty && d.dateStr === selectedDate.value) {
      return d
    }
  }
  return null
})

function selectCell(cell) {
  if (cell.empty) return
  selectedDate.value = cell.dateStr
}

function toggleSelectedCheckin() {
  const dateStr = selectedDate.value
  if (!store.checkins[dateStr]) {
    const info = store.getCycleForDate(dateStr)
    store.checkins[dateStr] = { done: true, type: info.type }
  } else {
    delete store.checkins[dateStr]
  }
  // Immediate snapshot sync to cloud
  store.queuePushCloud()
}

onMounted(() => {
  resetToCurrentMonth()
})
</script>

<template>
  <div class="heatmap-view-container">
    <div class="heatmap-card">
      <!-- Minimalist Month Navigation Header (No Extra Tabs) -->
      <div class="month-header-bar">
        <div class="month-selector">
          <button class="btn-month-nav" @click="prevMonth" title="上一月">‹</button>
          <span class="month-title-text">{{ monthTitle }}</span>
          <button class="btn-month-nav" @click="nextMonth" title="下一月">›</button>
          <button 
            v-if="!isCurrentMonthView" 
            class="btn-back-current" 
            @click="resetToCurrentMonth"
            title="回到当前月"
          >
            回到本月
          </button>
        </div>

        <!-- Color Theme Switcher -->
        <div class="theme-toggle-group">
          <button 
            class="theme-btn" 
            :class="{ 'active': colorMode === 'split' }"
            @click="colorMode = 'split'"
            title="按训练部位分化色着色"
          >
            🎨 分化色
          </button>
          <button 
            class="theme-btn" 
            :class="{ 'active': colorMode === 'github' }"
            @click="colorMode = 'github'"
            title="经典 GitHub 4阶绿着色"
          >
            🟩 经典绿
          </button>
        </div>
      </div>

      <!-- 4 Metrics Strip for Current Month -->
      <div class="heatmap-stats-strip">
        <div class="heat-stat-card">
          <span class="heat-stat-val">{{ monthStats.totalDone }}</span>
          <span class="heat-stat-lbl">当月出勤 (天)</span>
        </div>
        <div class="heat-stat-card">
          <span class="heat-stat-val" style="color: var(--cute-coral);">{{ monthStats.currentStreak }}</span>
          <span class="heat-stat-lbl">当前连续 (天)</span>
        </div>
        <div class="heat-stat-card">
          <span class="heat-stat-val" style="color: #ea580c;">{{ monthStats.maxStreak }}</span>
          <span class="heat-stat-lbl">当月最长 (天)</span>
        </div>
        <div class="heat-stat-card">
          <span class="heat-stat-val" style="color: #16a34a;">{{ monthStats.rate }}%</span>
          <span class="heat-stat-lbl">出勤完成率</span>
        </div>
      </div>

      <!-- Swipeable Month Calendar Body -->
      <div 
        class="month-calendar-container"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <!-- Weekday Headers (一 到 日) -->
        <div class="weekday-header-grid">
          <span class="wh-col">一</span>
          <span class="wh-col">二</span>
          <span class="wh-col">三</span>
          <span class="wh-col">四</span>
          <span class="wh-col">五</span>
          <span class="wh-col weekend">六</span>
          <span class="wh-col weekend">日</span>
        </div>

        <!-- Month Days Grid -->
        <div class="month-days-grid">
          <div 
            v-for="cell in monthCalendar" 
            :key="cell.key"
            class="month-day-cell"
            :class="[
              cell.empty ? 'cell-empty-slot' : '',
              !cell.empty && cell.isDone ? (colorMode === 'github' ? ('gh-level-' + cell.level) : ('split-' + cell.cycleType)) : (!cell.empty ? 'split-empty' : ''),
              {
                'is-today': !cell.empty && cell.isToday,
                'is-selected': !cell.empty && cell.dateStr === selectedDate,
                'is-future': !cell.empty && cell.isFuture
              }
            ]"
            @click="selectCell(cell)"
          >
            <span v-if="!cell.empty" class="day-number">{{ cell.dayNum }}</span>
          </div>
        </div>

        <div class="swipe-hint-bar">
          <span>👈 左右滑动切换月份 👉</span>
        </div>
      </div>

      <!-- Color Legend Box (Clear Explanation) -->
      <div class="legend-card-box">
        <div v-if="colorMode === 'split'" class="split-legend-grid">
          <div class="leg-item">
            <span class="leg-dot split-push"></span>
            <span class="leg-label">推日 (胸/肩前/三头)</span>
          </div>
          <div class="leg-item">
            <span class="leg-dot split-pull"></span>
            <span class="leg-label">拉日 (背/肩后/二头)</span>
          </div>
          <div class="leg-item">
            <span class="leg-dot split-legs"></span>
            <span class="leg-label">腿日 (股四/腘绳/臀)</span>
          </div>
          <div class="leg-item">
            <span class="leg-dot split-rest"></span>
            <span class="leg-label">休息日 (超量恢复)</span>
          </div>
          <div class="leg-item">
            <span class="leg-dot split-empty"></span>
            <span class="leg-label">未练/未打卡</span>
          </div>
        </div>

        <div v-else class="github-legend-row">
          <span class="leg-text">打卡训练量：少</span>
          <div class="leg-sq-row">
            <span class="gh-sq gh-level-0"></span>
            <span class="gh-sq gh-level-1"></span>
            <span class="gh-sq gh-level-2"></span>
            <span class="gh-sq gh-level-3"></span>
            <span class="gh-sq gh-level-4"></span>
          </div>
          <span class="leg-text">多 (按组数)</span>
        </div>
      </div>

      <!-- Interactive Selected Date Detail Card -->
      <div v-if="selectedCellInfo" class="selected-day-card">
        <div class="sel-card-left">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="sel-date-text">{{ selectedCellInfo.dateStr }}</span>
            <span class="sel-weekday-tag">
              周{{ ['一','二','三','四','五','六','日'][selectedCellInfo.weekday] }}
              {{ selectedCellInfo.isToday ? '· 今天' : '' }}
            </span>
          </div>
          <div class="sel-desc-text">
            <span>{{ selectedCellInfo.cycleEmoji }} {{ selectedCellInfo.cycleLabel }}</span>
            <span style="color: var(--text-muted);">（{{ selectedCellInfo.cycleDesc }}）</span>
            <span v-if="selectedCellInfo.isDone" style="color: #16a34a; font-weight: 700;">
              · ✓ 已打卡 {{ selectedCellInfo.completedSets > 0 ? `(${selectedCellInfo.completedSets}组)` : '' }}
            </span>
            <span v-else-if="selectedCellInfo.isFuture" style="color: var(--text-muted);">
              · 未来待练
            </span>
            <span v-else style="color: #ea580c;">
              · ○ 未打卡
            </span>
          </div>
        </div>

        <button 
          v-if="!selectedCellInfo.isFuture"
          class="btn-sel-action"
          :class="{ 'done': selectedCellInfo.isDone }"
          @click="toggleSelectedCheckin"
        >
          <span>{{ selectedCellInfo.isDone ? '撤销打卡' : '补打卡' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heatmap-card {
  background: var(--bg-card);
  border: 2px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 14px;
  box-shadow: var(--shadow-card);
  width: 100%;
  box-sizing: border-box;
}

/* Month Navigation Header */
.month-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.month-title-text {
  font-size: 1.12rem;
  font-weight: 800;
  color: var(--text-title);
  white-space: nowrap;
}

.btn-month-nav {
  background: #fdfaf6;
  border: 1.5px solid var(--border-card);
  border-bottom: 2.5px solid var(--border-card-hover);
  border-radius: 8px;
  width: 28px;
  height: 28px;
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
  color: var(--text-body);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s ease;
}

.btn-month-nav:active {
  transform: translateY(1.5px);
  border-bottom-width: 1.5px;
}

.btn-back-current {
  background: var(--cute-coral-light);
  border: 1px solid var(--cute-coral);
  color: var(--cute-coral-dark);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

.theme-toggle-group {
  display: flex;
  background: #f4ede6;
  padding: 2.5px;
  border-radius: 999px;
  gap: 2px;
}

.theme-btn {
  border: none;
  background: transparent;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.theme-btn.active {
  background: #fff;
  color: var(--text-title);
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
}

/* 4 Metrics Strip */
.heatmap-stats-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 12px;
}

.heat-stat-card {
  background: #faf5ee;
  border: 1.5px solid #ebdcd0;
  border-radius: 12px;
  padding: 6px 2px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heat-stat-val {
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--text-title);
  line-height: 1.2;
}

.heat-stat-lbl {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
}

/* Month Calendar Grid */
.month-calendar-container {
  background: #fff;
  border: 1.5px solid #ebdcd0;
  border-radius: 16px;
  padding: 10px;
  margin-bottom: 12px;
  user-select: none;
  touch-action: pan-y;
}

.weekday-header-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  text-align: center;
  margin-bottom: 6px;
}

.wh-col {
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--text-muted);
  padding: 2px 0;
}

.wh-col.weekend {
  color: var(--cute-coral);
}

.month-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.month-day-cell {
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background-color: #f4ede6; /* Fallback default background prevents transparent disappear */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  position: relative;
  box-sizing: border-box;
}

.cell-empty-slot {
  background-color: transparent !important;
  cursor: default !important;
}

.month-day-cell:hover:not(.cell-empty-slot):not(.is-future) {
  transform: scale(1.08);
  z-index: 5;
}

.day-number {
  font-size: 0.84rem;
  font-weight: 800;
  color: var(--text-body);
}

/* Today Outline */
.month-day-cell.is-today {
  outline: 2.5px solid #2d2424;
  outline-offset: -1px;
  z-index: 4;
}

/* Selected Ring */
.month-day-cell.is-selected {
  box-shadow: 0 0 0 3px rgba(255, 107, 87, 0.45);
  z-index: 6;
}

/* Future Day */
.month-day-cell.is-future {
  opacity: 0.28;
  cursor: default;
}

/* Colors: Split Colors (推/拉/腿/休/自) */
.split-empty {
  background-color: #f4ede6 !important;
}
.split-empty .day-number {
  color: #716260;
}

.split-push {
  background-color: #ff6b57 !important;
}
.split-push .day-number {
  color: #fff !important;
}

.split-pull {
  background-color: #6366f1 !important;
}
.split-pull .day-number {
  color: #fff !important;
}

.split-legs {
  background-color: #f59e0b !important;
}
.split-legs .day-number {
  color: #fff !important;
}

.split-rest {
  background-color: #10b981 !important;
}
.split-rest .day-number {
  color: #fff !important;
}

.split-custom {
  background-color: #ec4899 !important;
}
.split-custom .day-number {
  color: #fff !important;
}

/* Colors: GitHub 4-Level Green */
.gh-level-0 {
  background-color: #f4ede6 !important;
}
.gh-level-0 .day-number {
  color: #716260;
}

.gh-level-1 {
  background-color: #9be9a8 !important;
}
.gh-level-1 .day-number {
  color: #166534 !important;
}

.gh-level-2 {
  background-color: #40c463 !important;
}
.gh-level-2 .day-number {
  color: #fff !important;
}

.gh-level-3 {
  background-color: #30a14e !important;
}
.gh-level-3 .day-number {
  color: #fff !important;
}

.gh-level-4 {
  background-color: #216e39 !important;
}
.gh-level-4 .day-number {
  color: #fff !important;
}

.swipe-hint-bar {
  text-align: center;
  font-size: 0.68rem;
  color: #a89f9e;
  margin-top: 8px;
}

/* Legend Card Box */
.legend-card-box {
  background: #faf5ee;
  border: 1.5px solid #ebdcd0;
  border-radius: 12px;
  padding: 8px 10px;
  margin-bottom: 12px;
}

.split-legend-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.leg-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.leg-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.leg-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-body);
}

.github-legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.leg-text {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

.leg-sq-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.gh-sq {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

/* Selected Date Detail Card */
.selected-day-card {
  background: #fff8f5;
  border: 1.5px solid #fbdcd5;
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sel-card-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sel-date-text {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-title);
}

.sel-weekday-tag {
  font-size: 0.72rem;
  color: var(--cute-coral);
  font-weight: 700;
  background: #fff;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid #fecdd3;
}

.sel-desc-text {
  font-size: 0.75rem;
  color: var(--text-body);
  line-height: 1.35;
}

.btn-sel-action {
  background: var(--cute-coral);
  color: #fff;
  border: 1.5px solid var(--cute-coral-dark);
  border-bottom: 2.5px solid var(--cute-coral-dark);
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: all 0.1s ease;
}

.btn-sel-action.done {
  background: #f5f5f4;
  color: #78716c;
  border-color: #d6d3d1;
  border-bottom-color: #a8a29e;
}

.btn-sel-action:active {
  transform: translateY(1.5px);
  border-bottom-width: 1.5px;
}
</style>
