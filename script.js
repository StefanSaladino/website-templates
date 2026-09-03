const featuredStyles = document.createElement('link');
featuredStyles.rel = 'stylesheet';
featuredStyles.href = 'featured.css';
document.head.append(featuredStyles);

const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.template-card')];

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle('active', item === button));
    cards.forEach((card) => {
      const categories = card.dataset.category.split(' ');
      card.classList.toggle('is-hidden', category !== 'all' && !categories.includes(category));
    });
  });
});
