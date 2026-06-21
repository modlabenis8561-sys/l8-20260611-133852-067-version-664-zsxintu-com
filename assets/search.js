(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function text(value) {
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

  function card(item) {
    var tags = item.tags.slice(0, 2).map(function (tag) {
      return '<span>' + text(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card" href="' + item.url + '" data-title="' + text(item.title) + '" data-tags="' + text(item.tags.join(' ')) + '" data-year="' + item.year + '" data-region="' + text(item.region) + '">',
      '<div class="card-cover">',
      '<img src="' + item.cover + '" alt="' + text(item.title) + '" loading="lazy">',
      '<span class="card-region">' + text(item.region) + '</span>',
      '<span class="card-type">' + text(item.type) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + text(item.title) + '</h3>',
      '<p>' + text(item.oneLine) + '</p>',
      '<div class="card-meta"><span>' + item.year + '</span><span>' + text(item.genre) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>'
    ].join('');
  }

  function run() {
    var input = document.querySelector('[data-search-input]');
    var result = document.querySelector('[data-search-results]');
    var note = document.querySelector('[data-search-note]');
    var items = window.searchItems || [];
    if (!input || !result) {
      return;
    }

    function render(query) {
      var keyword = query.trim().toLowerCase();
      var matches = items.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase();
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);
      result.innerHTML = matches.map(card).join('');
      if (note) {
        note.textContent = keyword ? '相关影片' : '推荐影片';
      }
    }

    input.value = getQuery();
    render(input.value);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
