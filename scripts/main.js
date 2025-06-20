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

  if (window.Telegram?.WebApp?.initData) {
    try {
      const isValid = await validateTelegramData(Telegram.WebApp.initData);
      if (!isValid) throw new Error('Invalid Telegram data');

      const user = Telegram.WebApp.initDataUnsafe.user;
      if (!user?.id) throw new Error('No user data');

      const userId = 'tg_' + user.id;
      const userRef = firebase.database().ref(`users/${userId}`);

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
      console.error('Ошибка авторизации:', error);
      currentPlayer.id = 'local_' + Math.random().toString(36).substring(2, 9);
    }
  } else {
    currentPlayer.id = 'local_' + Math.random().toString(36).substring(2, 9);
  }

  updateUserInterface();
  initPresenceTracking();
}

async function validateTelegramData(initData) {
  try {
    const encoder = new TextEncoder();
    const secretKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataToCheck = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secret = await window.crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(dataToCheck)
    );

    const hexSecret = Array.from(new Uint8Array(secret))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return hexSecret === hash;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
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