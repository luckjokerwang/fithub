<script setup>
import { computed } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()
const exercises = computed(() => store.currentSlotExercises)
const todayStr = computed(() => store.todayStr)

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
  <div class="workout-view-container">
    <!-- Header with 3 Tabs -->
    <div class="workout-header-card">
      <div class="workout-header-top">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 0.92rem; font-weight: 800; color: var(--text-title);">📋 器械训练清单</span>
        </div>
        <span class="pill-tag tag-target" style="font-size: 0.7rem; font-weight: 700;">
          增肌定制 · 8~12RM
        </span>
      </div>

      <!-- 3 split tabs -->
      <div class="workout-tabs-row">
        <button 
          class="workout-tab-btn" 
          :class="{ 'active': store.currentWorkoutType === 'push' }"
          @click="store.currentWorkoutType = 'push'"
        >
          <span>🔥</span>
          <span>推日</span>
        </button>
        <button 
          class="workout-tab-btn" 
          :class="{ 'active': store.currentWorkoutType === 'pull' }"
          @click="store.currentWorkoutType = 'pull'"
        >
          <span>⚡</span>
          <span>拉日</span>
        </button>
        <button 
          class="workout-tab-btn" 
          :class="{ 'active': store.currentWorkoutType === 'legs' }"
          @click="store.currentWorkoutType = 'legs'"
        >
          <span>🦵</span>
          <span>腿日</span>
        </button>
      </div>
    </div>

    <!-- Exercise Cards List -->
    <div class="exercise-cards-list">
      <div 
        v-for="(ex, idx) in exercises" 
        :key="ex.id"
        class="exercise-card"
      >
        <!-- Card Title & Action -->
        <div class="ex-title-row">
          <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
            <span style="font-size: 1rem; font-weight: 800; color: var(--text-title); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ idx + 1 }}. {{ ex.name }}
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
            动作 {{ idx + 1 }}/{{ exercises.length }}
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
          <button class="btn-ex-action btn-ex-swap" @click="openSwap(idx, ex)">
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
