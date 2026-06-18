(function () {
  function attachStream(video, url) {
    if (video.getAttribute('data-ready') === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hls = hls;
    } else {
      video.src = url;
    }

    video.setAttribute('data-ready', 'true');
  }

  window.initializeMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);

    if (!video || !button || !options.url) {
      return;
    }

    function play() {
      attachStream(video, options.url);
      video.controls = true;
      button.classList.add('is-hidden');
      var started = video.play();

      if (started && typeof started.catch === 'function') {
        started.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  };
}());
