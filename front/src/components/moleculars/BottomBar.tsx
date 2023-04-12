import React, { useEffect, useState } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import FolderIcon from "@mui/icons-material/Folder";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box, Slide, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function BottomBar() {
  const [inArea, setInArea] = useState(false);
  const [value, setValue] = React.useState("recents");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  function nearDetect(e: MouseEvent) {
    const isArea = e.clientY > innerHeight - 70;

    setInArea(isArea);
  }

  useEffect(() => {
    window.addEventListener("mousemove", nearDetect);
    return () => {
      window.removeEventListener("mousemove", nearDetect);
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          margin: "auto",
          color: "inherit",
          zIndex: 1,
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
          backgroundColor: "#ffffff56",
          px: 3,
          pt: 1,
          position: "relative",
        }}>
        <MenuIcon fontSize={"small"} />
        <Box
          sx={{
            position: "absolute",
            left: "100%",
            bottom: 0,
            p: 1,
            overflow: "hidden",
            ["&::before"]: {
              content: '""',
              position: "absolute",
              bottom: 0,
              right: 0,
              borderBottomLeftRadius: "100%",
              boxShadow: "0 0 0 999999px #ffffff56",
              p: 1,
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: "100%",
            bottom: 0,
            p: 1,
            overflow: "hidden",
            ["&::before"]: {
              content: '""',
              position: "absolute",
              bottom: 0,
              right: 0,
              borderBottomRightRadius: "100%",
              boxShadow: "0 0 0 999999px #ffffff56",
              p: 1,
            },
          }}
        />
      </Box>
      <Slide in={inArea} timeout={100} direction='up'>
        <BottomNavigation
          sx={{
            zIndex: 1,
            bottom: 0,
            position: "absolute",
            left: 0,
            right: 0,
          }}
          value={value}
          onChange={handleChange}>
          <BottomNavigationAction
            label='Recents'
            value='recents'
            icon={<RestoreIcon />}
          />
          <BottomNavigationAction
            label='Favorites'
            value='favorites'
            icon={<FavoriteIcon />}
          />
          <BottomNavigationAction
            label='Nearby'
            value='nearby'
            icon={<LocationOnIcon />}
          />
          <BottomNavigationAction
            label='Folder'
            value='folder'
            icon={<FolderIcon />}
          />
        </BottomNavigation>
      </Slide>
    </>
  );
}
