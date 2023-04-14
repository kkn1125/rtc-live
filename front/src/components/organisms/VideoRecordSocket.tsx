import { Box } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import LiveSocket, { INTERCEPT, SIGNAL } from "../../model/LiveSocket";

const socket = new LiveSocket("ws", "localhost", 4000);
const streams: Blob[] = [];
const CODEC = "video/webm;codecs=vp9";

function VideoRecordSocket() {
  const videoRef = useRef<HTMLVideoElement>();
  const [room, setRoom] = useState({});
  const [user, setUser] = useState({});

  function getName() {
    // return +new Date();
    return "test";
  }

  const STREAM_NAME = getName();
  // const CODEC = 'video/webm; codecs="vp8, vorbis"';

  function sendFile(file: Blob, chunkNumber: number) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", STREAM_NAME.toString());
    formData.append("chunk", chunkNumber.toString());
    axios.put("http://localhost:5000/api/upload", formData);
    socket.signalBinary(SIGNAL.STREAM, {
      action: "send",
      file: file,
    });
  }

  function registerRecord(stream: MediaStream) {
    let mediaRecorder = new MediaRecorder(stream, {
      mimeType: CODEC,
      bitsPerSecond: 2000,
      videoBitsPerSecond: 500,
      audioBitsPerSecond: 500,
    });
    let countUploadChunk = 0;
    console.log("register");
    mediaRecorder.ondataavailable = (data) => {
      console.log(data.data, countUploadChunk);
      // sendFile(data.data, countUploadChunk);
      // const reader = new FileReader();
      // reader.onloadend = (e) => {
      //   const arrayBuffer = reader.result as ArrayBuffer;
      //   console.log(arrayBuffer);
      //   socket.sendFile(arrayBuffer);
      //   countUploadChunk++;
      // };
      // reader.readAsArrayBuffer(data.data);
      streams.push(data.data);
      socket.sendFile(data.data);
      countUploadChunk++;
    };

    mediaRecorder.start();

    setInterval(() => {
      console.log("record");
      mediaRecorder.requestData();
    }, 2000);
  }

  function registerPlayer(mediaSource: MediaSource) {
    console.log("start play");
    const videoBuffer = mediaSource.addSourceBuffer(CODEC);
    let countDownloadChunk = 0;

    setInterval(async () => {
      // axios
      //   .get(
      //     `http://localhost:5000/api/download?name=${STREAM_NAME}&chunk=${countDownloadChunk}`,
      //     {
      //       responseType: "arraybuffer",
      //     }
      //   )
      //   .then((response) => {
      //     if (response.status !== 200) {
      //       throw Error("no such file");
      //     }
      //     return response.data;
      //   })
      //   .then((buffer) => {
      //     countDownloadChunk++;
      //     videoBuffer.appendBuffer(buffer);
      //   })
      //   .catch(() => {});
      if (streams[countDownloadChunk]) {
        console.log("play", countDownloadChunk);
        videoBuffer.appendBuffer(
          await streams[countDownloadChunk].arrayBuffer()
        );
        countDownloadChunk++;
      }
    }, 1000);
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
      socket.signalBinary(SIGNAL.STREAM, {
        action: "subscribe",
      });
    });

    socket.on(SIGNAL.ROOM, (type, data) => {
      const roomData = data.result.room;
      setRoom((room) => ({ ...room, ...roomData }));
    });

    socket.on(SIGNAL.USER, async (type, data) => {
      if (data.data.action === "create") {
        const userData = data.result.user;
        const mediaSource = new MediaSource();

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
              const videoBuffer = mediaSource.addSourceBuffer(CODEC);
              let countDownloadChunk = 0;
              /* register */
              registerRecord(stream);
              socket.on(INTERCEPT.MESSAGE, async (type, data) => {
                console.log("뺏어오기!", data.data, countDownloadChunk);
                videoBuffer.appendBuffer(await data.data);
                countDownloadChunk++;
              });
              // registerPlayer(mediaSource);
              // if (videoRef.current) {
              //   videoRef.current.srcObject = stream;
              // }
            })
            .catch((e) => {
              console.log(e);
            });
        }
      }
    });
  }, []);
  return (
    <Box>
      <Box
        component='video'
        ref={videoRef}
        autoPlay
        playsInline
        loop
        controls
      />
    </Box>
  );
}

export default VideoRecordSocket;
