function initMenu() {
  const menuHTML = `
    <div id="main-menu">
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

  // Анимация появления меню
  setTimeout(() => {
    const menu = document.getElementById('main-menu');
    if (menu) {
      menu.style.opacity = '0';
      menu.style.transition = 'opacity 0.5s ease';
      setTimeout(() => { menu.style.opacity = '1' }, 50);
    }
  }, 500);

  // Назначение обработчиков
  document.getElementById('profile-btn').addEventListener('click', showProfile);
  document.getElementById('shop-btn').addEventListener('click', showShop);
  document.getElementById('pvp-btn').addEventListener('click', goToPvp);
}

function showProfile() {
  if (!window.currentPlayer) {
    console.error('Данные игрока не загружены');
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
  
  document.getElementById('update-nickname-btn').addEventListener('click', updateNickname);
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
}

function goToPvp() {
  window.location.href = 'pvp-game.html';
}

function updateNickname() {
  const newNickname = document.getElementById('nickname-input').value.trim();
  if (newNickname && newNickname !== currentPlayer.name) {
    currentPlayer.name = newNickname;
    
    if (currentPlayer.id.startsWith('tg_')) {
      firebase.database().ref(`users/${currentPlayer.id}/name`).set(newNickname)
        .catch(error => console.error('Ошибка сохранения ника:', error));
    } else {
      localStorage.setItem('localUser', JSON.stringify(currentPlayer));
    }
  }
}

// Инициализация меню при загрузке
document.addEventListener('DOMContentLoaded', initMenu);