import { defineStore } from 'pinia'
import exercisesData from '../data/exercises.json'
import quotesData from '../data/quotes.json'

const API_URL = '/api/fit/state'
const STORAGE_KEY = 'fithub_vue_state_v1'

// Calibrated 9-day cycle starting at 2026-09-21 as PUSH day (index 0)
const CYCLE_9DAYS = [
  { type: 'push', label: '推日', emoji: '🔥', desc: '胸部、肩前束、肱三头肌' },
  { type: 'pull', label: '拉日', emoji: '⚡', desc: '背部肌群、肩后束、肱二头肌' },
  { type: 'rest', label: '休息日', emoji: '💤', desc: '超量恢复，补充优质蛋白质与碳水' },
  { type: 'legs', label: '腿日', emoji: '🦵', desc: '股四头肌、腘绳肌、臀部与小腿' },
  { type: 'push', label: '推日', emoji: '🔥', desc: '胸部、肩前束、肱三头肌' },
  { type: 'rest', label: '休息日', emoji: '💤', desc: '超量恢复，补充优质蛋白质与碳水' },
  { type: 'pull', label: '拉日', emoji: '⚡', desc: '背部肌群、肩后束、肱二头肌' },
  { type: 'legs', label: '腿日', emoji: '🦵', desc: '股四头肌、腘绳肌、臀部与小腿' },
  { type: 'rest', label: '休息日', emoji: '💤', desc: '超量恢复，补充优质蛋白质与碳水' }
]

const DEFAULT_SLOTS = {
  push: ['p_chest_press', 'p_incline_press', 'p_shoulder_press', 'p_lateral_raise'],
  pull: ['l_lat_pulldown', 'l_seated_row', 'l_reverse_fly', 'l_db_curl'],
  legs: ['g_leg_press', 'g_leg_extension', 'g_lying_curl', 'g_calf_raise']
}

