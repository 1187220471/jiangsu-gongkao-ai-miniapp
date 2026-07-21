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

**目标**：等待上传代码提交审核
**已完成**：
- Taro 初始化 + 5 个 Tab 页面（首页/面试/申论/要闻/我的）+ 5 个分包（practice/zhenti/shenlun/history/supply/focus）
- 微信登录（`/api/auth/wechat-login`） + 绑号制（Web 主账号 + 微信扫码绑定）
- 5 个面试训练入口 + 申论训练模块（列表/详情/作答/AI 批改/OCR） + 政务要闻 + 练习记录
- 语音答题（阿里云 ASR 实时流式 + AudioUploader 上传文件）
- 申论题型标准化 6 类（与 Web 端对齐）
- 小程序备案通过（2026-07-16），名称改为「申面智能小助手」
- **2026-07-17**：全部页面样式统一为首页像素风灰系设计；面试页+申论页改用首页模块布局；按钮黑/白底文字颜色 bug 修复 7 处；每日任务 v2（自定义目标 1-20，panda 按完成比例切换）；Git 推送切 SSH
- **2026-07-20**：补给站抽卡集卡 Phase 1 上线（学习点货币、16 像素萌宠图鉴、白底抽卡机页、4 个答题点接入 earnPoints）；稀有度定版 2 档；免费抽改服务端判定；双仓库已推送
- **2026-07-21**：补给站 Phase 2（首页 mascot 装备选择器 + 稀有 shimmer 动效）；Phase 3 专注功能（30/60 分钟番茄钟 +2/+4 学习点，切后台超 5 分钟弹提示「继续/放弃」）；首页新增专注台入口卡片

---

## 踩坑记录

| 问题 | 根因 | 解决方案 |
|------|------|---------|
| TabBar 图标缺失 | `app.config.ts` 配置了 `iconPath` 但无图片文件 | 移除 `iconPath`，只用文字标签 |
| `touristappid` 报错 | `project.config.json` 写的是 `touristappid` | 改为真实 AppID `wxc080dddfc5b7cda2` |
| 登录失败：invalid code | 游客模式 `wx.login()` 返回模拟 code | 改用真实 AppID |
| 登录失败：域名不在白名单 | Vercel 301 重定向 → POST 降级 GET，code 丢失 | 直接用 `www.mianshidati.xyz`，微信后台加白名单 |
| 预览模式 SyntaxError | `project.config.json` 中 `es6: false`，可选链 `?.` 未被转译 | 改为 `es6: true`，清缓存重新编译 |
| 真机调试栈溢出 | Taro 调试器 source map 注入冲突 | 使用预览模式代替真机调试 |
| 字体太小 | Taro 默认 `designWidth=750`，px 转 rpx 后缩小一倍 | 改为 `designWidth: 375`（转换比例 2:1）|
| **组件 SCSS 不生效** | Taro 不编译 `src/components/**/*.scss` | **必须用内联 style**（语音按钮、ImageUploader 等都改内联） |
| 语音 SDK 路径报错 | 相对路径错误 | `../aliyun-nls/st` → `../../utils/aliyun-nls/st` |
| `process is not defined` | 小程序无 `process.env` | 删除环境变量引用，Token/AppKey 从后端 `/api/voice/aliyun-token` 获取 |
| 阿里云 Token 接口 500 | Vercel 阻断 HTTP 出站，且 AccessKey 被删 | endpoint 改为 `https://`，重新创建 AccessKey，后端加缓存 |
| 语音 wss 域名未配置 | 微信公众平台 socket 白名单缺失 | 添加 `wss://nls-gateway.cn-shanghai.aliyuncs.com` |
| 模拟器 IDLE_TIMEOUT | 模拟器无真实音频，启动时序错误 | 真机测试，先启动录音再启动 ASR，加录音锁 |
| 识别结果未回填文本框 | `completed` 事件 `result` 为空 | 用 `interimTextRef` 兜底，保留最终 interim 结果 |
| **GitHub HTTPS push 频繁超时** | 本机 port 443 / HTTP2 framing 错误 | **切换为 SSH**（见根 MEMORY.md） |
| 按钮黑底黑字/白底白字 | 批量样式替换时改错了激活态文字色 | 激活态文字按背景反色：黑底配 `#ffffff`，白底配 `#111827` |

---

