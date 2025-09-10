import React from "react";
import { createRoot } from "react-dom/client";

import { Auth } from "./Auth";
import { Reader } from "./Reader";

const App = () => {
  return (
    <Auth>
      <Reader />
    </Auth>
  );
};

const root = createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
);
