// pvp-game.js - ПОЛНОСТЬЮ ПЕРЕПИСАННЫЙ ФАЙЛ
let gameRef = null;
let currentGameId = null;

// Инициализация PVP игры
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('pvp-container').style.display = 'flex';
  
  // Инициализация текущего игрока
  window.currentPlayer = {
    id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'anon_' + Math.random().toString(36).slice(2),
    name: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Игрок'
  };

  // Поиск активной игры при загрузке
  await findActiveGame();
});

async function findActiveGame() {
  const gamesRef = firebase.ref(db, 'games');
  const snapshot = await firebase.get(gamesRef);
  
  if (snapshot.exists()) {
    const games = snapshot.val();
    
    // Поиск игры, ожидающей второго игрока
    const availableGame = Object.entries(games).find(([id, game]) => 
      game.status === 'waiting' && 
      game.player1.id !== currentPlayer.id
    );
    
    if (availableGame) {
      joinGame(availableGame[0], availableGame[1]);
      return;
    }
  }
  
  updateUI('waiting');
}

function joinGame(gameId, gameData) {
  currentGameId = gameId;
  gameRef = firebase.ref(db, `games/${gameId}`);
  
  // Обновляем состояние игры
  firebase.update(gameRef, {
    player2: window.currentPlayer,
    status: 'playing',
    lastUpdate: Date.now()
  });
  
  // Слушаем изменения в игре
  firebase.onValue(gameRef, (snapshot) => {
    const game = snapshot.val();
    if (!game) return;
    
    updateGameUI(game);
    
    if (game.status === 'playing' && game.player1 && game.player2) {
      startGame(game);
    }
  });
  
  updateUI('joined', gameData);
}

async function createGame() {
  const newGameRef = firebase.push(firebase.ref(db, 'games'));
  currentGameId = newGameRef.key;
  gameRef = newGameRef;
  
  await firebase.set(newGameRef, {
    player1: window.currentPlayer,
    status: 'waiting',
    createdAt: Date.now(),
    lastUpdate: Date.now()
  });
  
  // Слушаем нашу игру
  firebase.onValue(newGameRef, (snapshot) => {
    const game = snapshot.val();
    if (!game) return;
    
    updateGameUI(game);
    
    if (game.status === 'playing' && game.player2) {
      startGame(game);
    }
  });
  
  updateUI('created');
}

function startGame(game) {
  // Обновляем UI
  updateUI('playing', game);
  
  // Запускаем игровой процесс
  const progressFill = document.getElementById('progress-fill');
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += 2;
    progressFill.style.width = `${progress}%`;
    
    if (progress >= 100) {
      clearInterval(interval);
      finishGame(game);
    }
  }, 50);
}

async function finishGame(game) {
  const isPlayer1Winner = Math.random() < 0.5;
  const winner = isPlayer1Winner ? game.player1 : game.player2;
  
  // Обновляем состояние игры
  await firebase.update(gameRef, {
    winner: winner,
    status: 'finished',
    finishedAt: Date.now()
  });
  
  // Показываем результат
  const isWinner = winner.id === window.currentPlayer.id;
  updateUI('finished', game, isWinner);
  
  // Удаляем игру через 10 секунд
  setTimeout(() => {
    if (gameRef) {
      firebase.remove(gameRef);
      gameRef = null;
      currentGameId = null;
    }
    updateUI('waiting');
  }, 10000);
}

function updateGameUI(game) {
  // Обновляем информацию об игроках
  document.getElementById('player1-name').textContent = 
    game.player1.id === window.currentPlayer.id ? 'Вы' : game.player1.name;
  
  if (game.player2) {
    document.getElementById('player2-name').textContent = 
      game.player2.id === window.currentPlayer.id ? 'Вы' : game.player2.name;
  }
  
  // Обновляем статус игры
  const statusElement = document.getElementById('pvp-status');
  const betButton = document.getElementById('pvp-bet');
  
  switch (game.status) {
    case 'waiting':
      statusElement.textContent = 'Ожидание второго игрока...';
      betButton.textContent = 'Отменить игру';
      betButton.onclick = cancelGame;
      break;
      
    case 'playing':
      statusElement.textContent = 'Игра началась!';
      betButton.style.display = 'none';
      break;
      
    case 'finished':
      const isWinner = game.winner.id === window.currentPlayer.id;
      statusElement.textContent = isWinner ? 'Вы победили!' : 'Вы проиграли';
      betButton.style.display = 'none';
      break;
  }
}

function updateUI(state, game, isWinner) {
  const statusElement = document.getElementById('pvp-status');
  const betButton = document.getElementById('pvp-bet');
  const resultElement = document.getElementById('pvp-result');
  
  betButton.style.display = 'block';
  resultElement.textContent = '';
  
  switch (state) {
    case 'waiting':
      statusElement.textContent = 'Ожидание игроков...';
      betButton.textContent = 'Создать игру (50 золотых)';
      betButton.onclick = createGame;
      break;
      
    case 'created':
      statusElement.textContent = 'Ожидаем второго игрока...';
      betButton.textContent = 'Отменить игру';
      betButton.onclick = cancelGame;
      break;
      
    case 'joined':
      statusElement.textContent = `Вы присоединились к ${game.player1.name}`;
      betButton.style.display = 'none';
      break;
      
    case 'playing':
      statusElement.textContent = 'Игра началась!';
      betButton.style.display = 'none';
      break;
      
    case 'finished':
      statusElement.textContent = isWinner ? 'Вы победили!' : 'Вы проиграли';
      resultElement.textContent = isWinner ? '+50 золотых!' : 'Попробуйте снова!';
      resultElement.style.color = isWinner ? '#4CAF50' : '#F44336';
      betButton.style.display = 'block';
      betButton.textContent = 'Играть снова';
      betButton.onclick = () => location.reload();
      break;
  }
}

async function cancelGame() {
  if (gameRef) {
    await firebase.remove(gameRef);
  }
  gameRef = null;
  currentGameId = null;
  updateUI('waiting');
}