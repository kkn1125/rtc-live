import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import { includeResult, publish, sendMe, sendNotMe } from "../util/tool";

export default function roomHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "create") {
    const room = manager.createRoom({
      id: json.data.id,
      title: json.data.title,
    });
    includeResult(json, { room });
    sendMe(app, ws, { ...json });
    sendNotMe(app, ws, { ...json });
  } else if (json.data.action === "fetch") {
    const rooms = manager.rooms;
    includeResult(json, { rooms });
    sendMe(app, ws, json);
  }
}
