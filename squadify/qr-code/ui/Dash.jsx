import React from "react";

import { useAuth } from "./Auth";

const Dash = () => {
  const { user } = useAuth();

  return (
    <div id="dash">
      <span>Hello {user.email}! <a href="/logout">Logout</a></span>

      <div id="home">
        <a href="/reader">Reader</a>

        {user.roles.includes("admin") && <a href="/users">Users</a>}
      </div>
    </div>
  );
}

export { Dash };
