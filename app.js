alert("Сообщение на русском!");

if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.MainButton.setText("Продолжить").show();
}