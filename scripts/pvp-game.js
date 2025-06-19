let gameState = {
  player1: null,
  player2: null,
  spinning: false,
  lastUpdate: 0,
  winner: null
};

function loadGameState() {
  const savedState = localStorage.getItem('pvpGameState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    if (Date.now() - parsedState.lastUpdate < 120000) {
      gameState = parsedState;
    } else {
      resetGameState();
    }
  }
}

function saveGameState() {
  gameState.lastUpdate = Date.now();
  localStorage.setItem('pvpGameState', JSON.stringify(gameState));
}

function resetGameState() {
  gameState = {
    player1: null,
    player2: null,
    spinning: false,
    lastUpdate: Date.now(),
    winner: null
  };
  saveGameState();
}

function checkGameState() {
  const oldState = JSON.stringify(gameState);
  loadGameState();
  
  if (JSON.stringify(gameState) !== oldState) {
    updateGameUI();
  }
  
  if (gameState.player1 && gameState.player2 && !gameState.spinning) {
    if (gameState.player1.id !== gameState.player2.id) {
      startGame();
    } else {
      resetGameState();
    }
  }
}

function updateGameUI() {
  const betButton = document.getElementById('pvp-bet');
  const statusElement = document.getElementById('pvp-status');
  const resultElement = document.getElementById('pvp-result');
  const progressFill = document.getElementById('progress-fill');
  
  if (!gameState.winner) {
    resultElement.textContent = '';
  }
  
  const isPlayer1 = gameState.player1 && gameState.player1.id === currentPlayer.id;
  const isPlayer2 = gameState.player2 && gameState.player2.id === currentPlayer.id;
  const isInGame = isPlayer1 || isPlayer2;
  
  if (gameState.spinning) {
    betButton.disabled = true;
    betButton.textContent = 'Идет игра...';
    statusElement.textContent = 'Идет игра...';
    progressFill.style.width = '100%';
    progressFill.style.background = 'linear-gradient(90deg, #FF5252 0%, #4FC3F7 100%)';
    return;
  }
  
  if (gameState.player1) {
    document.getElementById('player1-name').textContent = 
      gameState.player1.id === currentPlayer.id ? 'Вы' : gameState.player1.name;
  } else {
    document.getElementById('player1-name').textContent = 'Ожидание...';
  }
  
  if (gameState.player2) {
    document.getElementById('player2-name').textContent = 
      gameState.player2.id === currentPlayer.id ? 'Вы' : gameState.player2.name;
  } else {
    document.getElementById('player2-name').textContent = 'Ожидание...';
  }
  
  if (gameState.player1 && gameState.player2) {
    if (isInGame) {
      betButton.disabled = true;
      betButton.textContent = 'Ожидание запуска...';
      statusElement.textContent = 'Оба игрока готовы!';
    } else {
      betButton.disabled = true;
      betButton.textContent = 'Игра уже началась';
      statusElement.textContent = 'Игра в процессе';
    }
    progressFill.style.width = '100%';
    progressFill.style.background = 'linear-gradient(90deg, #FF5252 0%, #4FC3F7 100%)';
  } else if (gameState.player1 || gameState.player2) {
    if (isInGame) {
      betButton.disabled = true;
      betButton.textContent = 'Ожидание соперника...';
      statusElement.textContent = 'Ожидание второго игрока';
      progressFill.style.width = '50%';
      progressFill.style.background = isPlayer1 ? '#FF5252' : '#4FC3F7';
    } else {
      betButton.disabled = false;
      betButton.textContent = 'Присоединиться (50 золотых)';
      statusElement.textContent = 'Можно присоединиться';
      progressFill.style.width = gameState.player1 ? '50%' : '0%';
      progressFill.style.background = '#FF5252';
    }
  } else {
    betButton.disabled = false;
    betButton.textContent = 'Создать игру (50 золотых)';
    statusElement.textContent = 'Ожидание игроков...';
    progressFill.style.width = '0%';
  }
}

function placeBet() {
  if (gameState.spinning) return;
  
  if ((gameState.player1 && gameState.player1.id === currentPlayer.id) || 
      (gameState.player2 && gameState.player2.id === currentPlayer.id)) {
    return;
  }
  
  if (!gameState.player1) {
    gameState.player1 = currentPlayer;
  } else if (!gameState.player2 && gameState.player1.id !== currentPlayer.id) {
    gameState.player2 = currentPlayer;
  }
  
  saveGameState();
  updateGameUI();
}

function startGame() {
  gameState.spinning = true;
  saveGameState();
  
  const betButton = document.getElementById('pvp-bet');
  const statusElement = document.getElementById('pvp-status');
  const resultElement = document.getElementById('pvp-result');
  const progressFill = document.getElementById('progress-fill');
  
  betButton.disabled = true;
  statusElement.textContent = 'Определяем победителя...';
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    progressFill.style.width = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      finishGame();
    }
  }, 50);
}

function finishGame() {
  const isPlayer1Winner = Math.random() < 0.5;
  gameState.winner = isPlayer1Winner ? gameState.player1 : gameState.player2;
  
  const resultElement = document.getElementById('pvp-result');
  const isWinner = gameState.winner.id === currentPlayer.id;
  
  resultElement.textContent = isWinner ? 'Вы победили! +50 золотых' : 'Вы проиграли!';
  resultElement.style.color = isWinner ? '#4CAF50' : '#F44336';
  
  updateGameUI();
  
  setTimeout(() => {
    resetGameState();
    updateGameUI();
  }, 5000);
}

// Инициализация PVP игры
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pvp-container').style.display = 'flex';
  loadGameState();
  setInterval(checkGameState, 1000);
});