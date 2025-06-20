document.addEventListener('DOMContentLoaded', () => {
  // Создаем меню
  const menuHTML = `
    <div id="main-menu" style="opacity: 0; filter: blur(5px); transition: opacity 1s ease, filter 1s ease;">
      <div class="menu-buttons">
        <button class="menu-btn" onclick="window.location.href='index.html'">
          <span class="btn-icon">👤</span>
          <span class="btn-text">Профиль</span>
        </button>
        <button class="menu-btn" onclick="window.location.href='index.html#shop'">
          <span class="btn-icon">🛒</span>
          <span class="btn-text">Магазин</span>
        </button>
        <button class="menu-btn" onclick="window.location.href='pvp-game.html'">
          <span class="btn-icon">⚔️</span>
          <span class="btn-text">PVP</span>
        </button>
      </div>
    </div>
  `;
  
  // Добавляем меню в body
  document.body.insertAdjacentHTML('beforeend', menuHTML);
  
  // Стили для меню
  const style = document.createElement('style');
  style.textContent = `
    #main-menu {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(42, 40, 38, 0.97);
      backdrop-filter: blur(12px);
      border-radius: 25px;
      padding: 15px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.4);
      z-index: 1002;
      border: 1px solid #3a3836;
      width: 90%;
      max-width: 500px;
    }
    .menu-buttons {
      display: flex;
      justify-content: space-around;
    }
    .menu-btn {
      background: none;
      border: none;
      color: white;
      padding: 10px 15px;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.3s ease;
    }
    .menu-btn:hover {
      background: rgba(127, 90, 240, 0.2);
    }
    .btn-icon {
      font-size: 1.5rem;
      margin-bottom: 5px;
    }
    .btn-text {
      font-size: 0.8rem;
    }
  `;
  document.head.appendChild(style);
  
  // Анимация появления меню (одновременно с заголовком)
  setTimeout(() => {
    const menu = document.getElementById('main-menu');
    if (menu) {
      menu.style.opacity = '1';
      menu.style.filter = 'blur(0)';
    }
  }, 4000); // Совпадает с появлением заголовка
});