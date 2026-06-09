const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session 配置
app.use(session({
  secret: 'animal-pedia-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    httpOnly: true
  }
}));

// 数据文件路径
const ANIMALS_FILE = path.join(__dirname, 'data', 'animals.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// 读取数据
function readAnimals() {
  const data = fs.readFileSync(ANIMALS_FILE, 'utf8');
  return JSON.parse(data);
}

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ========== API 路由 ==========

// 获取所有动物
app.get('/api/animals', (req, res) => {
  const animals = readAnimals();
  res.json(animals);
});

// 获取单个动物详情
app.get('/api/animals/:id', (req, res) => {
  const animals = readAnimals();
  const animal = animals.find(a => a.id === parseInt(req.params.id));
  
  if (!animal) {
    return res.status(404).json({ error: '动物不存在' });
  }
  
  res.json(animal);
});

// 搜索动物
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json([]);
  }
  
  const animals = readAnimals();
  const keyword = q.toLowerCase().trim();
  
  const results = animals.filter(animal => 
    animal.name.toLowerCase().includes(keyword) ||
    animal.category.toLowerCase().includes(keyword) ||
    animal.habitat.toLowerCase().includes(keyword) ||
    animal.description.toLowerCase().includes(keyword) ||
    animal.diet.toLowerCase().includes(keyword) ||
    animal.features.some(f => f.toLowerCase().includes(keyword))
  );
  
  res.json(results);
});

// 用户注册
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: '用户名至少需要3个字符' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少需要6个字符' });
  }
  
  const users = readUsers();
  
  // 检查用户名是否已存在
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  
  // 加密密码
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  const newUser = {
    id: Date.now(),
    username,
    password: hashedPassword,
    favorites: [],
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeUsers(users);
  
  // 设置session
  req.session.user = {
    id: newUser.id,
    username: newUser.username
  };
  
  res.json({
    success: true,
    message: '注册成功',
    user: {
      id: newUser.id,
      username: newUser.username,
      favorites: newUser.favorites
    }
  });
});

// 用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(400).json({ error: '用户名或密码错误' });
  }
  
  // 验证密码
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(400).json({ error: '用户名或密码错误' });
  }
  
  // 设置session
  req.session.user = {
    id: user.id,
    username: user.username
  };
  
  res.json({
    success: true,
    message: '登录成功',
    user: {
      id: user.id,
      username: user.username,
      favorites: user.favorites
    }
  });
});

// 用户登出
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: '登出失败' });
    }
    res.json({ success: true, message: '登出成功' });
  });
});

// 获取当前登录用户信息
app.get('/api/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: '未登录' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.id === req.session.user.id);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    favorites: user.favorites,
    createdAt: user.createdAt
  });
});

// 添加/取消收藏
app.post('/api/favorites/:animalId', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: '请先登录' });
  }
  
  const animalId = parseInt(req.params.animalId);
  const animals = readAnimals();
  const animal = animals.find(a => a.id === animalId);
  
  if (!animal) {
    return res.status(404).json({ error: '动物不存在' });
  }
  
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === req.session.user.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const user = users[userIndex];
  const favIndex = user.favorites.indexOf(animalId);
  
  let isFavorited;
  
  if (favIndex === -1) {
    // 添加收藏
    user.favorites.push(animalId);
    isFavorited = true;
  } else {
    // 取消收藏
    user.favorites.splice(favIndex, 1);
    isFavorited = false;
  }
  
  writeUsers(users);
  
  res.json({
    success: true,
    isFavorited,
    favorites: user.favorites
  });
});

// 获取用户收藏列表
app.get('/api/favorites', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: '请先登录' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.id === req.session.user.id);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const animals = readAnimals();
  const favoriteAnimals = animals.filter(a => user.favorites.includes(a.id));
  
  res.json(favoriteAnimals);
});

// 检查动物是否已收藏
app.get('/api/favorites/:animalId', (req, res) => {
  if (!req.session.user) {
    return res.json({ isFavorited: false });
  }
  
  const animalId = parseInt(req.params.animalId);
  const users = readUsers();
  const user = users.find(u => u.id === req.session.user.id);
  
  if (!user) {
    return res.json({ isFavorited: false });
  }
  
  const isFavorited = user.favorites.includes(animalId);
  res.json({ isFavorited });
});

// 按分类获取动物
app.get('/api/category/:category', (req, res) => {
  const { category } = req.params;
  const animals = readAnimals();
  
  const filtered = animals.filter(a => 
    a.category === category || a.category.includes(category)
  );
  
  res.json(filtered);
});

// 获取所有分类
app.get('/api/categories', (req, res) => {
  const animals = readAnimals();
  const categories = [...new Set(animals.map(a => a.category))];
  res.json(categories);
});

// ========== 页面路由 ==========

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🐾 Animal Pedia server is running on http://localhost:${PORT}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, 'public')}`);
});