// Проверка alert
alert("Сообщение на русском!");  // Кириллица должна быть видна прямо в коде

// Инициализация Telegram WebApp
if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.MainButton.setText("Продолжить").show();
}