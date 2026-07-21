import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import "katex/dist/katex.min.css";
import "./index.css";
import { App } from "./App";
import { initTheme } from "./lib/theme";
import { CloudProvider } from "./components/CloudProvider";

initTheme();
// offline-first PWA: precaches the app + course chunks, auto-updates silently
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CloudProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </CloudProvider>
  </StrictMode>
);
