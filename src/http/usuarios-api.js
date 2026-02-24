import api from "./apl";

export const fetchUsuarios = async () => {
  const response = await api.get("/auth/users");
  return response.data;
};

export const getUsuarioPorId = async (id) => {
  const response = await api.get(`/auth/users/${id}`);
  return response.data;
};

export const crearUsuario = async (datos) => {
  const response = await api.post("/auth/register", datos);
  return response.data;
};

export const actualizarUsuario = async (id, datos) => {
  const response = await api.put(`/auth/users/${id}`, datos);
  return response.data;
};

export const eliminarUsuario = async (id) => {
  const response = await api.delete(`/auth/users/${id}`);
  return response.data;
};

// ===== Permisos =====

export const fetchPermisos = async () => {
  const response = await api.get("/auth/permissions");
  return response.data;
};

export const fetchPermisosUsuario = async (userId) => {
  const response = await api.get(`/auth/users/${userId}/permissions`);
  return response.data;
};

export const actualizarPermisosUsuario = async (userId, datos) => {
  const response = await api.put(`/auth/users/${userId}/permissions`, datos);
  return response.data;
};
