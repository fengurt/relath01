import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "react-vant";
import { App } from "./App";

import "react-vant/lib/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
