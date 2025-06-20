let currentPlayer = {
  id: null,
  name: 'Гость',
  username: '@username'
};

function initTelegram() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    currentPlayer = {
      id: 'tg_' + user.id,
      name: user.first_name || 'Гость',
      username: user.username ? '@' + user.username : 'tg://user?id=' + user.id
    };
    Telegram.WebApp.expand();
  } else {
    currentPlayer.id = 'local_' + Math.random().toString(36).substring(2, 9);
  }
  
  updateUserInterface();
  initPresenceTracking();
}

function updateUserInterface() {
  const nicknameElement = document.getElementById('user-nickname');
  const telegramElement = document.getElementById('user-telegram');
  
  if (nicknameElement) nicknameElement.textContent = currentPlayer.name;
  if (telegramElement) telegramElement.textContent = currentPlayer.username;
}

async function updateNickname() {
  const newNickname = document.getElementById('nickname-input').value.trim();
  if (!newNickname || !currentPlayer.id) return;
  
  try {
    await firebase.database().ref(`users/${currentPlayer.id}/nickname`).set(newNickname);
    currentPlayer.name = newNickname;
    updateUserInterface();
  } catch (error) {
    console.error('Ошибка изменения ника:', error);
  }
}

function initPresenceTracking() {
  if (!currentPlayer.id || !window.db) return;
  
  const presenceRef = firebase.database().ref(`userPresence/${currentPlayer.id}`);
  presenceRef.set(true);
  
  window.addEventListener('beforeunload', () => {
    presenceRef.remove();
  });
  
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.onEvent('viewportChanged', (e) => {
      presenceRef.set(e.isExpanded);
    });
  }
}

document.addEventListener('DOMContentLoaded', initTelegram);