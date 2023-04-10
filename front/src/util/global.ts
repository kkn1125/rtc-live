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
