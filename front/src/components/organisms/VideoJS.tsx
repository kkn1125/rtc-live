import { Box } from "@mui/material";
import React, { useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

function VideoJS() {
  const videoRef = useRef<HTMLDivElement>();
  return (
    <Box data-vjs-player>
      <Box ref={videoRef} />
    </Box>
  );
}

export default VideoJS;
