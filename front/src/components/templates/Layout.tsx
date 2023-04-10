import { Container, Stack } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <Stack>
      <Container>
        <Outlet />
      </Container>
    </Stack>
  );
}

export default Layout;
