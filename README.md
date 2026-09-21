# 🏋️‍♂️ FitHub · 元气萌系健身伴侣与 3D 动作图解

<div align="center">

![FitHub Banner](public/logo.png)

**三分化科学推拉腿 · 3D肌肉解剖动效图解 · 器械收藏与避坑指南 · 多端秒级云同步**

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-2.3-ffd859?style=flat-square)](https://pinia.vuejs.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-f05138?style=flat-square)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 🌟 核心特性

- 🎯 **科学三分化训练体系**：经典「推日 ➔ 拉日 ➔ 休息日 ➔ 腿日 ➔ 推日 ➔ 休息日 ➔ 拉日 ➔ 腿日 ➔ 休息日」9 天练二休一科学循环，支持根据起始日期自动轮转与手动校准。
- 🔄 **45+ 款健身房王牌动作 3D 解剖动效**：全量集成 GymVisual 3D 肌肉解剖连续循环动效 (GIF)，清晰标红标绿主要受力肌群与辅助肌群，告别枯燥抽象的纯文字说明。
- ⭐ **器械收藏与快速筛选系统**：在卡片与弹窗中点击 ⭐ 即可将常用器械加入「我的收藏」，在「器械百科」中支持一键切换收藏视图，并支持按胸/背/腿/肩/手臂/核心及器械类型快速检索。
- 📖 **新手避坑与保姆级实操图解**：每个动作配备 4 大维度保姆级指南：
  - 🏢 **健身房认机指南**：如何一眼在健身房找到这台器械；
  - ⚙️ **4步保姆级调节**：座椅高低、握把对齐、插销配重；
  - 🎯 **目标发力感**：哪里酸胀才算练对；
  - ⚠️ **防伤死穴必读**：避免耸肩、手腕翻折、膝盖反弓锁死等常见危险动作。
- 📺 **一键 B站 1080P 精准精讲**：精简直达按钮，直达专业教练的 1 分钟高清慢动作拆解（已彻底移除干扰搜索词，直达标准教学）。
- 🔄 **机器被占？一键换动作**：当健身房某个器械被占时，系统自动智能推荐同肌群等效替换动作（附带器械缩略图），随时无缝切换到哑铃区或空闲器械。
- 🟩 **112 天对称训练热力图**：GitHub 风格网格，居中对称排布，未来未发生的日期自动置灰禁用防误触，清晰掌握长期自律轨迹。
- 📈 **体重趋势动态跟踪**：SVG 动态渐变折线图与体重打卡记录，直观反映增肌期体重增长趋势。
- 🍱 **校园食堂 5 餐增肌营养方案**：专为学生党与上班族定制的高蛋白、高碳水、低成本食堂实操搭配指南。
- ☁️ **多端秒级云同步与 PWA 支持**：支持安装到 iOS / Android 手机桌面作为独立全屏 App 使用，数据实时双向与云端 API 同步，无网络时自动使用 LocalStorage 本地离线兜底。

---

## 🛠️ 技术栈

- **核心框架**：Vue 3 (Composition API, `<script setup>`)
- **构建工具**：Vite 6
- **状态管理**：Pinia 2
- **设计风格**：糖果可爱马卡龙调色板 (Cute Cartoon Theme, Mobile-First, 响应式防折行)
- **动效库来源**：GymVisual 3D 解剖动效 (45 款核心动作全量本地缓存 + CDN 容灾)
- **后端同步**：轻量级 REST API (GET / POST `/api/fit/state`)

---

## 🚀 本地运行与开发

```bash
# 1. 克隆项目
git clone https://github.com/luckjokerwang/fithub.git
cd fithub

# 2. 安装依赖
npm install

# 3. 启动本地开发服务
npm run dev

# 4. 构建生产包
npm run build
```

构建产物将输出至 `dist/` 目录，可直接部署至任何支持静态托管的服务器（如 Nginx, Caddy, Vercel, Cloudflare Pages 等）。

---

## 📱 手机端 PWA 添加到主屏幕

1. 使用手机浏览器（如 Safari, Chrome, Edge）打开线上地址。
2. 点击浏览器底部或菜单中的 **「分享」➔「添加到主屏幕」**。
3. 即可在手机桌面上获得一个原生 App 质感、无浏览器地址栏的全屏健身助手。

---

## 📄 开源许可

本项目遵循 [MIT License](LICENSE) 开源协议。
动效与媒体资源版权归原作者 GymVisual 及开源数据集所有。
