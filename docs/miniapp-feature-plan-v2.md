# 小程序功能修改文档 v2

> 版本：v2.0
> 更新时间：2026-07-20
> 适用项目：申面智能小助手（Taro 微信小程序）
> 文档目标：整合「首页完善」「抽卡集卡」「专注功能」三大模块，形成可执行的产品/技术方案。

---

## 一、项目概述

### 1.1 背景

当前小程序已完成：
- 4 个训练模块（AI 面试、申论真题、政务要闻、练习记录）
- 每日任务 v2（自定义目标 1-20，panda 按完成比例切换）
- 全页面统一灰系像素风设计
- 用户体系与额度制

本版本新增 **学习激励系统**：通过「答题/专注 → 获得学习点 → 抽卡收集像素萌宠」的闭环，提升用户留存与活跃度。

### 1.2 目标

| 目标层级 | 描述 | 指标 |
|----------|------|------|
| 短期 | 答题/专注后给予即时奖励反馈 | 单次练习完成后奖励触达率 100% |
| 中期 | 形成「学习 → 奖励 → 收集 → 展示」闭环 | 收藏图鉴平均收集率、首页停留时长 |
| 长期 | 通过图鉴分享带来自然增长 | 分享率、新增用户来源占比 |

### 1.3 核心原则

- **不破坏现有额度制**：学习点是奖励维度，不替代答题额度。
- **不做氪金**：学习点仅通过学习和分享获得，不开放充值。
- **不强制社交**：分享是激励手段，不是任何功能的门槛。
- **合法合规**：所有收集品均为原创像素萌宠，不涉及名人肖像/赛事商标。
- **运动系列暂缓**：本次只上「萌宠系列」16 只，运动系列 v2.1 再做。

---

## 二、模块一：首页完善（已有功能升级）

### 2.1 每日任务 v2（已上线，本次保持）

| 项 | 设计 |
|----|------|
| 入口 | 首页 Hero 卡左上角 |
| 目标设置 | 齿轮图标弹层，范围 1-20，默认 3 |
| 进度计算 | 已完成 / 目标数 |
| panda 状态 | 0-32% 阅读 / 33-65% 写作 / 66%+ 点赞 |
| 跨天 | 已完成数重置，目标数保留 |

### 2.2 首页 mascot 装备系统（新增）

**设计目标**：用户抽到萌宠后，可将其装备在首页展示，替换或并置现有 panda。

| 项 | 设计 |
|----|------|
| 展示位置 | 首页 Hero 卡右侧，与每日任务进度区并列 |
| 默认状态 | 展示现有 panda（状态机仍保留） |
| 装备切换 | 点击 mascot 区域 → 弹出「我的萌宠」选择器 |
| 已装备 | 选中的萌宠覆盖 panda 静态位置；panda 状态机改成小图标显示在进度条旁 |
| 未收集 | 展示「?」灰色轮廓，提示「去补给站抽取」 |
| 稀有度展示 | 稀有级萌宠装备时，头像框带蓝色细闪动效 |

### 2.3 首页入口调整

| 入口 | 位置 | 说明 |
|------|------|------|
| 训练模块 | 首页中部 | 保持现有 4 卡布局 |
| 补给站 | 首页 Hero 卡下方新增一行 | 显示当前学习点数 + 「去补给站」按钮 |
| 专注台 | 首页 Hero 卡下方新增一行 | 显示今日专注时长 + 「开始专注」按钮 |
| 我的图鉴 | 我的页面 | 已有入口 |

---

## 三、模块二：抽卡集卡系统

### 3.1 货币：学习点

| 项 | 设计 |
|----|------|
| 名称 | 学习点 |
| 用途 | 仅用于抽取补给品 |
| 获取方式 | 答题完成、专注完成、每日签到、分享奖励 |
| 与额度关系 | 完全隔离，不可兑换额度 |

### 3.2 学习点获取规则

