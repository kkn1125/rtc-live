import React, {
  forwardRef,
  ReactElement,
  Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { useNavigate } from "react-router-dom";
import { Box, Stack, TextField, Toolbar, Typography } from "@mui/material";
import { v4 } from "uuid";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

const AnswerModal = ({ open, to, handleClose }: AnswerModalType) => {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLInputElement>();

  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    setRoomId(v4());
  }, [open]);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby='alert-dialog-slide-description'>
      <DialogTitle>{"🚀 룸 개설"}</DialogTitle>
      <DialogContent>
        <Stack direction='row'>
          <Box>
            <Typography>룸 ID</Typography>
            <TextField
              size='small'
              variant='standard'
              disabled
              value={roomId}
            />
          </Box>
          <Toolbar variant='dense' />
          <Box>
            <Typography>룸 제목</Typography>
            <TextField inputRef={titleRef} size='small' variant='standard' />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button
          onClick={() => {
            if (!titleRef.current) return;
            if (!titleRef.current.value) {
              alert("제목을 입력해주세요.");
              return;
            }
            handleClose();

            

            navigate(to, {
              state: {
                id: roomId,
                title: titleRef.current.value,
              },
            });
          }}>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnswerModal;
