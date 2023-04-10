import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

function ViewerRoom() {
  const navigate = useNavigate();
  const handleHome = () => {
    navigate("/");
  };
  return (
    <Box>
      <Typography component='h3' variant='h3' align='center' gutterBottom>
        Viewer
      </Typography>
      <Button onClick={handleHome}>Home</Button>
    </Box>
  );
}

export default ViewerRoom;
