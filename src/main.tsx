import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

const root = createRoot(document.getElementById("root")!);
if (
  (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV &&
  new URLSearchParams(window.location.search).has("exportModels")
) {
  import("./exports/ModelExportPage").then(({ default: ModelExportPage }) =>
    root.render(<ModelExportPage />),
  );
} else root.render(<App />);
