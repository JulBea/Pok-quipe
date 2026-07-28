import { Route, Routes } from "react-router-dom";
import { Home } from "./components/Home";
import { TeamPage } from "./components/TeamPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gen/:genId" element={<TeamPage />} />
    </Routes>
  );
}
