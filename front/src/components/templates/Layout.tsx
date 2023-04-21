import { Box, Container, IconButton, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

function Layout() {
  const navigate = useNavigate();
  
  return (
    <Stack sx={{ height: "100%" }}>
      <Stack sx={{ flex: 1 }}>
        <Outlet />
      </Stack>
      <Box
        sx={{
          display: "inline-block",
          position: "fixed",
          bottom: 5,
          right: 5,
          zIndex: 1,
        }}>
        <IconButton
          color='success'
          size='large'
          sx={{
            backgroundColor: "#2e7d3226",
          }}
          onClick={() => {
            navigate("/");
          }}>
          <HomeIcon />
        </IconButton>
      </Box>
    </Stack>
  );
}

export default Layout;
