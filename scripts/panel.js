function initPanel() {
  const panelHTML = `
    <div id="panel">
      <div class="tab-buttons">
        <button class="tab-button active" data-page="profile">Профиль</button>
        <button class="tab-button" data-page="shop">Магазин</button>
        <button class="tab-button" data-page="pvp">PVP</button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', panelHTML);
  
  // Анимация появления
  setTimeout(() => {
    const panel = document.getElementById('panel');
    if (panel) {
      panel.style.transition = 'bottom 1.5s ease-out, opacity 1.5s ease-out';
      panel.style.bottom = '0';
      panel.style.opacity = '1';
    }
  }, 6000);
}

document.addEventListener('DOMContentLoaded', initPanel);