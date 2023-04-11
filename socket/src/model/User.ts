import { v3, v4, v5 } from "uuid";
import { dev } from "../util/tool";

export default class User {
  id: string;
  nickname: string;

  isAdmin: boolean = false;

  joinIn: string;

  created_at: number = Date.now();
  updated_at: number = Date.now();

  /* media */
  offer: object;
  answer: object;
  remoteOffer: object;
  remoteAnswer: object;
  icecandidate: object;
  remoteIcecandidate: object;
  isAudio: boolean = false;
  isVideo: boolean = false;

  constructor(id: string = v4(), nickname: string = v4(), roomId?: string) {
    id && (this.id = id);
    nickname && (this.nickname = nickname);
    roomId && (this.joinIn = roomId);
    dev.alias("✨CREATE USER").log(this);
  }

  setAdmin() {
    this.isAdmin = true;
    dev.alias("✅SET ROLE ADMIN").log(this);
  }

  setUser() {
    this.isAdmin = false;
    dev.alias("✅SET ROLE USER").log(this);
  }

  turnOnVideo() {
    this.isVideo = true;
    dev.alias("♻️TURN ON THE VIDEO").log(this);
  }

  turnOffVideo() {
    this.isVideo = false;
    dev.alias("♻️TURN OFF THE VIDEO").log(this);
  }

  turnOnAudio() {
    this.isAudio = true;
    dev.alias("♻️TURN ON THE AUDIO").log(this);
  }

  turnOffAudio() {
    this.isAudio = false;
    dev.alias("♻️TURN OFF THE AUDIO").log(this);
  }

  saveOffer(offer: object) {
    this.offer = offer;
    dev.alias("✅SAVE OFFER").log(this);
    return this.offer;
  }

  saveAnswer(answer: object) {
    this.answer = answer;
    dev.alias("✅SAVE ANSWER").log(this);
    return this.answer;
  }

  saveRemoteOffer(remoteOffer: object) {
    this.remoteOffer = remoteOffer;
    dev.alias("✅SAVE REMOTE OFFER").log(this);
    return this.remoteOffer;
  }

  saveRemoteAnswer(remoteAnswer: object) {
    this.remoteAnswer = remoteAnswer;
    dev.alias("✅SAVE REMOTE ANSWER").log(this);
    return this.remoteAnswer;
  }
}
