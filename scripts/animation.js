document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('#ring, #title');
  elements.forEach(el => {
    el.style.willChange = 'transform, opacity, filter';
  });
  
  setTimeout(() => {
    const ring = document.getElementById('ring');
    if (ring) {
      ring.style.animation = 'flyThrough 2s ease-out forwards';
      
      setTimeout(() => {
        const container = document.getElementById('ring-container');
        if (container) {
          container.style.opacity = '0';
          setTimeout(() => {
            container.remove();
            document.getElementById('content').classList.add('visible');
          }, 1000);
        }
      }, 2000);
    }
  }, 4000);
});