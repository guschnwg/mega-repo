import React from "react";
import { listUsers } from "./api";

const Users = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
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

    fetchUsers();
  }, []);

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
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            <div>Email: {user.email}</div>
            <div>Roles: {user.roles}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { Users };
