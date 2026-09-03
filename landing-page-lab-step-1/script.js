const filters = Array.from(document.querySelectorAll('.filter'));
const cards = Array.from(document.querySelectorAll('.template-card'));
const count = document.getElementById('visible-count');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;

    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    let visible = 0;
    cards.forEach((card) => {
      const categories = card.dataset.category.split(' ');
      const show = selected === 'all' || categories.includes(selected);
      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });

    count.textContent = String(visible).padStart(2, '0');
  });
});
