let currentPlayer = {
  id: null,
  name: 'Гость',
  username: '@username',
  inventory: [],
  balance: 0,
  registrationDate: null,
  lastLogin: null
};

async function initTelegram() {
  const firebaseConfig = {
    apiKey: "AIzaSyC6EklCDD25kU_nuXyeh5mj9F24KECyYpM",
    databaseURL: "https://gizmo-27843-default-rtdb.firebaseio.com"
  };
  
  const app = firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();

  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    const userId = 'tg_' + user.id;
    const userRef = firebase.database().ref(`users/${userId}`);

    try {
      const snapshot = await userRef.once('value');
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        currentPlayer = {
          id: userId,
          name: userData.name || user.first_name || 'Игрок',
          username: userData.username || (user.username ? '@' + user.username : 'tg://user?id=' + user.id),
          inventory: userData.inventory || [],
          balance: userData.balance || 0,
          registrationDate: userData.registrationDate || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
      } else {
        currentPlayer = {
          id: userId,
          name: user.first_name || 'Игрок',
          username: user.username ? '@' + user.username : 'tg://user?id=' + user.id,
          inventory: [],
          balance: 100,
          registrationDate: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        await userRef.set(currentPlayer);
      }

      await userRef.update({
        lastLogin: new Date().toISOString(),
        isOnline: true
      });

      Telegram.WebApp.expand();
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
      currentPlayer.id = 'local_' + Math.random().toString(36).substring(2, 9);
    }
  } else {
    currentPlayer.id = 'local_' + Math.random().toString(36).substring(2, 9);
  }

  updateUserInterface();
  initPresenceTracking();
}

function updateUserInterface() {
  if (document.getElementById('username')) {
    document.getElementById('username').textContent = currentPlayer.name;
  }
  if (document.getElementById('user-telegram')) {
    document.getElementById('user-telegram').textContent = currentPlayer.username;
  }
  if (document.getElementById('user-nickname')) {
    document.getElementById('user-nickname').textContent = currentPlayer.name;
  }
}

async function updateNickname() {
  const newNickname = document.getElementById('nickname-input').value.trim();
  if (!newNickname || !currentPlayer.id || currentPlayer.id.startsWith('local_')) return;

  try {
    await firebase.database().ref(`users/${currentPlayer.id}/name`).set(newNickname);
    currentPlayer.name = newNickname;
    updateUserInterface();
  } catch (error) {
    console.error('Ошибка изменения ника:', error);
  }
}

function initPresenceTracking() {
  if (!currentPlayer.id || currentPlayer.id.startsWith('local_') || !window.db) return;

  const presenceRef = firebase.database().ref(`userPresence/${currentPlayer.id}`);
  presenceRef.set(true);

  window.addEventListener('beforeunload', () => {
    presenceRef.update({
      isOnline: false,
      lastSeen: new Date().toISOString()
    });
  });

  if (window.Telegram?.WebApp) {
    Telegram.WebApp.onEvent('viewportChanged', (e) => {
      presenceRef.update({
        isOnline: e.isExpanded,
        lastSeen: new Date().toISOString()
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initTelegram);