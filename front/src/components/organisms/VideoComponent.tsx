import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import LiveSocket from "../../model/LiveSocket";
import AdminVideo from "./AdminVideo";
import UserVideo from "./UserVideo";
import UserVideoCopy from "./UserVideoCopy";

function VideoComponent({
  room,
  user,
  ws,
}: {
  room: any;
  user: any;
  ws: LiveSocket;
}) {
  if (user.isAdmin) {
    // create view
    console.log("create cam");
  } else {
    console.log("viewer");
  }
  return (
    <Box>
      {user && user.isAdmin ? (
        <AdminVideo room={room} user={user} ws={ws} />
      ) : (
        <UserVideoCopy room={room} user={user} ws={ws} />
      )}
    </Box>
  );
}

export default VideoComponent;
