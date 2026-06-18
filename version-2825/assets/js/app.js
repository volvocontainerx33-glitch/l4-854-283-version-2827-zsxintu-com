(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 6200);
  }

  function getText(card, name) {
    return (card.getAttribute(name) || "").toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var target = document.querySelector(panel.getAttribute("data-target"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card, .horizontal-card"));
      var empty = target.parentElement ? target.parentElement.querySelector("[data-empty-state]") : null;
      var search = panel.querySelector("[data-search]");
      var region = panel.querySelector("[data-region]");
      var year = panel.querySelector("[data-year]");
      var category = panel.querySelector("[data-category]");

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value.toLowerCase() : "";
        var yearValue = year ? year.value.toLowerCase() : "";
        var categoryValue = category ? category.value.toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            getText(card, "data-title"),
            getText(card, "data-tags"),
            getText(card, "data-region"),
            getText(card, "data-year"),
            getText(card, "data-type"),
            getText(card, "data-category")
          ].join(" ");
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (regionValue && getText(card, "data-region") !== regionValue) {
            matched = false;
          }
          if (yearValue && getText(card, "data-year") !== yearValue) {
            matched = false;
          }
          if (categoryValue && getText(card, "data-category") !== categoryValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [search, region, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery && search) {
        search.value = initialQuery;
        apply();
      }
    });
  }

  function attachHls(video, source, message) {
    var HlsConstructor = window.Hls;
    if (HlsConstructor && HlsConstructor.isSupported && HlsConstructor.isSupported()) {
      var hls = new HlsConstructor({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return true;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return true;
    }
    if (message) {
      message.textContent = "视频暂时无法载入";
    }
    return false;
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      if (shell.playerReady) {
        return;
      }
      shell.playerReady = true;
      var video = shell.querySelector("video[data-src]");
      var button = shell.querySelector(".play-overlay");
      var message = shell.querySelector("[data-player-message]");
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-src");
      var loaded = false;
      function ensureLoaded() {
        if (loaded) {
          return true;
        }
        loaded = attachHls(video, source, message);
        return loaded;
      }
      function playVideo() {
        if (!ensureLoaded()) {
          return;
        }
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            if (message) {
              message.textContent = "点击视频控件开始播放";
            }
          });
        }
      }
      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        if (message) {
          message.textContent = "";
        }
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });

  window.addEventListener("hls-ready", setupPlayers);
})();
