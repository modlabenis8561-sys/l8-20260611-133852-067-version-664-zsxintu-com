(function () {
  function attachStream(video, streamUrl) {
    if (video.hlsInstance) {
      video.hlsInstance.destroy();
      video.hlsInstance = null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      video.hlsInstance = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          video.hlsInstance = null;
          video.src = streamUrl;
          video.play().catch(function () {});
        }
      });
      return;
    }

    video.src = streamUrl;
    video.play().catch(function () {});
  }

  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-stream]');

    if (!video || !button) {
      return;
    }

    function start() {
      var streamUrl = button.getAttribute('data-stream');
      if (!streamUrl) {
        return;
      }

      button.classList.add('is-hidden');
      video.controls = true;
      attachStream(video, streamUrl);
    }

    button.addEventListener('click', start);
    shell.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        start();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(initPlayer);
})();
