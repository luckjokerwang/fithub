<script setup>
import { ref, computed } from 'vue'
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

const activeWikiTab = ref('all') // 'all' or 'fav'
const searchKw = ref('')
const muscleFilter = ref('all')
const equipFilter = ref('all')

const muscleOptions = [
  { label: '全部部位', val: 'all' },
  { label: '胸部', val: 'chest' },
  { label: '背部', val: 'back' },
  { label: '腿部', val: 'legs' },
  { label: '肩部', val: 'shoulders' },
  { label: '二头', val: 'biceps' },
  { label: '三头', val: 'triceps' },
  { label: '核心', val: 'abs' }
]

const filteredExercises = computed(() => {
  let list = activeWikiTab.value === 'fav' ? store.favoriteExercises : store.exercises
  
  const kw = searchKw.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(ex => 
      ex.name.toLowerCase().includes(kw) ||
      ex.en.toLowerCase().includes(kw) ||
      ex.muscle.toLowerCase().includes(kw) ||
      ex.equip.toLowerCase().includes(kw)
    )
  }

  if (muscleFilter.value !== 'all') {
    list = list.filter(ex => ex.body_part === muscleFilter.value)
  }

  if (equipFilter.value !== 'all') {
    list = list.filter(ex => ex.equip.includes(equipFilter.value))
  }

  return list
})

function openGuide(ex) {
  store.guideModal.exercise = ex
  store.guideModal.visible = true
}
</script>

<template>
  <div class="wiki-view-container">
    <!-- Top Tab Group: All vs Favorites -->
    <div class="wiki-tab-group">
      <button 
        class="wiki-tab-btn" 
        :class="{ 'active': activeWikiTab === 'all' }"
        @click="activeWikiTab = 'all'"
      >
        <span>📚</span>
        <span class="wiki-tab-text">全部器械 ({{ store.exercises.length }})</span>
      </button>

      <button 
        class="wiki-tab-btn" 
        :class="{ 'active': activeWikiTab === 'fav' }"
        @click="activeWikiTab = 'fav'"
      >
        <span>⭐</span>
        <span class="wiki-tab-text">我的收藏 ({{ store.favorites.length }})</span>
      </button>
    </div>

    <!-- Search & Filter Card -->
    <div class="wiki-filter-card">
      <div class="wiki-search-box">
        <input 
          v-model="searchKw"
          type="text" 
          placeholder="🔍 搜索器械名称、肌肉、英文标牌..." 
          class="wiki-search-input"
        >
      </div>

      <!-- Muscle Filter Pills -->
      <div class="wiki-filter-scroll">
        <button 
          v-for="opt in muscleOptions"
          :key="opt.val"
          class="pill-tag filter-pill"
          :class="muscleFilter === opt.val ? 'tag-target' : 'tag-equip'"
          @click="muscleFilter = opt.val"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredExercises.length === 0" class="wiki-empty-state">
      <p style="font-size: 1.5rem; margin-bottom: 6px;">😿</p>
      <p v-if="activeWikiTab === 'fav'">您还没有收藏任何器械，在动作卡片上点击 ☆ 即可加入收藏！</p>
      <p v-else>没有找到匹配的器械动作，换个搜索关键词试试看吧~</p>
    </div>

    <!-- Exercises List -->
    <div class="wiki-list-grid">
      <div 
        v-for="ex in filteredExercises" 
        :key="ex.id"
        class="wiki-card-item"
        @click="openGuide(ex)"
      >
        <!-- Thumbnail image -->
        <img 
          :src="ex.media?.local_img || `/fit/assets/exercises/${ex.id}.jpg`" 
          :alt="ex.name"
          class="wiki-item-thumb"
          onerror="this.src='/logo_round.png'"
        >

        <!-- Main Info -->
        <div class="wiki-item-info">
          <div class="wiki-item-header">
            <div class="wiki-title-box">
              <span class="wiki-item-title">{{ ex.name }}</span>
              <button 
                class="btn-star-fav"
                :title="store.isFavorite(ex.id) ? '已收藏' : '未收藏'"
                @click.stop="store.toggleFavorite(ex.id)"
              >
                {{ store.isFavorite(ex.id) ? '⭐' : '☆' }}
              </button>
            </div>
            <span class="wiki-guide-link">查看动效 ➔</span>
          </div>

          <div class="wiki-item-en">🏷️ {{ ex.en }}</div>

          <div class="ex-badges-row">
            <span class="pill-tag tag-target">🎯 {{ ex.muscle }}</span>
            <span class="pill-tag tag-equip">🏗️ {{ ex.equip }}</span>
            <span class="pill-tag tag-sets">⚖️ {{ ex.starter_weight }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wiki-view-container {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.wiki-tab-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.wiki-tab-btn {
  flex: 1;
  min-width: 0;
  padding: 8px 6px;
  border-radius: var(--radius-btn);
  border: 1.5px solid var(--border-card);
  background: #fff;
  color: var(--text-body);
  font-size: clamp(0.72rem, 2.9vw, 0.82rem);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
}
.wiki-tab-btn.active {
  background: var(--cute-coral);
  color: #fff;
  border-color: var(--cute-coral);
  box-shadow: 0 4px 10px rgba(255, 107, 87, 0.25);
}
.wiki-tab-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wiki-filter-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 10px 12px;
  margin-bottom: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.wiki-search-box {
  margin-bottom: 8px;
  width: 100%;
}
.wiki-search-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: var(--radius-btn);
  border: 1.5px solid var(--border-card);
  font-size: 0.82rem;
  background: #fdfaf6;
  outline: none;
  box-sizing: border-box;
}
.wiki-filter-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.filter-pill {
  cursor: pointer;
  flex-shrink: 0;
}
.wiki-empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 0.85rem;
}
.wiki-list-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.wiki-card-item {
  background: #fff;
  border: 1.5px solid #ecdcd0;
  border-radius: 16px;
  padding: 10px 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.1s ease;
}
.wiki-card-item:hover {
  border-color: #d6c2b2;
}
.wiki-card-item:active {
  transform: scale(0.99);
}
.wiki-item-thumb {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  object-fit: cover;
  background: #fff;
  border: 1px solid #ebdcd0;
  flex-shrink: 0;
  margin-top: 1px;
}
.wiki-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}
.wiki-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
}
.wiki-title-box {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}
.wiki-item-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--text-title);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.wiki-guide-link {
  font-size: 0.72rem;
  color: var(--cute-coral);
  font-weight: 700;
  flex-shrink: 0;
  white-space: nowrap;
}
.wiki-item-en {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  min-width: 0;
}
.ex-badges-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  width: 100%;
  min-width: 0;
}
.ex-badges-row .pill-tag {
  font-size: 0.68rem;
  padding: 1.5px 6px;
  line-height: 1.3;
}
</style>
