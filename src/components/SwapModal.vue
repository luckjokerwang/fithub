<script setup>
import { computed } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

function close() {
  store.swapModal.visible = false
}

const currentEx = computed(() => store.swapModal.currentEx)
const slotIdx = computed(() => store.swapModal.slotIdx)
const currentType = computed(() => store.swapModal.type)

const alternatives = computed(() => {
  if (!currentEx.value) return []
  const ex = currentEx.value
  const sameSlot = store.exercises.filter(e => e.slot === ex.slot && e.id !== ex.id)
  const sameSplit = store.exercises.filter(e => e.split_day === currentType.value && e.id !== ex.id && !sameSlot.includes(e))
  return sameSlot.concat(sameSplit)
})

function onSelectAlternative(newId) {
  store.swapSlot(currentType.value, slotIdx.value, newId)
  close()
}
</script>

<template>
  <div 
    v-if="store.swapModal.visible && currentEx"
    class="modal-overlay active"
    @click.self="close"
  >
    <div class="modal-box">
      <div class="modal-title">
        <span>🔄 机器被占？选择备选动作</span>
        <button class="btn-close-modal" @click="close">×</button>
      </div>

      <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
        当前槽位：第 {{ slotIdx + 1 }} 个动作【{{ currentEx.name }}】({{ currentEx.muscle }})。如果该机器被占或健身房没有，可一键替换为同肌群等效动作：
      </div>

      <!-- Alternative exercises list with thumbnails -->
      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 55vh; overflow-y: auto;">
        <div 
          v-for="alt in alternatives" 
          :key="alt.id"
          style="background: #faf5ee; border: 1.5px solid #ebdcd0; border-radius: 14px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px;"
        >
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
            <img 
              :src="alt.media?.local_img || `/fit/assets/exercises/${alt.id}.jpg`" 
              :alt="alt.name"
              style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; background: #fff; border: 1px solid #ebdcd0; flex-shrink: 0;"
              onerror="this.src='/logo_round.png'"
            >
            <div style="min-width: 0;">
              <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-title); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ alt.name }}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin: 2px 0;">
                🎯 {{ alt.muscle }} · 🏗️ {{ alt.equip }}
              </div>
            </div>
          </div>

          <button 
            class="btn-cute-main" 
            style="padding: 6px 12px; font-size: 0.76rem; border-radius: 999px; flex-shrink: 0;"
            @click="onSelectAlternative(alt.id)"
          >
            换成这个 ➔
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
