import React from 'react';

import { useAuth } from "./Auth";

const Menu = () => {
  const { user } = useAuth();

  return (
    <div id="menu">
      <a href="/">Home</a>
      {user.roles.includes("admin") && <a href="/users">Users</a>}
    </div>
  );
}

export { Menu };
