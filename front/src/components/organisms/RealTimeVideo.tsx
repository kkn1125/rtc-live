import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";

function RealTimeVideo() {
  const videoRef = useRef<HTMLVideoElement>();
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
  }, []);
  return (
    <Box>
      <Box component='video' ref={videoRef} autoPlay playsInline controls />
    </Box>
  );
}

export default RealTimeVideo;
