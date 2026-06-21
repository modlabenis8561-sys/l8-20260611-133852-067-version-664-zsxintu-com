(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var prefix = form.getAttribute("data-prefix") || "./";
        var value = input ? input.value.trim() : "";
        var target = prefix + "search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase().replace(/\s+/g, " ");
  }

  function initFilters() {
    var input = document.querySelector("[data-page-search]");
    var list = document.querySelector("[data-movie-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var activeChip = "全部";

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
    }

    function apply() {
      var keyword = input ? normalize(input.value.trim()) : "";
      var chip = activeChip === "全部" ? "" : normalize(activeChip);
      var visible = 0;
      cards.forEach(function (card) {
        var text = cardText(card);
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedChip = !chip || text.indexOf(chip) !== -1;
        var matched = matchedKeyword && matchedChip;
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
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chipButton) {
      chipButton.addEventListener("click", function () {
        activeChip = chipButton.getAttribute("data-filter-chip") || "全部";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chipButton);
        });
        apply();
      });
    });

    apply();
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, offset) {
        slide.classList.toggle("is-active", offset === current);
      });
      dots.forEach(function (dot, offset) {
        dot.classList.toggle("is-active", offset === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-play-trigger]");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var hlsInstance = null;

      function attachStream(callback) {
        if (video.getAttribute("data-ready") === "true") {
          if (callback) {
            callback();
          }
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.setAttribute("data-ready", "true");
            if (callback) {
              callback();
            }
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = stream;
              video.setAttribute("data-ready", "true");
            }
          });
          return;
        }
        video.src = stream;
        video.setAttribute("data-ready", "true");
        if (callback) {
          callback();
        }
      }

      function play() {
        attachStream(function () {
          player.classList.add("is-playing");
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(function () {
              player.classList.remove("is-playing");
            });
          }
        });
      }

      if (trigger) {
        trigger.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initGlobalSearch();
    initFilters();
    initHero();
    initPlayers();
  });
})();
