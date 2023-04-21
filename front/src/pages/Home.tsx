import { Box, Button, List, ListItem, Stack, Typography } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import EnterButton from "../components/atoms/EnterButton";
import VideoJS from "../components/organisms/VideoJS";
import {
  SocketContext,
  SocketDispatchContext,
  SOCKET_ACTION,
} from "../context/SocketContext";
import { INTERCEPT, SIGNAL } from "../model/LiveSocket";

let localStream: MediaStream = new MediaStream();

let streams: Blob[] = [];
const CODEC = "video/webm;codecs=vp9,opus";

function Home() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>();
  let player: Player;
  const [roomList, setRoomList] = useState<any[]>([]);
  const socket = useContext(SocketContext);
  const socketDispatch = useContext(SocketDispatchContext);

  const handlePath = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLButtonElement;
    navigate(`/${target.dataset.path}`);
  };

  useEffect(() => {
    socketDispatch({
      type: SOCKET_ACTION.CONNECT,
    });

    socket.on(INTERCEPT.OPEN, async (type, e) => {
      socket.signalBinary(SIGNAL.ROOM, {
        action: "fetch",
      });
    });

    socket.on(SIGNAL.ROOM, (type, data) => {
      console.log("SIGNAL.ROOM", data);
      if (data.data.action === "fetch") {
        console.log("SIGNAL.ROOM fetch", data.result.rooms);
        const rooms = data.result.rooms;
        setRoomList((roomList) => roomList.concat(...rooms));
      } else if (data.data.action === "create") {
        console.log("SIGNAL.ROOM create", data.result.room);
        setRoomList((roomList) => [...roomList, data.result.room]);
      }
    });

    // const videoJS = document.createElement("video-js") as HTMLVideoElement;
    // videoJS.classList.add("vjs-big-play-centered");
    // let loop1: NodeJS.Timer;

    // const mediaSource = new MediaSource();
    // if (videoRef.current) {
    //   videoRef.current.appendChild(videoJS);
    //   videoJS.src = URL.createObjectURL(mediaSource);
    //   player = videojs(
    //     videoJS,
    //     {
    //       autoplay: true,
    //       controls: true,
    //       liveui: true,
    //       liveTracker: {
    //         liveTolerance: 1,
    //         trackingThreshold: 5,
    //       },
    //     },
    //     () => {
    //       videojs.log("player is ready");
    //     }
    //   );
    //   player.autoplay(true);
    //   player.options({
    //     autoplay: true,
    //     controls: true,
    //     liveui: true,
    //     liveTracker: {
    //       liveTolerance: 1,
    //       trackingThreshold: 5,
    //     },
    //   });
    // }

    // navigator.mediaDevices
    //   .getUserMedia({
    //     video: true,
    //     audio: true,
    //   })
    //   .then((stream) => {
    //     let videoBuffer: SourceBuffer;
    //     videoBuffer = mediaSource.addSourceBuffer(CODEC);

    //     if (videoRef.current) {
    //       localStream = stream;

    //       let countUploadChunk = 0;
    //       let countDownloadChunk = 0;

    //       const recoder = new MediaRecorder(stream, {
    //         mimeType: CODEC,
    //       });
    //       recoder.ondataavailable = async (data) => {
    //         streams.push(data.data);
    //         countUploadChunk++;

    //         if (streams[countDownloadChunk]) {
    //           // console.log(streams[countDownloadChunk]);
    //           videoBuffer.appendBuffer(await data.data.arrayBuffer());
    //           countDownloadChunk++;
    //         }
    //       };

    //       recoder.start();

    //       loop1 = setInterval(() => {
    //         // console.log("record");
    //         recoder.requestData();
    //       }, 100);
    //     }
    //   });
    return () => {
      // clearInterval(loop1);
      socketDispatch({
        type: SOCKET_ACTION.DISCONNECT,
      });
      setRoomList([]);
    };
  }, []);

  return (
    <Box>
      <Typography component='h3' variant='h3' align='center' gutterBottom>
        Home
      </Typography>
      <Stack direction='row' gap={3} justifyContent='center'>
        <EnterButton to='live'>live room</EnterButton>
        <EnterButton to='viewer'>viewer room</EnterButton>
        <EnterButton color='error' to='record'>
          record room
        </EnterButton>
        <EnterButton color='error' to='watch'>
          watch room
        </EnterButton>
        <EnterButton color='success' to='recordsocket'>
          record socket room
        </EnterButton>
        <EnterButton color='success' to='watchsocket'>
          watch socket room
        </EnterButton>
      </Stack>

      <Box>
        {roomList.length > 0 &&
          roomList.map((room, i) => (
            <Link key={i} to={`/watchsocket/${room.id}`}>
              <Typography>{room.id}</Typography>
            </Link>
          ))}
      </Box>
    </Box>
  );
}

export default Home;
