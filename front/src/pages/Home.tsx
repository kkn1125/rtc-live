import { Box, Button, Stack, Typography } from "@mui/material";
import React from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLiveRoom = () => {
    navigate("/live");
  };
  const handleViewerRoom = () => {
    navigate("/viewer");
  };
  return (
    <Box>
      <Typography component='h3' variant='h3' align='center' gutterBottom>
        Home
      </Typography>
      <Stack direction='row' gap={3} justifyContent='center'>
        <Button variant='contained' onClick={handleLiveRoom}>
          live room
        </Button>
        <Button variant='contained' onClick={handleViewerRoom}>
          viewer room
        </Button>
      </Stack>
    </Box>
  );
}

export default Home;
