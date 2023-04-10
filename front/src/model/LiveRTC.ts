import { RTC_PEER_CONNECT_OPTION } from "../util/global";

export default class LiveRTC extends RTCPeerConnection {
  localStream?: MediaStream;
  constructor() {
    super(RTC_PEER_CONNECT_OPTION);
  }

  async connectWebCam() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    this.localStream = stream;
  }

  setLocalDesc(session: RTCSessionDescription) {
    this.setLocalDescription(session);
  }

  setRemoteDesc(session: RTCSessionDescription) {
    this.setRemoteDescription(session);
  }
}
