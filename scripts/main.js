// Инициализация игрока
const currentPlayer = {
  id: null,
  name: 'Игрок'
};

// Основная функция инициализации
function initApp() {
  initTelegram();
  initUI();
}

// Инициализация Telegram WebApp
function initTelegram() {
  try {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = Telegram.WebApp.initDataUnsafe.user;
      currentPlayer.id = `tg_${user.id}`;
      currentPlayer.name = user.first_name || 'Игрок';
      
      document.getElementById('username').textContent = currentPlayer.name;
      Telegram.WebApp.expand();
      Telegram.WebApp.MainButton.setText("Продолжить").show();
    }
  } catch (e) {
    console.error("Telegram init error:", e);
    setupLocalFallback();
  }
}

// Запасной вариант для локального тестирования
function setupLocalFallback() {
  currentPlayer.id = `local_${Math.random().toString(36).substr(2, 9)}`;
  currentPlayer.name = 'Игрок';
}

// Инициализация интерфейса
function initUI() {
  // Делегирование событий для кнопок
  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('tab-button')) {
      handleTabButton(e.target);
    }
  });
}

// Обработчик кнопок
function handleTabButton(button) {
  const tabName = button.dataset.page;
  
  // Снимаем активность со всех кнопок
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Добавляем активность текущей
  button.classList.add('active');
  
  // Переключаем контент
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);