<script setup>
import { computed } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()
const todayInfo = computed(() => store.todayCycleInfo)
const isChecked = computed(() => !!(store.checkins[store.todayStr] && store.checkins[store.todayStr].done))

const rhythmSteps = [
  { type: 'push', emoji: '🔥', label: '推日', sub: '胸/肩前/三头' },
  { type: 'pull', emoji: '⚡', label: '拉日', sub: '背/肩后/二头' },
  { type: 'rest', emoji: '💤', label: '休息日', sub: '超量恢复' },
  { type: 'legs', emoji: '🦵', label: '腿日', sub: '股四/腘绳/臀' }
]

function selectRhythm(type) {
  if (type !== 'rest') {
    store.currentWorkoutType = type
    store.activeTab = 'today'
  }
}
</script>

<template>
  <div class="today-workout-box">
    <div class="card-header-row">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span class="card-title-text">📅 今日训练节奏</span>
        <span class="date-chip">{{ store.todayStr }}</span>
      </div>
      <span class="streak-badge">
        🔥 连续 {{ store.streakDays }} 天
      </span>
    </div>

    <!-- 4-step rhythm selector -->
    <div class="cycle-track-grid">
      <div 
        v-for="step in rhythmSteps" 
        :key="step.type"
        class="cycle-step-item"
        :class="{ 'active': step.type === todayInfo.type }"
        @click="selectRhythm(step.type)"
      >
        <span class="step-title">{{ step.emoji }} {{ step.label }}</span>
        <span class="step-sub">{{ step.sub }}</span>
      </div>
    </div>

    <!-- Summary strip & checkin button -->
    <div class="today-summary-bar">
      <div class="today-summary-left">
        <span class="today-badge" :class="'badge-' + todayInfo.type">
          {{ todayInfo.emoji }} 今日：{{ todayInfo.label }}
        </span>
        <span class="today-desc">重点任务：{{ todayInfo.desc }}</span>
      </div>

      <button 
        class="btn-cute-checkin"
        :class="{ 'checked': isChecked }"
        @click="store.toggleTodayCheckin"
      >
        <span>🐾</span>
        <span>{{ isChecked ? '今日已打卡' : '今日打卡' }}</span>
      </button>
    </div>
  </div>
</template>
