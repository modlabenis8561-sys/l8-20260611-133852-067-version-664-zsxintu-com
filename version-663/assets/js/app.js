(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;

        var showSlide = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        };

        var startTimer = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var search = scope.querySelector('[data-filter-search]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var status = scope.querySelector('[data-filter-status]');
        var activeCategory = 'all';
        var activeType = 'all';
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (search && initialQuery) {
            search.value = initialQuery;
        }

        var apply = function () {
            var query = search ? search.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-type') || ''
                ].join(' ').toLowerCase();
                var categoryOk = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
                var typeOk = activeType === 'all' || card.getAttribute('data-type') === activeType;
                var queryOk = !query || text.indexOf(query) !== -1;
                var show = categoryOk && typeOk && queryOk;
                card.classList.toggle('is-filter-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = visible > 0 ? '正在显示匹配内容' : '没有找到匹配内容';
            }
        };

        scope.querySelectorAll('[data-filter-category]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter-category') || 'all';
                scope.querySelectorAll('[data-filter-category]').forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });

        scope.querySelectorAll('[data-filter-type]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.getAttribute('data-filter-type') || 'all';
                scope.querySelectorAll('[data-filter-type]').forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });

        if (search) {
            search.addEventListener('input', apply);
        }

        apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var status = player.querySelector('[data-player-status]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hls = null;
        var ready = false;

        if (!video || !stream) {
            return;
        }

        var prepare = function () {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            ready = true;
        };

        var play = function () {
            prepare();
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('error', function () {
            if (status) {
                status.textContent = '视频加载遇到问题，请稍后再试';
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}());
