import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./views/Home";
import { Canvas } from "./views/Canvas";
import { EAppRoutes } from "./utils/routes";
import { WebTransportProvider } from "./provider";

function App() {
  return (
    <WebTransportProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path={EAppRoutes.CANVAS} element={<Canvas />} />
        </Routes>
      </BrowserRouter>
    </WebTransportProvider>
  );
}

export default App;
