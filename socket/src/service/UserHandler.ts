import { Message } from "protobufjs";
import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import User from "../model/User";
import { dev, includeResult, publish, sendMe, sendNotMe } from "../util/tool";

export default function userHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "create") {
    const user =
      manager.findUser((ws as any).roomId) ||
      new User((ws as any).roomId, json.data.nickname);
    const room = manager.findRoom(json.data.roomId);
    ws.subscribe(json.data.roomId);
    if (room) {
      room.join(user);
      includeResult(json, { user, room });
    } else {
      dev.alias("❌NOT FOUND ROOM").log(room, user);
      includeResult(json, { error: "not found room" });
    }
    sendMe(app, ws, json);
    sendNotMe(app, ws, {
      type: 'SIGNAL:USER',
      data: Object.assign(JSON.parse(json.data), { action: "fetch" }),
      result: json.result,
    });
  }
}
