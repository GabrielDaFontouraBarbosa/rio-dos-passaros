window.addEventListener('scroll', () => {
  const bg = document.querySelector('.bg-videos-scroll');
  const section = document.querySelector('.bloco-videos');

  if (!bg || !section) return;

  const rect = section.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Quando a seção entra na viewport
  if (rect.top < windowHeight && rect.bottom > 0) {
    const visiblePercent = 1 - rect.top / windowHeight;
    bg.style.opacity = Math.min(Math.max(visiblePercent, 0), 1);
  } else {
    bg.style.opacity = 0;
  }
});