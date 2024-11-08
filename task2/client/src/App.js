import Header from "../src/components/Header";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import VideoCall from "./pages/VideoCall";

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/video/:id" element={<VideoCall />} />
      </Routes>
    </>
  );
}

export default App;
