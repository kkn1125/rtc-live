import {
  Box,
  Divider,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import LiveSocket, { INTERCEPT, SIGNAL } from "../../model/LiveSocket";
import { CODEC, VIDEO_OPTION } from "../../util/global";
import Chattings from "../moleculars/Chattings";
import MiniTip from "../moleculars/MiniTip";
import TopLinkInput from "../moleculars/TopLinkInput";
import RealTimeVideo from "./RealTimeVideo";
import VideoJS from "./VideoJS";
import VideoJS1 from "./VideoJS1";

const socket = new LiveSocket("ws", "localhost", 4000);
const streams: ArrayBuffer[] = [];
const mediaSource = new MediaSource();

let localStream: MediaStream = new MediaStream();
let loop1: NodeJS.Timer;
let player: Player;
let before = true;

function VideoRecordSocket() {
  const videoRef = useRef<HTMLDivElement>();
  const playerRef = useRef<Player>();
  const [room, setRoom] = useState({});
  const [user, setUser] = useState({});

  const [seekToLive, setSeekToLive] = useState(true);
  const [player1, setPlayer] = useState<Player>();

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });
  const [toggleChat, setToggleChat] = useState(false);
  function toggleChatting() {
    setToggleChat(!toggleChat);
  }

  function getName() {
    return "test";
  }

  const STREAM_NAME = getName();

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
    mediaRecorder.ondataavailable = async (data) => {
      console.log(data.data, countUploadChunk);
      streams.push(await data.data.arrayBuffer());
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
      if (streams[countDownloadChunk]) {
        console.log("play", countDownloadChunk);
        videoBuffer.appendBuffer(streams[countDownloadChunk]);
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
      const userData = data.result.user;
      if (data.data.action === "create") {
        setUser((user) => ({ ...user, ...userData }));
        setRoom((room) => ({ ...room, ...data.result.room }));
      } else if (data.data.action === "fetch") {
        setRoom((room) => data.result.room);
      } else if (data.data.action === "out") {
        setRoom((room) => data.result.room);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handlePlayerReady = (player: Player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    // @ts-ignore
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    // @ts-ignore
    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return (
    <Stack
      direction={"row"}
      sx={{
        backgroundColor: "#121212",
        p: 3,
        flex: 1,
        color: "#ffffff",
      }}>
      <Stack>
        <Box>
          <Typography
            fontSize={24}
            fontWeight={700}
            gutterBottom
            sx={{ color: "inherit" }}>
            실제 영상
          </Typography>
          <RealTimeVideo />
        </Box>
        <Divider
          sx={{
            my: 3,
            borderColor: "#ffffff",
          }}
        />
        <Box>
          <Typography
            fontSize={24}
            fontWeight={700}
            gutterBottom
            sx={{ color: "inherit" }}>
            라이브 송출 영상 현황
          </Typography>
          <MiniTip
            badge='live'
            view={(room as any)?.users?.length || 0}
            color={"error"}
          />
          <Box>
            <VideoJS1
              socket={socket}
              options={VIDEO_OPTION}
              onReady={handlePlayerReady}
            />
          </Box>
        </Box>
      </Stack>
      <Stack sx={{ flex: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Chattings
            nosidebar
            room={room}
            user={user}
            socket={socket}
            size={size}
            toggleChat={toggleChat}
            toggleChatting={toggleChatting}
          />
        </Box>
        <Stack sx={{ p: 3, flex: 1 }}>
          <Typography>control pannel</Typography>
          <TopLinkInput label={"link"} prefix />
          <TopLinkInput label={"message"} />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default VideoRecordSocket;
