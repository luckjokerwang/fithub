<script setup>
import { ref, computed } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()
const quoteIdx = ref(0)

const currentQuote = computed(() => {
  const type = store.todayCycleInfo.type
  const list = store.quotes[type] || store.quotes.push
  return list[quoteIdx.value % list.length]
})

function nextQuote() {
  quoteIdx.value++
}
</script>

<template>
  <div class="bear-coach-card" @click="nextQuote" title="点击切换教练金句">
    <div class="bear-coach-header">
      <span style="font-size: 1.3rem;">🏄‍♂️</span>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="font-weight: 800; font-size: 0.86rem; color: var(--cute-coral-dark);">冲浪小熊教练</span>
        <span style="font-size: 0.68rem; color: var(--cute-coral); font-weight: 700;">🟠 在线陪练</span>
      </div>
    </div>
    <div class="bear-speech-bubble">
      <span>{{ currentQuote }}</span>
    </div>
  </div>
</template>
