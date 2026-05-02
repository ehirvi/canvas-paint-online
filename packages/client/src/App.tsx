import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./views/Home";
import { CanvasWrapper } from "./views/Canvas";
import { EAppRoutes } from "./routes";
import { WebTransportProvider } from "./provider";

function App() {
  return (
    <WebTransportProvider>
      <BrowserRouter>
        <Routes>
          <Route path={EAppRoutes.HOME} index element={<Home />} />
          <Route path={EAppRoutes.CANVAS} element={<CanvasWrapper />} />
        </Routes>
      </BrowserRouter>
    </WebTransportProvider>
  );
}

export default App;
