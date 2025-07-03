document.addEventListener('DOMContentLoaded', () => {
  const shopItems = {
    dragon_sword: {
      name: "Меч Дракона",
      price: 100,
      description: "Мощное оружие с огненным эффектом"
    },
    knight_shield: {
      name: "Щит Рыцаря",
      price: 75,
      description: "Прочная защита от любых атак"
    }
  };

  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const itemId = this.getAttribute('data-item');
      const item = shopItems[itemId];
      
      if (!item) return;
      
      try {
        const snapshot = await firebase.database().ref(`users/${currentPlayer.id}/balance`).once('value');
        const balance = snapshot.val() || 0;
        
        if (balance >= item.price) {
          await firebase.database().ref(`users/${currentPlayer.id}`).update({
            balance: balance - item.price,
            [`inventory/${itemId}`]: true
          });
          
          alert(`Вы успешно купили ${item.name}!`);
        } else {
          alert('Недостаточно средств!');
        }
      } catch (error) {
        console.error('Ошибка покупки:', error);
        alert('Ошибка при покупке предмета');
      }
    });
  });
});