# 小程序专属记忆

_小程序端（Taro + 微信）的技术细节、踩坑记录、开发进度。_

---

## 项目速览

- **名称**：申面智能小助手（备案已通过）
- **路径**：`/Users/yier/Documents/daijinli网页版/daijinli-miniapp/`
- **框架**：Taro 3.x + React 18 + TypeScript + Sass
- **编译目标**：微信小程序
- **后端**：复用 `daijinli-web` 的 Next.js API（`https://www.mianshidati.xyz`）

---

## 当前迭代

**目标**：Phase 3 完成，备案已通过，品牌名已更新为「申面智能小助手」，等待上传代码提交审核
**状态**：
- ✅ Taro 项目初始化（React + TS + Sass）
- ✅ 5 个 Tab 页面（首页/面试/申论/要闻/我的）
- ✅ 4 个分包结构（practice/zhenti/shenlun/history）
- ✅ 首页 UI（模块卡片 + 微信登录）
- ✅ 微信登录 API（`/api/auth/wechat-login`）
- ✅ Vercel 环境变量（WECHAT_APPID/SECRET）
- ✅ 微信小程序服务器域名（mianshidati.xyz / www.mianshidati.xyz / wss://nls-gateway.cn-shanghai.aliyuncs.com）
- ✅ 微信登录测试通过（2026-06-23）
- ✅ 面试训练 5 个入口全部可用（AI练习/真题参考/套题训练/自定义题目/练习记录）
- ✅ 政务要闻模块（复用 `/api/news/daily`，支持日期筛选，复制链接）
- ✅ 「我的」页面完善（额度/统计/会员状态/功能入口/绑定 Web 账号）
- ✅ 用户体系融合（绑号制，Web 账号与小程序 openid 绑定）
- ✅ 品牌名清理（删除「戴锦鲤」/「daijinli」相关内容）
- ✅ UI 重构（首页/面试/申论/要闻/我的统一深蓝灰渐变风格）
- ✅ 申论训练模块（列表/详情/作答/AI 批改/OCR）
- ✅ 语音答题（阿里云 ASR 小程序 SDK，支持面试真题与申论作答）
- ✅ 申论题型标准化为 6 类（与 Web 端对齐）
- ✅ 小程序已提交备案
- ✅ 备案已通过（2026-07-16），小程序名称已改为「申面智能小助手」
- ✅ 项目元数据已同步更新（project.config.json / package.json / config/index.ts 等）
- ✅ 本地构建验证通过

---

## 踩坑记录

| 问题 | 根因 | 解决方案 |
|------|------|---------|
| TabBar 图标缺失 | app.config.ts 配置了 iconPath 但无图片文件 | 移除 iconPath，只用文字标签 |
| 开发者工具报 touristappid | project.config.json 写的是 touristappid | 改为真实 AppID `wxc080dddfc5b7cda2` |
| 登录失败：invalid code | 游客模式 wx.login() 返回模拟 code | 改用真实 AppID |
| 登录失败：域名不在白名单 | Vercel 301 重定向 → POST 降级 GET，code 丢失 | 直接用 `www.mianshidati.xyz`，微信后台加白名单 |
| 预览模式 SyntaxError | `project.config.json` 中 `es6: false`，可选链 `?.` 未被转译 | 改为 `es6: true`，清缓存重新编译 |
| 真机调试栈溢出 | Taro 调试器 source map 注入冲突 | 使用预览模式代替真机调试 |
| 字体太小 | Taro 默认 designWidth=750，px 转 rpx 后缩小一倍 | 改为 `designWidth: 375`（转换比例 2:1）|
| 组件 SCSS 不生效 | Taro 对 `src/components/**/*.scss` 不编译 | 组件内使用内联 `style`，页面级样式放页面 SCSS |
| 语音 SDK 路径报错 `Cannot find module` | 相对路径错误 | `../aliyun-nls/st` → `../../utils/aliyun-nls/st` |
| `process is not defined` | 小程序无 `process.env` | 删除环境变量引用，Token/AppKey 从后端 `/api/voice/aliyun-token` 获取 |
| 阿里云 Token 接口 500 | Vercel 阻断 HTTP 出站，且 AccessKey 被删 | endpoint 改为 `https://`，重新创建 AccessKey，后端加缓存 |
| 语音 wss 域名未配置 | 微信公众平台 socket 白名单缺失 | 添加 `wss://nls-gateway.cn-shanghai.aliyuncs.com` |
| 模拟器报 IDLE_TIMEOUT | 模拟器无真实音频，启动时序错误 | 真机测试，先启动录音再启动 ASR，加录音锁 |
| 识别结果未回填文本框 | `completed` 事件 result 为空 | 用 `interimTextRef` 兜底，保留最终 interim 结果 |
| 按钮颜色不生效 | 组件 SCSS 不被 Taro 编译 | 改为全内联 style，默认灰底，录音中蓝底 |

