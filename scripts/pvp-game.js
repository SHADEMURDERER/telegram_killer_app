// Инициализация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6EklCDD25kU_nuXyeh5mj9F24KECyYpM",
  databaseURL: "https://gizmo-27843-default-rtdb.firebaseio.com"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.getDatabase(app);

// Текущий игрок
const currentPlayer = {
  id: Telegram?.WebApp?.initDataUnsafe?.user?.id || 'player_' + Math.random().toString(36).slice(2, 9),
  name: Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Игрок'
};

let currentGameId = null;
let currentGameRef = null;

// Элементы интерфейса
const actionButton = document.getElementById('action-button');
const gameStatus = document.getElementById('game-status');
const resultDisplay = document.getElementById('result');
const player1Name = document.getElementById('player1-name');
const player2Name = document.getElementById('player2-name');

// Основная функция инициализации
async function initPVP() {
  actionButton.addEventListener('click', handleActionButtonClick);
  
  // Проверяем активные игры
  const availableGame = await findAvailableGame();
  if (availableGame) {
    joinGame(availableGame);
  } else {
    updateUI('waiting');
  }
}

// Поиск доступной игры
async function findAvailableGame() {
  try {
    const snapshot = await firebase.get(firebase.ref(db, 'games'));
    if (snapshot.exists()) {
      const games = snapshot.val();
      return Object.entries(games).find(
        ([id, game]) => game.status === 'waiting' && game.player1.id !== currentPlayer.id
      );
    }
  } catch (error) {
    console.error("Ошибка поиска игры:", error);
  }
  return null;
}

// Создание новой игры
async function createGame() {
  currentGameId = firebase.push(firebase.ref(db, 'games')).key;
  currentGameRef = firebase.ref(db, `games/${currentGameId}`);
  
  await firebase.set(currentGameRef, {
    player1: currentPlayer,
    player2: null,
    status: 'waiting',
    createdAt: Date.now()
  });
  
  // Слушаем изменения в игре
  firebase.onValue(currentGameRef, (snapshot) => {
    const game = snapshot.val();
    if (!game) return;
    
    if (game.player2 && game.status === 'playing') {
      startGame(game);
    }
    
    if (game.status === 'finished') {
      showResult(game.winner);
    }
  });
  
  updateUI('created');
}

// Присоединение к существующей игре
async function joinGame([gameId, game]) {
  currentGameId = gameId;
  currentGameRef = firebase.ref(db, `games/${gameId}`);
  
  await firebase.update(currentGameRef, {
    player2: currentPlayer,
    status: 'playing',
    startedAt: Date.now()
  });
  
  updateUI('joined', game.player1.name);
}

// Начало игры
function startGame(game) {
  updateUI('playing');
  
  // Симуляция боя (3 секунды)
  setTimeout(() => {
    finishGame(game);
  }, 3000);
}

// Завершение игры
async function finishGame(game) {
  const winner = Math.random() < 0.5 ? game.player1 : game.player2;
  
  await firebase.update(currentGameRef, {
    winner: winner,
    status: 'finished',
    finishedAt: Date.now()
  });
}

// Показ результата
function showResult(winner) {
  const isWinner = winner.id === currentPlayer.id;
  resultDisplay.textContent = isWinner ? "🎉 Вы победили! +50💰" : "😢 Вы проиграли";
  resultDisplay.style.color = isWinner ? "#4CAF50" : "#F44336";
  
  actionButton.textContent = "Играть снова";
  actionButton.disabled = false;
  
  // Удаляем игру через 10 секунд
  setTimeout(() => {
    if (currentGameRef) {
      firebase.remove(currentGameRef);
      resetGame();
    }
  }, 10000);
}

// Обработчик кнопки
function handleActionButtonClick() {
  actionButton.disabled = true;
  
  if (!currentGameId) {
    createGame();
  } else {
    // Если игра завершена - перезагружаем
    location.reload();
  }
}

// Сброс игры
function resetGame() {
  currentGameId = null;
  currentGameRef = null;
  updateUI('waiting');
}

// Обновление интерфейса
function updateUI(state, opponentName = null) {
  switch (state) {
    case 'waiting':
      gameStatus.textContent = "Ожидание соперника...";
      actionButton.textContent = "Создать игру (50💰)";
      actionButton.disabled = false;
      player1Name.textContent = "Ожидание...";
      player2Name.textContent = "Ожидание...";
      break;
      
    case 'created':
      gameStatus.textContent = "Ожидаем второго игрока...";
      actionButton.textContent = "Отменить игру";
      player1Name.textContent = currentPlayer.name;
      break;
      
    case 'joined':
      gameStatus.textContent = `Вы сражаетесь с ${opponentName}!`;
      actionButton.style.display = "none";
      player1Name.textContent = opponentName;
      player2Name.textContent = currentPlayer.name;
      break;
      
    case 'playing':
      gameStatus.textContent = "Идет бой...";
      resultDisplay.textContent = "";
      break;
  }
}

// Запуск игры при загрузке
document.addEventListener('DOMContentLoaded', initPVP);