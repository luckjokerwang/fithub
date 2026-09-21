<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()
const scrollContainerRef = ref(null)

// Color mode: 'split' (推/拉/腿/休) or 'github' (经典4阶绿色)
const colorMode = ref('split') // 'split' | 'github'

// Selected cell for interactive inspection
const selectedDate = ref(store.todayStr)

const WEEKS_COUNT = 16
const DAYS_PER_WEEK = 7
const TOTAL_DAYS = WEEKS_COUNT * DAYS_PER_WEEK // 112 days

const weekdayLabels = [
  { label: '一', row: 0 },
  { label: '三', row: 2 },
  { label: '五', row: 4 },
  { label: '日', row: 6 }
]

// 16-week matrix calculation
const calendarData = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = store.todayStr

  // End on current week's Sunday
  const dayOfWeek = today.getDay() // 0 is Sunday, 1 is Monday...
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + daysToSunday)

  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - TOTAL_DAYS + 1)

  const weeks = []
  let prevMonth = -1

  for (let w = 0; w < WEEKS_COUNT; w++) {
    const days = []
    let monthLabel = ''

    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const cur = new Date(startDate)
      cur.setDate(startDate.getDate() + w * 7 + d)
      cur.setHours(0, 0, 0, 0)

      const y = cur.getFullYear()
      const m = cur.getMonth()
      const mStr = String(m + 1).padStart(2, '0')
      const dStr = String(cur.getDate()).padStart(2, '0')
      const dateStr = `${y}-${mStr}-${dStr}`

      // Check if month changes in this week
      if (m !== prevMonth) {
        prevMonth = m
        monthLabel = `${m + 1}月`
      }

      const isFuture = cur.getTime() > today.getTime()
      const isToday = dateStr === todayStr
      const checkin = store.checkins[dateStr]
      const isDone = !!(checkin && checkin.done)

      // Calculate sets count
      const daySets = store.sets[dateStr] || {}
      const completedSets = Object.values(daySets).filter(Boolean).length

      // Intensity level (0-4)
      let level = 0
      if (isDone) {
        if (completedSets >= 12) level = 4
        else if (completedSets >= 8) level = 3
        else if (completedSets >= 4) level = 2
        else level = 2 // default to level 2 if checked in
      }

      const cycleInfo = store.getCycleForDate(dateStr)

      days.push({
        dateStr,
        dayNum: cur.getDate(),
        month: m + 1,
        dayOfWeek: d, // 0: Mon, 6: Sun
        isFuture,
        isToday,
        isDone,
        level,
        completedSets,
        cycleType: checkin?.type || cycleInfo.type,
        cycleLabel: cycleInfo.label,
        cycleEmoji: cycleInfo.emoji,
        cycleDesc: cycleInfo.desc
      })
    }

    weeks.push({
      weekIndex: w,
      monthLabel,
      days
    })
  }

  return { weeks, startDate, endDate }
})

// Statistics
const stats = computed(() => {
  const weeks = calendarData.value.weeks
  let totalDone = 0
  let pastDays = 0
  const allDays = []

  weeks.forEach(w => {
    w.days.forEach(d => {
      allDays.push(d)
      if (!d.isFuture) {
        pastDays++
        if (d.isDone) totalDone++
      }
    })
  })

  // Calculate longest streak
  let maxStreak = 0
  let tempStreak = 0
  allDays.forEach(d => {
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
  for (const w of calendarData.value.weeks) {
    for (const d of w.days) {
      if (d.dateStr === selectedDate.value) {
        return d
      }
    }
  }
  return null
})

function selectCell(cell) {
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
  store.queuePushCloud()
}

// Auto scroll to right end on mount
onMounted(() => {
  nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollLeft = scrollContainerRef.value.scrollWidth
    }
  })
})
</script>

