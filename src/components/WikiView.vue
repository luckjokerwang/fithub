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
        <span>全部器械动作 ({{ store.exercises.length }})</span>
      </button>

      <button 
        class="wiki-tab-btn" 
        :class="{ 'active': activeWikiTab === 'fav' }"
        @click="activeWikiTab = 'fav'"
      >
        <span>⭐</span>
        <span>我的器械收藏 ({{ store.favorites.length }})</span>
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
          class="pill-tag"
          :class="muscleFilter === opt.val ? 'tag-target' : 'tag-equip'"
          style="cursor: pointer;"
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
            <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
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

          <div class="ex-badges-row" style="margin-top: 4px;">
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
.wiki-filter-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 10px 12px;
  margin-bottom: 12px;
}
.wiki-search-box {
  margin-bottom: 8px;
}
.wiki-search-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: var(--radius-btn);
  border: 1.5px solid var(--border-card);
  font-size: 0.82rem;
  background: #fdfaf6;
  outline: none;
}
.wiki-filter-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
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
}
.wiki-item-thumb {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  object-fit: cover;
  background: #fff;
  border: 1px solid #ebdcd0;
  flex-shrink: 0;
}
.wiki-item-info {
  flex: 1;
  min-width: 0;
}
.wiki-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.wiki-item-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-title);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wiki-guide-link {
  font-size: 0.72rem;
  color: var(--cute-coral);
  font-weight: 700;
  flex-shrink: 0;
}
.wiki-item-en {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 2px 0;
}
</style>
