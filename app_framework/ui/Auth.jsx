import React, { createContext, useContext, useEffect, useState } from "react";

import { me } from './api';

const AuthContext = createContext({ loading: true, error: false, user: null });
const useAuth = () => useContext(AuthContext);

const Auth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      setError(null);

      try {
        setUser(await me());
        setError(false);
      } catch (error) {
        setError(true);
        setTimeout(() => {
          window.location.pathname = '/login';
        }, 1000);
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
    <AuthContext.Provider value={{ loading, error, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export { Auth, useAuth };
