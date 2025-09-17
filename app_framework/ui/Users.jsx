import React from "react";

import { Menu } from './Menu';
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

  const updateThisUser = async (id, data) => {
    await updateUser({ id, ...data });
    await fetchUsers();
  };

  const createNewUser = async () => {
    const email = prompt("Email?");
    const password = prompt("Password?");
    if (!email || !password) {
      return;
    }

    await createUser({ email, password });
    await fetchUsers();
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
    <>
      <Menu />
      <div id="users">
        <h2>
          Users

          <button onClick={createNewUser}>
            New User
          </button>
        </h2>

        <ul>
          {users.map((user, index) => (
            <li key={index}>
              <div>Email: {user.email}</div>
              <div>Roles: {user.roles}</div>
              <div>Active: {user.active ? 'Sim' : 'Não'}</div>

              <div>
                <button onClick={() => {
                  const password = prompt("Password?");
                  if (!password) return;
                  updateThisUser(user.id, { password })
                }}>
                  Update Password
                </button>
                <button onClick={() => updateThisUser(user.id, { active: !user.active })}>
                  {user.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export { Users };
