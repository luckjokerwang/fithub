<script setup>
import { computed } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()
const todayInfo = computed(() => store.todayCycleInfo)
const isChecked = computed(() => !!(store.checkins[store.todayStr] && store.checkins[store.todayStr].done))
const exercises = computed(() => store.currentSlotExercises)
const todayStr = computed(() => store.todayStr)

const rhythmSteps = [
  { type: 'push', emoji: '🔥', label: '推日', sub: '胸/肩前/三头' },
  { type: 'pull', emoji: '⚡', label: '拉日', sub: '背/肩后/二头' },
  { type: 'rest', emoji: '💤', label: '休息日', sub: '超量恢复' },
  { type: 'legs', emoji: '🦵', label: '腿日', sub: '股四/腘绳/臀' }
]

function selectRhythm(type) {
  if (type !== 'rest') {
    store.currentWorkoutType = type
  }
}

function openGuide(ex) {
  store.guideModal.exercise = ex
  store.guideModal.visible = true
}

function openSwap(slotIdx, ex) {
  store.swapModal.type = store.currentWorkoutType
  store.swapModal.slotIdx = slotIdx
  store.swapModal.currentEx = ex
  store.swapModal.visible = true
}

function isSetDone(exId, setNum) {
  const daySets = store.sets[todayStr.value] || {}
  return !!daySets[`${exId}_${setNum}`]
}

function onToggleSet(ex, setNum) {
  store.toggleSet(todayStr.value, `${ex.id}_${setNum}`, ex.name)
}
</script>

<template>
  <div class="card-main">
    <!-- 今日训练节奏 Header -->
    <div class="card-header-clean">
      <div class="card-title-badge">
        <span class="card-title-text">📅 今日训练节奏</span>
        <span class="card-meta-pill">{{ store.todayStr }}</span>
      </div>
      <span style="font-size: 0.76rem; font-weight: 700; color: #16a34a;">
        🔥 连续 {{ store.streakDays }} 天
      </span>
    </div>

    <!-- 4步水平进度条 (4等分网格) -->
    <div class="cycle-flow-container">
      <div 
        v-for="step in rhythmSteps" 
        :key="step.type"
        class="cycle-step-item"
        :class="{ 'active': step.type === todayInfo.type }"
        @click="selectRhythm(step.type)"
      >
        <span class="cycle-step-name">{{ step.emoji }} {{ step.label }}</span>
        <span class="cycle-step-sub">{{ step.sub }}</span>
      </div>
    </div>

    <!-- 今日训练操作行 (左侧详情 + 右侧今日打卡按钮) -->
    <div class="today-action-box">
      <div class="today-details">
        <div class="today-workout-badge" :class="'badge-' + todayInfo.type">
          {{ todayInfo.emoji }} 今日：{{ todayInfo.label }}
        </div>
        <div class="today-summary-text">
          重点任务：{{ todayInfo.desc }}
        </div>
      </div>
      <button 
        class="btn-cute-main" 
        :class="{ 'done': isChecked }"
        @click="store.toggleTodayCheckin"
      >
        <span>{{ isChecked ? '✓' : '🐾' }}</span>
        <span>{{ isChecked ? '今日已完成' : '今日打卡' }}</span>
      </button>
    </div>

    <!-- 器械训练清单切换器 (3等分网格) -->
    <div style="margin-top: 4px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: 0.86rem; font-weight: 800; color: var(--text-title);">📋 器械训练清单</span>
        <span style="font-size: 0.72rem; color: #b45309; font-weight: 700; background: #fef3c7; padding: 1.5px 7px; border-radius: 999px;">
          好人松松定制 · 8~12RM
        </span>
      </div>
      <div class="split-segment-grid">
        <button 
          class="btn-split-tab" 
          :class="{ 'active-push': store.currentWorkoutType === 'push' }"
          @click="store.currentWorkoutType = 'push'"
        >
          🔥 推日
        </button>
        <button 
          class="btn-split-tab" 
          :class="{ 'active-pull': store.currentWorkoutType === 'pull' }"
          @click="store.currentWorkoutType = 'pull'"
        >
          ⚡ 拉日
        </button>
        <button 
          class="btn-split-tab" 
          :class="{ 'active-legs': store.currentWorkoutType === 'legs' }"
          @click="store.currentWorkoutType = 'legs'"
        >
          🦵 腿日
        </button>
      </div>
    </div>

    <!-- 动作卡片清单列表 -->
    <div class="exercise-list">
      <div 
        v-for="(ex, slotIdx) in exercises" 
        :key="ex.id"
        class="exercise-card"
      >
        <div class="ex-title-row">
          <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
            <span style="font-size: 1.05rem; font-weight: 800; color: var(--text-title); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ slotIdx + 1 }}. {{ ex.name }}
            </span>
            <button 
              class="btn-star-fav" 
              :title="store.isFavorite(ex.id) ? '已收藏，点击取消' : '点击收藏此动作'"
              @click.stop="store.toggleFavorite(ex.id)"
            >
              {{ store.isFavorite(ex.id) ? '⭐' : '☆' }}
            </button>
          </div>
          <span style="font-size: 0.74rem; color: var(--text-muted); flex-shrink: 0;">
            动作 {{ slotIdx + 1 }}/{{ exercises.length }}
          </span>
        </div>

        <span class="ex-en-sign">🏷️ 器械标牌：{{ ex.en }}</span>

        <!-- Badges Row -->
        <div class="ex-badges-row">
          <span class="pill-tag tag-target">🎯 {{ ex.muscle }}</span>
          <span class="pill-tag tag-equip">🏗️ {{ ex.equip }}</span>
          <span class="pill-tag tag-sets">📦 {{ ex.sets }}</span>
          <span class="pill-tag tag-reps">🔢 {{ ex.reps }}</span>
        </div>

        <!-- Two Action Buttons -->
        <div class="ex-action-row">
          <button class="btn-ex-action btn-ex-guide" @click="openGuide(ex)">
            <span>📖</span>
            <span>怎么做/看图解</span>
          </button>
          <button class="btn-ex-action btn-ex-swap" @click="openSwap(slotIdx, ex)">
            <span>🔄</span>
            <span>机器被占？换个动作</span>
          </button>
        </div>

        <!-- Beginner Cue Box -->
        <div class="ex-cue-box">
          💡 <strong>新手要领：</strong>{{ ex.cues || ex.feel }}
        </div>

        <!-- 4 Sets Buttons -->
        <div class="sets-grid-4">
          <div 
            v-for="s in 4" 
            :key="s"
            class="btn-set-pill"
            :class="{ 'done': isSetDone(ex.id, s) }"
            @click="onToggleSet(ex, s)"
          >
            <span>{{ isSetDone(ex.id, s) ? '✓ ' : '' }}第{{ s }}组</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
