(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 6500);
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-region") || ""
    ].join(" ").toLowerCase();
  }

  function runFilter(scope) {
    var input = scope.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty]");
    var keyword = input ? input.value.trim().toLowerCase() : "";
    var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
    var visible = 0;
    cards.forEach(function (card) {
      var ok = true;
      if (keyword && textOf(card).indexOf(keyword) === -1) {
        ok = false;
      }
      selects.forEach(function (select) {
        if (!ok) {
          return;
        }
        var key = select.getAttribute("data-filter-select");
        var value = select.value;
        if (value && (card.getAttribute("data-" + key) || "").indexOf(value) === -1) {
          ok = false;
        }
      });
      card.style.display = ok ? "" : "none";
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var controls = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-input], [data-filter-select]"));
      controls.forEach(function (control) {
        control.addEventListener("input", function () {
          runFilter(scope);
        });
        control.addEventListener("change", function () {
          runFilter(scope);
        });
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      var input = scope.querySelector("[data-filter-input]");
      if (q && input) {
        input.value = q;
        runFilter(scope);
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var stream = player.getAttribute("data-stream");
      var started = false;
      var hlsInstance = null;
      if (!video || !button || !stream) {
        return;
      }
      function attach() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        attach();
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
