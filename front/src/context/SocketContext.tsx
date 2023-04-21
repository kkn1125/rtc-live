import React, { createContext, useReducer } from "react";
import LiveSocket, { INTERCEPT, SIGNAL } from "../model/LiveSocket";

const socket = new LiveSocket("ws", "localhost", 4000);

export const SocketContext = createContext(socket);
export const SocketDispatchContext = createContext<any>(null);

export enum ROOM_ACTION {
  CREATE = "ROOM/CREATE",
  UPDATE = "ROOM/UPDATE",
  DELETE = "ROOM/DELETE",
}

export enum SOCKET_ACTION {
  CONNECT = "SOCKET/CONNECT",
  INITIALIZE = "SOCKET/INITIALIZE",
  DISCONNECT = "SOCKET/DISCONNECT",
  CREATE_SOCKET = "SOCKET/SOCKET/CREATE",
}

const reducer = (state: LiveSocket, action: any) => {
  console.log(state, action);
  switch (action.type) {
    case SOCKET_ACTION.CONNECT:
      state.connect(action.roomId);
      return state;
    case SOCKET_ACTION.INITIALIZE:
      if (action.viewer) {
        state.on(INTERCEPT.OPEN, async (type, e) => {
          action?.cb?.();
          // console.log(e);
          await state.connectRTC();
          state.signalBinary(SIGNAL.ROOM, {
            action: "create",
            id: action.roomId,
            title: action.roomTitle,
          });
          state.signalBinary(SIGNAL.USER, {
            action: "create",
            roomId: action.roomId,
          });
          state.signalBinary(SIGNAL.STREAM, {
            action: "subscribe",
          });
        });
      } else {
        // state.on(INTERCEPT.OPEN, async (type, e) => {
        action?.cb?.();
        // console.log(e);
        state.connectRTC().then(() => {
          state.signalBinary(SIGNAL.ROOM, {
            action: "create",
            id: action.roomId,
            title: action.roomTitle,
          });
          state.signalBinary(SIGNAL.USER, {
            action: "create",
            roomId: action.roomId,
          });
          state.signalBinary(SIGNAL.STREAM, {
            action: "subscribe",
          });
        });
        // });
      }
      return state;
    case SOCKET_ACTION.DISCONNECT:
      state.disconnect();
      return state;
    case SOCKET_ACTION.CREATE_SOCKET:
      return state;
    default:
      return state;
  }
};

const SocketProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(reducer, socket);

  return (
    <SocketDispatchContext.Provider value={dispatch}>
      <SocketContext.Provider value={state}>{children}</SocketContext.Provider>;
    </SocketDispatchContext.Provider>
  );
};

export default SocketProvider;
