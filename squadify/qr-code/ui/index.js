import React from "react";
import { createRoot } from "react-dom/client";
import Auth from "./Auth";

const App = () => {
  return (
    <Auth>
      <h1>QR Code</h1>
    </Auth>
  );
};

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
