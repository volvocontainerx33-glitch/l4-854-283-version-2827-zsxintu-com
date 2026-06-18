(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });
    if (slides.length) {
      setSlide(0);
      window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var search = scope.querySelector('[data-filter-search]');
      var category = scope.querySelector('[data-filter-category]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var reset = scope.querySelector('[data-filter-reset]');
      var empty = scope.querySelector('[data-filter-empty]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

      function norm(value) {
        return (value || '').toString().toLowerCase();
      }

      function apply() {
        var q = norm(search && search.value);
        var cat = category ? category.value : 'all';
        var reg = region ? region.value : 'all';
        var typ = type ? type.value : 'all';
        var yr = year ? year.value : 'all';
        var visible = 0;
        cards.forEach(function (card) {
          var text = norm([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.textContent
          ].join(' '));
          var match = true;
          if (q && text.indexOf(q) === -1) {
            match = false;
          }
          if (cat !== 'all' && card.dataset.category !== cat) {
            match = false;
          }
          if (reg !== 'all' && card.dataset.region !== reg) {
            match = false;
          }
          if (typ !== 'all' && card.dataset.type !== typ) {
            match = false;
          }
          if (yr !== 'all' && card.dataset.year !== yr) {
            match = false;
          }
          card.classList.toggle('hidden-card', !match);
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      [search, category, region, type, year].forEach(function (item) {
        if (item) {
          item.addEventListener('input', apply);
          item.addEventListener('change', apply);
        }
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (search) {
            search.value = '';
          }
          [category, region, type, year].forEach(function (item) {
            if (item) {
              item.value = 'all';
            }
          });
          apply();
        });
      }
    });

    document.querySelectorAll('.movie-player').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var button = player.querySelector('.player-button');
      if (!video) {
        return;
      }
      var url = video.getAttribute('data-src');

      function prepare() {
        if (!url || video.dataset.ready === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
          hls.loadSource(url);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = url;
        }
        video.dataset.ready = '1';
      }

      function play() {
        prepare();
        player.classList.add('is-playing');
        video.controls = true;
        var started = video.play();
        if (started && started.catch) {
          started.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          play();
        });
      }
      video.addEventListener('click', function () {
        if (video.dataset.ready !== '1') {
          play();
        }
      });
    });
  });
})();