## 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | Taro（React） | 与 Web 端 React 技术栈匹配 |
| 用户体系 | 微信 openid → 自动创建用户 | 简化注册流程 |
| 语音方案 | 阿里云小程序 SDK 实时流式 | 与 Web 端体验一致 |
| 分包规划 | 主包 + 4 个分包 | 避免主包 2MB 限制 |
| 视觉风格 | 像素风 App + 灰系（`#f5f5f5` 背景 + 圆角白卡 + 像素图标） | 与参考图风格对齐 |
| 每日任务 | **按完成比例切换 panda 状态**（v2：自定义 1-20 目标） | 比固定次数更灵活 |
| 每日任务入口 | 首页内齿轮弹层（不放「我的」页） | 用户明确要求 |
| Git 协议 | **SSH** | 解决本机 HTTPS 频繁超时 |
| 补给站稀有度 | 2 档：12 普通 + 4 稀有，付费抽 80/20 | 用户要求简化（原 4 档太多） |
| 免费抽状态 | 服务端判定（balance 接口返回 `freeDrawUsedToday`），禁用本地 storage | 本地 storage 有 UTC 时区偏差 + 多端不同步 |

---

## 技术细节

### 微信登录流程
`wx.login()` 取 code → POST `/api/auth/wechat-login` → 后端 code 换 openid → 查找/创建 User → 返回 JWT → 小程序存 token，后续请求带 Authorization

### 绑号制流程
Web 端个人中心生成绑定码（32 位大写，5 分钟有效）→ 小程序「我的」输入绑定码 → 后端关联 openid 到 Web 用户 → 重新登录继承 Web 账号会员权限和练习记录

### 分包结构
```
subpkg-practice/    ← AI练习（选题/作答/批改/自定义题目/套题训练）
subpkg-zhenti/      ← 真题参考（列表/详情）
subpkg-shenlun/     ← 申论训练（列表/详情/OCR）
subpkg-history/     ← 练习记录（列表/详情）
subpkg-supply/      ← 补给站（抽卡机/图鉴/详情）
```

### 语音答题实现
- 组件：`src/components/VoiceInput/index.tsx`（**全内联样式**，Taro 不编译组件 SCSS）
- SDK：`src/utils/aliyun-nls/`（精简版，仅 st.js/nls.js/token.js 等核心文件）
- 后端：`/api/voice/aliyun-token`（`@alicloud/pop-core` 获取临时 Token，进程内缓存）
- 流程：按住录音（16kHz PCM）+ 同时取 Token → WebSocket 连 `wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1` → 实时发 chunk 收 interim 结果 → 松开发送停止指令取最终文本
- 注意：小程序组件 SCSS 不编译，必须用内联 style；真机与模拟器表现差异大，务必真机测试

### 每日任务状态机
- 工具模块：`src/utils/dailyTask.ts`
  - `getDailyTask()`：返回 `{ count, target, progress, stage }`
  - `completeDailyTask()`：完成一次练习后 `count < target` 时 +1
  - `setDailyTaskTarget(n)`：设置目标（1-20）
  - `getMascotStage(count, target)`：按比例返回 0/1/2（阅读/写作/点赞）
- 存储：localStorage key `dailyTask`，跨天只重置 `count` 不重置 `target`
- 4 个练习完成点调用 `completeDailyTask()`：单题/套题/真题批改/申论批改
- UI 入口：首页内齿轮图标（`.target-gear`）→ 弹层 → 预设按钮 1/3/5/10 + 步进器

### 像素风图标
- 4 个训练模块图标：`src/assets/icons/{microphone,scroll,newspaper,clock}.png`
- 每个图标 16×16 网格 × 6px = 96×96 PNG
- 配色（4 档灰 + 轻微主题色调）：
  - 话筒：蓝灰 `#4a5568` / `#7888a0` / `#eef2f8`
  - 笔记本：绿灰 `#4a5560` / `#78a088` / `#eef8f2`
  - 报纸：暖灰 `#555048` / `#a09878` / `#f8f4ee`
  - 时钟：紫灰 `#504a55` / `#8878a0` / `#f4eef8`
- 渲染：`image-rendering: pixelated` 保持锐利
- 容器：56×56 圆角 14px，背景为对应浅色

### 补给站（抽卡集卡）
- 货币「学习点」：答题单题/真题/申论 +1、套题 +3、签到 +1；抽奖 3 点/次，每日 1 次免费
- 后端 API：`/api/supply/{balance,earn,draw,collection,collection/equip}`；逻辑库 `daijinli-web/src/lib/supply.ts`
- 16 萌宠素材：`src/assets/collection/pet-*.png`（120×120 透明底），`utils/petAssets.ts` 映射 imageUrl → 本地资源
- 抽卡机页（`subpkg-supply/pages/draw/`）：白底机身 + 三滚筒错停（1.0/1.3/1.6s）+ 可点拉杆；滚动用 `setInterval` 100ms 切图
- 免费抽：服务端判定（PointsLog 今日 `free:` 记录），页面 catch 到「免费已用完」自动同步状态（错误自愈）
- 图片去底脚本：`scripts/fix-*-bg.py`（采样四角背景色 → alpha 置 0 → 裁剪居中缩放）
- `assets-concepts/`（AI 原图 31MB）已加入 .gitignore，不入库
