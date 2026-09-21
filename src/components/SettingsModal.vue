<script setup>
import { ref } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

function close() {
  store.settingsModal.visible = false
}

const editName = ref(store.profile.name)
const editHeight = ref(store.profile.height)
const editWeight = ref(store.profile.weight)
const selectedCycleType = ref(store.todayCycleInfo.type)

function saveProfile() {
  store.profile.name = editName.value.trim() || '学员'
  store.profile.height = Number(editHeight.value) || 175
  store.profile.weight = Number(editWeight.value) || 58.0
  store.saveLocal()
  alert('✅ 个人信息已保存！')
}

function calibrateTodayCycle() {
  // Find which index in CYCLE_9DAYS corresponds to selectedCycleType
  // CYCLE_9DAYS has types: push(0), pull(1), rest(2), legs(3), push(4), rest(5), pull(6), legs(7), rest(8)
  const targetType = selectedCycleType.value
  let targetIndex = 0
  if (targetType === 'push') targetIndex = 0
  else if (targetType === 'pull') targetIndex = 1
  else if (targetType === 'rest') targetIndex = 2
  else if (targetType === 'legs') targetIndex = 3

  // We want: today diffDays % 9 == targetIndex
  // By setting baseDateStr = today - targetIndex days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const newBase = new Date(today)
  newBase.setDate(today.getDate() - targetIndex)

  const y = newBase.getFullYear()
  const m = String(newBase.getMonth() + 1).padStart(2, '0')
  const d = String(newBase.getDate()).padStart(2, '0')
  store.baseDateStr = `${y}-${m}-${d}`

  store.queuePushCloud()
  alert(`✅ 训练节奏已校准！今天已设置为【${targetType === 'push' ? '推日' : targetType === 'pull' ? '拉日' : targetType === 'legs' ? '腿日' : '休息日'}】。`)
}

function exportBackup() {
  const data = {
    profile: store.profile,
    checkins: store.checkins,
    weights: store.weights,
    sets: store.sets,
    custom_slots: store.custom_slots,
    favorites: store.favorites,
    baseDateStr: store.baseDateStr
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fithub_backup_${store.todayStr}.json`
  a.click()
}
</script>

<template>
  <div 
    v-if="store.settingsModal.visible"
    class="modal-overlay active"
    @click.self="close"
  >
    <div class="modal-box">
      <div class="modal-title">
        <span>⚙️ 系统设置与个人资料</span>
        <button class="btn-close-modal" @click="close">×</button>
      </div>

      <!-- User Profile Settings -->
      <div class="settings-section">
        <div class="guide-sec-title">👤 个人昵称与身体数据 (本地私密存储)</div>
        <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted);">昵称</label>
            <input v-model="editName" type="text" class="settings-input">
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted);">身高 (cm)</label>
            <input v-model="editHeight" type="number" class="settings-input">
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted);">体重 (kg)</label>
            <input v-model="editWeight" type="number" step="0.1" class="settings-input">
          </div>
        </div>
        <button class="btn-cute-main" style="width: 100%; justify-content: center; font-size: 0.8rem; padding: 7px;" @click="saveProfile">
          保存个人资料
        </button>
      </div>

      <!-- Rhythm Calibration -->
      <div class="settings-section">
        <div class="guide-sec-title">🎯 手动校准今日训练节奏</div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <select v-model="selectedCycleType" class="settings-input" style="flex: 1;">
            <option value="push">🔥 推日 (胸/肩前/三头)</option>
            <option value="pull">⚡ 拉日 (背/肩后/二头)</option>
            <option value="legs">🦵 腿日 (股四/腘绳/臀)</option>
            <option value="rest">💤 休息日 (超量恢复)</option>
          </select>
          <button class="btn-cute-main" style="font-size: 0.8rem; padding: 7px 12px; flex-shrink: 0;" @click="calibrateTodayCycle">
            设为今天
          </button>
        </div>
      </div>

      <!-- Cloud Sync & Backup -->
      <div class="settings-section">
        <div class="guide-sec-title">☁️ 数据备份与同步</div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-cute-secondary" style="flex: 1; padding: 8px; font-size: 0.78rem;" @click="store.fetchCloudState">
            🔄 强制重新拉取
          </button>
          <button class="btn-cute-secondary" style="flex: 1; padding: 8px; font-size: 0.78rem;" @click="exportBackup">
            💾 导出 JSON 备份
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-section {
  background: #fdfaf6;
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 12px;
  margin-bottom: 12px;
}
.settings-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--radius-btn);
  border: 1.5px solid var(--border-card);
  font-size: 0.82rem;
  background: #fff;
  outline: none;
}
.btn-cute-secondary {
  background: #fff;
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-btn);
  color: var(--text-body);
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
