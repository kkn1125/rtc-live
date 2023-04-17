import { dev } from "../util/tool";
import protobufjs from "protobufjs";
import { RTC_PEER_CONNECT_OPTION } from "../util/global";
import LiveRTC from "./LiveRTC";

const { Message, Field } = protobufjs;
const fields = [
  "id",
  "test",
  "type",
  "data",
  "result",
  "server",
  "client",
  "file",
];

function alreadyHasKey(key: string) {
  return !protobufjs.Message.$type?.fields.hasOwnProperty(key);
}

fields.forEach((field, i) => {
  if (alreadyHasKey(field)) {
    switch (field) {
      case "server":
      case "client":
        Field.d(i, "bool", "optional")(Message.prototype, field);
        break;
      case "id":
      case "test":
      case "type":
      case "data":
      case "result":
        Field.d(i, "string", "optional")(Message.prototype, field);
        break;
      case "file":
        Field.d(i, "string", "optional")(Message.prototype, field);
        break;
    }
  }
});

type OnEventType = (signal: string, e: Event) => void;
type OnEventCallbackType = (signal: string, data: any, e: Event) => void;

export enum INTERCEPT {
  OPEN = "INTERCEPT:OPEN",
  CLOSE = "INTERCEPT:CLOSE",
  ERROR = "INTERCEPT:ERROR",
  MESSAGE = "INTERCEPT:MESSAGE",
}
export enum SIGNAL {
  GLOBAL = "SIGNAL:GLOBAL",
  CHAT = "SIGNAL:CHAT",
  ROOM = "SIGNAL:ROOM",
  USER = "SIGNAL:USER",
  STREAM = "SIGNAL:STREAM",
}
export enum MEDIA {
  REQUEST = "MEDIA:REQUEST",
  OFFER = "MEDIA:OFFER",
  ANSWER = "MEDIA:ANSWER",
  ICE_CANDIDATE = "MEDIA:ICE_CANDIDATE",
}

export default class LiveSocket {
  ws?: WebSocket;
  rtc?: LiveRTC;
  protocol?: string;
  host?: string;
  port?: number;
  events: {
    [k: string]: {
      data: object;
      cb: (OnEventType & OnEventCallbackType)[];
    };
  } = {};

  constructor(protocol: string, host: string, port: number) {
    this.protocol = protocol;
    this.host = host;
    this.port = port;

    this.events[INTERCEPT.OPEN] = { cb: [() => {}], data: {} };
    this.events[INTERCEPT.CLOSE] = { cb: [() => {}], data: {} };
    this.events[INTERCEPT.ERROR] = { cb: [() => {}], data: {} };
    this.events[INTERCEPT.MESSAGE] = { cb: [() => {}], data: {} };

    this.events[SIGNAL.STREAM] = { cb: [() => {}], data: {} };
    this.events[SIGNAL.GLOBAL] = { cb: [() => {}], data: {} };
    this.events[SIGNAL.CHAT] = { cb: [() => {}], data: {} };
    this.events[SIGNAL.ROOM] = { cb: [() => {}], data: {} };
    this.events[SIGNAL.USER] = { cb: [() => {}], data: {} };

    this.events[MEDIA.REQUEST] = { cb: [() => {}], data: {} };
    this.events[MEDIA.OFFER] = { cb: [() => {}], data: {} };
    this.events[MEDIA.ANSWER] = { cb: [() => {}], data: {} };
    this.events[MEDIA.ICE_CANDIDATE] = { cb: [() => {}], data: {} };
  }

  connect() {
    const ws = new WebSocket(`${this.protocol}://${this.host}:${this.port}`);
    ws.binaryType = "arraybuffer";
    ws.onopen = this.onOpen;
    ws.onerror = this.onError;
    ws.onclose = this.onClose;
    ws.onmessage = this.onMessage;

    this.ws = ws;
  }

  connectRTC() {
    this.rtc = new LiveRTC();

    return new Promise((resolve) => resolve(true));
  }

  disconnect() {
    dev.alias("socket disconnect").debug("done");
    this.ws?.close();
  }

  getParsingData(decoded: any) {
    decoded.data && Object.assign(decoded, { data: JSON.parse(decoded.data) });
    decoded.result &&
      Object.assign(decoded, { result: JSON.parse(decoded.result) });
  }

