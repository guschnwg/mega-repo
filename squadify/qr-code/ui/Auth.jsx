import React from "react";

const Auth = ({ children }) => {
  if (false) {
    window.location.href = "/login";
    return null;
  }

  return <>{children}</>;
};

export default Auth;
