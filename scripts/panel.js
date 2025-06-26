document.addEventListener('DOMContentLoaded', () => {
  const panelHTML = `
    <div id="panel">
      <div class="tab-buttons">
        <button class="tab-button" data-page="profile">Профиль</button>
        <button class="tab-button" data-page="shop">Магазин</button>
        <button class="tab-button" data-page="pvp">PVP</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', panelHTML);
  const currentPage = 
    window.location.pathname.includes('pvp-game.html') ? 'pvp' :
    window.location.hash === '#shop' ? 'shop' : 'profile';
  document.querySelector(`.tab-button[data-page="${currentPage}"]`).classList.add('active');
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page');
      switch(page) {
        case 'profile': window.location.href = 'index.html'; break;
        case 'shop': window.location.href = 'index.html#shop'; break;
        case 'pvp': window.location.href = 'pvp-game.html'; break;
      }
    });
  });
});