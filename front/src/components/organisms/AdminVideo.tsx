import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import LiveSocket, { MEDIA } from "../../model/LiveSocket";

function AdminVideo({
  room,
  user,
  ws,
}: {
  room: any;
  user: any;
  ws: LiveSocket;
}) {
  const videoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    (async () => {
      if (videoRef.current && ws.rtc) {
        ws.rtc.setParent(videoRef.current);
        ws.rtc.createVideo(user);
        await ws.rtc.connectWebCam();
        ws.rtc.initialDataChannel(1);
        ws.rtc.on("ice", (e: RTCPeerConnectionIceEvent) => {
          if (ws.rtc) {
            if (e.candidate) {
              console.log("candidate!!", e.candidate);
              ws.signalBinary(MEDIA.ICE_CANDIDATE, {
                action: "send",
                candidate: e.candidate,
                from: user.id,
              });
            }
          }
        });
        ws.on(MEDIA.ICE_CANDIDATE, (type, data) => {
          if (ws.rtc) {
            if (ws.rtc.remoteDescription) {
              ws.rtc.addIceCandidate(data.result.candidate);
            }
          }
        });
      }
      ws.on(MEDIA.REQUEST, async (type, data) => {
        console.log("시작");
        if (ws.rtc) {
          const offer = await ws.rtc.createOffer();
          ws.rtc.offer = offer;
          ws.rtc.setLocalDescription(offer);
          console.log("data.result", data.result);
          ws.signalBinary(MEDIA.OFFER, {
            action: "send",
            from: data.result.from,
            to: data.result.to,
            offer: {
              type: ws.rtc.offer.type,
              sdp: ws.rtc.offer.sdp,
            },
          });
        }
      });
      ws.on(MEDIA.ANSWER, async (type, data) => {
        if (ws.rtc) {
          ws.rtc.setRemoteDescription(
            new RTCSessionDescription(data.result.answer)
          );
        }
      });
    })();
  }, [videoRef.current]);
  return <Box ref={videoRef}></Box>;
}

export default AdminVideo;
