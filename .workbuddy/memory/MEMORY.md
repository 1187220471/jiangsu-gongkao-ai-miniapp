# 小程序专属记忆

_小程序端（Taro + 微信）的技术细节、踩坑记录、开发进度。_

---

## 项目速览

- **路径**：`/Users/yier/Documents/daijinli网页版/daijinli-miniapp/`
- **框架**：Taro 3.x + React 18 + TypeScript + Sass
- **编译目标**：微信小程序
- **后端**：复用 `daijinli-web` 的 Next.js API（`https://www.mianshidati.xyz`）

---

## 当前迭代

**目标**：Phase 1 完成，微信登录测试通过
**状态**：
- ✅ Taro 项目初始化（React + TS + Sass）
- ✅ 5 个 Tab 页面（首页/面试/申论/要闻/我的）
- ✅ 4 个分包结构（practice/zhenti/shenlun/history）
- ✅ 首页 UI（3 大模块卡片 + 微信登录按钮）
- ✅ 微信登录 API（`/api/auth/wechat-login`）
- ✅ Vercel 环境变量（WECHAT_APPID/SECRET）
- ✅ 微信小程序服务器域名（mianshidati.xyz + www.mianshidati.xyz）
- ✅ 微信登录测试通过（2026-06-23 23:18）
- ⏳ 开发面试训练子页面（AI练习/真题/套题/自定义/记录）
- ⏳ 用户体系融合（绑号制，Phase 2）

---

## 踩坑记录

| 问题 | 根因 | 解决方案 |
|------|------|---------|
| TabBar 图标缺失 | app.config.ts 配置了 iconPath 但无图片文件 | 移除 iconPath，只用文字标签 |
| 开发者工具报 touristappid | project.config.json 写的是 touristappid | 改为真实 AppID `wxc080dddfc5b7cda2` |
| 登录失败：invalid code | 游客模式 wx.login() 返回模拟 code | 改用真实 AppID |
| 登录失败：域名不在白名单 | Vercel 301 重定向 → POST 降级 GET，code 丢失 | 直接用 `www.mianshidati.xyz`，微信后台加白名单 |

---

## 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | Taro（React） | 与 Web 端 React 技术栈匹配，学习成本最低 |
| 用户体系 | 微信 openid → 自动创建用户 | 简化注册流程，无需密码 |
| 语音方案 | 阿里云小程序 SDK 实时流式 | 与 Web 端体验一致 |
| 分包规划 | 主包 + 4 个分包 | 避免主包 2MB 限制 |

---

## 技术细节

### 微信登录流程
```
wx.login() → 获取 code
  ↓
POST /api/auth/wechat-login { code }
  ↓
后端调用微信接口：code → openid
  ↓
查找或创建 User 记录
  ↓
返回 JWT Token
  ↓
小程序存储 token，后续请求带 Authorization
```

### 分包结构
```
subpkg-practice/    ← AI练习（选题/作答/批改）
subpkg-zhenti/      ← 真题参考（列表/详情）
subpkg-shenlun/     ← 申论训练（列表/详情/OCR）
subpkg-history/     ← 练习记录
```

### 语音答题（待实现）
- 方案：阿里云 `alibabacloud-nls-wx-sdk`
- 与 Web 端差异：小程序录音 API 为 `wx.getRecorderManager()`
- 后端复用：上传音频文件到 `/api/voice/...` 中转

---

## 待办

1. ~~配置 Vercel 环境变量（WECHAT_APPID/SECRET）~~ ✅
2. ~~配置微信小程序服务器域名~~ ✅
3. ~~测试微信登录流程~~ ✅
4. 开发面试训练子页面（5 个入口卡片）
5. 开发 AI 练习页面（选题 → 文字作答 → AI 批改）
6. 语音答题功能（录音 → 上传 → 识别）
7. 真题参考列表/详情（只读）
8. 申论训练列表/详情（含 OCR）
