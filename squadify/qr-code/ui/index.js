import React from "react";
import { createRoot } from "react-dom/client";

import { Auth } from "./Auth";
import { Reader } from "./Reader";
import { Login } from "./Login";

const App = () => {
  if (window.location.pathname == '/login') {
    return <Login />;
  }

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
