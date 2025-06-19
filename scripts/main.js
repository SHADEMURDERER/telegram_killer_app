// Общие переменные
let currentPlayer = {
  id: null,
  name: 'Игрок'
};

// Инициализация Telegram WebApp
function initTelegram() {
  if (window.Telegram && Telegram.WebApp) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    if (user?.id) {
      currentPlayer.id = 'tg_' + user.id;
      currentPlayer.name = user.first_name || 'Игрок';
      if (document.getElementById('username')) {
        document.getElementById('username').textContent = currentPlayer.name;
      }
    }
    Telegram.WebApp.expand();
  } else {
    currentPlayer.id = 'local_' + Math.random().toString(36).substring(2, 9);
    currentPlayer.name = 'Игрок';
  }
}

// Переключение вкладок
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initTelegram);