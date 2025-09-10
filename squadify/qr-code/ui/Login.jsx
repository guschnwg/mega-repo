import React from "react";

const Login = () => {
  return (
    <form action="/api/login" method="post">
      <input
        type="email"
        name="email"
        placeholder="Email"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
      />
      <button type="submit">
        Login
      </button>
    </form>
  );
};

export { Login };
