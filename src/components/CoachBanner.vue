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
  <section class="bear-cheer-card" @click="nextQuote" title="点击切换教练金句">
    <div class="cheer-icon">🏄‍♂️</div>
    <div class="cheer-content">
      <div class="cheer-title">
        <span>冲浪小熊教练</span>
        <span style="font-size: 0.7rem; color: #ea580c; font-weight: normal;">● 在线陪练</span>
      </div>
      <div class="cheer-msg">
        {{ currentQuote }}
      </div>
    </div>
  </section>
</template>
