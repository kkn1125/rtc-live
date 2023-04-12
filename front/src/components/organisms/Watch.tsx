import { Box } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import LiveSocket, { INTERCEPT, SIGNAL } from "../../model/LiveSocket";
import LiveCommerceLayout from "./LiveCommerceLayout";

const socket = new LiveSocket("ws", "localhost", 4000);

let countDownloadChunk = 0;
let isSkip = false;
const mediaSource = new MediaSource();

function Watch() {
  const videoRef = useRef<HTMLVideoElement>();
  const [room, setRoom] = useState({});
  const [user, setUser] = useState({});

  function getName() {
    // return +new Date();
    return "test";
  }

  const STREAM_NAME = getName();

  function sendFile(file: Blob, chunkNumber: number) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", STREAM_NAME.toString());
    formData.append("chunk", chunkNumber.toString());
    axios.put("http://localhost:5000/api/upload", formData);
  }

  function registerRecord(stream: MediaStream) {
    const mediaRecorder = new MediaRecorder(stream);
    let countUploadChunk = 0;

    mediaRecorder.ondataavailable = (data) => {
      sendFile(data.data, countUploadChunk);
      countUploadChunk++;
    };
    mediaRecorder.start();

    setInterval(() => {
      mediaRecorder.requestData();
    }, 10000);
  }

  function registerPlayer(/* mediaSource: MediaSource */) {
    console.log("start play");
    const videoBuffer = mediaSource.addSourceBuffer("video/webm;codecs=vp8");

    setInterval(() => {
      axios
        .get(
          `http://localhost:5000/api/download?name=${STREAM_NAME}&chunk=${
            countDownloadChunk > 0 ? countDownloadChunk : 0
          }`,
          {
            responseType: "arraybuffer",
          }
        )
        .then((response) => {
          if (response.status !== 200) {
            throw Error("no such file");
          }
          return response.data;
        })
        .then((buffer) => {
          countDownloadChunk++;
          videoBuffer.appendBuffer(buffer);
          if (!isSkip) {
            isSkip = true;
          }
        })
        .catch(() => {});
    }, 2000);
  }

  useEffect(() => {
    socket.connect();

    socket.on(INTERCEPT.OPEN, async (type, e) => {
      console.log(e);
      await socket.connectRTC();
      socket.signalBinary(SIGNAL.ROOM, {
        action: "create",
        id: "test_room",
      });
      socket.signalBinary(SIGNAL.USER, {
        action: "create",
        roomId: "test_room",
      });
    });

    // socket.on(SIGNAL.STREAM, (type, data) => {
    //   if (data.data.action === "fetch") {
    //     console.log("fetch 완료");
    //     console.log(data.result.chunk);
    //   }
    // });

    socket.on(SIGNAL.ROOM, (type, data) => {
      const roomData = data.result.room;
      setRoom((room) => ({ ...room, ...roomData }));
    });
    socket.on(SIGNAL.USER, async (type, data) => {
      const userData = data.result.user;

      if (socket.rtc && videoRef.current) {
        // socket.rtc.setParent(videoRef.current);
        // socket.rtc.createVideo(userData);
        // await socket.rtc.connectWebCam();

        if (videoRef.current) {
          videoRef.current.src = URL.createObjectURL(mediaSource);
        }
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: false,
          })
          .then((stream) => {
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
            registerPlayer();
          });
      }
    });
  }, []);

  useEffect(() => {
    // if (videoRef && videoRef.current) {
    // }
    handleResizeVideo();
    function handleResizeVideo() {
      if (videoRef.current) {
        videoRef.current.style.height = `${innerHeight}px`;
        videoRef.current.style.top = "0px";
        videoRef.current.style.bottom = "0px";
        videoRef.current.style.left = "50%";
        videoRef.current.style.transform = "translateX(-50%)";
      }
    }
    (videoRef.current as HTMLVideoElement).style.position = "absolute";
    window.addEventListener("resize", handleResizeVideo);
    return () => {
      window.removeEventListener("resize", handleResizeVideo);
    };
  }, []);

  return (
    <Box sx={{ height: "100%" }}>
      <LiveCommerceLayout
        videoRef={videoRef}
        video={
          <Box component='video' ref={videoRef} autoPlay playsInline controls />
        }
      />
    </Box>
  );
}

export default Watch;