export const useFitnessStore = defineStore('fitness', {
  state: () => ({
    exercises: exercisesData,
    quotes: quotesData,
    
    // User profile (privacy-safe default, customized via localStorage / cloud)
    profile: {
      name: '元气学员',
      height: 175,
      weight: 58.0
    },

    // UI navigation & workout view
    activeTab: 'today', // today, wiki, heatmap, weight, meal
    currentWorkoutType: 'push', // push, pull, legs

    // Cycle calibration base date: 2026-09-21 is Push Day (index 0)
    baseDateStr: '2026-09-21',

    // Synced fitness data
    checkins: {},
    weights: [
      { date: '2026-09-14', weight: 58.0, note: '初始基准' },
      { date: '2026-09-17', weight: 58.2, note: '正常' },
      { date: '2026-09-20', weight: 58.5, note: '饭后' }
    ],
    sets: {},
    custom_slots: { ...DEFAULT_SLOTS },
    favorites: ['p_chest_press', 'g_leg_press', 'l_lat_pulldown'], // Equipment favorites
    last_updated: 0,

    // Cloud sync state
    syncStatus: 'ok', // ok, syncing, offline
    syncLabel: '已同步',
    syncTimer: null,

    // Modals
    guideModal: {
      visible: false,
      exercise: null
    },
    swapModal: {
      visible: false,
      type: 'push',
      slotIdx: 0,
      currentEx: null
    },
    settingsModal: {
      visible: false
    },
    icsModal: {
      visible: false
    },
    weightModal: {
      visible: false
    },

    // Rest timer
    restTimer: {
      active: false,
      totalSeconds: 90,
      remainingSeconds: 90,
      exerciseName: '',
      intervalId: null
    }
  }),

  getters: {
    exerciseMap: (state) => {
      const map = {}
      state.exercises.forEach(ex => { map[ex.id] = ex })
      return map
    },

    todayStr: () => {
      const d = new Date()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },

    todayCycleInfo: (state) => {
      return state.getCycleForDate(new Date())
    },

    currentSlotExercises: (state) => {
      const slotIds = state.custom_slots[state.currentWorkoutType] || DEFAULT_SLOTS[state.currentWorkoutType]
      return slotIds.map(id => state.exerciseMap[id] || state.exercises[0])
    },

    favoriteExercises: (state) => {
      return state.favorites.map(id => state.exerciseMap[id]).filter(Boolean)
    },

    streakDays: (state) => {
      let streak = 0
      const curr = new Date()
      curr.setHours(0, 0, 0, 0)
      const todayStr = state.todayStr

      while (true) {
        const y = curr.getFullYear()
        const m = String(curr.getMonth() + 1).padStart(2, '0')
        const d = String(curr.getDate()).padStart(2, '0')
        const dStr = `${y}-${m}-${d}`

        if (state.checkins[dStr] && state.checkins[dStr].done) {
          streak++
          curr.setDate(curr.getDate() - 1)
        } else {
          if (streak === 0 && dStr === todayStr) {
            curr.setDate(curr.getDate() - 1)
            continue
          }
          break
        }
      }
      return streak
    }
  },

  actions: {
    getCycleForDate(targetDate) {
      const d = new Date(targetDate)
      d.setHours(0, 0, 0, 0)
      const b = new Date(this.baseDateStr + 'T00:00:00')
      b.setHours(0, 0, 0, 0)

      const diffDays = Math.round((d.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
      let cycleIndex = diffDays % 9
      if (cycleIndex < 0) cycleIndex += 9

      const item = CYCLE_9DAYS[cycleIndex]
      return {
        diffDays,
        cycleIndex,
        type: item.type,
        label: item.label,
        emoji: item.emoji,
        desc: item.desc
      }
    },

    // Initialize & Load
    init() {
      this.loadLocal()
      // Calibrate current view workout to today's cycle
      const todayInfo = this.todayCycleInfo
      if (todayInfo.type !== 'rest') {
        this.currentWorkoutType = todayInfo.type
      }
      this.fetchCloudState()
    },

    loadLocal() {
      try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (data) {
          const parsed = JSON.parse(data)
          if (parsed.profile) this.profile = { ...this.profile, ...parsed.profile }
          if (parsed.checkins) this.checkins = parsed.checkins
          if (parsed.weights) this.weights = parsed.weights
          if (parsed.sets) this.sets = parsed.sets
          if (parsed.custom_slots) this.custom_slots = parsed.custom_slots
          if (parsed.favorites) this.favorites = parsed.favorites
          if (parsed.baseDateStr) this.baseDateStr = parsed.baseDateStr
          if (parsed.last_updated) this.last_updated = parsed.last_updated
        }
      } catch (e) {
        console.warn('Failed to load local storage:', e)
      }
    },

    saveLocal() {
      try {
        const data = {
          profile: this.profile,
          checkins: this.checkins,
          weights: this.weights,
          sets: this.sets,
          custom_slots: this.custom_slots,
          favorites: this.favorites,
          baseDateStr: this.baseDateStr,
          last_updated: this.last_updated
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (e) {
        console.warn('Failed to save local storage:', e)
      }
    },

    // Cloud Sync
    async fetchCloudState() {
      this.syncStatus = 'syncing'
      this.syncLabel = '同步中...'
      try {
        const resp = await fetch(API_URL + '?t=' + Date.now())
        if (resp.ok) {
          const res = await resp.json()
          if (res && res.status === 'ok' && res.data) {
            const cloud = res.data
            if (cloud.checkins) Object.assign(this.checkins, cloud.checkins)
            if (cloud.sets) {
              for (const k in cloud.sets) {
                if (!this.sets[k]) this.sets[k] = {}
                Object.assign(this.sets[k], cloud.sets[k])
              }
            }
            if (cloud.custom_slots) Object.assign(this.custom_slots, cloud.custom_slots)
            if (cloud.favorites) this.favorites = cloud.favorites
            if (Array.isArray(cloud.weights) && cloud.weights.length > 0) {
              const wMap = {}
              this.weights.forEach(w => { if (w.date) wMap[w.date] = w })
              cloud.weights.forEach(w => { if (w.date) wMap[w.date] = w })
              this.weights = Object.values(wMap).sort((a, b) => a.date.localeCompare(b.date))
            }
            this.last_updated = Math.max(this.last_updated, cloud.last_updated || 0)
            this.saveLocal()
            this.syncStatus = 'ok'
            this.syncLabel = '已同步'
            return
          }
        }
        this.syncStatus = 'ok'
        this.syncLabel = '本地就绪'
      } catch (err) {
        this.syncStatus = 'offline'
        this.syncLabel = '离线模式'
      }
    },

    queuePushCloud() {
      this.last_updated = Date.now()
      this.saveLocal()
      this.syncStatus = 'syncing'
      this.syncLabel = '正在保存...'

      if (this.syncTimer) clearTimeout(this.syncTimer)
      this.syncTimer = setTimeout(async () => {
        try {
          const payload = {
            checkins: this.checkins,
            weights: this.weights,
            sets: this.sets,
            custom_slots: this.custom_slots,
            favorites: this.favorites,
            last_updated: this.last_updated
          }
          const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (resp.ok) {
            this.syncStatus = 'ok'
            this.syncLabel = '已同步'
          } else {
            this.syncStatus = 'offline'
            this.syncLabel = '已存本地'
          }
        } catch (e) {
          this.syncStatus = 'offline'
          this.syncLabel = '已存本地'
        }
      }, 500)
    },

    // Checkin & Sets
    toggleSet(dateStr, setKey, exerciseName) {
      if (!this.sets[dateStr]) this.sets[dateStr] = {}
      const isDone = !!this.sets[dateStr][setKey]
      this.sets[dateStr][setKey] = !isDone

      // If finished a set, start rest timer automatically!
      if (!isDone) {
        this.startRestTimer(90, exerciseName)
      }

      // If any set done, mark today's checkin as true
      const anyDone = Object.values(this.sets[dateStr]).some(v => v === true)
      if (anyDone) {
        const info = this.todayCycleInfo
        this.checkins[dateStr] = { done: true, type: info.type }
      }

      this.queuePushCloud()
    },

    toggleTodayCheckin() {
      const today = this.todayStr
      const isDone = !!(this.checkins[today] && this.checkins[today].done)
      const info = this.todayCycleInfo

      if (!isDone) {
        this.checkins[today] = { done: true, type: info.type }
      } else {
        delete this.checkins[today]
      }
      this.queuePushCloud()
    },

    // Favorites
    toggleFavorite(exerciseId) {
      const idx = this.favorites.indexOf(exerciseId)
      if (idx >= 0) {
        this.favorites.splice(idx, 1)
      } else {
        this.favorites.push(exerciseId)
      }
      this.queuePushCloud()
    },

    isFavorite(exerciseId) {
      return this.favorites.includes(exerciseId)
    },

    // Swap Exercise
    swapSlot(type, slotIdx, newExerciseId) {
      if (!this.custom_slots[type]) {
        this.custom_slots[type] = [...DEFAULT_SLOTS[type]]
      }
      this.custom_slots[type][slotIdx] = newExerciseId
      this.queuePushCloud()
    },

    // Weights
    saveWeight(date, weight, note) {
      const existingIdx = this.weights.findIndex(w => w.date === date)
      if (existingIdx >= 0) {
        this.weights[existingIdx] = { date, weight, note }
      } else {
        this.weights.push({ date, weight, note })
        this.weights.sort((a, b) => a.date.localeCompare(b.date))
      }
      this.queuePushCloud()
    },

    deleteWeight(date) {
      this.weights = this.weights.filter(w => w.date !== date)
      this.queuePushCloud()
    },

    // Rest Timer
    startRestTimer(seconds = 90, exerciseName = '组间休息') {
      if (this.restTimer.intervalId) {
        clearInterval(this.restTimer.intervalId)
      }
      this.restTimer.active = true
      this.restTimer.totalSeconds = seconds
      this.restTimer.remainingSeconds = seconds
      this.restTimer.exerciseName = exerciseName

      this.restTimer.intervalId = setInterval(() => {
        this.restTimer.remainingSeconds--
        if (this.restTimer.remainingSeconds <= 0) {
          clearInterval(this.restTimer.intervalId)
          this.restTimer.intervalId = null
          this.playChime()
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          setTimeout(() => {
            this.restTimer.active = false
          }, 1500)
        }
      }, 1000)
    },

    skipRestTimer() {
      if (this.restTimer.intervalId) clearInterval(this.restTimer.intervalId)
      this.restTimer.intervalId = null
      this.restTimer.active = false
    },

    addTimer30s() {
      this.restTimer.remainingSeconds += 30
      this.restTimer.totalSeconds += 30
    },

    playChime() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, ctx.currentTime)
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
        osc.start()
        osc.stop(ctx.currentTime + 0.6)
      } catch (e) {}
    }
  }
})
