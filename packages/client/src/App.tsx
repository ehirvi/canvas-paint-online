import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./views/Home";
import { PaintCanvas } from "./views/PaintCanvas";
import { EAppRoutes } from "./utils/routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path={EAppRoutes.PAINT_CANVAS} element={<PaintCanvas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
