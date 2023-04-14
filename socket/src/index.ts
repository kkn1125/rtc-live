/* A quite detailed WebSockets upgrade example "async" */

import uWS from "uWebSockets.js";
import { PORT, userData } from "./util/global";
import protobufjs from "protobufjs";
import { v4 } from "uuid";
import { dev, selectWs } from "./util/tool";
import Manager from "./model/Manager";
import roomHandler from "./service/RoomHandler";
import userHandler from "./service/UserHandler";
import {
  mediaAnswerHandler,
  mediaIceHandler,
  mediaOfferHandler,
  mediaRequestHandler,
} from "./service/MediaHandler";
import streamHandler from "./service/StreamHandler";
import fs from "fs";
import path from "path";
import chatHandler from "./service/ChatHandler";

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
let i = 0;
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
      userData.set(ws, {});
      ws.subscribe("global");
      ws.subscribe(ws.id);
      Object.assign(userData.get(ws), { id: ws.id });
      dev.alias("connect url").log(ws.url);
      dev.alias("user id").log(ws.id);
    },
    message: (ws, message, isBinary) => {
      const makeDirnameFilename = (name: string, chunk: number) => {
        const dirname = `/app/uploads/${name}`;
        const filename = `${dirname}/${chunk}.webm`;
        return [dirname, filename];
      };
      /* Ok is false if backpressure was built up, wait for drain */
      if (message.byteLength > 10_000) {
        console.log("file publish");
        const room = manager.findRoomUserIn((ws as any).id);
        const messageCopy = message.slice(0);
        room.addStream(messageCopy);

        // const [dirname, filename] = makeDirnameFilename("test", i);
        // i++;

        // fs.promises
        //   .mkdir(path.join(path.resolve(), "tmp", dirname), { recursive: true })
        //   .then(() => {
        //     fs.writeFile(
        //       path.join(path.resolve(), "tmp", filename),
        //       Buffer.from(messageCopy),
        //       (err) => {
        //         console.log(message);
        //       }
        //     );
        //   });

        app.publish(`channel-${room.id}`, messageCopy, true);
      } else {
        if (isBinary) {
          handleBinaryMessage(ws, message);
        } else {
          handleNonBinaryMessage(ws, message);
        }
      }
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed");
      const room = manager.outUser((ws as any).id);
      if (room) {
        dev.alias("after out user").log(room);
      }

      if (ws && (ws as any).id) {
        const json = {
          type: "SIGNAL:USER",
          data: JSON.stringify({ action: "out" }),
          result: JSON.stringify({
            userId: (ws as any).id,
            room,
            user: room.findUser((ws as any).id),
          }),
        };

        const encode = Message.encode(new Message(json)).finish();
        app.publish("global", encode, true);
      }
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
      roomHandler(app, ws, manager, json);
      break;
    case "SIGNAL:USER":
      userHandler(app, ws, manager, json);
      break;
    case "SIGNAL:CHAT":
      chatHandler(app, ws, manager, json);
      break;
    case "SIGNAL:STREAM":
      streamHandler(app, ws, manager, json);
      break;
    case "MEDIA:REQUEST":
      mediaRequestHandler(app, ws, manager, json);
    case "MEDIA:OFFER":
      mediaOfferHandler(app, ws, manager, json);
      break;
    case "MEDIA:ANSWER":
      mediaAnswerHandler(app, ws, manager, json);
      break;
    case "MEDIA:ICE_CANDIDATE":
      mediaIceHandler(app, ws, manager, json);
      break;
    default:
      console.log("걸리지 않는 타입", json.type);
      break;
  }
}

function handleNonBinaryMessage(
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer
) {
  try {
    dev.alias("💻Non-Binary Data").log(message);
    const decoded = new TextDecoder().decode(message);
    const json = JSON.parse(decoded);
    json.server = true;
    json.client = false;
    json.data = JSON.parse(json.data);
    dev.alias("check json data").log(json);
  } catch (e) {
    console.log(e);
  }

  app.publish("global", message);
}
