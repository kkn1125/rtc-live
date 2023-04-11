import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import User from "../model/User";
import { dev, includeResult, publish, sendMe } from "../util/tool";

export default function userHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "create") {
    const user =
      manager.findUser((ws as any).id) ||
      new User((ws as any).id, json.data.nickname);
    const room = manager.findRoom(json.data.roomId);
    room.join(user);
    includeResult(json, { user, room });
    sendMe(app, ws, json);
  }
}
