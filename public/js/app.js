// ========== 工具函数 ==========

// 显示Toast提示
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// 获取URL参数
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// 检查用户登录状态
async function checkAuth() {
  try {
    const response = await fetch('/api/user');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ========== 导航栏功能 ==========

// 初始化导航栏
async function initNavbar() {
  const user = await checkAuth();
  const navUser = document.getElementById('navUser');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  
  if (user) {
    navUser.innerHTML = `
      <a href="profile.html" class="nav-link">
        <span class="user-avatar">${user.username.charAt(0).toUpperCase()}</span>
        <span>${user.username}</span>
      </a>
      <button class="btn-login" onclick="logout()" style="border-color: rgba(255,255,255,0.5);">退出</button>
    `;
  } else {
    navUser.innerHTML = `
      <a href="login.html" class="btn-login">登录</a>
      <a href="register.html" class="btn-register">注册</a>
    `;
  }
  
  // 移动端菜单
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('show');
    });
  }
  
  // 设置当前页面激活状态
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// 登出
async function logout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      showToast('已退出登录', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  } catch (error) {
    showToast('退出失败，请重试', 'error');
  }
}

// ========== 动物卡片渲染 ==========

// 创建动物卡片HTML
function createAnimalCard(animal) {
  return `
    <div class="animal-card" onclick="viewAnimal(${animal.id})">
      <img src="${animal.image}" alt="${animal.name}" class="animal-card-img">
      <button class="favorite-btn ${animal.isFavorite ? 'active' : ''}" 
              onclick="event.stopPropagation(); toggleFavorite(${animal.id}, this)">
        ${animal.isFavorite ? '❤️' : '🤍'}
      </button>
      <div class="animal-card-body">
        <span class="animal-card-category">${animal.category}</span>
        <h3 class="animal-card-name">${animal.name}</h3>
        <p class="animal-card-desc">${animal.description}</p>
      </div>
    </div>
  `;
}

// 查看动物详情
function viewAnimal(id) {
  window.location.href = `animal.html?id=${id}`;
}

