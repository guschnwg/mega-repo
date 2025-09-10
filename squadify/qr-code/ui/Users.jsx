import React from "react";
import { createUser, listUsers, updateUser } from "./api";

const Users = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await listUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const triggerState = (id, active) => {
    updateUser({ id, active });
    fetchUsers();
  };

  const createNewUser = () => {
    const email = prompt("Email?");
    const password = prompt("Password?");
    if (!email || !password) {
      return;
    }

    createUser({ email, password });
    fetchUsers();
  }

  if (loading) {
    return (
      <div>
        <h2>Users</h2>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Users</h2>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <h2>Users</h2>

      <div>
        <button onClick={createNewUser}>
          New User
        </button>
      </div>

      <ul>
        {users.map((user, index) => (
          <li key={index}>
            <div>Email: {user.email}</div>
            <div>Roles: {user.roles}</div>
            <div>Active: {user.active ? 'Sim' : 'Não'}</div>

            <div>
              <button onClick={() => triggerState(user.id, !user.active)}>
                {user.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { Users };
