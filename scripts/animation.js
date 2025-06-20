document.addEventListener('DOMContentLoaded', () => {
  // Инициализация анимации
  const ring = document.getElementById('ring');
  const title = document.getElementById('title');
  const ringContainer = document.getElementById('ring-container');

  if (ring && title && ringContainer) {
    // После завершения всех анимаций
    setTimeout(() => {
      ringContainer.style.opacity = '0';
      setTimeout(() => {
        ringContainer.remove();
        initMenu();
      }, 1000);
    }, 5000);
  }
});

function initMenu() {
  const menuHTML = `
    <div id="main-menu">
      <div class="menu-buttons">
        <button class="menu-btn profile-btn">
          <span class="btn-icon">👤</span>
          <span class="btn-text">Профиль</span>
        </button>
        <button class="menu-btn shop-btn">
          <span class="btn-icon">🛒</span>
          <span class="btn-text">Магазин</span>
        </button>
        <button class="menu-btn pvp-btn">
          <span class="btn-icon">⚔️</span>
          <span class="btn-text">PVP</span>
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', menuHTML);

  // Обработчики кнопок
  document.querySelector('.profile-btn').addEventListener('click', showProfile);
  document.querySelector('.shop-btn').addEventListener('click', showShop);
  document.querySelector('.pvp-btn').addEventListener('click', () => {
    window.location.href = 'pvp-game.html';
  });
}

function showProfile() {
  const profileHTML = `
    <div id="profile-panel" class="slide-panel">
      <div class="panel-content">
        <div class="profile-header">
          <h2>${currentPlayer.name}</h2>
          <p class="telegram-username">${currentPlayer.username}</p>
        </div>
        <div class="nickname-edit">
          <input type="text" id="nickname-input" placeholder="Введите новый никнейм" value="${currentPlayer.name}">
          <button id="update-nickname-btn">Сохранить</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', profileHTML);
  const panel = document.getElementById('profile-panel');
  setTimeout(() => {
    panel.classList.add('active');
  }, 10);
  
  document.getElementById('update-nickname-btn').addEventListener('click', updateNickname);
  
  // Закрытие при клике вне панели
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
  setTimeout(() => {
    panel.classList.add('active');
  }, 10);
  
  // Закрытие при клике вне панели
  panel.addEventListener('click', (e) => {
    if (e.target === panel) {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 400);
    }
  });
}

function updateNickname() {
  const newNickname = document.getElementById('nickname-input').value.trim();
  if (newNickname && newNickname !== currentPlayer.name) {
    currentPlayer.name = newNickname;
    if (currentPlayer.id.startsWith('tg_')) {
      firebase.database().ref(`users/${currentPlayer.id}/name`).set(newNickname);
    } else {
      localStorage.setItem('localUser', JSON.stringify(currentPlayer));
    }
    document.querySelector('#profile-panel .profile-header h2').textContent = newNickname;
  }
}