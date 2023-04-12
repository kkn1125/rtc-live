import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import User from "../model/User";
import { includeResult, dev, sendMe } from "../util/tool";

export default function streamHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "chunk") {
    const room = manager.findRoom(json.data.roomId);
    if (room) {
      room.setChunk(json.data.chunk);
      dev.alias("✅CURRENT ROOM CHUNK").log(room);
      includeResult(json, { chunk: room.getChunk() });
    } else {
      dev.alias("❌NOT FOUND ROOM").log(room);
      includeResult(json, { error: "not found room" });
    }
    sendMe(app, ws, json);
  } else if (json.data.action === "fetch") {
    const room = manager.findRoom(json.data.roomId);
    includeResult(json, { chunk: room.getChunk() - 1 });
    sendMe(app, ws, json);
  }
}
