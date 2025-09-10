import React from "react";
import { createRoot } from "react-dom/client";

import { Auth, useAuth } from "./Auth";
import { Reader } from "./Reader";
import { Login } from "./Login";
import { Users } from "./Users";

const NotFound = () => <span>Not found!</span>;

const Root = () => {
  const { user } = useAuth();

  return (
    <div>
      <span>Hello {user.email}!</span>

      <div>
        <a href="/reader">Reader</a>

        {user.roles.includes("admin") && <a href="/users">Users</a>}
      </div>
    </div>
  );
}

const App = () => {
  if (window.location.pathname == '/login') {
    return <Login />;
  }

  const routes = {
    "/": Root,
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
