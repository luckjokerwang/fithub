<script setup>
import { computed, ref } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()
const ex = computed(() => store.guideModal.exercise)
const isImgLoading = ref(true)

function close() {
  store.guideModal.visible = false
}

const biliUrl = computed(() => {
  if (!ex.value) return '#'
  const query = `${ex.value.name} 动作教学`
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}`
})

const gifSrc = computed(() => {
  if (!ex.value) return ''
  return ex.value.media?.local_gif || `/fit/assets/exercises/${ex.value.id}.gif`
})

function onGifError(e) {
  if (ex.value?.media?.gif_cdn && e.target.src !== ex.value.media.gif_cdn) {
    e.target.src = ex.value.media.gif_cdn
  } else {
    e.target.src = ex.value?.media?.local_img || `/fit/assets/exercises/${ex.value?.id}.jpg`
  }
}
</script>

<template>
  <!-- Modal Overlay with click-outside to close -->
  <div 
    v-if="store.guideModal.visible && ex"
    class="modal-overlay active"
    @click.self="close"
  >
    <div class="modal-box">
      <!-- Modal Header -->
      <div class="modal-title">
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            {{ ex.icon || '📖' }} {{ ex.name }}
          </span>
          <button 
            class="btn-star-fav"
            :title="store.isFavorite(ex.id) ? '已收藏' : '未收藏'"
            @click.stop="store.toggleFavorite(ex.id)"
          >
            {{ store.isFavorite(ex.id) ? '⭐' : '☆' }}
          </button>
        </div>
        <button class="btn-close-modal" @click="close">×</button>
      </div>

      <!-- Badges -->
      <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px;">
        <span class="pill-tag tag-target">🎯 {{ ex.muscle }}</span>
        <span class="pill-tag tag-equip">🏗️ {{ ex.equip }}</span>
        <span class="pill-tag tag-sets">⚖️ 起步：{{ ex.starter_weight }}</span>
        <span class="pill-tag tag-reps">🔢 建议：{{ ex.sets }} × {{ ex.reps }}</span>
      </div>

      <!-- 3D Animated GIF demonstration -->
      <div class="guide-media-container" style="background: #fdfaf6; border-radius: 16px; padding: 10px; border: 1.5px solid var(--border-card); margin-bottom: 14px; text-align: center;">
        <div style="max-height: 230px; min-height: 180px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 12px; overflow: hidden; position: relative;">
          <img 
            :src="gifSrc" 
            :alt="ex.name"
            style="max-width: 100%; max-height: 230px; object-fit: contain; display: block; margin: 0 auto;"
            @load="isImgLoading = false"
            @error="onGifError"
          >
          <div v-if="isImgLoading" style="position: absolute; inset: 0; background: #faf5ee; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; color: var(--text-muted);">
            🔄 加载3D解剖动效中...
          </div>
        </div>
        <div style="margin-top: 6px; display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
          <span class="pill-tag" style="background: #fef3c7; color: #d97706; font-size: 0.72rem; font-weight: 700;">🔄 3D肌肉解剖循环动效</span>
          <span class="pill-tag" style="background: #e0f2fe; color: #0284c7; font-size: 0.72rem; font-weight: 700;">🎯 红色高亮为主要受力肌群</span>
        </div>
      </div>

      <!-- Structured Guide Sections -->
      <div class="guide-section">
        <div class="guide-sec-title">🏢 健身房怎么找到它 (器械长啥样？)</div>
        <div class="guide-sec-box">{{ ex.look }}</div>
      </div>

      <div class="guide-section">
        <div class="guide-sec-title">⚙️ 4步保姆级实操调节 (照着做即可)</div>
        <div class="guide-sec-box" style="white-space: pre-line;">{{ ex.setup }}</div>
      </div>

      <div class="guide-section">
        <div class="guide-sec-title">🎯 目标发力感 (哪里酸才算练对？)</div>
        <div class="guide-sec-box">{{ ex.feel }}</div>
      </div>

      <div class="guide-section">
        <div class="guide-sec-title" style="color: #be123c;">⚠️ 新手防伤必读 (千万别犯的死穴！)</div>
        <div class="guide-sec-box guide-alert-pitfall">{{ ex.pitfall }}</div>
      </div>

      <!-- Shortened Clean Bilibili Button (NO text cut off on mobile) -->
      <div style="margin-top: 16px; text-align: center;">
        <a 
          :href="biliUrl" 
          target="_blank" 
          rel="noopener"
          class="btn-cute-main" 
          style="width: 100%; justify-content: center; text-decoration: none; background: #fb7299; border-color: #f43f5e; box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3); font-size: 0.88rem; padding: 11px;"
        >
          <span>📺</span>
          <span>B站 1080P 动作精讲</span>
        </a>
      </div>
    </div>
  </div>
</template>