| 行为 | 学习点奖励 | 触发点 |
|------|----------|--------|
| AI 智能练习 - 单题完成 | +1 | subpkg-practice/question |
| 套题训练 - 整套完成 | +3 | subpkg-practice/set-question |
| 面试真题 - 我的作答完成 | +1 | subpkg-zhenti/detail |
| 申论训练 - 提交完成 | +1 | subpkg-shenlun/detail |
| 专注 30 分钟 | +2 | subpkg-focus/timer |
| 专注 60 分钟 | +4 | subpkg-focus/timer |
| 每日签到 | +1 | 首页每日首次打开 |
| 分享补给品 | 双方各 +1 | 分享卡片页 |
| 重复抽到已拥有 | 自动 +2 | 补给站抽奖 |

### 3.3 补给站抽奖

| 项 | 设计 |
|----|------|
| 入口 | 首页 Hero 卡、我的页面 |
| 单次消耗 | 3 学习点 |
| 免费抽 | 每日 1 次（0 点刷新），产出固定为「普通」品质 |
| 动画 | 补给品盒从屏幕外飞入 → 抖动 → 揭示 |
| 概率 | 普通 80% / 稀有 20% |

### 3.4 萌宠系列图鉴（16 只）

本次只开放「萌宠系列」，其他品类后续迭代。

| 序号 | 名称 | 稀有度 | 获取方式 | 视觉特征 |
|------|------|--------|----------|----------|
| 1 | 橘猫 | 普通 | 新手默认 | 橘色、白胸口、黑眼睛 |
| 2 | 蓝猫 | 普通 | 抽奖 | 蓝灰色、铜色眼 |
| 3 | 银渐层 | 普通 | 抽奖 | 银灰毛、绿眼 |
| 4 | 布偶 | 稀有 | 抽奖 | 重点色、蓝眼 |
| 5 | 柯基 | 普通 | 抽奖 | 黄白、短腿、大耳朵 |
| 6 | 柴犬 | 普通 | 抽奖 | 橙棕、三角耳、卷尾 |
| 7 | 泰迪 | 普通 | 抽奖 | 棕色卷毛、圆头 |
| 8 | 金毛 | 普通 | 抽奖 | 金色、长耳、微笑 |
| 9 | 哈士奇 | 普通 | 抽奖 | 灰白、蓝眼、面罩 |
| 10 | 萨摩耶 | 普通 | 抽奖 | 纯白、微笑 |
| 11 | 边牧 | 普通 | 抽奖 | 黑白、尖耳 |
| 12 | 仓鼠 | 普通 | 抽奖 | 圆球、金棕、小耳 |
| 13 | 垂耳兔 | 普通 | 抽奖 | 灰色、长耳 |
| 14 | 龙猫 | 稀有 | 抽奖 | 灰毛、大耳、圆身 |
| 15 | 小熊猫 | 稀有 | 抽奖 | 红棕、白脸纹、条纹尾 |
| 16 | 企鹅 | 稀有 | 抽奖 | 黑白、橙嘴橙脚 |

**稀有萌宠（4 只）**：布偶、龙猫、小熊猫、企鹅。稀有萌宠获取概率较低，作为全系列收集目标。

### 3.5 图鉴系统

| 项 | 设计 |
|----|------|
| 入口 | 我的页面 → 我的图鉴 |
| 展示 | 网格布局，16 宫格 |
| 已收集 | 彩色像素图 + 收集日期 |
| 未收集 | 灰色剪影 + 「??」 |
| 进度 | 顶部显示「16/16」或百分比进度条 |
| 成就 | 收集齐全部 16 只，奖励 30 学习点 + 限定称号「萌宠大师」 |
| 详情页 | 点击任一萌宠 → 全屏展示 + 装备按钮 |

### 3.6 分享卡片

| 项 | 设计 |
|----|------|
| 入口 | 图鉴详情页 / 抽到稀有时弹窗 |
| 内容 | 像素萌宠大图 + 昵称 + 收集日期 + 小程序码 |
| 尺寸 | 正方形 1080×1080，适合朋友圈 |
| 奖励 | 分享后，双方各 +1 学习点 |

---

## 四、模块三：专注功能（番茄钟）

### 4.1 专注台

| 项 | 设计 |
|----|------|
| 入口 | 首页 Hero 卡下方「开始专注」按钮、底部 Tab 暂不加 |
| 页面 | 新页面 `/subpkg-focus/pages/timer/index` |
| 时长 | 30 / 60 分钟两档 |
| 视觉 | 居中显示当前装备的萌宠，倒计时大字，进度环 |
| 白噪音 | 可选 3 种：雨声、图书馆、白噪音（v2.1 再扩展） |
| 完成奖励 | 按时长发放学习点（见 3.2） |
| 防作弊 | 切后台 5 分钟以上自动放弃 |
| 暂停 | 最多暂停 1 次，每次不超过 5 分钟 |

