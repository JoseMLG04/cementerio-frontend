export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetchWithAuth(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  return response;
};

export const login = async (usuario, contrasenia) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  
  const response = await fetchWithAuth(`${API_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usu_usuario: usuario, usu_contrasenia: contrasenia }),
  });

  if (!response.ok) throw new Error('Credenciales inválidas');

  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  
  return data;
};