  onOpen = (e: Event) => {
    dev.alias("✨SOCKET CONNECT").debug(e);
    this.events[INTERCEPT.OPEN].cb.forEach((cb) => cb(INTERCEPT.OPEN, e));
  };
  onError = (e: Event) => {
    dev.alias("❌ERROR SOCKET").debug(e);
    this.events[INTERCEPT.ERROR].cb.forEach((cb) => cb(INTERCEPT.ERROR, e));
  };
  onClose = (e: CloseEvent) => {
    dev.alias("❌CLOSE SOCKET").debug(e);
    this.events[INTERCEPT.CLOSE].cb.forEach((cb) => cb(INTERCEPT.CLOSE, e));
  };
  onMessage = (e: MessageEvent<any>) => {
    if (typeof e.data === "string") {
      // non-binary
      try {
        const decoded = JSON.parse(e.data);

        /* data & result exists? */
        this.getParsingData(decoded);
        dev.alias("📜NON-BINARY MESSAGE").debug(decoded);

        /* 나머지 이벤트 */
        this.dispatchEventData(decoded, e);
      } catch (error) {
        this.events[INTERCEPT.MESSAGE].cb.forEach((cb) =>
          cb(INTERCEPT.MESSAGE, e)
        );
      }
    } else {
      // binary
      try {
        const decoded = Message.decode(new Uint8Array(e.data)).toJSON();

        /* data & result exists? */
        this.getParsingData(decoded);
        dev.alias("📜BINARY MESSAGE").debug(decoded);

        /* 나머지 이벤트 */
        this.dispatchEventData(decoded, e);
      } catch (error) {
        this.events[INTERCEPT.MESSAGE].cb.forEach((cb) =>
          cb(INTERCEPT.MESSAGE, e)
        );
      }
    }
  };

  dispatchEventData(decoded: any, e: Event) {
    decoded.type === SIGNAL.GLOBAL &&
      this.events[SIGNAL.GLOBAL].cb.forEach((cb) =>
        cb(SIGNAL.GLOBAL, decoded, e)
      );
    decoded.type === SIGNAL.STREAM &&
      this.events[SIGNAL.STREAM].cb.forEach((cb) =>
        cb(SIGNAL.STREAM, decoded, e)
      );
    decoded.type === SIGNAL.CHAT &&
      this.events[SIGNAL.CHAT].cb.forEach((cb) => cb(SIGNAL.CHAT, decoded, e));
    decoded.type === SIGNAL.ROOM &&
      this.events[SIGNAL.ROOM].cb.forEach((cb) => cb(SIGNAL.ROOM, decoded, e));
    decoded.type === SIGNAL.USER &&
      this.events[SIGNAL.USER].cb.forEach((cb) => cb(SIGNAL.USER, decoded, e));

    decoded.type === MEDIA.REQUEST &&
      this.events[MEDIA.REQUEST].cb.forEach((cb) =>
        cb(MEDIA.REQUEST, decoded, e)
      );
    decoded.type === MEDIA.OFFER &&
      this.events[MEDIA.OFFER].cb.forEach((cb) => cb(MEDIA.OFFER, decoded, e));
    decoded.type === MEDIA.ANSWER &&
      this.events[MEDIA.ANSWER].cb.forEach((cb) =>
        cb(MEDIA.ANSWER, decoded, e)
      );
    decoded.type === MEDIA.ICE_CANDIDATE &&
      this.events[MEDIA.ICE_CANDIDATE].cb.forEach((cb) =>
        cb(MEDIA.ICE_CANDIDATE, decoded, e)
      );
  }

  /* custom signal events */
  on(
    type: INTERCEPT | SIGNAL | MEDIA | `custom:${string}`,
    cb: OnEventType & OnEventCallbackType
  ) {
    if (!this.events[type]) {
      this.events[type] = {
        cb: [() => {}],
        data: {},
      };
    }
    this.events[type].cb.push(cb);
  }

  signalBinary(
    type: INTERCEPT | SIGNAL | MEDIA | `custom:${string}`,
    data: {
      action:
        | "create"
        | "send"
        | "fetch"
        | "req"
        | "chunk"
        | "streams"
        | "subscribe";
      from?: string;
      to?: string;
      offer?: { type: string; sdp?: string };
      answer?: { type: string; sdp?: string };
      candidate?: RTCIceCandidate;
      id?: string;
      roomId?: string;
      userId?: string;
      [k: string]: any;
    },
    file?: Blob
  ) {
    if (typeof data === "string") {
      this.sendBinary({ type, message: data, client: true, server: false });
    } else {
      this.sendBinary({
        type,
        data: JSON.stringify(data),
        ...(file && { file }),
        client: true,
        server: false,
      });
    }
  }

  signal(type: INTERCEPT | SIGNAL | MEDIA | `custom:${string}`, data: any) {
    if (typeof data === "string") {
      this.send({ type, message: data, client: true, server: false });
    } else {
      this.send({
        type,
        data: JSON.stringify(data),
        client: true,
        server: false,
      });
    }
  }

  sendBinary(data: object) {
    const encoded = Message.encode(new Message(data)).finish();
    dev.alias("send binary data").debug(data);
    this.ws?.send(encoded);
  }

  send(data: object) {
    dev.alias("send non-binary data").debug(data);
    this.ws?.send(JSON.stringify(data));
  }

  sendFile(file: ArrayBuffer) {
    dev.alias("send arraybuffer data").debug(typeof file);
    const data = Message.encode(
      new Message({
        type: SIGNAL.STREAM,
        data: JSON.stringify({
          action: "send",
        }),
        file: new Uint8Array(file).toString(),
      })
    ).finish();
    this.ws?.send(data);
  }
}
