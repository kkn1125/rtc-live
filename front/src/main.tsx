import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import RoomProvider from "./context/[x]RoomContext";
import SocketProvider from "./context/SocketContext";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    {/* <React.StrictMode> */}
    <SocketProvider>
      <RoomProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RoomProvider>
    </SocketProvider>
    {/* </React.StrictMode> */}
  </>
);
