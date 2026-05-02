import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./views/Home";
import { CanvasWrapper } from "./views/Canvas";
import { EAppRoutes } from "./routes";
import { ApplicationContextProvider } from "./provider";

function App() {
  return (
    <ApplicationContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path={EAppRoutes.HOME} index element={<Home />} />
          <Route path={EAppRoutes.CANVAS} element={<CanvasWrapper />} />
        </Routes>
      </BrowserRouter>
    </ApplicationContextProvider>
  );
}

export default App;
