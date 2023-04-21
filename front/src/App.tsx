import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import VideoRecord from "./components/organisms/VideoRecord";
import VideoRecordSocket from "./components/organisms/VideoRecordSocket";
import Watch from "./components/organisms/Watch";
import WatchSocket from "./components/organisms/WatchSocket";
import Layout from "./components/templates/Layout";
import Home from "./pages/Home";
import LiveRoom from "./pages/LiveRoom";
import NotFound from "./pages/NotFound";
import ViewerRoom from "./pages/ViewerRoom";

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='' element={<Home />} />
        <Route path='live' element={<LiveRoom />} />
        <Route path='viewer' element={<ViewerRoom />} />
        <Route path='record' element={<VideoRecord />} />
        <Route path='watch' element={<Watch />} />
        <Route path='recordsocket' element={<VideoRecordSocket />} />
        <Route path='watchsocket/:room_id' element={<WatchSocket />} />
      </Route>
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

export default App;
