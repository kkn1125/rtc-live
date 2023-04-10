import { v3, v4, v5 } from "uuid";

export default class User {
  id: string;
  nickname: string;

  isAudio: boolean = false;
  isVideo: boolean = false;

  isAdmin: boolean = false;

  joinIn: string;

  created_at: number = Date.now();
  updated_at: number = Date.now();

  constructor(id: string = v4(), nickname: string = v4(), roomId?: string) {
    id && (this.id = id);
    nickname && (this.nickname = nickname);
    roomId && (this.joinIn = roomId);
  }

  setAdmin() {
    this.isAdmin = true;
  }

  setUser() {
    this.isAdmin = false;
  }

  turnOnVideo() {
    this.isVideo = true;
  }

  turnOffVideo() {
    this.isVideo = false;
  }

  turnOnAudio() {
    this.isAudio = true;
  }

  turnOffAudio() {
    this.isAudio = false;
  }
}
