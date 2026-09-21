<script setup>
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

const meals = [
  {
    title: '🌅 早餐 (早八前)',
    time: '07:30 ~ 08:00',
    desc: '鸡蛋 2 个（蛋黄全吃）+ 热豆浆/纯牛奶 1 杯 + 菜包/肉包 2 个（或食堂燕麦粥 1 碗）。',
    cal: '480 kcal',
    protein: '蛋白 22g',
    carbs: '碳水 65g'
  },
  {
    title: '🍲 午餐 (食堂大伙)',
    time: '11:45 ~ 12:30',
    desc: '大米饭 1 大碗（压实约 200g）+ 荤菜（去皮鸡腿/牛肉炒芹菜）+ 半荤半素（西红柿炒蛋/肉末豆腐）+ 清炒时蔬 1 份。',
    cal: '680 kcal',
    protein: '蛋白 30g',
    carbs: '碳水 85g'
  },
  {
    title: '🍎 下午加餐 (宿舍/自习)',
    time: '16:00 ~ 16:30',
    desc: '全麦面包 2 片 + 水果（苹果 1 个 / 香蕉 1 根）+ 原味酸奶 1 盒（约 150ml）。',
    cal: '320 kcal',
    protein: '蛋白 10g',
    carbs: '碳水 52g'
  },
  {
    title: '🍱 晚餐 (练前2小时)',
    time: '18:00 ~ 18:45',
    desc: '米饭/馒头 1 份 + 瘦肉/鱼肉/卤鸡胸 1 掌心大小 + 绿叶蔬菜 1 大份 + 紫菜蛋花汤。',
    cal: '580 kcal',
    protein: '蛋白 28g',
    carbs: '碳水 75g'
  },
  {
    title: '🥛 练后/夜间加餐',
    time: '21:30 ~ 22:00',
    desc: '温牛奶 1 杯 (250ml) 或乳清蛋白粉 1 勺 + 香蕉 1 根（促进糖原快速超量恢复，助眠修复）。',
    cal: '347 kcal',
    protein: '蛋白 18g',
    carbs: '碳水 45g'
  }
]
</script>

<template>
  <div class="meal-view-container">
    <div class="meal-card">
      <!-- Title row: Clean, NO clashing, NO "好人松松" -->
      <div class="meal-header-row">
        <div class="meal-title-group">
          <span style="font-size: 1rem; font-weight: 800; color: var(--text-title); white-space: nowrap;">
            🍱 校园食堂 5 餐增肌方案
          </span>
        </div>
        <span class="pill-tag tag-target" style="font-size: 0.72rem; font-weight: 700; flex-shrink: 0; white-space: nowrap;">
          2407 kcal / 日
        </span>
      </div>

      <div class="meal-subtitle">
        为 {{ store.profile.name }}（{{ store.profile.height }}cm / {{ store.profile.weight }}kg）定制：蛋白质 100g、碳水 280g、脂肪 55g。
      </div>

      <!-- Meal Cards List -->
      <div class="meal-list">
        <div 
          v-for="m in meals" 
          :key="m.title"
          class="single-meal-item"
        >
          <div class="single-meal-top">
            <span style="font-size: 0.92rem; font-weight: 800; color: var(--text-title);">{{ m.title }}</span>
            <span class="meal-time-badge">{{ m.time }}</span>
          </div>

          <p class="single-meal-desc">
            <strong>食堂选择：</strong>{{ m.desc }}
          </p>

          <div class="meal-nutrition-row">
            <span class="pill-tag tag-target">{{ m.cal }}</span>
            <span class="pill-tag tag-equip">{{ m.protein }}</span>
            <span class="pill-tag tag-sets">{{ m.carbs }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meal-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 16px 14px;
}
.meal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.meal-subtitle {
  font-size: 0.76rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 14px;
  border-bottom: 1px dashed var(--border-card);
  padding-bottom: 10px;
}
.meal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.single-meal-item {
  background: #fdfaf6;
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 12px;
}
.single-meal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.meal-time-badge {
  font-size: 0.72rem;
  color: var(--text-muted);
  background: #fff;
  border: 1px solid var(--border-card);
  padding: 2px 8px;
  border-radius: 999px;
}
.single-meal-desc {
  font-size: 0.78rem;
  color: var(--text-body);
  line-height: 1.6;
  margin-bottom: 8px;
}
.meal-nutrition-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
