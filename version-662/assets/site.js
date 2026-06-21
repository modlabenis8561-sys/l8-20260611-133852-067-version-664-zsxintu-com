(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function initMenu() {
        var toggle = $(".menu-toggle");
        var panel = $(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function initHero() {
        var stage = $("[data-hero]");
        if (!stage) {
            return;
        }
        var slides = $all(".hero-slide", stage);
        var dots = $all(".hero-dots button", stage);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            slides[index].classList.remove("is-active");
            if (dots[index]) {
                dots[index].classList.remove("is-active");
            }
            index = next;
            slides[index].classList.add("is-active");
            if (dots[index]) {
                dots[index].classList.add("is-active");
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show((index + 1) % slides.length);
        }, 5600);
    }

    function renderSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>" +
            "<span class=\"poster-play\">▶</span>" +
            "</a>" +
            "<div class=\"movie-copy\">" +
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.category) + "</p>" +
            "<p class=\"movie-line\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var results = $("#searchResults");
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }
        var input = $("#siteSearchInput");
        var form = $("#siteSearchForm");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) {
            input.value = initial;
        }
        function applySearch() {
            var query = (input && input.value ? input.value : "").trim().toLowerCase();
            var items = window.SEARCH_MOVIES;
            if (query) {
                items = items.filter(function (movie) {
                    return [movie.title, movie.region, movie.type, movie.category, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(query) !== -1;
                });
            }
            items = items.slice(0, 120);
            if (!items.length) {
                results.innerHTML = "<div class=\"empty-state\">没有找到相关内容，可以更换关键词或浏览分类片库。</div>";
                return;
            }
            results.innerHTML = items.map(renderSearchCard).join("");
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applySearch();
            });
        }
        applySearch();
    }

    window.bindMoviePlayer = function (video, button, mask, status, src) {
        if (!video || !button || !mask || !src) {
            return;
        }
        var hls = null;
        var loaded = false;
        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }
        function loadAndPlay() {
            mask.hidden = true;
            setStatus("正在加载影片...");
            if (loaded) {
                video.play().then(function () {
                    setStatus("");
                }).catch(function () {
                    setStatus("点击视频区域可继续播放。");
                });
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().then(function () {
                        setStatus("");
                    }).catch(function () {
                        setStatus("点击视频区域可继续播放。");
                    });
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("视频加载失败，请稍后重试。");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
                video.addEventListener("loadedmetadata", function () {
                    video.play().then(function () {
                        setStatus("");
                    }).catch(function () {
                        setStatus("点击视频区域可继续播放。");
                    });
                }, { once: true });
                video.addEventListener("error", function () {
                    setStatus("视频加载失败，请稍后重试。");
                }, { once: true });
            } else {
                setStatus("当前浏览器无法直接播放该视频。");
            }
        }
        button.addEventListener("click", loadAndPlay);
        mask.addEventListener("click", loadAndPlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                loadAndPlay();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initSearchPage();
    });
})();
