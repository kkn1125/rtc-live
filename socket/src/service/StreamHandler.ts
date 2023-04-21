import uWS from "uWebSockets.js";
import Manager from "../model/Manager";
import User from "../model/User";
import { includeResult, dev, sendMe } from "../util/tool";
import fs from "fs";
import path from "path";

const makeDirnameFilename = (name: string, chunk: number) => {
  const dirname = `/app/uploads/${name}`;
  const filename = `${dirname}/${chunk}.mp4`;
  return [dirname, filename];
};
let i = 0;
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
  } else if (json.data.action === "streams") {
    const room = manager.findRoomUserIn((ws as any).roomId);

    const uint = new Uint8Array();
    let byteLength = 0;
    const streams = room.getStream();
    for (let stream of streams) {
      dev.alias("🚀🚀 send stream!!!").log(!!stream);
      ws.send(stream, true);
    }
  } else if (json.data.action === "subscribe") {
    const room = manager.findRoomUserIn((ws as any).roomId);
    ws.subscribe(`channel-${room.id}`);
  } else if (json.data.action === "send") {
    console.log("file publish");
    const room = manager.findRoomUserIn((ws as any).roomId);
    const messageCopy = new Uint8Array(json.file.split(","));
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
    //         console.log(err);
    //       }
    //     );
    //   });

    app.publish(`channel-${room.id}`, messageCopy, true);
  }
}
