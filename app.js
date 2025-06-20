if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.MainButton.setText("Продолжить").show();
    
    tg.MainButton.onClick(() => {
        tg.close();
    });
}