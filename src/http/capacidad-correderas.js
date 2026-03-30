import api from "./apl";

export const fetchCorrederas = async () => {
  const response = await api.get("/capacidad-correderas");
  return response.data;
};

export const getCorrederaById = async (id) => {
  const response = await api.get(`/capacidad-correderas/${id}`);
  return response.data;
};

export const crearCorredera = async (datos) => {
  const response = await api.post("/capacidad-correderas", datos);
  return response.data;
};

export const actualizarCorredera = async (id, datos) => {
  const response = await api.put(`/capacidad-correderas/${id}`, datos);
  return response.data;
};

export const eliminarCorredera = async (id) => {
  const response = await api.delete(`/capacidad-correderas/${id}`);
  return response.data;
};