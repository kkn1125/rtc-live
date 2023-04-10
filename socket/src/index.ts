/* A quite detailed WebSockets upgrade example "async" */

import uWS from "uWebSockets.js";
import { PORT } from "./util/global";
import protobufjs from "protobufjs";
import { v4 } from "uuid";
import { dev } from "./util/tool";
import Manager from "./model/Manager";
import roomHandler from "./service/RoomHandler";
import userHandler from "./service/UserHandler";

const { Message, Field } = protobufjs;
const fields = ["id", "test", "type", "data", "result", "server", "client"];

function alreadyHasKey(key: string) {
  return !protobufjs.Message.$type?.fields.hasOwnProperty(key);
}

fields.forEach((field, i) => {
  alreadyHasKey(field)
    ? Field.d(
        i,
        field.match(/server|client/) ? "bool" : "string",
        "optional"
      )(Message.prototype, field)
    : null;
});

/* room manager */
const manager = new Manager();

const app = uWS
  ./*SSL*/ App({
    // key_file_name: "misc/key.pem",
    // cert_file_name: "misc/cert.pem",
    // passphrase: "1234",
  })
  .ws("/*", {
    /* Options */
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 32,
    /* Handlers */
    upgrade: (res, req, context) => {
      console.log(
        "An Http connection wants to become WebSocket, URL: " +
          req.getUrl() +
          "!"
      );

      /* Keep track of abortions */
      const upgradeAborted = { aborted: false };

      /* You MUST copy data out of req here, as req is only valid within this immediate callback */
      const userId = v4();
      const url = req.getUrl();
      const secWebSocketKey = req.getHeader("sec-websocket-key");
      const secWebSocketProtocol = req.getHeader("sec-websocket-protocol");
      const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");

      /* Simulate doing "async" work before upgrading */
      setTimeout(() => {
        console.log(
          "We are now done with our async task, let's upgrade the WebSocket!"
        );

        if (upgradeAborted.aborted) {
          console.log("Ouch! Client disconnected before we could upgrade it!");
          /* You must not upgrade now */
          return;
        }

        /* This immediately calls open handler, you must not use res after this call */
        res.upgrade(
          {
            id: userId,
            url: url,
          },
          /* Use our copies here */
          secWebSocketKey,
          secWebSocketProtocol,
          secWebSocketExtensions,
          context
        );
      }, 0);

      /* You MUST register an abort handler to know if the upgrade was aborted by peer */
      res.onAborted(() => {
        /* We can simply signal that we were aborted */
        upgradeAborted.aborted = true;
      });
    },
    open: (ws: any) => {
      ws.subscribe("global");
      dev.alias("connect url").log(ws.url);
      dev.alias("user id").log(ws.id);
    },
    message: (ws, message, isBinary) => {
      /* Ok is false if backpressure was built up, wait for drain */
      if (isBinary) {
        handleBinaryMessage(ws, message);
      } else {
        handleNonBinaryMessage(ws, message);
      }
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed");
      const room = manager.outUser((ws as any).id);
      dev.alias("after out user").log(room);

      const json = {
        type: "OUT:USER",
        data: JSON.stringify({}),
        result: JSON.stringify({
          userId: (ws as any).id,
        }),
      };

      const encode = Message.encode(new Message(json)).finish();
      app.publish("global", encode, true);
    },
  })
  .any("/*", (res, req) => {
    res.end("Nothing to see here!");
  })
  .listen(PORT, (token) => {
    if (token) {
      console.log("Listening to port " + PORT);
    } else {
      console.log("Failed to listen to port " + PORT);
    }
  });

function handleBinaryMessage(ws: uWS.WebSocket<unknown>, message: ArrayBuffer) {
  dev.alias("💻Binary Data").log(message);
  const json = Message.decode(new Uint8Array(message)).toJSON();
  json.server = true;
  json.client = false;
  json.data = JSON.parse(json.data);
  dev.alias("check json data").log(json);

  /* 전처리 */
  switch (json.type) {
    case "SIGNAL:ROOM":
      roomHandler(ws, manager, json);
      break;
    case "SIGNAL:USER":
      userHandler(ws, manager, json);
      break;
    default:
      console.log("걸리지 않는 타입", json.type);
      break;
  }

  /* 메세지 데이터 처리 */
  const encode = Message.encode(
    new Message(Object.assign(json, { data: JSON.stringify(json.data) }))
  ).finish();

  app.publish("global", encode, true);
}

function handleNonBinaryMessage(
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer
) {
  dev.alias("💻Non-Binary Data").log(message);
  
  app.publish("global", message);
}
