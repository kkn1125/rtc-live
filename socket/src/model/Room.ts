import { dev } from "../util/tool";
import User from "./User";

export default class Room {
  id: string;
  title?: string;
  password?: string;

  admin: User | undefined;
  users: User[] = [];

  streams: ArrayBuffer[] = [];
  chunk: number = 0;

  limit?: number = 0;

  constructor({
    id,
    title,
    password,
    limit,
  }: {
    id: string;
    title?: string;
    password?: string;
    limit?: number;
  }) {
    id && (this.id = id);
    title && (this.title = title);
    password && (this.password = password);
    limit && (this.limit = limit);
    dev.alias("✨CREATE ROOM").log(this);
  }

  isAdmin(id: string) {
    const isAdmin = Boolean(this.admin?.id === id);
    dev.alias("🔍IS ADMIN?").log(id, isAdmin);
    return isAdmin;
  }

  changeAdmin(user: User) {
    dev.alias("♻️CHANGE ADMIN").log(user);
    this.admin = user;
    user.setAdmin();
  }

  hasAdmin() {
    const hasAdmin = Boolean(this.admin);
    dev.alias("🔍CHECK HAS ADMIN").log(hasAdmin);
    return hasAdmin;
  }

  findUser(id: string) {
    const user = this.users.find((u) => u.id === id);
    dev.alias("🔍FIND USER").log(user);
    return user;
  }

  join(user: User) {
    if (!this.hasAdmin()) {
      this.changeAdmin(user);
      dev.alias("✨SET ADMIN").log(user);
    } else {
      user.setUser();
    }
    user.joinIn = this.id;
    this.users.push(user);
    dev.alias("✨JOIN USER").log(user);
    return user;
  }

  addStream(stream: ArrayBuffer) {
    this.streams.push(stream);
  }

  getStream() {
    return this.streams;
  }

  setChunk(chunk: number) {
    return (this.chunk = chunk);
  }

  getChunk() {
    return this.chunk;
  }

  out(id: string) {
    const index = this.users.findIndex((u) => u.id === id);
    const user = this.users.splice(index, 1)?.[0];
    if (user && this.isAdmin(user.id)) {
      this.admin = undefined;
      if (this.users.length > 0) {
        this.admin = this.users[0];
        this.users[0].setAdmin();
      }
    }
    dev.alias("❌DELETE USER").log(user);
    if (this.users.length === 0) {
      dev.alias("😥ROOM IS EMPTY").log(!!this);
    }
    return user;
  }
}
