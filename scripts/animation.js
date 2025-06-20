document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const ring = document.getElementById('ring');
    const title = document.getElementById('title');
    
    if (ring && title) {
      // Анимация завершения
      ring.style.animation = 'zoomOut 2s ease-in forwards';
      title.style.animation = 'fadeOut 1s ease-in forwards';
      
      setTimeout(() => {
        const container = document.getElementById('ring-container');
        if (container) {
          container.style.opacity = '0';
          setTimeout(() => {
            container.remove();
            document.getElementById('content').style.display = 'block';
            initMenu();
          }, 1000);
        }
      }, 2000);
    }
  }, 6000);
});