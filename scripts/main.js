let currentPlayer = {
  id: null,
  name: 'Игрок',
  username: 'Гость'
};

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
      if (document.getElementById('user-telegram')) {
        document.getElementById('user-telegram').textContent = currentPlayer.username;
      }
      if (document.getElementById('user-nickname')) {
        document.getElementById('user-nickname').textContent = currentPlayer.name;
      }
      
      updateUserPresence(true);
      
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
    currentPlayer.username = 'Гость_' + Math.random().toString(36).substring(2, 6);
  }
  
  window.currentPlayer = currentPlayer;
}

async function updateUserPresence(isActive) {
  try {
    await firebase.database().ref(`userPresence/${currentPlayer.id}`).set(isActive);
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
  }
}

async function updateNickname() {
  const newNickname = document.getElementById('nickname-input').value.trim();
  if (newNickname) {
    try {
      await firebase.database().ref(`users/${currentPlayer.id}/nickname`).set(newNickname);
      document.getElementById('user-nickname').textContent = newNickname;
      alert('Ник успешно изменен!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при изменении ника');
    }
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
}

document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
  
  window.addEventListener('beforeunload', () => {
    updateUserPresence(false);
  });
});