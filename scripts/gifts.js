class GiftTracker {
  constructor() {
    this.userId = null;
    this.userData = null;
    this.gifts = [];
  }

  async init(userId) {
    this.userId = userId;
    await this.loadUserData();
    await this.loadGifts();
    this.setupBotListener();
  }

  async loadUserData() {
    const snapshot = await firebase.database().ref(`users/${this.userId}`).once('value');
    this.userData = snapshot.val() || {
      id: this.userId,
      gifts: {},
      balance: 0,
      createdAt: Date.now()
    };
    
    if (!snapshot.exists()) {
      await this.saveUserData();
    }
    
    this.updateUI();
  }

  async loadGifts() {
    const giftsRef = firebase.database().ref(`users/${this.userId}/gifts`);
    giftsRef.on('value', (snapshot) => {
      this.gifts = snapshot.val() ? Object.values(snapshot.val()) : [];
      this.renderGifts();
    });
  }

  async saveUserData() {
    await firebase.database().ref(`users/${this.userId}`).set(this.userData);
  }

  renderGifts() {
    const container = document.getElementById('gifts-container');
    if (!container) return;
    
    if (this.gifts.length === 0) {
      container.innerHTML = `
        <div class="empty-gifts">
          <p>У вас пока нет подарков</p>
          <button onclick="window.open('https://t.me/${GIFT_BOT_USERNAME}', '_blank')">
            Отправить подарок
          </button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.gifts.map(gift => `
      <div class="gift-item">
        <div class="gift-header">
          <h3>${gift.name || 'NFT Подарок'}</h3>
          <span class="gift-value">${gift.value || '0'} TON</span>
        </div>
        <div class="gift-image">
          <img src="${gift.image}" alt="Подарок">
        </div>
        <div class="gift-meta">
          <span>От: ${gift.sender || 'Неизвестно'}</span>
          <span>${new Date(gift.timestamp).toLocaleString()}</span>
        </div>
        <div class="gift-actions">
          <button class="sell-btn" data-id="${gift.id}">Продать</button>
        </div>
      </div>
    `).join('');
    
    // Добавляем обработчики для кнопок продажи
    document.querySelectorAll('.sell-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const giftId = e.target.getAttribute('data-id');
        this.sellGift(giftId);
      });
    });
  }

  async addGift(giftData) {
    const giftId = `gift_${Date.now()}`;
    const gift = {
      id: giftId,
      ...giftData,
      timestamp: Date.now(),
      status: 'unclaimed'
    };
    
    await firebase.database().ref(`users/${this.userId}/gifts/${giftId}`).set(gift);
    await this.updateBalance(giftData.value || 0);
  }

  async sellGift(giftId) {
    const giftRef = firebase.database().ref(`users/${this.userId}/gifts/${giftId}`);
    const snapshot = await giftRef.once('value');
    const gift = snapshot.val();
    
    if (!gift) return;
    
    // Здесь должна быть логика продажи через TON API
    const salePrice = gift.value * 0.9; // Продаем за 90% от стоимости
    
    await this.updateBalance(salePrice);
    await giftRef.remove();
    
    alert(`Подарок продан за ${salePrice} TON!`);
  }

  async updateBalance(amount) {
    this.userData.balance = (this.userData.balance || 0) + amount;
    await firebase.database().ref(`users/${this.userId}/balance`).set(this.userData.balance);
    this.updateUI();
  }

  updateUI() {
    if (this.userData) {
      document.getElementById('username').textContent = this.userData.name || 'Пользователь';
      document.getElementById('user-id').textContent = this.userId;
      document.getElementById('user-balance').textContent = this.userData.balance || 0;
    }
  }

  setupBotListener() {
    // Слушаем новые подарки в реальном времени
    const giftsRef = firebase.database().ref('gifts');
    giftsRef.orderByChild('recipient').equalTo(this.userId).on('child_added', (snapshot) => {
      const gift = snapshot.val();
      if (gift && !this.gifts.some(g => g.id === gift.id)) {
        this.addGift(gift);
      }
    });
  }
}

window.giftTracker = new GiftTracker();