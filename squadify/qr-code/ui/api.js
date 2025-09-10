const _fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    if (response.status === 401 && window.location.pathname !== '/login') {
      window.location.pathname = '/login';
    } else if (response.status === 403 && window.location.pathname !== '/') {
      window.location.pathname = '/';
    }
    throw response.statusText;
  }
  return response;
}

const me = async () => {
  const response = await _fetch('/api/me');
  const data = await response.json();
  return data;
}

const login = async (email, password) => {
  const response = await _fetch(
    '/api/login',
    { method: 'post', body: JSON.stringify({ email, password }) }
  );
  const data = await response.json();
  return data;
}

const listUsers = async () => {
  const response = await _fetch('/api/list_users');
  const data = await response.json();
  return data;
}

const updateUser = async inputData => {
  const response = await _fetch(
    '/api/update_user',
    {
      method: 'post',
      body: JSON.stringify(inputData),
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
  const data = await response.json();
  return data;
}

export {
  me,
  login,
  listUsers,
  updateUser,
};
