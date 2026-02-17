import api from "./apl";

export const fetchCorrederas = async () => {
  const response = await api.get("/correderas");
  return response.data;
};

export const getCorrederaById = async (id) => {
  const response = await api.get(`/correderas/${id}`);
  return response.data;
};

export const crearCorredera = async (datos) => {
  const response = await api.post("/correderas", datos);
  return response.data;
};

export const actualizarCorredera = async (id, datos) => {
  const response = await api.put(`/correderas/${id}`, datos);
  return response.data;
};

export const eliminarCorredera = async (id) => {
  const response = await api.delete(`/correderas/${id}`);
  return response.data;
};