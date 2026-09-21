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
      <div class="bear-avatar-box" @click="onAvatarClick" title="戳一戳冲浪小熊">
        <img src="/logo_round.png" alt="冲浪小熊" class="bear-avatar" onerror="this.src='/logo.png'">
        <span class="avatar-paw-badge">🐾</span>
      </div>
      <div class="header-info">
        <div class="header-title-row">
          <span class="app-brand">FitHub</span>
        </div>
        <span class="user-subinfo">{{ store.profile.name }} · {{ store.profile.height }}cm / {{ store.profile.weight }}kg</span>
      </div>
    </div>

    <div class="header-actions">
      <!-- Sync Pill Badge -->
      <button 
        class="btn-icon-pill sync-btn-cloud" 
        :class="{ 'syncing': store.syncStatus === 'syncing' }"
        @click="store.fetchCloudState"
        title="点击同步多端最新数据"
      >
        <span>☁️</span>
        <span class="btn-text-hide-mobile">{{ store.syncLabel }}</span>
      </button>

      <!-- Calendar Button -->
      <button class="btn-icon-pill" @click="store.icsModal.visible = true" title="导出日历订阅">
        <span>📅</span>
        <span class="btn-text-hide-mobile">日历</span>
      </button>

      <!-- Settings Button -->
      <button class="btn-icon-pill" @click="store.settingsModal.visible = true" title="设置与备份">
        <span>⚙️</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
@media (max-width: 480px) {
  .header-bar {
    padding: 8px 10px;
    gap: 6px;
  }
  .bear-avatar-box, .bear-avatar {
    width: 38px;
    height: 38px;
  }
  .app-brand {
    font-size: 1.05rem;
  }
  .user-subinfo {
    max-width: 120px;
    font-size: 0.68rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .btn-icon-pill {
    padding: 4px 6px;
    font-size: 0.72rem;
    gap: 2px;
  }
}

@media (max-width: 390px) {
  .btn-text-hide-mobile {
    display: none;
  }
  .user-subinfo {
    max-width: 95px;
  }
}
</style>
