import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import { includeResult, publish, sendNotMe, sendOthers } from "../util/tool";

export function mediaRequestHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "req") {
    includeResult(json, { from: json.data.to, to: json.data.from });
    sendOthers(app, ws, json);
  }
}

export function mediaOfferHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "send") {
    const room = manager.findRoomUserIn((ws as any).id);
    room.admin.saveOffer(json.data.offer);
    includeResult(json, {
      from: json.data.to,
      to: json.data.from,
      offer: json.data.offer,
    });
    sendOthers(app, ws, json);
  } /*  else if (json.data.action === "fetch") {
    const room = manager.findRoomUserIn((ws as any).id);
    const offer = room.admin.offer;
    includeResult(json, { offer });
    sendOthers(app, ws, json);
  } */
}

export function mediaAnswerHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "send") {
    const room = manager.findRoomUserIn((ws as any).id);
    room.admin.saveAnswer(json.data.answer);
    console.log(json.data);
    includeResult(json, { answer: json.data.answer });
    sendOthers(app, ws, json);
  } else if (json.data.action === "fetch") {
  }
}
export function mediaIceHandler(
  app: uWS.TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  manager: Manager,
  json: any
) {
  if (json.data.action === "send") {
    const room = manager.findRoomUserIn((ws as any).id);
    includeResult(json, {
      from: json.data.from,
      candidate: json.data.candidate,
    });
    sendNotMe(app, ws, json);
  } else if (json.data.action === "fetch") {
  }
}
