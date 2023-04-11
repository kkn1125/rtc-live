import { dev } from "../util/tool";
import Room from "./Room";

export default class Manager {
  rooms: Room[] = [];

  constructor() {
    dev.alias("✨CREATE MANAGER").log(this);
  }

  createRoom(options: { id: string; password?: string; limit?: number }) {
    const room = this.findRoom(options.id) || new Room(options);
    this.rooms.push(room);
    dev.alias("✨CREATE ROOM").log(room);
    return room;
  }

  insertRoom(room: Room) {
    this.rooms.push(room);
  }

  findRoom(id: string) {
    const room = this.rooms.find((r) => r.id === id);
    dev.alias("🔍FIND ROOM").log(room);
    return room;
  }

  deleteRoom(id: string) {
    const index = this.rooms.findIndex((room) => room.id === id);
    const room = this.rooms.splice(index, 1)?.[0];
    dev.alias("❌DELETE ROOM").log(room);
    return room;
  }

  findUser(userId: string) {
    let user;
    this.rooms.forEach((room) => {
      user = room.findUser(userId);
    });
    dev.alias("🔍FIND USER IN ROOM").log(user);
    return user;
  }

  findRoomUserIn(userId: string) {
    const room = this.rooms.find((r) => r.findUser(userId));
    dev.alias("🔍FIND ROOM BY USER ID").log(room);
    return room;
  }

  outUser(userId: string) {
    const room = this.findRoomUserIn(userId);
    room.out(userId);
    dev.alias("❌OUT ROOM BY USER ID").log(room);
    return room;
  }
}
