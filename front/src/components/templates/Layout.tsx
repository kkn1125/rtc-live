import { Box, Container, Stack } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <Stack sx={{ height: "100%" }}>
      <Stack sx={{ flex: 1 }}>
        <Outlet />
      </Stack>
    </Stack>
  );
}

export default Layout;
