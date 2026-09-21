<script setup>
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

function onAvatarClick() {
  const quotes = store.quotes[store.todayCycleInfo.type] || store.quotes.push
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
  alert(`🐾 冲浪小熊教练：“${randomQuote}”`)
}
</script>

<template>
  <header class="header-bar">
    <div class="header-left">
      <div class="bear-avatar-box" @click="onAvatarClick" title="点击听小熊打气">
        <img src="/logo.png" alt="小熊头像" class="bear-avatar" onerror="this.src='/logo_round.png'">
        <span class="avatar-paw-badge">🐾</span>
      </div>
      <div class="header-info">
        <div class="header-title-row">
          <span class="app-brand">FitHub</span>
        </div>
        <div class="user-subinfo">
          {{ store.profile.name }} · {{ store.profile.height }}cm / {{ store.profile.weight }}kg
        </div>
      </div>
    </div>

    <div class="header-actions">
      <!-- Sync Pill Badge -->
      <button 
        class="btn-icon-pill" 
        :class="{ 'syncing': store.syncStatus === 'syncing' }"
        style="color: var(--cute-mint-dark); background: var(--cute-mint-light); border-color: #a7f3d0;"
        @click="store.fetchCloudState"
        title="点击立即与云端同步"
      >
        <span>☁️</span>
        <span>{{ store.syncLabel }}</span>
      </button>

      <!-- Calendar Button -->
      <button class="btn-icon-pill" @click="store.icsModal.visible = true">
        <span>📅</span>
        <span>日历</span>
      </button>

      <!-- Settings Button -->
      <button class="btn-icon-pill" style="padding: 5px 8px;" @click="store.settingsModal.visible = true">
        <span>⚙️</span>
      </button>
    </div>
  </header>
</template>
