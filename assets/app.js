(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('.hero-prev');
    const next = hero.querySelector('.hero-next');
    let current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    if (slides.length > 1) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
      next.addEventListener('click', function () {
        show(current + 1);
      });
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-slide')) || 0);
        });
      });
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  const searchInput = document.querySelector('[data-search]');
  const cards = Array.from(document.querySelectorAll('.movie-card, .rank-row'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter-value]'));
  let activeFilter = 'all';

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilters() {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      const matchText = !keyword || cardText(card).includes(keyword);
      const matchFilter = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
      card.hidden = !(matchText && matchFilter);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });
})();
