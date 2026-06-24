# Learnings

Corrections, insights, and knowledge gaps captured during miniapp development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260623-001] best_practice

**Logged**: 2026-06-23T19:55:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
小程序 TabBar 图标配置导致开发者工具导入失败。

### Details
app.config.ts 中配置了 `iconPath` 和 `selectedIconPath`，但 `src/assets/tabbar/` 目录下没有对应的图片文件，导致微信开发者工具报错。

**修复：**
移除所有 `iconPath` 和 `selectedIconPath` 配置，TabBar 只用文字标签。

### Metadata
- Source: error
- Related Files: src/app.config.ts
- Tags: taro, miniprogram, tabbar, wechat
- Pattern-Key: taro.tabbar.icon_missing
- Recurrence-Count: 1
- First-Seen: 2026-06-23
- Last-Seen: 2026-06-23

### Resolution
- **Resolved**: 2026-06-23T19:55:00+08:00
- **Notes**: 移除 iconPath，使用文字标签

---

## [LRN-20260623-002] correction

**Logged**: 2026-06-23T23:15:00+08:00
**Priority**: high
**Status**: resolved
**Area**: infra

### Summary
project.config.json 的 appid 写的是 touristappid，导致 wx.login() 返回模拟 code，微信接口报 invalid code。

### Details
开发者工具导入项目后，虽然右上角详情页显示真实 AppID，但项目配置文件 `project.config.json` 中 `appid: "touristappid"` 导致实际运行在游客模式，`wx.login()` 返回 `"the code is a mock one"`，微信服务器不认可。

**修复：** 将 `project.config.json` 和 `dist/project.config.json` 中的 `appid` 改为真实 AppID，关闭工具重新导入。

### Metadata
- Source: error
- Related Files: project.config.json, dist/project.config.json
- Tags: wechat, miniprogram, login, touristappid

### Resolution
- **Resolved**: 2026-06-23T23:18:00+08:00
- **Notes**: 改为真实 AppID 后登录成功

---

## [LRN-20260623-003] correction

**Logged**: 2026-06-23T23:15:00+08:00
**Priority**: high
**Status**: resolved
**Area**: infra

### Summary
域名 301 重定向导致小程序 POST 请求降级为 GET，请求体丢失。

### Details
`mianshidati.xyz` → Vercel 301 → `www.mianshidati.xyz`。微信小程序的 `Taro.request()` 在遇到重定向时，POST 请求变为 GET，后端收不到 `code` 参数。

**修复：** 代码直接使用 `www.mianshidati.xyz`，微信后台同时加白名单。

### Metadata
- Source: error
- Related Files: src/pages/index/index.tsx
- Tags: wechat, miniprogram, redirect, domain

### Resolution
- **Resolved**: 2026-06-23T21:25:00+08:00
- **Notes**: 统一使用 www 域名

---
