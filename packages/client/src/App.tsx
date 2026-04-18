import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./views/Home";
import { Canvas } from "./views/Canvas";
import { EAppRoutes } from "./utils/routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path={EAppRoutes.CANVAS} element={<Canvas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
