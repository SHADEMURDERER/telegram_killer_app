alert('Я ЖИВОЙ!'); // Проверка работы
if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}