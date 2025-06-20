let currentPlayer = {
  id: null,
  name: 'Игрок',
  username: '@username',
  balance: 0,
  inventory: [],
  stats: {
    wins: 0,
    losses: 0,
    draws: 0
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyC6EklCDD25kU_nuXyeh5mj9F24KECyYpM",
  databaseURL: "https://gizmo-27843-default-rtdb.firebaseio.com",
  projectId: "gizmo-27843",
  appId: "1:7664399240:web:3a9c8a7b3b3c9b3c8a7b3b"
};

function initFirebase() {
  try {
    const app = firebase.initializeApp(firebaseConfig);
    window.db = firebase.database(app);
    return true;
  } catch (error) {
    console.error('Ошибка инициализации Firebase:', error);
    return false;
  }
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
    console.error('Ошибка валидации данных Telegram:', error);
    return false;
  }
}

async function initTelegram() {
  if (!window.Telegram?.WebApp) return false;

  try {
    if (Telegram.WebApp.initData) {
      const isValid = await validateTelegramData(Telegram.WebApp.initData);
      if (!isValid) throw new Error('Invalid Telegram data');
    }

    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (!user?.id) throw new Error('No Telegram user data');

    const userId = `tg_${user.id}`;
    const userRef = firebase.database().ref(`users/${userId}`);

    const snapshot = await userRef.once('value');
    const userData = snapshot.val() || {};

    currentPlayer = {
      id: userId,
      name: userData.name || user.first_name || 'Игрок',
      username: userData.username || (user.username ? `@${user.username}` : `tg://user?id=${user.id}`),
      balance: userData.balance || 100,
      inventory: userData.inventory || [],
      stats: userData.stats || { wins: 0, losses: 0, draws: 0 }
    };

    await userRef.update({
      lastLogin: firebase.database.ServerValue.TIMESTAMP,
      isOnline: true
    });

    Telegram.WebApp.expand();
    return true;
  } catch (error) {
    console.error('Ошибка инициализации Telegram:', error);
    initLocalUser();
    return false;
  }
}

function initLocalUser() {
  const savedUser = localStorage.getItem('localUser');
  if (savedUser) {
    currentPlayer = JSON.parse(savedUser);
  } else {
    currentPlayer = {
      id: `local_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Гость',
      username: `guest_${Math.random().toString(36).substr(2, 6)}`,
      balance: 50,
      inventory: [],
      stats: { wins: 0, losses: 0, draws: 0 }
    };
    localStorage.setItem('localUser', JSON.stringify(currentPlayer));
  }
}

function updateUserPresence(isOnline) {
  if (!currentPlayer.id || !currentPlayer.id.startsWith('tg_')) return;
  
  const presenceRef = firebase.database().ref(`userPresence/${currentPlayer.id}`);
  presenceRef.update({
    isOnline,
    lastSeen: firebase.database.ServerValue.TIMESTAMP
  });
}

function trackUserAction(action, data = {}) {
  if (!currentPlayer.id) return;

  const actionRef = firebase.database().ref(`userActions/${currentPlayer.id}`).push();
  actionRef.set({
    action,
    ...data,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    userAgent: navigator.userAgent,
    page: window.location.pathname
  });
}

async function updateNickname(newNickname) {
  if (!newNickname || !currentPlayer.id) return false;

  try {
    if (currentPlayer.id.startsWith('tg_')) {
      await firebase.database().ref(`users/${currentPlayer.id}/name`).set(newNickname);
    } else {
      currentPlayer.name = newNickname;
      localStorage.setItem('localUser', JSON.stringify(currentPlayer));
    }
    
    trackUserAction('nickname_change', { oldName: currentPlayer.name, newName: newNickname });
    currentPlayer.name = newNickname;
    return true;
  } catch (error) {
    console.error('Ошибка изменения ника:', error);
    return false;
  }
}

function handleBeforeUnload() {
  updateUserPresence(false);
  trackUserAction('page_leave');
}

function initEventListeners() {
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.onEvent('viewportChanged', (e) => {
      updateUserPresence(e.isExpanded);
    });
  }
}

async function initApp() {
  initFirebase();
  await initTelegram();
  initEventListeners();
  trackUserAction('page_visit');
}

document.addEventListener('DOMContentLoaded', initApp);