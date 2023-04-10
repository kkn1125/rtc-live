import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import { includeResult } from "../util/tool";

export default function roomHandler(
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "create") {
    const room = manager.createRoom({ id: json.data.id });
    includeResult(json, { room });
  }
}
