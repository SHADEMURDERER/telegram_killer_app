function adjustViewport() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
  document.body.style.height = `${window.innerHeight}px`;
}

if (window.Telegram?.WebApp) {
  Telegram.WebApp.expand();
  Telegram.WebApp.MainButton.setText("Продолжить").show();
  Telegram.WebApp.onEvent('viewportChanged', adjustViewport);
}

window.addEventListener('resize', adjustViewport);
adjustViewport();

alert("Сообщение на русском!");