document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
});

function initTelegram() {
  let userId;
  
  if (window.Telegram && Telegram.WebApp) {
    const tgWebApp = Telegram.WebApp;
    tgWebApp.expand();
    
    const user = tgWebApp.initDataUnsafe.user;
    userId = `tg_${user.id}`;
    
    document.getElementById('username').textContent = user.first_name || 'Пользователь';
    document.getElementById('user-id').textContent = user.id;
    
    // Инициализируем трекер подарков
    window.giftTracker.init(userId);
    
    // Отправляем данные пользователя боту для верификации
    verifyWithBot(userId, user);
  } else {
    // Режим для тестирования без Telegram
    userId = `test_${Math.random().toString(36).substr(2, 9)}`;
    window.giftTracker.init(userId);
    alert('Для полного функционала откройте приложение через Telegram');
  }
}

async function verifyWithBot(userId, tgUser) {
  try {
    await firebase.database().ref(`userVerifications/${userId}`).set({
      id: tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      language_code: tgUser.language_code,
      lastActive: Date.now()
    });
  } catch (error) {
    console.error('Ошибка верификации:', error);
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
  
  if (tabName === 'gifts') {
    window.giftTracker.renderGifts();
  }
}