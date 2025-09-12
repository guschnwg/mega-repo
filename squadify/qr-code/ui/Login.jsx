import React, { useEffect, useState } from "react";
import { me } from "./api";

const Login = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      setError(null);

      try {
        await me();
        setError(true);
        setTimeout(() => {
          window.location.pathname = '/';
        }, 1000);
      } catch (error) {
        setError(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  if (loading) {
    return <span>Carregando...</span>;
  }

  if (error) {
    return <span>Erro!</span>;
  }

  return (
    <form action="/login" method="post">
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
