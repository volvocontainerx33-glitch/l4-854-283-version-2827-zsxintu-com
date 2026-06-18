(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.opacity = "0";
      });
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-page]").forEach(function (panel) {
      var grid = panel.querySelector("[data-filter-grid]");
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
      var search = panel.querySelector("[data-filter-search]");
      var category = panel.querySelector("[data-filter-category]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var sort = panel.querySelector("[data-filter-sort]");
      var empty = panel.querySelector("[data-empty-state]");

      function textValue(element) {
        return element ? String(element.value || "").trim().toLowerCase() : "";
      }

      function selectedValue(element) {
        return element ? String(element.value || "all") : "all";
      }

      function apply() {
        var query = textValue(search);
        var cat = selectedValue(category);
        var reg = selectedValue(region);
        var typ = selectedValue(type);
        var shown = 0;

        cards.forEach(function (card) {
          var ok = true;
          if (query && String(card.dataset.title || "").indexOf(query) === -1) {
            ok = false;
          }
          if (cat !== "all" && card.dataset.category !== cat) {
            ok = false;
          }
          if (reg !== "all" && card.dataset.region !== reg) {
            ok = false;
          }
          if (typ !== "all" && card.dataset.type !== typ) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }

      function reorder() {
        if (!grid || !sort) {
          apply();
          return;
        }
        var mode = sort.value;
        var ordered = cards.slice();
        if (mode === "score") {
          ordered.sort(function (a, b) {
            return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
          });
        } else if (mode === "year") {
          ordered.sort(function (a, b) {
            return String(b.dataset.year || "").localeCompare(String(a.dataset.year || ""), "zh-Hans-CN");
          });
        } else if (mode === "title") {
          ordered.sort(function (a, b) {
            var aTitle = a.querySelector(".movie-title") ? a.querySelector(".movie-title").textContent : "";
            var bTitle = b.querySelector(".movie-title") ? b.querySelector(".movie-title").textContent : "";
            return aTitle.localeCompare(bTitle, "zh-Hans-CN");
          });
        } else {
          ordered = cards.slice();
        }
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
        apply();
      }

      [search, category, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (sort) {
        sort.addEventListener("change", reorder);
      }

      apply();
    });
  });
})();
