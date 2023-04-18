import { Box, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import LiveSocket, { INTERCEPT, SIGNAL } from "../../model/LiveSocket";
import { CODEC, VIEWER_VIDEO_OPTION } from "../../util/global";

let streams: ArrayBuffer[] = [];
let mediaSource: MediaSource | undefined;

function VideoJS({
  admin = false,
  record = false,
  socket,
  videoRef,
}: // mediaSource,
{
  admin?: boolean;
  record?: boolean;
  socket: LiveSocket;
  videoRef: React.MutableRefObject<HTMLDivElement | undefined>;
  // mediaSource: MediaSource;
}) {
  const [isLive, setIsLive] = useState(false);
  const playerRef = useRef<Player | undefined>(undefined);

  function registerRecord(stream: MediaStream) {
    let mediaRecorder = new MediaRecorder(stream, {
      mimeType: CODEC,
      bitsPerSecond: 2000,
      videoBitsPerSecond: 500,
      audioBitsPerSecond: 500,
    });
    let countUploadChunk = 0;
    console.log("register");
    mediaRecorder.ondataavailable = async (data) => {
      const mediaArrayBuffer = await data.data.arrayBuffer();
      streams.push(mediaArrayBuffer);
      socket.sendFile(mediaArrayBuffer);
      countUploadChunk++;
    };

    mediaRecorder.start();

    setInterval(() => {
      console.log("record");
      mediaRecorder.requestData();
    }, 1000);
  }

  useEffect(() => {
    mediaSource = new MediaSource();
    socket.on(SIGNAL.USER, async (type, data) => {
      if (data.data.action === "create" && socket.rtc && videoRef.current) {
        const videoElement = document.createElement(
          "video-js"
        ) as HTMLVideoElement;
        videoElement.src = URL.createObjectURL(mediaSource as MediaSource);
        videoElement.classList.add(
          "vjs-big-play-centered",
          "vjs-live",
          "vjs-liveui"
        );
        videoRef.current.appendChild(videoElement);

        const player = (playerRef.current = videojs(
          videoElement,
          VIEWER_VIDEO_OPTION,
          () => {
            videojs.log("player is ready");
          }
        ));
        player.autoplay(true);
        player.controls(true);
        player.options(VIEWER_VIDEO_OPTION);

        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: false,
          })
          .then((stream) => {
            if (record) {
              const videoBuffer = (mediaSource as MediaSource).addSourceBuffer(
                CODEC
              );
              let countDownloadChunk = 0;
              /* register */
              registerRecord(stream);
              socket.on(INTERCEPT.MESSAGE, async (type, data) => {
                console.log("뺏어오기!", /* data.data, */ countDownloadChunk);
                try {
                  videoBuffer.appendBuffer(await data.data);
                } catch (e) {}
                countDownloadChunk++;
              });
            } else {
              console.log(stream);
              /* register */
              socket.signalBinary(SIGNAL.STREAM, {
                action: "fetch",
                roomId: "test_room",
              });
              const videoBuffer = (mediaSource as MediaSource).addSourceBuffer(
                CODEC
              );

              socket.signalBinary(SIGNAL.STREAM, { action: "streams" });

              let countDownloadChunk = 0;
              let countPlayChunk = 0;
              socket.on(INTERCEPT.MESSAGE, (type, data) => {
                console.log("뺏어오기!", /* data.data, */ countDownloadChunk);
                streams.push(data.data);
                countDownloadChunk++;
              });

              setInterval(() => {
                if (streams[countPlayChunk]) {
                  try {
                    videoBuffer.appendBuffer(
                      new Uint8Array(streams[countPlayChunk])
                    );
                    // @ts-ignore
                    console.log(
                      "liveWindow",
                      // @ts-ignore
                      playerRef.current?.liveTracker.liveWindow()
                    );
                    console.log(
                      "liveCurrentTime",
                      // @ts-ignore
                      playerRef.current?.liveTracker.liveCurrentTime()
                    );
                    console.log(
                      "gap",
                      countDownloadChunk -
                        // @ts-ignore
                        playerRef.current?.liveTracker.isLive()
                    );
                    console.log(
                      "test",
                      // @ts-ignore
                      playerRef.current?.liveTracker.isLive()
                    );
                    // @ts-ignore
                    setIsLive(() =>
                      // @ts-ignore
                      playerRef.current?.liveTracker.isLive()
                    );
                    console.log(
                      "play!",
                      streams[countPlayChunk],
                      countPlayChunk
                    );
                    countPlayChunk++;
                    if (videoRef.current) {
                      console.log("current duration", countDownloadChunk);
                    }
                  } catch (error) {}
                }
              }, 0);
            }
          });
      }
    });

    return () => {
      streams = [];
      mediaSource = undefined;
    };
  }, []);

  function handleSeekToLive() {
    // @ts-ignore
    playerRef.current.liveTracker.seekToLiveEdge_();
  }

  return (
    <Box
      data-vjs-player
      sx={
        !admin
          ? {
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              height: "100%",
            }
          : {
              position: "relative",
              width: 500,
              height: 300,
            }
      }>
      <Box
        ref={videoRef}
        sx={{
          width: "100%",
          height: "100%",
          [".vjs-modal-dialog-content"]: {
            display: "none",
          },
          ["video-js"]: {
            width: "100%",
            height: "100%",
            [".vjs-control-bar"]: {},
          },
          [".vjs-control-bar"]: {
            zIndex: 999,
          },
        }}
      />
      {!isLive && (
        <Button
          variant='contained'
          color='error'
          size='small'
          sx={{
            position: "absolute",
            top: 100,
            right: 10,
          }}
          onClick={handleSeekToLive}>
          실시간 보기
        </Button>
      )}
    </Box>
  );
}

export default VideoJS;
