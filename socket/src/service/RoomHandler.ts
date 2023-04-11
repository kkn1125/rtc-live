import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import { includeResult, publish, sendMe } from "../util/tool";

export default function roomHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "create") {
    const room = manager.createRoom({ id: json.data.id });
    includeResult(json, { room });
    sendMe(app, ws, json);
  }
}
