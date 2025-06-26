let currentPlayer = {
  id: null,
  name: 'Игрок'
};

// Добавьте в initTelegram()
function initTelegram() {
  if (window.Telegram && Telegram.WebApp) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    if (user?.id) {
      currentPlayer.id = 'tg_' + user.id;
      currentPlayer.name = user.first_name || 'Игрок';
      currentPlayer.username = user.username ? '@' + user.username : 'tg://user?id=' + user.id;
      
      if (document.getElementById('username')) {
        document.getElementById('username').textContent = currentPlayer.name;
      }
      if (document.getElementById('user-nickname')) {
        document.getElementById('user-nickname').textContent = currentPlayer.username;
      }
      
      // Отправляем статус активности
      updateUserPresence(true);
      
      // Обработчик закрытия приложения
      Telegram.WebApp.onEvent('viewportChanged', (e) => {
        if (e.isStateStable && !e.isExpanded) {
          updateUserPresence(false);
        }
      });
      
      Telegram.WebApp.expand();
    }
  } else {
    currentPlayer.id = 'local_' + Math.random().toString(36).substring(2, 9);
    currentPlayer.name = 'Игрок';
    currentPlayer.username = 'guest_' + Math.random().toString(36).substring(2, 6);
  }
  
  window.currentPlayer = currentPlayer;
}

// Функция обновления статуса активности
async function updateUserPresence(isActive) {
  try {
    await firebase.database().ref(`userPresence/${currentPlayer.id}`).set(isActive);
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
  }
}

// При загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
  
  // При закрытии страницы
  window.addEventListener('beforeunload', () => {
    updateUserPresence(false);
  });
});

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

document.addEventListener('DOMContentLoaded', initTelegram);