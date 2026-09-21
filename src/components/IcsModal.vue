<script setup>
import { useFitnessStore } from '../stores/fitness'

const store = useFitnessStore()

function close() {
  store.icsModal.visible = false
}

function downloadIcs() {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FitHub//Workout Companion//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FitHub 健身三分化日程',
    'X-WR-TIMEZONE:Asia/Shanghai'
  ]

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 60; i++) {
    const cur = new Date(today)
    cur.setDate(today.getDate() + i)

    const info = store.getCycleForDate(cur)
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    const dateTag = `${y}${m}${d}`

    const appUrl = typeof window !== 'undefined' ? (window.location.origin + '/fit/') : 'https://fithub.app/'
    const domain = typeof window !== 'undefined' ? (window.location.host || 'fithub.app') : 'fithub.app'
    const summary = `${info.emoji} 健身【${info.label}】· FitHub`
    const description = `【练二休一】科学分化循环\\n重点部位：${info.desc}\\n进入打卡：${appUrl}`

    ics.push('BEGIN:VEVENT')
    ics.push(`UID:fithub-${dateTag}@${domain}`)
    ics.push(`DTSTAMP:${dateTag}T000000Z`)
    ics.push(`DTSTART;VALUE=DATE:${dateTag}`)
    ics.push(`DTEND;VALUE=DATE:${dateTag}`)
    ics.push(`SUMMARY:${summary}`)
    ics.push(`DESCRIPTION:${description}`)
    ics.push('STATUS:CONFIRMED')
    ics.push('END:VEVENT')
  }

  ics.push('END:VCALENDAR')
  const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fithub_workout_60days_${store.todayStr}.ics`
  a.click()
  close()
}
</script>

<template>
  <div 
    v-if="store.icsModal.visible"
    class="modal-overlay active"
    @click.self="close"
  >
    <div class="modal-box">
      <div class="modal-title">
        <span>📅 导出 60 天健身日程到手机日历</span>
        <button class="btn-close-modal" @click="close">×</button>
      </div>

      <div style="font-size: 0.8rem; color: var(--text-body); line-height: 1.6; margin-bottom: 14px;">
        将未来 60 天的【推日、拉日、腿日、休息日】训练日程一键打包为标准 <code>.ics</code> 日历文件，可直接导入到 <strong>苹果日历 (Apple Calendar)</strong>、<strong>谷歌日历 (Google Calendar)</strong>、<strong>华为/小米/OPPO系统日历</strong> 中。
      </div>

      <button class="btn-cute-main" style="width: 100%; justify-content: center; padding: 11px;" @click="downloadIcs">
        📥 立即下载 .ics 日历文件
      </button>
    </div>
  </div>
</template>
