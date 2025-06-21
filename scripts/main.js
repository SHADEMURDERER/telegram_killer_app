// Инициализация глобального объекта игрока
window.currentPlayer = {
  id: null,
  name: 'Гость',
  username: '@username',
  balance: 100,
  inventory: [],
  stats: { wins: 0, losses: 0, draws: 0 }
};

// Конфигурация Firebase (объявлена только здесь)
const firebaseConfig = {
  apiKey: "AIzaSyC6EklCDD25kU_nuXyeh5mj9F24KECyYpM",
  databaseURL: "https://gizmo-27843-default-rtdb.firebaseio.com",
  projectId: "gizmo-27843",
  appId: "1:7664399240:web:3a9c8a7b3b3c9b3c8a7b3b"
};

// Инициализация Firebase
function initFirebase() {
  try {
    // Проверяем, не инициализирован ли уже Firebase
    if (!firebase.apps.length) {
      const app = firebase.initializeApp(firebaseConfig);
      window.db = firebase.database(app);
      return true;
    }
    return true;
  } catch (error) {
    console.error('Ошибка инициализации Firebase:', error);
    return false;
  }
}

// Валидация данных Telegram
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

// Инициализация Telegram WebApp
async function initTelegram() {
  if (!window.Telegram?.WebApp) {
    console.log('Telegram WebApp не доступен');
    initLocalUser();
    return false;
  }

  try {
    if (Telegram.WebApp.initData) {
      const isValid = await validateTelegramData(Telegram.WebApp.initData);
      if (!isValid) throw new Error('Невалидные данные Telegram');
    }

    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (!user?.id) throw new Error('Нет данных пользователя');

    const userId = `tg_${user.id}`;
    const userRef = firebase.database().ref(`users/${userId}`);

    const snapshot = await userRef.once('value');
    const userData = snapshot.val() || {};

    window.currentPlayer = {
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

// Инициализация локального пользователя
function initLocalUser() {
  const savedUser = localStorage.getItem('localUser');
  if (savedUser) {
    window.currentPlayer = JSON.parse(savedUser);
  } else {
    window.currentPlayer.id = `local_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('localUser', JSON.stringify(window.currentPlayer));
  }
}

// Инициализация приложения
async function initApp() {
  if (!initFirebase()) {
    console.error('Не удалось инициализировать Firebase');
    initLocalUser();
    return;
  }

  await initTelegram();
  
  // Инициализация меню
  if (typeof initMenu === 'function') {
    initMenu();
  }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);