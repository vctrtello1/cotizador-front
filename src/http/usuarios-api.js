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
