import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("#root öğesi bulunamadı. index.html dosyasını kontrol edin.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