---

## 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | Taro（React） | 与 Web 端 React 技术栈匹配，学习成本最低 |
| 用户体系 | 微信 openid → 自动创建用户 | 简化注册流程，无需密码 |
| 语音方案 | 阿里云小程序 SDK 实时流式 | 与 Web 端体验一致 |
| 分包规划 | 主包 + 4 个分包 | 避免主包 2MB 限制 |
| 小程序字体规范 | 与首页保持一致（标题16-20px，正文14px，辅助12px） | 避免不同页面字体大小差异过大 |

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

### 绑号制流程
```
Web 端：登录 → 个人中心 → 生成绑定码（32位大写，5分钟有效）
  ↓
小程序：我的 → 输入绑定码 → 确认绑定
  ↓
后端：将当前小程序 openid 关联到 Web 用户的 User 记录
  ↓
小程序：退出重新登录 → 继承 Web 账号的会员权限和练习记录
```

### 分包结构
```
subpkg-practice/    ← AI练习（选题/作答/批改/自定义题目/套题训练）
subpkg-zhenti/      ← 真题参考（列表/详情）
subpkg-shenlun/     ← 申论训练（列表/详情/OCR）
subpkg-history/     ← 练习记录（列表/详情）
```

### 语音答题实现
- 组件：`src/components/VoiceInput/index.tsx`（全内联样式）
- SDK：`src/utils/aliyun-nls/`（精简版，仅 st.js/nls.js/token.js 等核心文件）
- 后端：`/api/voice/aliyun-token`（`@alicloud/pop-core` 获取临时 Token，进程内缓存）
- 流程：
  ```
  按住录音 → wx.getRecorderManager() 启动 16kHz PCM
    ↓
  同时获取阿里云 Token
    ↓
  WebSocket 连接 wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1
    ↓
  实时发送音频 chunk → RecognitionResultChanged 返回 interim 结果
    ↓
  松开结束 → 关闭录音 → 发送 StopTranslationTask → 取最终文本
  ```
- 注意：小程序组件 SCSS 不编译，必须用内联 style；真机与模拟器表现差异大，务必真机测试

---

## 待办

1. ~~配置 Vercel 环境变量（WECHAT_APPID/SECRET）~~ ✅
2. ~~配置微信小程序服务器域名~~ ✅
3. ~~测试微信登录流程~~ ✅
4. ~~开发面试训练子页面（5 个入口卡片）~~ ✅
5. ~~开发 AI 练习页面（选题 → 文字作答 → AI 批改）~~ ✅
6. ~~开发真题参考列表/详情~~ ✅
7. ~~开发套题训练~~ ✅
8. ~~开发自定义题目~~ ✅
9. ~~开发练习记录~~ ✅
10. ~~开发政务要闻~~ ✅
11. ~~完善「我的」页面~~ ✅
12. ~~申论训练模块（列表/详情/AI 批改）~~ ✅
13. ~~语音答题功能（录音 → 上传 → 识别）~~ ✅
14. 等待备案/认证审核，配置服务器域名，上传代码提交审核
