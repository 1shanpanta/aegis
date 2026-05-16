// SPDX-License-Identifier: Apache-2.0
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { setNetworkId, NetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import App from "./App";
import { PrivyAppProvider } from "./lib/PrivyAppProvider";

setNetworkId("undeployed" as NetworkId);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PrivyAppProvider>
      <App />
    </PrivyAppProvider>
  </React.StrictMode>,
);
