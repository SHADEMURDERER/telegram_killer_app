let currentPlayer = {
  id: null,
  name: 'Игрок'
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
      if (document.getElementById('user-nickname')) {
        document.getElementById('user-nickname').textContent = currentPlayer.username;
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
    currentPlayer.username = 'guest_' + Math.random().toString(36).substring(2, 6);
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

async function loadUserGifts() {
  try {
    const userId = currentPlayer.id;
    if (!userId) return;
    
    const snapshot = await firebase.database().ref(`users/${userId}/gifts`).once('value');
    const gifts = snapshot.val() || {};
    
    const giftsList = document.getElementById('gifts-list');
    if (!giftsList) return;
    
    giftsList.innerHTML = '';
    
    Object.values(gifts).forEach(gift => {
      const giftCard = document.createElement('div');
      giftCard.className = 'gift-card';
      giftCard.innerHTML = `
        <div class="gift-title">${gift.title || 'NFT Подарок'}</div>
        <div class="gift-price">${gift.price || '0'} TON</div>
      `;
      giftsList.appendChild(giftCard);
    });
    
  } catch (error) {
    console.error('Ошибка загрузки подарков:', error);
  }
}

// Вызывайте эту функцию при загрузке профиля
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
  
  if (tabName === 'gifts-section') {
    loadUserGifts();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
  
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