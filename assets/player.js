(function () {
  const video = document.querySelector('[data-player]');
  const configNode = document.getElementById('player-config');
  const cover = document.querySelector('[data-play-cover]');
  const button = document.querySelector('[data-play-button]');

  if (!video || !configNode) {
    return;
  }

  let config = {};

  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  let attached = false;

  function attachStream() {
    if (attached || !config.url) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.url;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(config.url);
      hls.attachMedia(video);
      video.hlsController = hls;
    } else {
      video.src = config.url;
    }

    attached = true;
  }

  function startVideo() {
    attachStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    const result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', startVideo);
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
})();
