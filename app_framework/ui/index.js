import React from "react";
import { createRoot } from "react-dom/client";

import './styles.css';

import { Auth, useAuth } from "./Auth";
import { Reader } from "./Reader";
import { Login } from "./Login";
import { Users } from "./Users";
import { Dash } from "./Dash";

const NotFound = () => <span>Not found!</span>;

const App = () => {
  if (window.location.pathname == '/login') {
    return <Login />;
  }

  const routes = {
    "/": Dash,
    "/reader": Reader,
    "/users": Users,
  };

  const Component = routes[window.location.pathname] || NotFound;

  return (
    <Auth>
      <Component />
    </Auth>
  );
};

const root = createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
);