### 4.2 与每日任务的关系

- 专注**不直接增加**每日任务完成次数。
- 但专注期间如果用户同时完成答题，仍按正常答题规则计数。
- 首页展示「今日专注时长」作为个人记录。

### 4.3 专注统计

| 项 | 设计 |
|----|------|
| 展示位置 | 我的页面 → 学习数据 |
| 数据 | 今日专注时长、本周专注总时长、累计专注次数 |
| 最长 streak | 连续专注天数 |

---

## 五、数据模型（Prisma）

```prisma
model UserPoints {
  userId      String   @id
  points      Int      @default(0)
  totalEarned Int      @default(0)
  totalSpent  Int      @default(0)
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
}

model PointsLog {
  id        Int      @id @default(autoincrement())
  userId    String
  amount    Int
  type      String   // answer / focus / dailySign / drawRepeat / share
  refId     String?
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
}

model SupplyItem {
  id          Int      @id @default(autoincrement())
  category    String   // pixelPet / badge / theme / quote
  rarity      String   // common / rare
  name        String
  description String?
  imageUrl    String
  unlockHint  String?
  isLimited   Boolean  @default(false)
  validFrom   DateTime?
  validTo     DateTime?
  createdAt   DateTime @default(now())
}

model UserCollection {
  id         Int      @id @default(autoincrement())
  userId     String
  itemId     Int
  source     String   // freeDraw / paidDraw / focus / signIn / share
  obtainedAt DateTime @default(now())
  isEquipped Boolean  @default(false)
  user       User     @relation(fields: [userId], references: [id])
  item       SupplyItem @relation(fields: [itemId], references: [id])
  @@unique([userId, itemId])
  @@index([userId, obtainedAt])
}

model FocusSession {
  id        Int      @id @default(autoincrement())
  userId    String
  duration  Int      // 分钟
  status    String   // completed / abandoned / cheated
  startedAt DateTime
  endedAt   DateTime?
  createdAt DateTime @default(now())
  @@index([userId, startedAt])
}
```

---

## 六、API 设计

| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/points/balance` | GET | 当前学习点余额 |
| `/api/points/log` | GET | 学习点流水 |
| `/api/points/earn` | POST | 发放学习点（答题/专注/签到） |
| `/api/draw` | POST | 单次抽奖（source: free / paid） |
| `/api/collection` | GET | 我的图鉴 |
| `/api/collection/equip` | POST | 装备某萌宠到首页 |
| `/api/collection/share` | POST | 标记分享，发放奖励 |
| `/api/focus/start` | POST | 开始专注 |
| `/api/focus/end` | POST | 结束专注并校验奖励 |
| `/api/focus/stats` | GET | 专注统计数据 |

---

## 七、页面清单

| 页面 | 路径 | 新增/修改 | 复杂度 |
|------|------|----------|--------|
| 首页 | `pages/index/index` | 修改 | 中 |
| 补给站 | `subpkg-supply/pages/draw/index` | 新增 | 高 |
| 我的图鉴 | `subpkg-supply/pages/collection/index` | 新增 | 中 |
| 图鉴详情 | `subpkg-supply/pages/collection/detail` | 新增 | 低 |
| 分享卡片 | `subpkg-supply/pages/share/index` | 新增 | 中 |
| 专注台 | `subpkg-focus/pages/timer/index` | 新增 | 中 |
| 专注统计 | `subpkg-focus/pages/stats/index` | 新增 | 低 |
| 我的 | `pages/profile/profile` | 修改 | 低 |

---

## 八、实施路线图

### Phase 1：数据与基础抽奖（1 周）

- 后端：Prisma 模型 + 学习点发放/抽奖 API
- 前端：补给站页面 + 抽奖动画
- 萌宠素材：16 只 120×120 像素图入资源库
- 首页：新增学习点余额入口

**验收**：答题得学习点 → 能抽奖 → 能在图鉴看到。

### Phase 2：首页装备与图鉴完善（1 周）

- 首页 mascot 装备选择器
- 我的图鉴页面（16 宫格）
- 图鉴详情页 + 装备/分享按钮
- 收集齐 16 只成就奖励

**验收**：抽到萌宠 → 能在首页装备 → 切换生效。

### Phase 3：专注台（1 周）

- 专注台番茄钟页面
- 白噪音（基础 3 种）
- 防作弊逻辑（切后台检测）
- 专注统计页面

**验收**：专注 30 分钟 → 获得学习点 → 可继续抽奖。

### Phase 4：分享裂变与调优（1 周）

- 分享卡片生成（canvas）
- 分享奖励机制
- 埋点：抽奖次数、分享率、停留时长
- 概率/奖励数值微调

**验收**：分享图鉴 → 双方各得 1 学习点。

---

## 九、风险与边界

### 9.1 风险点

| 风险 | 应对措施 |
|------|----------|
| 未成年人沉迷抽奖 | 单日抽奖上限 50 次；未成年人模式不展示抽奖入口 |
| 氪金化 | 学习点不可充值，仅通过学习和分享获得 |
| 版权 | 全部使用原创像素萌宠，不上名人/赛事形象 |
| 刷分 | 答题时长校验 + 切后台检测 + 抽奖限流 |
| 与额度制混淆 | 产品文案明确区分「答题额度」和「学习点」 |

### 9.2 明确不做

- ❌ 现金充值 / 提现 / 交易
- ❌ 玩家间交易或赠送补给品
- ❌ 强制分享解锁功能
- ❌ 运动系列（v2.1 再做）
- ❌ 公考名师头像 / 申论金句卡 / 时政热点卡（v2.1 或更后）

---

## 十、验收标准

### 10.1 首页完善

- [ ] 每日任务目标可设置 1-20，默认 3
- [ ] panda 按 0-32%/33-65%/66%+ 比例切换
- [ ] 首页 mascot 可切换为已收集的萌宠
- [ ] 未收集萌宠显示「?」引导去补给站

### 10.2 抽卡集卡

- [ ] 16 只萌宠全部可在图鉴查看
- [ ] 答题/专注后正确发放学习点
- [ ] 3 学习点抽奖动画流畅
- [ ] 重复获得自动 +2 学习点
- [ ] 收集齐 16 只触发成就奖励

### 10.3 专注功能

- [ ] 30/60 分钟两档专注
- [ ] 切后台 5 分钟以上自动放弃
- [ ] 完成专注按时长发放学习点
- [ ] 专注统计正确展示

---

## 十一、附录：16 只萌宠命名规范

用于资源文件名、数据库 name 字段、多语言 key：

| 中文名 | 英文名 | 文件名 |
|--------|--------|--------|
| 橘猫 | OrangeCat | pet-orange-cat-120.png |
| 蓝猫 | BlueCat | pet-blue-cat-120.png |
| 银渐层 | SilverShaded | pet-silver-shaded-120.png |
| 布偶 | Ragdoll | pet-ragdoll-120.png |
| 柯基 | Corgi | pet-corgi-120.png |
| 柴犬 | Shiba | pet-shiba-120.png |
| 泰迪 | Poodle | pet-poodle-120.png |
| 金毛 | GoldenRetriever | pet-golden-retriever-120.png |
| 哈士奇 | Husky | pet-husky-120.png |
| 萨摩耶 | Samoyed | pet-samoyed-120.png |
| 边牧 | BorderCollie | pet-border-collie-120.png |
| 仓鼠 | Hamster | pet-hamster-120.png |
| 垂耳兔 | LopRabbit | pet-lop-rabbit-120.png |
| 龙猫 | Chinchilla | pet-chinchilla-120.png |
| 小熊猫 | RedPanda | pet-red-panda-120.png |
| 企鹅 | Penguin | pet-penguin-120.png |

---

**变更日志**
- v2.1（2026-07-20）：货币名称由「灵石」改为「学习点」；调整额度规则（单题/套题/面试/申论/专注/签到/分享/重复/抽奖消耗），移除十连抽；专注时长改为 30/60 分钟两档。
- v2.0（2026-07-20）：整合首页完善、抽卡集卡、专注功能三大模块；确定 16 只萌宠清单；运动系列暂不纳入。
