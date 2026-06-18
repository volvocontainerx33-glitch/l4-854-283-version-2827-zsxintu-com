(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (form.dataset.local === 'true') {
        return;
      }
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('action') || './library.html';
      window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    var start = function () {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var search = filterPanel.querySelector('[data-filter-search]');
    var region = filterPanel.querySelector('[data-filter-region]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var year = filterPanel.querySelector('[data-filter-year]');
    var clear = filterPanel.querySelector('[data-filter-clear]');
    var empty = filterPanel.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && search) {
      search.value = initialQuery;
    }
    var normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };
    var apply = function () {
      var q = normalize(search && search.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var hay = normalize(card.dataset.search);
        var ok = true;
        if (q && hay.indexOf(q) === -1) {
          ok = false;
        }
        if (r && normalize(card.dataset.region) !== r) {
          ok = false;
        }
        if (t && normalize(card.dataset.type) !== t) {
          ok = false;
        }
        if (y && normalize(card.dataset.year) !== y) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    };
    [search, region, type, year].forEach(function (item) {
      if (!item) {
        return;
      }
      item.addEventListener('input', apply);
      item.addEventListener('change', apply);
    });
    if (clear) {
      clear.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }
    apply();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play-cover]');
    var message = player.querySelector('[data-player-message]');
    var url = player.dataset.playUrl;
    var hls = null;
    var started = false;
    var playVideo = function () {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          if (message) {
            message.textContent = '点击画面即可继续播放';
          }
        });
      }
    };
    var startPlayer = function () {
      if (!video || !url) {
        return;
      }
      player.classList.add('is-playing');
      if (message) {
        message.textContent = '正在播放';
      }
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && message) {
            message.textContent = '播放失败，请稍后重试';
          }
        });
      } else {
        video.src = url;
        playVideo();
      }
    };
    if (cover) {
      cover.addEventListener('click', startPlayer);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        if (message) {
          message.textContent = '播放结束';
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    var updateBackTop = function () {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    };
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', updateBackTop, { passive: true });
    updateBackTop();
  }
})();
