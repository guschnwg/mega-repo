const _fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw response.statusText;
  }
  return response;
}

const me = async () => {
  const response = await _fetch('/api/me', );
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

export {
  me,
  login,
};
