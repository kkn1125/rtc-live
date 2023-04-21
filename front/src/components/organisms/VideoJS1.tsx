import { Box, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import LiveSocket, { INTERCEPT } from "../../model/LiveSocket";
import { CODEC } from "../../util/global";

let localStream: MediaStream = new MediaStream();
let streams: ArrayBuffer[] = [];
let loop1: NodeJS.Timer;
let player: Player;
let before = true;
let mediaSource: MediaSource | undefined;
let countUploadChunk = 0;
let videoBuffer: SourceBuffer;
let mediaRecorder: MediaRecorder;

export const VideoJS = (props: {
  socket: LiveSocket;
  options: any;
  onReady: any;
}) => {
  const videoRef = useRef<HTMLElement | undefined>(undefined);
  const playerRef = useRef<Player | undefined>(undefined);
  const { options, onReady } = props;
  const [seekToLive, setSeekToLive] = useState(true);
  const [player1, setPlayer] = useState<Player>();
  const [isLive, setIsLive] = useState(false);

  let handleSeekToLive = () => {
    // @ts-ignore
    player1?.liveTracker.seekToLiveEdge_();
  };

  function registerRecord(stream: MediaStream) {
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: CODEC,
      bitsPerSecond: 2000,
      videoBitsPerSecond: 500,
      audioBitsPerSecond: 500,
    });
    console.log("register");
    mediaRecorder.ondataavailable = async (data) => {
      const mediaArrayBuffer = await data.data.arrayBuffer();
      streams.push(mediaArrayBuffer);
      props.socket.sendFile(mediaArrayBuffer);
      countUploadChunk++;

      videoBuffer.appendBuffer(mediaArrayBuffer);
      // @ts-ignore
      setIsLive(playerRef.current?.liveTracker.isLive());
      console.log("record");
    };

    mediaRecorder.start(500);

    // setTimeout(() => {
    //   mediaRecorder.stop();
    // }, 500);
  }

  useEffect(() => {
    mediaSource = new MediaSource();
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      (videoElement as HTMLVideoElement).src = URL.createObjectURL(mediaSource);
      videoRef.current?.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      }));

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;
  }, [playerRef]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        let countDownloadChunk = 0;
        videoBuffer = (mediaSource as MediaSource).addSourceBuffer(CODEC);
        /* register */
        // loop1 = setInterval(() => {
        registerRecord(stream);
        // }, 1000);
        // props.socket.on(INTERCEPT.MESSAGE, async (type, data) => {
        //   console.log("뺏어오기!", /* data.data, */ countDownloadChunk);
        //   try {
        //     videoBuffer.appendBuffer(await data.data);
        //   } catch (e) {}
        //   countDownloadChunk++;
        // });
      });
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        if (playerRef.current) {
          playerRef.current = undefined;
        }
      }
      mediaSource = undefined;
      streams = [];
      clearTimeout(loop1);
      mediaRecorder.stop();
    };
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
      }}>
      <Box
        data-vjs-player
        sx={{
          height: "100%",
        }}>
        <Box ref={videoRef} />
      </Box>
      {!isLive && (
        <Button
          variant='contained'
          color='error'
          size='small'
          sx={{ position: "absolute", bottom: "100%", right: 0 }}
          onClick={() => handleSeekToLive()}>
          실시간 보기
        </Button>
      )}
    </Box>
  );
};

export default VideoJS;
