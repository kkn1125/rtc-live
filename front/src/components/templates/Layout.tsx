import { Box, Container, Stack } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <Stack sx={{ height: "100%" }}>
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Stack>
  );
}

export default Layout;
