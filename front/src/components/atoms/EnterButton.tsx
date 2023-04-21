import { Button } from "@mui/material";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnswerModal from "./AnswerModal";

type EnterButtonType = {
  color?: ButtonColors;
  variant?: ButtonVariants;
  to?: string;
  admin?: boolean;
  children?: React.ReactElement | React.ReactElement[] | string;
};

function EnterButton({
  color = "info",
  variant = "contained",
  to = "/",
  admin = false,
  children,
}: EnterButtonType) {
  const newLocal = false;
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <AnswerModal open={open} handleClose={handleClose} to={to} />
      <Button
        color={color}
        variant={variant}
        children={children}
        onClick={handleClickOpen}
      />
    </>
  );
}

export default EnterButton;
