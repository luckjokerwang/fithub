<script setup>
import { onMounted } from 'vue'
import { useFitnessStore } from './stores/fitness'

import AppHeader from './components/AppHeader.vue'
import CoachBanner from './components/CoachBanner.vue'
import TodayRhythm from './components/TodayRhythm.vue'
import WorkoutView from './components/WorkoutView.vue'
import WikiView from './components/WikiView.vue'
import HeatmapView from './components/HeatmapView.vue'
import WeightView from './components/WeightView.vue'
import MealView from './components/MealView.vue'

import GuideModal from './components/GuideModal.vue'
import SwapModal from './components/SwapModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import WeightModal from './components/WeightModal.vue'
import IcsModal from './components/IcsModal.vue'

const store = useFitnessStore()

onMounted(() => {
  store.init()
})

const navTabs = [
  { id: 'today', icon: '🏋️', label: '今日训练' },
  { id: 'wiki', icon: '📚', label: '器械百科' },
  { id: 'heatmap', icon: '🟩', label: '打卡热力' },
  { id: 'weight', icon: '📈', label: '体重趋势' },
  { id: 'meal', icon: '🍱', label: '食堂5餐' }
]

function switchNavTab(tabId) {
  store.activeTab = tabId
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="app-container">
    <!-- Top Header -->
    <AppHeader />

    <!-- Coach Banner -->
    <CoachBanner />

    <!-- Today Rhythm (Shown on today tab) -->
    <TodayRhythm v-if="store.activeTab === 'today'" />

    <!-- Tab Panes -->
    <main class="main-content-area">
      <WorkoutView v-if="store.activeTab === 'today'" />
      <WikiView v-else-if="store.activeTab === 'wiki'" />
      <HeatmapView v-else-if="store.activeTab === 'heatmap'" />
      <WeightView v-else-if="store.activeTab === 'weight'" />
      <MealView v-else-if="store.activeTab === 'meal'" />
    </main>

    <!-- Floating Rest Timer Bar -->
    <div v-if="store.restTimer.active" class="floating-rest-timer">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="timer-countdown-badge">
          {{ store.restTimer.remainingSeconds }}s
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 0.84rem; font-weight: 800; color: #fff;">⏱️ 组间休息中</span>
          <span style="font-size: 0.7rem; color: #cbd5e1;">{{ store.restTimer.exerciseName }}</span>
        </div>
      </div>

      <div style="display: flex; gap: 6px;">
        <button class="btn-timer-ctrl" @click="store.addTimer30s">+30s</button>
        <button class="btn-timer-ctrl skip" @click="store.skipRestTimer">跳过</button>
      </div>
    </div>

    <!-- Bottom Navigation Dock -->
    <nav class="bottom-nav-bar">
      <button 
        v-for="tab in navTabs"
        :key="tab.id"
        class="nav-tab-item"
        :class="{ 'active': store.activeTab === tab.id }"
        @click="switchNavTab(tab.id)"
      >
        <span class="nav-tab-icon">{{ tab.icon }}</span>
        <span class="nav-tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Modals -->
    <GuideModal />
    <SwapModal />
    <SettingsModal />
    <WeightModal />
    <IcsModal />
  </div>
</template>

<style scoped>
.main-content-area {
  margin-top: 10px;
}
.floating-rest-timer {
  position: fixed;
  bottom: calc(75px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 540px;
  background: #2d2424;
  color: #fff;
  border-radius: var(--radius-pill);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  z-index: 150;
  animation: timerSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes timerSlideUp {
  from { transform: translate(-50%, 40px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
.timer-countdown-badge {
  background: var(--cute-coral);
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  min-width: 48px;
  text-align: center;
}
.btn-timer-ctrl {
  background: rgba(255, 255, 255, 0.18);
  border: none;
  color: #fff;
  border-radius: var(--radius-pill);
  padding: 5px 12px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-timer-ctrl.skip {
  background: #ef4444;
}
</style>
