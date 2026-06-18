(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-slide-dot]'));
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        const active = slideIndex === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-dot')) || 0);
        play();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);
    show(0);
    play();
  });

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }

      const value = input.value.trim();
      if (!value) {
        event.preventDefault();
        window.location.href = './library.html';
      }
    });
  });

  const liveSearch = document.querySelector('[data-live-search]');
  const cardList = document.querySelector('[data-card-list]');
  const emptyState = document.querySelector('[data-empty-state]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  let activeFilter = '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cardList) {
      return;
    }

    const query = normalize(liveSearch ? liveSearch.value : '');
    const cards = Array.from(cardList.querySelectorAll('[data-card]'));
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.getAttribute('data-search'));
      const matchesText = !query || haystack.indexOf(query) !== -1;
      const matchesFilter = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
      const visible = matchesText && matchesFilter;
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  if (liveSearch) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      liveSearch.value = q;
    }

    liveSearch.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  document.querySelectorAll('[data-clear-search]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (liveSearch) {
        liveSearch.value = '';
      }
      activeFilter = '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', !item.getAttribute('data-filter'));
      });
      applyFilters();
      window.history.replaceState({}, document.title, window.location.pathname);
    });
  });

  applyFilters();
})();
