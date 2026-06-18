(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var opened = mobileNav.hasAttribute("hidden");
            if (opened) {
                mobileNav.removeAttribute("hidden");
            } else {
                mobileNav.setAttribute("hidden", "");
            }
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;
    var heroTimer;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle("active", itemIndex === heroIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle("active", itemIndex === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(heroTimer);
            showHero(Number(dot.getAttribute("data-hero-index")) || 0);
            startHero();
        });
    });

    startHero();

    var list = document.getElementById("movie-list");
    var filterInput = document.getElementById("filter-search");
    var filterType = document.getElementById("filter-type");
    var filterSort = document.getElementById("filter-sort");

    function runFilter() {
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var type = filterType ? filterType.value : "";
        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type")
            ].join(" ").toLowerCase();
            var visible = true;
            if (keyword && haystack.indexOf(keyword) === -1) {
                visible = false;
            }
            if (type && card.getAttribute("data-type") !== type) {
                visible = false;
            }
            card.style.display = visible ? "" : "none";
        });
    }

    function sortCards() {
        if (!list || !filterSort) {
            return;
        }
        var mode = filterSort.value;
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        if (mode === "default") {
            cards.sort(function (a, b) {
                return 0;
            });
        }
        if (mode === "rating") {
            cards.sort(function (a, b) {
                return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
            });
        }
        if (mode === "views") {
            cards.sort(function (a, b) {
                return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
            });
        }
        if (mode === "year") {
            cards.sort(function (a, b) {
                return String(b.getAttribute("data-year")).localeCompare(String(a.getAttribute("data-year")));
            });
        }
        cards.forEach(function (card) {
            list.appendChild(card);
        });
        runFilter();
    }

    if (filterInput) {
        filterInput.addEventListener("input", runFilter);
    }
    if (filterType) {
        filterType.addEventListener("change", runFilter);
    }
    if (filterSort) {
        filterSort.addEventListener("change", sortCards);
    }

    var searchBox = document.getElementById("page-search-input");
    var resultBox = document.getElementById("search-results");
    var searchTitle = document.getElementById("search-title");

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-rating=\"" + movie.rating + "\" data-views=\"" + movie.views + "\" data-region=\"" + escapeHtml(movie.region) + "\">" +
            "<a href=\"" + movie.url + "\" class=\"poster-link\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"card-play\">▶</span><span class=\"quality\">HD</span><span class=\"score\">" + movie.rating + "</span></a>" +
            "<div class=\"movie-card-body\"><h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2><p>" + escapeHtml(movie.desc) + "</p><div class=\"meta-row\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div><div class=\"tag-list\">" + tags + "</div></div></article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function renderSearch() {
        if (!resultBox || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (searchBox) {
            searchBox.value = query;
        }
        var normalized = query.trim().toLowerCase();
        var results = window.MOVIE_INDEX.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            return movie.search.indexOf(normalized) !== -1;
        }).slice(0, 120);
        if (searchTitle) {
            searchTitle.textContent = normalized ? "与“" + query + "”相关的影片" : "影片列表";
        }
        if (!results.length) {
            resultBox.innerHTML = "<div class=\"empty-state\">没有找到相关影片</div>";
            return;
        }
        resultBox.innerHTML = results.map(cardHtml).join("");
    }

    renderSearch();
}());
