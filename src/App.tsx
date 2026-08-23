import { BrowserRouter } from "react-router-dom";

import { CVRoutes } from "./CVRoutes";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CVRoutes />
    </BrowserRouter>
  );
}

export default App;
