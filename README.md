# 🐾 Animal Pedia - 动物图鉴网站

一个精美的动物图鉴网站，包含22种动物的详细介绍，支持搜索、收藏和用户系统。采用蓝绿色系设计风格，符合自然/动物主题。

## ✨ 功能特性

### 六大核心技术点
1. **🔐 用户登录注册系统** - 密码使用bcrypt加密，支持会话管理
2. **🔍 搜索功能** - 支持按动物名称、分类、栖息地、特征等关键词搜索
3. **📱 响应式布局** - 适配360px-1920px各种屏幕尺寸，移动端友好
4. **📚 动物数据管理** - 22种常见动物的详细数据，存放在JSON文件中
5. **❤️ 收藏功能** - 登录用户可以收藏喜欢的动物
6. **🚀 可部署架构** - 支持一键部署到Vercel或Netlify

### 页面列表
- 🏠 首页 - 动物列表网格展示 + 顶部导航栏 + 搜索框 + 分类筛选
- 🔍 搜索结果页 - 根据关键词展示匹配的动物列表
- 🐼 动物详情页 - 单个动物的详细介绍页面
- 👤 登录页 - 用户名/密码登录表单
- 📝 注册页 - 新用户注册表单
- 💖 个人中心页 - 用户信息展示 + 收藏的动物列表

## 🛠️ 技术栈

- **前端**: HTML + CSS + JavaScript（原生，不依赖框架）
- **后端**: Node.js + Express
- **数据存储**: JSON文件
- **密码加密**: bcryptjs
- **会话管理**: express-session

## 📁 项目结构

```
animal-pedia/
├── public/              # 前端静态文件
│   ├── css/
│   │   └── style.css    # 统一样式
│   ├── js/
│   │   └── app.js       # 前端交互逻辑
│   ├── index.html       # 首页
│   ├── login.html       # 登录页
│   ├── register.html    # 注册页
│   ├── search.html      # 搜索结果页
│   ├── animal.html      # 动物详情页
│   └── profile.html     # 个人中心页
├── data/
│   ├── animals.json     # 动物数据（22种）
│   └── users.json       # 用户数据（初始为空）
├── server.js            # Express后端服务
├── package.json         # 项目配置
├── vercel.json          # Vercel部署配置
└── README.md            # 说明文档
```

## 🚀 快速开始

### 本地运行

1. 安装依赖
```bash
npm install
```

2. 启动服务
```bash
npm start
```

> 如果你使用的是 PowerShell，请把两条命令分开执行，或写成两行；`&&` 是 Bash / CMD 风格，不是 PowerShell 的有效语法。

3. 访问网站
```
http://localhost:3000
```

## 📦 部署说明

### 方式一：部署到 Vercel

#### 前置准备
1. 注册 [Vercel](https://vercel.com) 账号
2. 安装 Vercel CLI（可选）

#### 步骤

**方法1：通过 Vercel 网站部署（推荐）**

1. 将项目代码推送到 GitHub / GitLab / Bitbucket
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project"
4. 选择你的项目仓库
5. 配置构建设置（通常会自动识别）
   - Framework Preset: Other
   - Build Command: `npm install`
   - Output Directory: `public`
   - Install Command: `npm install`
6. 点击 "Deploy" 等待部署完成

**方法2：通过 Vercel CLI 部署**

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
vercel

# 4. 生产环境部署
vercel --prod
```

### 方式二：部署到 Netlify

#### 前置准备
1. 注册 [Netlify](https://netlify.com) 账号

#### 步骤

**方法1：通过 Netlify 网站部署**

1. 将项目代码推送到 GitHub / GitLab / Bitbucket
2. 登录 [Netlify](https://app.netlify.com)
3. 点击 "Add new site" → "Import an existing project"
4. 选择你的代码仓库
5. 配置构建设置：
   - Build command: `npm install`
   - Publish directory: `public`
6. 点击 "Deploy site" 等待部署完成

> **注意**: Netlify 主要用于静态网站托管。如果需要完整的后端功能（登录注册、收藏等），建议使用 Vercel 或其他支持 Node.js 的平台。

### 方式三：部署到其他 Node.js 平台

本项目是标准的 Node.js + Express 应用，可以部署到任何支持 Node.js 的平台：

- **Heroku**
- **Railway**
- **Render**
- **Fly.io**
- **阿里云/腾讯云服务器**

部署步骤：
1. 上传代码到服务器
2. 运行 `npm install` 安装依赖
3. 设置环境变量 `PORT`（可选，默认3000）
4. 运行 `npm start` 启动服务
5. 配置反向代理（如使用 Nginx）

## 🔌 API 接口文档

### 动物相关

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/animals` | GET | 获取所有动物列表 |
| `/api/animals/:id` | GET | 获取单个动物详情 |
| `/api/search?q=关键词` | GET | 搜索动物 |
| `/api/categories` | GET | 获取所有分类 |
| `/api/category/:category` | GET | 按分类获取动物 |

### 用户相关

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/register` | POST | 用户注册 |
| `/api/login` | POST | 用户登录 |
| `/api/logout` | POST | 用户登出 |
| `/api/user` | GET | 获取当前登录用户信息 |

### 收藏相关

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/favorites` | GET | 获取用户收藏列表 |
| `/api/favorites/:animalId` | GET | 检查动物是否已收藏 |
| `/api/favorites/:animalId` | POST | 切换收藏状态 |

## 📊 动物数据

目前收录了 22 种动物，涵盖以下分类：

- 🐯 哺乳类（东北虎、大熊猫、非洲象、狮子、袋鼠、狼）
- 🦅 鸟类（丹顶鹤、金雕、孔雀、企鹅）
- 🦎 爬行类（鳄鱼、变色龙、眼镜王蛇）
- 🐸 两栖类（树蛙、大鲵、箭毒蛙）
- 🐟 鱼类（大白鲨、小丑鱼、海马）
- 🦋 无脊椎（蝴蝶、章鱼、蜜蜂）

每种动物包含以下信息：
- 名称、分类
- 图片
- 描述
- 栖息地
- 特征（数组）
- 食性
- 寿命

## 🎨 设计特点

- 蓝绿色系主色调，清新自然
- 渐变背景和卡片设计
- 平滑的动画过渡效果
- 卡片悬停动效
- Toast 提示消息
- 响应式布局适配各种设备

## 🔒 安全特性

- 密码使用 bcrypt 加密存储
- 用户会话管理
- 输入验证
- 未登录用户无法使用收藏功能

## 📝 更新日志

### v1.0.0 (2024)
- 初始版本发布
- 支持用户注册登录
- 支持动物搜索和分类浏览
- 支持收藏功能
- 响应式设计
- 完整的API接口

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

🐾 探索神奇的动物世界，从 Animal Pedia 开始！