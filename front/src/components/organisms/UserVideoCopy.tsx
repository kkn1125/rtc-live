import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import LiveSocket, { MEDIA } from "../../model/LiveSocket";

function UserVideoCopy({
  room,
  user,
  ws,
}: {
  room: any;
  user: any;
  ws: LiveSocket;
}) {
  const videoRef = useRef<HTMLElement>(null);

  console.log("is here?");
  useEffect(() => {
    (async () => {
      if (videoRef.current && ws.rtc) {
        ws.rtc.setParent(videoRef.current);
        ws.rtc.on("track", (e) => {
          console.log("트랙 왔나?");
          if (ws.rtc) {
            ws.rtc.createVideo(room.admin);
            if (ws.rtc.video) {
              ws.rtc.video.srcObject = new MediaStream();
              ws.rtc.video?.srcObject.addTrack(e.track);
            }
          }
        });
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
        // await ws.rtc.connectWebCam();
        ws.signalBinary(MEDIA.REQUEST, {
          action: "req",
          from: user.id,
          to: room.admin.id,
        });
        ws.on(MEDIA.OFFER, async (type, data) => {
          console.log(data);
          if (data.data.action === "send" && data.server && ws.rtc) {
            ws.rtc.setRemoteDescription(
              new RTCSessionDescription(data.result.offer)
            );
            const answer = await ws.rtc.createAnswer();
            ws.rtc.answer = answer;
            ws.rtc.setLocalDescription(new RTCSessionDescription(answer));
            if (ws.rtc.answer) {
              ws.signalBinary(MEDIA.ANSWER, {
                action: "send",
                from: data.result.from,
                to: data.result.to,
                answer: {
                  type: ws.rtc.answer.type,
                  sdp: ws.rtc.answer.sdp,
                },
              });
            }
          }
        });
      }
    })();
  }, [videoRef.current]);
  return <Box ref={videoRef}></Box>;
}

export default UserVideoCopy;
