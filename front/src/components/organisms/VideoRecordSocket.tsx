import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, StaticTimePicker } from "@mui/x-date-pickers";
import axios from "axios";
import dayjs from "dayjs";
import React, { Ref, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useOutletContext, useParams } from "react-router-dom";
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
// import {
//   RoomContext,
//   RoomDispatchContext,
//   ROOM_ACTION,
// } from "../../context/[x]RoomContext";
import {
  SocketContext,
  SocketDispatchContext,
  SOCKET_ACTION,
} from "../../context/SocketContext";

let socket: LiveSocket;
const streams: ArrayBuffer[] = [];
const mediaSource = new MediaSource();

let localStream: MediaStream = new MediaStream();
let loop1: NodeJS.Timer;
let player: Player;
let before = true;

const defaultTimeValue = dayjs(new Date().toISOString().slice(0, -8));

function VideoRecordSocket() {
  const socket = useContext(SocketContext);
  const socketDispatch = useContext(SocketDispatchContext);
  // const roomState = useContext(RoomContext);
  // const roomDispatch = useContext(RoomDispatchContext);
  const locate = useLocation();
  const { id, title } = locate.state;
  const [confirm, setConfirm] = useState(false);
  const videoRef = useRef<HTMLDivElement>();
  const [isStartedLive, setIsStartedLive] = useState(false);
  const playerRef = useRef<Player>();
  const [room, setRoom] = useState({});
  const [user, setUser] = useState({});
  const [liveCounter, setLiveCounter] = useState(0);
  const [prepare, setPrepare] = useState(false);

  const liveTitleRef = useRef<HTMLInputElement>();
  const [selectTime, setSelectTime] = useState<dayjs.Dayjs>();

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
    socketDispatch({
      type: SOCKET_ACTION.CONNECT,
      roomId: id,
    });
    // startLive();
    return () => {
      socket.disconnect();
      socket.off([INTERCEPT.OPEN, SIGNAL.ROOM, SIGNAL.USER]);
    };
  }, []);

  // live 시작
  function startLive() {
    socketDispatch({
      type: SOCKET_ACTION.INITIALIZE,
      roomId: id,
      roomTitle: title,
      cb: () => {
        console.log("live!");
        setIsStartedLive(() => true);
      },
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
  }

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

  const handleSetTime = () => {
    if (liveTitleRef.current) {
      console.log(liveTitleRef.current.value);
      if (!liveTitleRef.current.value) {
        console.log("라이브 룸 제목을 입력하세요.");
        return;
      }

      if (!selectTime) {
        console.log("라이브 방송 시간을 설정해주세요.");
        return;
      }
      console.log(selectTime.minute());
      console.log(new Date().getMinutes());

      setPrepare(true);
      const h = selectTime.hour();
      const m = selectTime.minute();
      const milliSeconds = 5;
      console.log(
        `라이브 방송이 ${h}시 ${m}분에 시작됩니다. 방송을 준비해주세요!`
      );
      setLiveCounter(() => milliSeconds);
      setTimeout(() => {
        startLive();
      }, milliSeconds * 1000);
      const countDown = setInterval(() => {
        setLiveCounter((liveCounter) => {
          if (liveCounter < 0) {
            clearInterval(countDown);
          }
          return liveCounter - 1;
        });
      }, 1000);
    }
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
      <Stack sx={{ flex: 0.5 }}>
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
        {isStartedLive && (
          <>
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
          </>
        )}
      </Stack>
      <Stack sx={{ flex: 1 }}>
        <Box sx={{ flex: 1 }}>
          {!isStartedLive ? (
            <Stack>
              {prepare && liveCounter > 0 && (
                <Box>
                  <Alert severity='warning'>
                    <AlertTitle>안내</AlertTitle>
                    라이브 시작 전 입니다. 라이브 룸 제목과 시작 시작을 설정
                    해주세요.
                    <br />
                    [라이브 시작 {liveCounter} 초 전]
                  </Alert>
                </Box>
              )}
              {!prepare && liveCounter === 0 && (
                <Box>
                  <Typography fontWeight={700} fontSize={20}>
                    📜 라이브 룸 제목
                  </Typography>
                  <TextField
                    inputRef={liveTitleRef}
                    sx={{
                      [".MuiInputBase-root"]: {
                        backgroundColor: "#ffffff56",
                      },
                    }}
                  />
                  <Typography fontWeight={700} fontSize={20}>
                    📜 시작 시간
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-block",
                      [".MuiPickersLayout-root"]: {
                        position: "relative",
                        backgroundColor: "transparent",
                        color: "#ffffff",
                        ["& .MuiTypography-root"]: {
                          color: "#ffffff",
                          ["&.MuiPickersToolbarText-root.Mui-selected"]: {
                            color: "#1976d2",
                          },
                          ["&.MuiTimePickerToolbar-ampmLabel.Mui-selected"]: {
                            color: "#1976d2",
                          },
                        },
                        [".MuiClock-root .MuiClock-clock"]: {
                          backgroundColor: "#ffffff",
                        },
                      },
                      [".MuiDialogActions-root.MuiPickersLayout-actionBar"]: {
                        display: "none",
                      },
                    }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <StaticTimePicker
                        disablePast
                        onChange={(value, context) => {
                          console.log("change", value);
                          console.log("change", context);
                          setSelectTime(value as dayjs.Dayjs);
                        }}
                        defaultValue={defaultTimeValue}
                        orientation='landscape'
                      />
                    </LocalizationProvider>
                    <Button onClick={handleSetTime}>확인</Button>
                  </Box>
                </Box>
              )}
            </Stack>
          ) : (
            <Chattings
              nosidebar
              room={room}
              user={user}
              socket={socket}
              size={size}
              toggleChat={toggleChat}
              toggleChatting={toggleChatting}
            />
          )}
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
