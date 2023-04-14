import { Stack, Box, Typography, keyframes } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import axios from "axios";
import { MouseEvent, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LiveSocket, { SIGNAL } from "../../model/LiveSocket";
import BottomBar from "../moleculars/BottomBar";
import Chattings from "../moleculars/Chattings";
import LiveToolBar from "../moleculars/LiveToolBar";
import MiniTip from "../moleculars/MiniTip";
import PopupModal from "../moleculars/PopupModal";
import SlideTitle from "../moleculars/SlideTitle";

type URLs = string[];

interface LiveCommerceOptionTypes {
  // title: string;
  room: any;
  user: any;
  url?: string;
  video?: React.ReactElement;
  videoRef?: React.MutableRefObject<HTMLVideoElement | undefined>;
  socket: LiveSocket;
}

const LIVE_SIZE = {
  MIN_WIDTH: {
    xs: "100%",
    md: 360,
  },
  WIDTH: {
    xs: "100%",
    md: "56.25vh",
  },
  MIN_HEIGHT: 640,
};

function LiveCommerceLayout({
  room,
  user,
  url,
  video,
  videoRef,
  socket,
}: LiveCommerceOptionTypes) {
  const locate = useLocation();
  const navigate = useNavigate();
  const matched = locate.pathname.match(/^\/lvr\/[0-9A-z\-\_]+/g)?.[0];
  const matchPath = !!matched;
  const [src, setSrc] = useState();
  const iframeRef = useRef<HTMLIFrameElement | HTMLVideoElement>();
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });
  const [toggleChat, setToggleChat] = useState(false);

  /* TODO: 추후 개설되지 않은 방 판별 조건문 추가 해야 함. */
  const isWrongPath = !matchPath || matched !== locate.pathname;

  const handleClosePopup = (e: MouseEvent) => {
    navigate("/");
  };

  const immediatelyModal = (
    <PopupModal type='deleted' immediately handler={handleClosePopup} />
  );

  // axios
  //   .get(`/youtube/HZIcTZABMuc`, {})
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  useEffect(() => {
    if (iframeRef.current) {
      new ResizeObserver(() => {
        setSize(() => ({
          width: iframeRef.current?.clientWidth || 0,
          height: iframeRef.current?.clientHeight || 0,
        }));
      }).observe(iframeRef.current);
    }
  }, []);

  function toggleChatting() {
    setToggleChat(!toggleChat);
  }

  return isWrongPath && false ? (
    <>
      <Box
        sx={{
          height: "inherit",
          color: "#ffffff",
          backgroundColor: "#222222",
        }}>
        {immediatelyModal}
      </Box>
    </>
  ) : (
    <Stack
      alignItems='center'
      sx={{
        height: "100%",
        color: "#ffffff",
        backgroundColor: "#232323",
        [`.MuiTypography-root`]: {
          zIndex: 5,
        },
      }}>
      <Stack
        sx={{
          position: "relative",
          overflow: "hidden",
          minWidth: LIVE_SIZE.MIN_WIDTH,
          width: LIVE_SIZE.WIDTH,
          height: "100%",
          minHeight: LIVE_SIZE.MIN_HEIGHT,
          backgroundColor: "#000000",
        }}>
        <LiveToolBar />
        <SlideTitle
          size={size}
          title='🌸 [솔가] 최대 70% 할인 🌸 봄맞이 한정 판매, 데일리 마스크!'
        />
        <MiniTip badge='live' view={room?.users?.length || 0} color={"error"} />
        <Stack
          sx={{
            flex: 1,
          }}>
          {/* <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
            }}
            component='iframe'
            height='100%'
            ref={iframeRef}
            src='https://www.youtube.com/embed/KBkc42lHd54'
            title='편집자가 퇴사할 뻔한 나이키 광고'
            frameBorder={0}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
          /> */}
          {video}
          <Toolbar sx={{ flex: 1, pointerEvents: "none" }} />
          {/* <Typography
            fontWeight={700}
            sx={{
              pl: 2,
              color: (theme) => theme.palette.primary.main,
            }}>
            사은품 증정 이벤트 안내
          </Typography> */}
          <Chattings
            room={room}
            user={user}
            socket={socket}
            size={size}
            toggleChat={toggleChat}
            toggleChatting={toggleChatting}
          />
          <Box
            sx={{
              zIndex: 1,
              px: 1,
            }}>
            <Typography
              fontSize={13}
              sx={{
                display: "inline-block",
                backgroundColor: "#ffffff56",
                px: 0.8,
                py: 0.3,
                borderRadius: 1,
                color: "inherit",
              }}>
              📢 라이브에서만 누릴 수 있는 혜택! 놓지지 마세요! ✨
            </Typography>
          </Box>
          <Toolbar sx={{ pointerEvents: "none" }} />
          <BottomBar />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default LiveCommerceLayout;
