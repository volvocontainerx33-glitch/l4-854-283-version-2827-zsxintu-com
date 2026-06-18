import { H as Hls } from "./hls-vendor-dru42stk.js";

var streamUrl = new URL("../media/stream.m3u8", import.meta.url).href;
var fallbackUrl = new URL("../media/stream.mp4", import.meta.url).href;

document.querySelectorAll(".js-player").forEach(function (player) {
  var video = player.querySelector("video");
  var cover = player.querySelector(".player-cover");
  var hls = null;
  var attached = false;

  function attach() {
    if (!video || attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
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
          video.src = fallbackUrl;
        }
      });
      return;
    }

    video.src = fallbackUrl;
  }

  function play() {
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    var request = video.play();
    if (request && typeof request.catch === "function") {
      request.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }
});