// 切换收藏状态
async function toggleFavorite(animalId, button) {
  const user = await checkAuth();
  
  if (!user) {
    showToast('请先登录后收藏', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  
  try {
    const response = await fetch(`/api/favorites/${animalId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.isFavorited) {
      button.classList.add('active');
      button.textContent = '❤️';
      showToast('已添加到收藏', 'success');
    } else {
      button.classList.remove('active');
      button.textContent = '🤍';
      showToast('已取消收藏', 'info');
    }
  } catch (error) {
    showToast('操作失败，请重试', 'error');
  }
}

// 加载收藏状态并渲染
async function loadAnimalsWithFavorites(animals) {
  const user = await checkAuth();
  
  if (user) {
    for (const animal of animals) {
      try {
        const response = await fetch(`/api/favorites/${animal.id}`);
        const data = await response.json();
        animal.isFavorite = data.isFavorited;
      } catch (error) {
        animal.isFavorite = false;
      }
    }
  } else {
    animals.forEach(animal => animal.isFavorite = false);
  }
  
  return animals;
}

// ========== 首页功能 ==========

async function initHomePage() {
  await initNavbar();
  
  const animalsGrid = document.getElementById('animalsGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const categoryFilter = document.getElementById('categoryFilter');
  
  // 加载分类
  try {
    const catResponse = await fetch('/api/categories');
    const categories = await catResponse.json();
    
    let categoryHtml = '<button class="category-btn active" data-category="all">全部</button>';
    categories.forEach(cat => {
      categoryHtml += `<button class="category-btn" data-category="${cat}">${cat}</button>`;
    });
    categoryFilter.innerHTML = categoryHtml;
    
    // 分类筛选事件
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        await loadAnimals(category);
      });
    });
  } catch (error) {
    console.error('加载分类失败:', error);
  }
  
  // 搜索功能
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
      }
    }
  });
  
  // 加载动物列表
  await loadAnimals('all');
  
  // 加载页脚
  loadFooter();
}

async function loadAnimals(category = 'all') {
  const animalsGrid = document.getElementById('animalsGrid');
  animalsGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  try {
    let url = '/api/animals';
    if (category !== 'all') {
      url = `/api/category/${category}`;
    }
    
    const response = await fetch(url);
    let animals = await response.json();
    
    // 加载收藏状态
    animals = await loadAnimalsWithFavorites(animals);
    
    if (animals.length === 0) {
      animalsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">🐾</div>
          <p class="empty-state-text">暂无该分类的动物</p>
        </div>
      `;
      return;
    }
    
    animalsGrid.innerHTML = animals.map(animal => createAnimalCard(animal)).join('');
  } catch (error) {
    animalsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">😢</div>
        <p class="empty-state-text">加载失败，请刷新重试</p>
      </div>
    `;
  }
}

// ========== 搜索结果页 ==========

async function initSearchPage() {
  await initNavbar();
  
  const query = getQueryParam('q');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultsCount = document.getElementById('resultsCount');
  const animalsGrid = document.getElementById('animalsGrid');
  
  if (query) {
    searchInput.value = query;
    document.getElementById('searchKeyword').textContent = query;
    
    await performSearch(query);
  }
  
  // 搜索功能
  searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q) {
      window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }
    }
  });
  
  loadFooter();
}

async function performSearch(query) {
  const animalsGrid = document.getElementById('animalsGrid');
  const resultsCount = document.getElementById('resultsCount');
  
  animalsGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    let animals = await response.json();
    
    resultsCount.innerHTML = `找到 <strong>${animals.length}</strong> 个相关结果`;
    
    if (animals.length === 0) {
      animalsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">🔍</div>
          <p class="empty-state-text">没有找到相关动物</p>
          <p style="margin-top: 0.5rem; color: #94A3B8;">试试其他关键词吧</p>
        </div>
      `;
      return;
    }
    
    // 加载收藏状态
    animals = await loadAnimalsWithFavorites(animals);
    
    animalsGrid.innerHTML = animals.map(animal => createAnimalCard(animal)).join('');
  } catch (error) {
    animalsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">😢</div>
        <p class="empty-state-text">搜索失败，请刷新重试</p>
      </div>
    `;
  }
}

// ========== 动物详情页 ==========

async function initAnimalPage() {
  await initNavbar();
  
  const animalId = getQueryParam('id');
  
  if (!animalId) {
    window.location.href = 'index.html';
    return;
  }
  
  await loadAnimalDetail(animalId);
  loadFooter();
}

async function loadAnimalDetail(id) {
  const container = document.getElementById('animalDetail');
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  try {
    const response = await fetch(`/api/animals/${id}`);
    const animal = await response.json();
    
    // 获取收藏状态
    let isFavorite = false;
    const user = await checkAuth();
    if (user) {
      const favResponse = await fetch(`/api/favorites/${id}`);
      const favData = await favResponse.json();
      isFavorite = favData.isFavorited;
    }
    
    container.innerHTML = `
      <div class="animal-detail">
        <div class="animal-detail-header">
          <img src="${animal.image}" alt="${animal.name}" class="animal-detail-img">
          <div class="animal-detail-info">
            <h1>${animal.name}</h1>
            <span class="animal-detail-category">${animal.category}</span>
            <p class="animal-detail-desc">${animal.description}</p>
            <div class="animal-stats">
              <div class="stat-card">
                <div class="stat-label">食性</div>
                <div class="stat-value">${animal.diet}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">寿命</div>
                <div class="stat-value">${animal.lifespan}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">收藏数</div>
                <div class="stat-value">${user ? user.favorites ? user.favorites.length : 0 : 0}</div>
              </div>
            </div>
            <button class="favorite-large-btn ${isFavorite ? 'active' : ''}" 
                    onclick="toggleFavorite(${animal.id}, this)">
              <span>${isFavorite ? '❤️' : '🤍'}</span>
              <span>${isFavorite ? '已收藏' : '收藏'}</span>
            </button>
          </div>
        </div>
        <div class="animal-detail-body">
          <div class="detail-section">
            <h2>🏠 栖息地</h2>
            <div class="habitat-info">
              <span class="habitat-icon">🌳</span>
              <span>${animal.habitat}</span>
            </div>
          </div>
          <div class="detail-section">
            <h2>✨ 特征</h2>
            <div class="features-list">
              ${animal.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 2rem; text-align: center;">
        <a href="index.html" style="color: var(--primary-color); font-weight: 600;">← 返回动物列表</a>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">😢</div>
        <p class="empty-state-text">加载失败，请刷新重试</p>
      </div>
    `;
  }
}

// ========== 登录页 ==========

async function initLoginPage() {
  await initNavbar();
  
  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // 验证
    if (!username || !password) {
      errorMsg.textContent = '请填写用户名和密码';
      errorMsg.classList.add('show');
      return;
    }
    
    errorMsg.classList.remove('show');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('登录成功！', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        errorMsg.textContent = data.error || '登录失败';
        errorMsg.classList.add('show');
      }
    } catch (error) {
      errorMsg.textContent = '网络错误，请稍后重试';
      errorMsg.classList.add('show');
    }
  });
  
  loadFooter();
}

// ========== 注册页 ==========

async function initRegisterPage() {
  await initNavbar();
  
  const registerForm = document.getElementById('registerForm');
  const errorMsg = document.getElementById('errorMsg');
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证
    if (!username || !password || !confirmPassword) {
      errorMsg.textContent = '请填写所有字段';
      errorMsg.classList.add('show');
      return;
    }
    
    if (username.length < 3) {
      errorMsg.textContent = '用户名至少需要3个字符';
      errorMsg.classList.add('show');
      return;
    }
    
    if (password.length < 6) {
      errorMsg.textContent = '密码至少需要6个字符';
      errorMsg.classList.add('show');
      return;
    }
    
    if (password !== confirmPassword) {
      errorMsg.textContent = '两次输入的密码不一致';
      errorMsg.classList.add('show');
      return;
    }
    
    errorMsg.classList.remove('show');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('注册成功！', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        errorMsg.textContent = data.error || '注册失败';
        errorMsg.classList.add('show');
      }
    } catch (error) {
      errorMsg.textContent = '网络错误，请稍后重试';
      errorMsg.classList.add('show');
    }
  });
  
  loadFooter();
}

// ========== 个人中心页 ==========

async function initProfilePage() {
  await initNavbar();
  
  const user = await checkAuth();
  
  if (!user) {
    showToast('请先登录', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  
  // 渲染用户信息
  document.getElementById('profileUsername').textContent = user.username;
  document.getElementById('profileAvatar').textContent = user.username.charAt(0).toUpperCase();
  document.getElementById('joinDate').textContent = `加入于 ${formatDate(user.createdAt)}`;
  document.getElementById('favCount').textContent = user.favorites ? user.favorites.length : 0;
  
  // 加载收藏列表
  await loadFavorites();
  
  loadFooter();
}

async function loadFavorites() {
  const favGrid = document.getElementById('favoritesGrid');
  favGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  try {
    const response = await fetch('/api/favorites');
    let animals = await response.json();
    
    // 标记收藏状态
    animals = animals.map(a => ({ ...a, isFavorite: true }));
    
    if (animals.length === 0) {
      favGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">❤️</div>
          <p class="empty-state-text">还没有收藏任何动物</p>
          <a href="index.html" style="color: var(--primary-color); font-weight: 600; margin-top: 1rem; display: inline-block;">
            去探索动物世界 →
          </a>
        </div>
      `;
      return;
    }
    
    document.getElementById('favCount').textContent = animals.length;
    favGrid.innerHTML = animals.map(animal => createAnimalCard(animal)).join('');
  } catch (error) {
    favGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">😢</div>
        <p class="empty-state-text">加载失败，请刷新重试</p>
      </div>
    `;
  }
}

// ========== 页脚 ==========

function loadFooter() {
  const footer = document.getElementById('footer');
  if (footer) {
    footer.innerHTML = `
      <div class="footer-logo">🐾 Animal Pedia</div>
      <p class="footer-desc">探索神奇的动物世界，了解更多有趣的动物知识</p>
      <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.6;">© 2024 Animal Pedia. All rights reserved.</p>
    `;
  }
}

// ========== 页面初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  
  switch (page) {
    case 'home':
      initHomePage();
      break;
    case 'search':
      initSearchPage();
      break;
    case 'animal':
      initAnimalPage();
      break;
    case 'login':
      initLoginPage();
      break;
    case 'register':
      initRegisterPage();
      break;
    case 'profile':
      initProfilePage();
      break;
    default:
      initNavbar();
      loadFooter();
  }
});