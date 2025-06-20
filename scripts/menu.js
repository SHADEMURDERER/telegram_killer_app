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

  setTimeout(() => {
    const buttons = document.querySelectorAll('.menu-btn');
    buttons.forEach((btn, index) => {
      btn.style.transform = 'translateY(100px)';
      btn.style.opacity = '0';
      btn.style.transition = `all 0.5s ease ${index * 0.1}s`;
      
      setTimeout(() => {
        btn.style.transform = 'translateY(0)';
        btn.style.opacity = '1';
      }, 100);
    });
  }, 2500);

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
        <h2>${currentPlayer.name}</h2>
        <p class="telegram-username">${currentPlayer.username}</p>
        <div class="nickname-edit">
          <input type="text" id="nickname-input" placeholder="Новый ник" value="${currentPlayer.name}">
          <button id="update-nickname-btn">Изменить</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', profileHTML);
  animatePanel('profile-panel');
  
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
  animatePanel('shop-panel');
}

function animatePanel(panelId) {
  const panel = document.getElementById(panelId);
  panel.style.height = '0';
  panel.style.opacity = '0';
  
  setTimeout(() => {
    panel.style.height = '70vh';
    panel.style.opacity = '1';
    panel.querySelector('.panel-content').classList.add('active');
  }, 10);
  
  panel.addEventListener('click', (e) => {
    if (e.target === panel) {
      panel.style.height = '0';
      panel.style.opacity = '0';
      setTimeout(() => panel.remove(), 500);
    }
  });
}

function updateNickname() {
  const newNickname = document.getElementById('nickname-input').value.trim();
  if (newNickname && newNickname !== currentPlayer.name) {
    currentPlayer.name = newNickname;
    sessionStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
    document.querySelector('#profile-panel h2').textContent = newNickname;
  }
}