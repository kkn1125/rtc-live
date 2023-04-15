import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";

let localStream: MediaStream = new MediaStream();

let streams: Blob[] = [];
const CODEC = "video/webm;codecs=vp9,opus";

function Home() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>();

  const handlePath = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLButtonElement;
    navigate(`/${target.dataset.path}`);
  };

  useEffect(() => {
    let loop1: NodeJS.Timer;

    const mediaSource = new MediaSource();
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(mediaSource);
    }

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        let videoBuffer: SourceBuffer;
        videoBuffer = mediaSource.addSourceBuffer(CODEC);

        if (videoRef.current) {
          localStream = stream;

          let countUploadChunk = 0;
          let countDownloadChunk = 0;

          const recoder = new MediaRecorder(stream, {
            mimeType: CODEC,
          });
          recoder.ondataavailable = async (data) => {
            // (videoBuffer as SourceBuffer).appendBuffer(
            //   await data.data.arrayBuffer()
            // );
            streams.push(data.data);
            countUploadChunk++;

            if (streams[countDownloadChunk]) {
              console.log(streams[countDownloadChunk]);
              videoBuffer.appendBuffer(await data.data.arrayBuffer());
              countDownloadChunk++;
            }
          };

          recoder.start();

          loop1 = setInterval(() => {
            console.log("record");
            recoder.requestData();
          }, 1000);

          // setInterval(() => {
          //   recoder.requestData();
          // }, 2000);

          // setInterval(async () => {
          //   if (streams[countDownloadChunk]) {
          //     console.log(streams[countDownloadChunk]);
          //     videoBuffer.appendBuffer(
          //       await streams[countDownloadChunk].arrayBuffer()
          //     );
          //     countDownloadChunk++;
          //   }
          // }, 1000);

          // videoRef.current.onloadedmetadata = (e) => {
          //   console.log(e)
          // };

          // videoRef.current.ontimeupdate = (e) => {
          //   console.log(e)
          // }

          // videoRef.current.onplaying=e=>{
          //   console.log(e)
          // }
        }
      });
    return () => {
      clearInterval(loop1);
    };
  }, []);

  return (
    <Box>
      <Typography component='h3' variant='h3' align='center' gutterBottom>
        Home
      </Typography>
      <Stack direction='row' gap={3} justifyContent='center'>
        <Button data-path='live' variant='contained' onClick={handlePath}>
          live room
        </Button>
        <Button data-path='viewer' variant='contained' onClick={handlePath}>
          viewer room
        </Button>
        <Button
          data-path='record'
          variant='contained'
          color='success'
          onClick={handlePath}>
          record room
        </Button>
        <Button
          data-path='watch'
          variant='contained'
          color='success'
          onClick={handlePath}>
          watch room
        </Button>
        <Button
          data-path='recordsocket'
          variant='contained'
          color='secondary'
          onClick={handlePath}>
          record socket room
        </Button>
        <Button
          data-path='watchsocket'
          variant='contained'
          color='secondary'
          onClick={handlePath}>
          watch socket room
        </Button>
      </Stack>

      <Box
        component='video'
        ref={videoRef}
        sx={{
          backgroundColor: "#55555556",
        }}
        autoPlay
        playsInline
        controls
      />
    </Box>
  );
}

export default Home;
