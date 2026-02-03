import api from "./apl";

export const fetchEstructuras = async () => {
  const response = await api.get("/estructuras");
  return response.data;
};

export const getEstructuraById = async (id) => {
  const response = await api.get(`/estructuras/${id}`);
  return response.data;
};

export const crearEstructura = async (datos) => {
  const response = await api.post("/estructuras", datos);
  return response.data;
};

export const actualizarEstructura = async (id, datos) => {
  const response = await api.put(`/estructuras/${id}`, datos);
  return response.data;
};

export const eliminarEstructura = async (id) => {
  const response = await api.delete(`/estructuras/${id}`);
  return response.data;
};