<template>
  <div class="heatmap-view-container">
    <div class="heatmap-card">
      <!-- Title & Theme Toggle Header -->
      <div class="heatmap-header">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="card-title-text">🟩 训练打卡热力图</span>
          <span class="card-meta-pill">112天 / 16周</span>
        </div>

        <div class="theme-toggle-group">
          <button 
            class="theme-btn" 
            :class="{ 'active': colorMode === 'split' }"
            @click="colorMode = 'split'"
            title="按训练分化部位着色"
          >
            🎨 分化色
          </button>
          <button 
            class="theme-btn" 
            :class="{ 'active': colorMode === 'github' }"
            @click="colorMode = 'github'"
            title="经典 GitHub 原谅绿4阶强度着色"
          >
            🟩 GitHub绿
          </button>
        </div>
      </div>

      <!-- 4-Stat Metric Strip -->
      <div class="heatmap-stats-strip">
        <div class="heat-stat-card">
          <span class="heat-stat-val">{{ stats.totalDone }}</span>
          <span class="heat-stat-lbl">累计出勤 (天)</span>
        </div>
        <div class="heat-stat-card">
          <span class="heat-stat-val" style="color: var(--cute-coral);">{{ stats.currentStreak }}</span>
          <span class="heat-stat-lbl">当前连续 (天)</span>
        </div>
        <div class="heat-stat-card">
          <span class="heat-stat-val" style="color: #ea580c;">{{ stats.maxStreak }}</span>
          <span class="heat-stat-lbl">最长连续 (天)</span>
        </div>
        <div class="heat-stat-card">
          <span class="heat-stat-val" style="color: #16a34a;">{{ stats.rate }}%</span>
          <span class="heat-stat-lbl">打卡出勤率</span>
        </div>
      </div>

      <!-- GitHub-Style Contribution Calendar -->
      <div class="github-calendar-wrapper" ref="scrollContainerRef">
        <div class="github-calendar-content">
          <!-- Month Labels Header Row -->
          <div class="month-labels-row">
            <div class="month-label-spacer"></div>
            <div class="month-labels-track">
              <div 
                v-for="week in calendarData.weeks" 
                :key="'m-' + week.weekIndex" 
                class="month-col"
              >
                <span v-if="week.monthLabel" class="month-text">{{ week.monthLabel }}</span>
              </div>
            </div>
          </div>

          <!-- Main Grid: Left Y-Axis Weekday Labels + 16 Week Columns -->
          <div class="calendar-body-row">
            <!-- Weekday Y-Axis -->
            <div class="weekday-labels-col">
              <span class="weekday-label" style="grid-row: 1;">一</span>
              <span class="weekday-label" style="grid-row: 3;">三</span>
              <span class="weekday-label" style="grid-row: 5;">五</span>
              <span class="weekday-label" style="grid-row: 7;">日</span>
            </div>

            <!-- 16 Week Columns -->
            <div class="weeks-grid-track">
              <div 
                v-for="week in calendarData.weeks" 
                :key="'w-' + week.weekIndex"
                class="week-column"
              >
                <div 
                  v-for="day in week.days" 
                  :key="day.dateStr"
                  class="day-square"
                  :class="[
                    colorMode === 'github' ? ('gh-level-' + (day.isDone ? day.level : 0)) : ('split-' + (day.isDone ? day.cycleType : 'empty')),
                    {
                      'is-today': day.isToday,
                      'is-selected': day.dateStr === selectedDate,
                      'is-future': day.isFuture
                    }
                  ]"
                  @click="selectCell(day)"
                ></div>
              </div>
            </div>
          </div>

          <!-- Bottom Legend Strip -->
          <div class="calendar-legend-row">
            <span class="legend-hint">💡 点击任意格子查看详情或补卡/撤卡</span>
            <div class="legend-scale">
              <span class="legend-text">少</span>
              <div class="legend-sq" :class="colorMode === 'github' ? 'gh-level-0' : 'split-empty'"></div>
              <div class="legend-sq" :class="colorMode === 'github' ? 'gh-level-1' : 'split-push-light'"></div>
              <div class="legend-sq" :class="colorMode === 'github' ? 'gh-level-2' : 'split-pull'"></div>
              <div class="legend-sq" :class="colorMode === 'github' ? 'gh-level-3' : 'split-legs'"></div>
              <div class="legend-sq" :class="colorMode === 'github' ? 'gh-level-4' : 'split-push'"></div>
              <span class="legend-text">多</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Selected Date Detail Card -->
      <div v-if="selectedCellInfo" class="selected-day-card">
        <div class="sel-card-left">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="sel-date-text">{{ selectedCellInfo.dateStr }}</span>
            <span class="sel-weekday-tag">
              周{{ ['一','二','三','四','五','六','日'][selectedCellInfo.dayOfWeek] }}
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

.heatmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
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

/* GitHub Contribution Calendar Grid */
.github-calendar-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 6px 0;
  margin-bottom: 10px;
  scrollbar-width: thin;
  scrollbar-color: #ebdcd0 transparent;
}

.github-calendar-wrapper::-webkit-scrollbar {
  height: 5px;
}
.github-calendar-wrapper::-webkit-scrollbar-thumb {
  background: #ebdcd0;
  border-radius: 999px;
}

.github-calendar-content {
  width: max-content;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 2px;
}

/* Month Labels Row */
.month-labels-row {
  display: flex;
  align-items: center;
  height: 16px;
  margin-bottom: 4px;
}

.month-label-spacer {
  width: 16px;
  flex-shrink: 0;
}

.month-labels-track {
  display: flex;
  gap: 3.5px;
}

.month-col {
  width: 12px;
  position: relative;
}

.month-text {
  position: absolute;
  left: 0;
  top: -2px;
  font-size: 9px;
  font-weight: 700;
  color: #8c7e7d;
  white-space: nowrap;
}

/* Calendar Body Row (Left Y-Axis + 16 Columns) */
.calendar-body-row {
  display: flex;
  gap: 4px;
}

.weekday-labels-col {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3.5px;
  width: 12px;
  text-align: right;
  flex-shrink: 0;
}

.weekday-label {
  font-size: 9px;
  line-height: 12px;
  font-weight: 700;
  color: #a39493;
}

.weeks-grid-track {
  display: flex;
  gap: 3.5px;
}

.week-column {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3.5px;
  width: 12px;
}

/* Day Square: Pure clean flat pixel style (NO numbers) */
.day-square {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.1s ease, outline-color 0.1s ease;
  position: relative;
}

.day-square:hover:not(.is-future) {
  transform: scale(1.25);
  z-index: 10;
}

.day-square.is-future {
  opacity: 0.22;
  cursor: default;
}

.day-square.is-today {
  outline: 2px solid #2d2424;
  outline-offset: 1px;
  z-index: 5;
}

.day-square.is-selected {
  outline: 2px solid var(--cute-coral);
  outline-offset: 1.5px;
  z-index: 6;
}

/* Colors: GitHub Classic 4-Level Green */
.gh-level-0 { background: #ebdcd0; }
.gh-level-1 { background: #9be9a8; }
.gh-level-2 { background: #40c463; }
.gh-level-3 { background: #30a14e; }
.gh-level-4 { background: #216e39; }

/* Colors: Cute Workout Split Mode */
.split-empty { background: #ebdcd0; }
.split-push { background: #ff6b57; }
.split-push-light { background: #ffaa99; }
.split-pull { background: #6366f1; }
.split-legs { background: #f59e0b; }
.split-rest { background: #10b981; }

/* Legend Row */
.calendar-legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.7rem;
  color: var(--text-muted);
  gap: 8px;
}

.legend-hint {
  font-size: 0.68rem;
}

.legend-scale {
  display: flex;
  align-items: center;
  gap: 3px;
}

.legend-sq {
  width: 9px;
  height: 9px;
  border-radius: 2px;
}

.legend-text {
  font-size: 0.65rem;
  padding: 0 2px;
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
  font-size: 0.88rem;
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
  padding: 6px 12px;
  font-size: 0.76rem;
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
