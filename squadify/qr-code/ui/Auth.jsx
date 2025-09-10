import React, { useEffect, useState } from "react";
import { me } from './api';

const Auth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    me().then(() => {
      setLoading(false);
      setError(false);
    }).catch(() => {
      setLoading(false);
      setError(true);
      setTimeout(() => {
        window.location.pathname = '/login';
      }, 1000);
    });
  }, []);

  if (loading) {
    return <span>Carregando...</span>;
  }

  if (error) {
    return <span>Erro!</span>;
  }

  return <>{children}</>;
};

export { Auth };
