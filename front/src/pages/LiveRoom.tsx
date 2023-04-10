import { Box, Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { v4 } from "uuid";
import LiveSocket, { INTERCEPT, MEDIA, SIGNAL } from "../model/LiveSocket";

const ws = new LiveSocket("ws", "localhost", 4000);

function LiveRoom() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>({});
  const handleHome = () => {
    navigate("/");
  };
  useEffect(() => {
    ws.connect();
    ws.on(INTERCEPT.OPEN, async (e) => {
      console.log("test");
      ws.on("custom:chat", (type: string, data: any) => {});
      ws.on(SIGNAL.ROOM, (type: string, data: any) => {});
      ws.on(SIGNAL.USER, (type: string, data: any) => {
        const userData = data.result.user;
        console.log("받은 유저", data);
        setUser((user: any) => {
          if (userData.isAdmin) {
            // create view
            console.log("create cam");
          } else {
            console.log("viewer");
          }

          return { ...user, ...userData };
        });
      });
      ws.signalBinary(SIGNAL.ROOM, { action: "create", id: "live_room" });
      ws.signalBinary(SIGNAL.USER, {
        action: "create",
        nickname: "test",
        roomId: "live_room",
      });
      await ws.connectRTC();
      ws.rtc?.connectWebCam();
    });
  }, []);
  return (
    <Box>
      {JSON.stringify(user)}
      <Typography component='h3' variant='h3' align='center' gutterBottom>
        Live
      </Typography>
      <Button onClick={handleHome}>Home</Button>
    </Box>
  );
}

export default LiveRoom;
