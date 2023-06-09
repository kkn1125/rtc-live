export const MODE = import.meta.env.MODE;
export const PROTOCOL = import.meta.env.VITE_API_PROTOCOL;
export const HOST = import.meta.env.VITE_API_HOST;
export const PORT = import.meta.env.VITE_API_PORT;
export const VERSION = import.meta.env.VITE_API_VERSION;
export const BASE_PATH = import.meta.env.VITE_API_BASE_PATH;

/* rtc options */
export const RTC_PEER_CONNECT_OPTION = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
    {
      urls: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    {
      urls: "turn:192.158.29.39:3478?transport=tcp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
  ],
};

export const SOCKET_PROTOCOL = import.meta.env.VITE_SOCKET_PROTOCOL;
export const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
export const SOCKET_PORT = import.meta.env.VITE_SOCKET_PORT;
export const CODEC = 'video/webm;codecs="vp9,opus"';
export const VIDEO_OPTION = {
  autoplay: true,
  controls: true,
  responsive: true,
  fluid: true,
  liveui: true,
  liveTracker: {
    // 몇초까지 live로 인식할지
    liveTolerance: 5,
    // 몇초까지 벌어져야 live를 띄울지
    trackingThreshold: 5,
  },
};
export const VIEWER_VIDEO_OPTION = {
  autoplay: true,
  controls: false,
  responsive: true,
  fluid: true,
  liveui: true,
  liveTracker: {
    // 몇초까지 live로 인식할지
    liveTolerance: 5,
    // 몇초까지 벌어져야 live를 띄울지
    trackingThreshold: 10,
  },
};
