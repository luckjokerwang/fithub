<script setup>
import { ref } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

function close() {
  store.weightModal.visible = false
}

const inputDate = ref(store.todayStr)
const inputWeight = ref(store.profile.weight || 58.5)
const inputNote = ref('')

function adjustWeight(delta) {
  inputWeight.value = Math.round((Number(inputWeight.value) + delta) * 10) / 10
}

function onSave() {
  const w = Number(inputWeight.value)
  if (isNaN(w) || w <= 30 || w >= 250) {
    alert('请输入合理的体重数值 (30~250kg)')
    return
  }
  store.saveWeight(inputDate.value, w, inputNote.value.trim())
  store.profile.weight = w
  close()
}
</script>

<template>
  <div 
    v-if="store.weightModal.visible"
    class="modal-overlay active"
    @click.self="close"
  >
    <div class="modal-box">
      <div class="modal-title">
        <span>⚖️ 记录今日体重</span>
        <button class="btn-close-modal" @click="close">×</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-title); display: block; margin-bottom: 4px;">打卡日期</label>
          <input v-model="inputDate" type="date" class="settings-input">
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-title); display: block; margin-bottom: 4px;">体重数值 (kg)</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn-step" @click="adjustWeight(-0.1)">-0.1</button>
            <input v-model="inputWeight" type="number" step="0.1" class="settings-input" style="text-align: center; font-size: 1.1rem; font-weight: 800;">
            <button class="btn-step" @click="adjustWeight(+0.1)">+0.1</button>
          </div>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-title); display: block; margin-bottom: 4px;">状态备注</label>
          <input v-model="inputNote" type="text" placeholder="如：早起空腹 / 练后称重" class="settings-input">
        </div>

        <button class="btn-cute-main" style="width: 100%; justify-content: center; padding: 10px; margin-top: 6px;" @click="onSave">
          保存体重打卡
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-btn);
  border: 1.5px solid var(--border-card);
  font-size: 0.85rem;
  background: #fdfaf6;
  outline: none;
}
.btn-step {
  background: #fdfaf6;
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-btn);
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
}
</style>
