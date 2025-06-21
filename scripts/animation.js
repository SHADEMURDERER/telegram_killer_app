let isInitialLoad = true;

document.addEventListener('DOMContentLoaded', () => {
  if (isInitialLoad) {
    // Анимация только при первом запуске
    setTimeout(() => {
      const ring = document.getElementById('ring');
      const title = document.getElementById('title');
      
      if (ring && title) {
        setTimeout(() => {
          const container = document.getElementById('ring-container');
          if (container) {
            container.style.opacity = '0';
            setTimeout(() => {
              container.remove();
              initMenu();
            }, 1000);
          }
        }, 6000);
      }
    }, 100);
    isInitialLoad = false;
  } else {
    // При переходах сразу показываем меню
    initMenu();
  }
});

function initMenu() {
  if (document.getElementById('main-menu')) return;

  const menuHTML = `
    <div id="main-menu" style="opacity:0">
      <div class="menu-buttons">
        <button class="menu-btn profile-btn" id="profile-btn">
          <span class="btn-icon">👤</span>
          <span class="btn-text">Профиль</span>
        </button>
        <button class="menu-btn shop-btn" id="shop-btn">
          <span class="btn-icon">🛒</span>
          <span class="btn-text">Магазин</span>
        </button>
        <button class="menu-btn pvp-btn" id="pvp-btn">
          <span class="btn-icon">⚔️</span>
          <span class="btn-text">PVP</span>
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', menuHTML);
  
  // Плавное появление
  setTimeout(() => {
    const menu = document.getElementById('main-menu');
    if (menu) menu.style.opacity = '1';
  }, 50);

  // Обработчики
  document.getElementById('profile-btn')?.addEventListener('click', showProfile);
  document.getElementById('shop-btn')?.addEventListener('click', showShop);
  document.getElementById('pvp-btn')?.addEventListener('click', goToPvp);
}

function showProfile() {
  if (!window.currentPlayer) {
    console.error('Player data not loaded');
    return;
  }

  const profileHTML = `
    <div id="profile-panel" class="slide-panel">
      <div class="panel-content">
        <div class="profile-header">
          <h2>${currentPlayer.name}</h2>
          <p class="telegram-username">${currentPlayer.username}</p>
        </div>
        <div class="nickname-edit">
          <input type="text" id="nickname-input" placeholder="Новый ник" value="${currentPlayer.name}">
          <button id="update-nickname-btn">Изменить</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', profileHTML);
  const panel = document.getElementById('profile-panel');
  setTimeout(() => panel.classList.add('active'), 10);
  
  document.getElementById('update-nickname-btn')?.addEventListener('click', updateNickname);
  
  panel.addEventListener('click', (e) => {
    if (e.target === panel) {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 400);
    }
  });
}

function showShop() {
  const shopHTML = `
    <div id="shop-panel" class="slide-panel">
      <div class="panel-content">
        <div class="shop-item">
          <h3>🗡️ Меч Дракона</h3>
          <p class="price">100 золотых</p>
          <button class="buy-btn" data-item="dragon_sword">Купить</button>
        </div>
        <div class="shop-item">
          <h3>🛡️ Щит Рыцаря</h3>
          <p class="price">75 золотых</p>
          <button class="buy-btn" data-item="knight_shield">Купить</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', shopHTML);
  const panel = document.getElementById('shop-panel');
  setTimeout(() => panel.classList.add('active'), 10);
  
  panel.addEventListener('click', (e) => {
    if (e.target === panel) {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 400);
    }
  });
}

function goToPvp() {
  window.location.href = 'pvp-game.html';
}

function updateNickname() {
  const newNickname = document.getElementById('nickname-input')?.value.trim();
  if (newNickname && newNickname !== currentPlayer.name) {
    currentPlayer.name = newNickname;
    if (currentPlayer.id.startsWith('tg_')) {
      firebase.database().ref(`users/${currentPlayer.id}/name`).set(newNickname);
    } else {
      localStorage.setItem('localUser', JSON.stringify(currentPlayer));
    }
  }
}