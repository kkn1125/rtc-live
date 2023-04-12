import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import VideoRecord from "./components/organisms/VideoRecord";
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
      </Route>
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

export default App;
