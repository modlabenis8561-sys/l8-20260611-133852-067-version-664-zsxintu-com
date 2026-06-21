document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(nextIndex);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var filterList = document.querySelector('[data-filter-list]');
    if (filterPanel && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-search-card]'));
        var activeType = 'all';
        var activeYear = 'all';
        var localSearch = document.querySelector('[data-local-search]');

        function markActive(selector, value) {
            Array.prototype.slice.call(filterPanel.querySelectorAll(selector)).forEach(function (button) {
                var attrName = selector.indexOf('type') !== -1 ? 'data-filter-type' : 'data-filter-year';
                button.classList.toggle('active', button.getAttribute(attrName) === value);
            });
        }

        function applyFilters() {
            var query = localSearch ? localSearch.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var typeOk = activeType === 'all' || card.getAttribute('data-type') === activeType;
                var yearOk = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.textContent
                ].join(' ').toLowerCase();
                var queryOk = !query || text.indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !(typeOk && yearOk && queryOk));
            });
        }

        filterPanel.addEventListener('click', function (event) {
            var button = event.target.closest('button');
            if (!button) {
                return;
            }

            if (button.hasAttribute('data-filter-type')) {
                activeType = button.getAttribute('data-filter-type');
                markActive('[data-filter-type]', activeType);
            }

            if (button.hasAttribute('data-filter-year')) {
                activeYear = button.getAttribute('data-filter-year');
                markActive('[data-filter-year]', activeYear);
            }

            applyFilters();
        });

        if (localSearch) {
            localSearch.addEventListener('input', applyFilters);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-button');
        var source = player.getAttribute('data-src');
        var initialized = false;
        var hlsInstance = null;

        function initializePlayer() {
            if (!video || !source) {
                return;
            }

            if (!initialized) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                initialized = true;
            }

            player.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', initializePlayer);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!initialized) {
                    initializePlayer();
                    return;
                }

                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    player.classList.remove('is-playing');
                }
            });
        }
    });

    if (window.SEARCH_DATA) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = document.querySelector('[data-search-input]');
        var status = document.querySelector('[data-search-status]');
        var results = document.querySelector('[data-search-results]');

        if (input) {
            input.value = query;
            input.addEventListener('input', function () {
                renderSearch(input.value);
            });
        }

        function movieCard(item) {
            var tags = (item.tags || []).slice(0, 4).map(function (tag) {
                return '<span class="tag">' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card">' +
                '<a class="cover-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">' +
                '<span class="cover-frame">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="cover-shade"></span><span class="play-dot">▶</span>' +
                '</span></a>' +
                '<div class="card-body">' +
                '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
                '<h3 class="card-title"><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
                '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="card-tags">' + tags + '</div>' +
                '</div></article>';
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function renderSearch(value) {
            var keyword = String(value || '').trim().toLowerCase();
            if (!results || !status) {
                return;
            }

            if (!keyword) {
                results.innerHTML = '';
                status.textContent = '请输入关键词开始搜索。';
                return;
            }

            var matched = window.SEARCH_DATA.filter(function (item) {
                var text = [item.title, item.year, item.type, item.region, item.genre, item.category, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();
                return text.indexOf(keyword) !== -1;
            }).slice(0, 120);

            status.textContent = matched.length ? '已显示前 ' + matched.length + ' 条相关结果。' : '没有找到匹配内容。';
            results.innerHTML = matched.map(movieCard).join('');
        }

        renderSearch(query);
    }
});
