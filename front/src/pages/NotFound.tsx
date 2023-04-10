import { Box, Button, Stack, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <Stack direction='row' justifyContent='center'>
      <Box sx={{ textAlign: "center" }}>
        <Typography fontSize={64} gutterBottom>
          404
        </Typography>
        <Typography fontSize={32} gutterBottom>
          not found
        </Typography>
        <Button
          variant='outlined'
          onClick={() => {
            navigate("/");
          }}>
          Home
        </Button>
      </Box>
    </Stack>
  );
}

export default NotFound;
