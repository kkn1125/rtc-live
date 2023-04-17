import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import LiveSocket, { INTERCEPT, SIGNAL } from "../../model/LiveSocket";

let streams: ArrayBuffer[] = [];

function VideoJS({
  admin = false,
  record = false,
  socket,
  videoRef,
  mediaSource,
  CODEC,
}: {
  admin?: boolean;
  record?: boolean;
  socket: LiveSocket;
  videoRef: React.MutableRefObject<HTMLDivElement | undefined>;
  mediaSource: MediaSource;
  CODEC: string;
}) {
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
    socket.on(SIGNAL.USER, async (type, data) => {
      if (data.data.action === "create" && socket.rtc && videoRef.current) {
        const videoElement = document.createElement(
          "video-js"
        ) as HTMLVideoElement;
        videoElement.src = URL.createObjectURL(mediaSource);
        videoElement.classList.add(
          "vjs-big-play-centered",
          "vjs-live",
          "vjs-liveui"
        );
        videoRef.current.appendChild(videoElement);

        const player = videojs(
          videoElement,
          {
            liveui: true,
            liveTracker: {
              liveTolerance: 0.5,
              trackingThreshold: 1,
            },
          },
          () => {
            videojs.log("player is ready");
          }
        );
        player.autoplay(true);
        player.controls(true);
        player.options({
          liveui: true,
          liveTracker: {
            liveTolerance: 0.5,
            trackingThreshold: 1,
          },
        });

        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: false,
          })
          .then((stream) => {
            if (record) {
              const videoBuffer = mediaSource.addSourceBuffer(CODEC);
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
              // if (videoRef.current) {
              //   videoRef.current.srcObject = stream;
              // }
              /* register */
              // registerRecord(stream);
              socket.signalBinary(SIGNAL.STREAM, {
                action: "fetch",
                roomId: "test_room",
              });
              // registerPlayer();
              const videoBuffer = mediaSource.addSourceBuffer(CODEC);

              socket.signalBinary(SIGNAL.STREAM, { action: "streams" });

              let countDownloadChunk = 0;
              let countPlayChunk = 0;
              socket.on(INTERCEPT.MESSAGE, (type, data) => {
                // console.log(data, countDownloadChunk);
                // if (data.data.byteLength > 10_000) {
                console.log("뺏어오기!", /* data.data, */ countDownloadChunk);
                streams.push(data.data);
                countDownloadChunk++;
                // if (done) {

                // }
                // }
              });

              setInterval(() => {
                if (streams[countPlayChunk]) {
                  try {
                    videoBuffer.appendBuffer(
                      new Uint8Array(streams[countPlayChunk])
                    );
                    console.log(
                      "play!",
                      streams[countPlayChunk],
                      countPlayChunk
                    );
                    countPlayChunk++;
                    if (videoRef.current) {
                      console.log("current duration", countDownloadChunk * 2);
                      // videoRef.current.currentTime = countDownloadChunk * 2;
                    }
                  } catch (error) {}
                }
              }, 0);
            }
          });
      }
    });
  }, []);

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
    </Box>
  );
}

export default VideoJS;
