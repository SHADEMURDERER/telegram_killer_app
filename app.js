// Проверка alert
alert("Сообщение на русском!");

// Инициализация Telegram WebApp
if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.MainButton.setText("Продолжить").show();
}