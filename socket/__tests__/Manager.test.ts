import { v4 } from "uuid";
import Manager from "../src/model/Manager";
import Room from "../src/model/Room";
import User from "../src/model/User";

const manager = new Manager();
const room = manager.createRoom({ id: v4() });
const newRoom = manager.createRoom({ id: "test_room" });

const user = new User(v4(), "kimson");
const user2 = new User(v4(), "coco");
const newUser = new User(v4(), "mimi");

describe("Manager Test", () => {
  test("Create Manager", () => {
    expect(manager).not.toBeNull();
  });

  test("Create Room Test", () => {
    expect(manager.rooms[0]).toStrictEqual(room);
  });

  test("Create User Test", () => {
    room.join(user);
    expect(room.admin).toStrictEqual(user);
  });

  test("Initial Admin User Test", () => {
    console.log(room.admin);
    console.log(user);
    expect(room.isAdmin(user.id)).toStrictEqual(true);
  });

  test("User is Admin Test", () => {
    expect(user.isAdmin).toStrictEqual(true);
  });

  test("User2 is User Test", () => {
    room.join(user2);
    console.log(room);
    console.log(user2);
    expect(user2.isAdmin).toStrictEqual(false);
  });

  test("Find Room Test", () => {
    const isroom = manager.findRoom(room.id);
    expect(isroom).toStrictEqual(room);
  });

  test("Delete Room Test", () => {
    const isroom = manager.deleteRoom(room.id);
    expect(isroom).toStrictEqual(room);
  });
});

room.id = "test";
manager.insertRoom(room);

describe("Room Test", () => {
  test("Room Test 1", () => {
    expect(newRoom.users.length).toStrictEqual(0);
  });
  test("Room Test 2", () => {
    newRoom.join(newUser);
    expect(newRoom.hasAdmin()).toStrictEqual(true);
  });
  test("Room Test 3", () => {
    newRoom.out(newUser.id);
    expect(newRoom.hasAdmin()).toStrictEqual(false);
  });
  test("Room Test 4", () => {
    room.join(newUser);
    room.out(user.id);
    expect(room.isAdmin(user2.id)).toStrictEqual(true);
  });
});

export {};
