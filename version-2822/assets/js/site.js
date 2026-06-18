(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    bindNavigation();
    bindBackTop();
    bindHero();
    bindFilters();
    bindPlayers();
  });

  function bindNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function bindBackTop() {
    var button = document.querySelector(".back-top");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      if (window.scrollY > 360) {
        button.classList.add("visible");
      } else {
        button.classList.remove("visible");
      }
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var cards = Array.prototype.slice.call(root.querySelectorAll(".hero-focus-card"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + cards.length) % cards.length;
      cards.forEach(function (card, i) {
        card.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function bindFilters() {
    document.querySelectorAll(".js-filter-scope").forEach(function (scope) {
      var search = scope.querySelector("[data-filter-search]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var list = scope.querySelector("[data-filter-list]");
      var empty = scope.querySelector("[data-filter-empty]");
      if (!list) {
        list = scope.parentElement.querySelector("[data-filter-list]");
      }
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var matchesQuery = !query || (card.getAttribute("data-title") || "").indexOf(query) !== -1;
          var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchesRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
          var matchesType = !selectedType || card.getAttribute("data-type") === selectedType;
          var visible = matchesQuery && matchesYear && matchesRegion && matchesType;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [search, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function bindPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var poster = player.querySelector(".player-poster");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      function attach() {
        if (loaded || !stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function play() {
        attach();
        player.classList.add("is-playing");
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      if (poster) {
        poster.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }
})();
