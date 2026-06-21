(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    if (!panels.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var list = document.querySelector('[data-filter-list]');
      var empty = document.querySelector('[data-filter-empty]');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.filter-card')) : [];

      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var activeFilters = {};
        var visible = 0;

        selects.forEach(function (select) {
          if (select.value) {
            activeFilters[select.getAttribute('data-filter-select')] = select.value;
          }
        });

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;

          Object.keys(activeFilters).forEach(function (key) {
            if ((card.getAttribute('data-' + key) || '') !== activeFilters[key]) {
              matched = false;
            }
          });

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      apply();
    });
  }

  initHero();
  initFilters();
})();
