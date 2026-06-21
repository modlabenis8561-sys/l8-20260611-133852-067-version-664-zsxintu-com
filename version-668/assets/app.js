(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                start();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener("mouseenter", function () {
                activate(parseInt(thumb.getAttribute("data-hero-thumb"), 10) || 0);
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                activate(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                activate(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        activate(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var count = scope.querySelector("[data-filter-count]");
            var empty = scope.querySelector("[data-empty-state]");

            if (yearSelect && yearSelect.options.length <= 1) {
                var years = cards.map(function (card) {
                    return card.getAttribute("data-year") || "";
                }).filter(Boolean).filter(function (year, index, list) {
                    return list.indexOf(year) === index;
                }).sort().reverse();
                years.slice(0, 40).forEach(function (year) {
                    var option = document.createElement("option");
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });
            }

            if (scope.hasAttribute("data-search-page") && input) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q") || "";
                input.value = query;
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year")
                    ].join(" "));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = (!query || haystack.indexOf(query) !== -1) && (!type || cardType.indexOf(type) !== -1) && (!year || cardYear === year);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + " 部";
                }
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, typeSelect, yearSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupPlayer() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-play-overlay]");
            if (!video) {
                return;
            }
            var source = video.getAttribute("data-video-url") || "";
            var attached = false;
            var hls = null;

            function attachSource() {
                if (attached || !source) {
                    return;
                }
                if (/\.m3u8(\?|$)/i.test(source) && window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                attached = true;
            }

            function playVideo() {
                attachSource();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", playVideo);
            }

            player.addEventListener("click", function (event) {
                if (event.target === player) {
                    playVideo();
                }
            });

            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });

            video.addEventListener("pause", function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove("is-hidden");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
