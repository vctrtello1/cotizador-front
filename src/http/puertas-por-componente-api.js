import api from "./apl";

export const fetchPuertasPorComponente = async () => {
  const response = await api.get("/puertas-por-componente");
  return response.data;
};

export const getPuertaPorComponenteById = async (id) => {
  const response = await api.get(`/puertas-por-componente/${id}`);
  return response.data;
};

export const crearPuertaPorComponente = async (datos) => {
  const response = await api.post("/puertas-por-componente", datos);
  return response.data;
};

export const actualizarPuertaPorComponente = async (id, datos) => {
  const response = await api.put(`/puertas-por-componente/${id}`, datos);
  return response.data;
};

export const eliminarPuertaPorComponente = async (id) => {
  const response = await api.delete(`/puertas-por-componente/${id}`);
  return response.data;
};
