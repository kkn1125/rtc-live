import { Message } from "protobufjs";
import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import {
  dev,
  includeResult,
  publish,
  sendNotMe,
  sendOthers,
} from "../util/tool";

export default function chatHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "send") {
    dev.alias("chat message").log(json.data.message);
    includeResult(json, {
      nickname: json.data.nickname,
      message: json.data.message,
    });
    sendNotMe(app, ws, json);
  }
}
