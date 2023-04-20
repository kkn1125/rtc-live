import React, { createContext, useReducer } from "react";

const roomPartition = {};

export const RoomContext = createContext(null);
export const RoomDispatchContext = createContext<any>(null);

export enum ROOM_ACTION {
  CREATE = "ROOM/CREATE",
  UPDATE = "ROOM/UPDATE",
  DELETE = "ROOM/DELETE",
}

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case ROOM_ACTION.CREATE:
      return Object.assign(
        { ...state },
        {
          [action.roomId]: {
            roomId: action.roomId,
            roomName: action.roomName,
          },
        }
      );
    case ROOM_ACTION.UPDATE:
      return Object.assign(
        { ...state },
        {
          [action.roomId]: {
            roomId: action.roomId,
            roomName: action.roomName,
          },
        }
      );
    case ROOM_ACTION.DELETE:
      const filtered = { ...state };
      delete filtered[action.roomId];
      return filtered;
    default:
      return state;
  }
};

const RoomProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(reducer, roomPartition);
  return (
    <RoomDispatchContext.Provider value={dispatch}>
      <RoomContext.Provider value={state}>{children}</RoomContext.Provider>;
    </RoomDispatchContext.Provider>
  );
};

export default RoomProvider;
