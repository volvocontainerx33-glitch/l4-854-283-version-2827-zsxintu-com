import { H as Hls } from './hls-vendor-dru42stk.js';

export function mountPlayer(config) {
  const video = document.getElementById(config.videoId);
  const cover = document.getElementById(config.coverId);
  let hls = null;
  let ready = false;

  if (!video || !config.url) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.url;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(config.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          ready = false;
        }
      });
      return;
    }

    video.src = config.url;
  }

  async function start() {
    attach();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
}
