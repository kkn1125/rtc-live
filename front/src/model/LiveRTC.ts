import { RTC_PEER_CONNECT_OPTION } from "../util/global";
import { dev } from "../util/tool";

export default class LiveRTC extends RTCPeerConnection {
  parent?: HTMLElement;
  video?: HTMLVideoElement;
  localStream?: MediaStream;
  offer?: RTCSessionDescriptionInit | RTCSessionDescription;
  answer?: RTCSessionDescriptionInit | RTCSessionDescription;
  events: { [k: string]: Function } = {};

  constructor() {
    super(RTC_PEER_CONNECT_OPTION);

    if (this.video && !this.video.srcObject) {
      this.video.srcObject = new MediaStream();
    }

    this.onicecandidate = async (e) => {
      console.log("✨icecandidate", e.candidate?.candidate);
      if (e.candidate) {
        this.events?.["ice"]?.(e);
        // this.setLocalDescription();
      }
    };
    this.ontrack = (e) => {
      console.log("✨on track");
      if (this.video && this.video.srcObject) {
        // (this.video.srcObject as MediaStream).addTrack(e.track);
        (this.video.srcObject as MediaStream).addTrack(e.track);
      } else {
        if (this.video) {
          this.video.srcObject = new MediaStream();
          this.video.srcObject.addTrack(e.track);
        }
      }
      this.events["track"](e);
    };
  }

  on(type: string, cb: (e: RTCTrackEvent & RTCPeerConnectionIceEvent) => void) {
    this.events[type] = cb.bind(this);
  }

  setParent(parent: HTMLElement) {
    this.parent = parent;
  }

  createVideo(user: any) {
    if (this.parent && this.parent.children.length !== 0) return;

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.id = `video_${user.id}`;

    const nameTag = document.createElement("span");
    nameTag.innerHTML = user.nickname;

    const wrap = document.createElement("div");
    wrap.append(video, nameTag);
    wrap.id = `con_${user.id}`;
    this.video = video;
    console.log(this.parent);
    this.parent?.append(wrap);
  }

  async connectWebCam() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    if (this.video) {
      this.video.srcObject = this.localStream = stream;
      stream.getTracks().forEach((track) => this.addTrack(track, stream));
    }
    return true;
  }

  // async saveOffer() {
  //   const offer = await this.createOffer();
  //   this.offer = offer;
  //   dev.alias("✨CREATE OFFER").log(offer);
  //   this.setLocalDescription(offer);
  // }

  // async saveAnswer(offer: { type: RTCSdpType; sdp?: string }) {
  //   const answer = await this.createAnswer(new RTCSessionDescription(offer));
  //   this.answer = answer;
  //   dev.alias("✨CREATE ANSWER").log(answer);
  // }

  // setLocalDesc(session: { type: RTCSdpType; sdp?: string }) {
  //   this.setLocalDescription(new RTCSessionDescription(session));
  //   dev.alias("✨SAVE LOCAL DESCRIPTION").log(this.localDescription);
  // }

  // setRemoteDesc(session: { type: RTCSdpType; sdp?: string }) {
  //   this.setRemoteDescription(new RTCSessionDescription(session));
  //   dev.alias("✨SAVE REMOTE DESCRIPTION").log(this.remoteDescription);
  // }
}
