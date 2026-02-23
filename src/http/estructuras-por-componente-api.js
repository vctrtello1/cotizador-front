import api from "./apl";

export const fetchEstructurasPorComponente = async () => {
  const response = await api.get("/estructura-por-componente");
  return response.data;
};

export const getEstructuraPorComponenteById = async (id) => {
  const response = await api.get(`/estructura-por-componente/${id}`);
  return response.data;
};

export const crearEstructuraPorComponente = async (datos) => {
  const response = await api.post("/estructura-por-componente", datos);
  return response.data;
};

export const actualizarEstructuraPorComponente = async (id, datos) => {
  const response = await api.put(`/estructura-por-componente/${id}`, datos);
  return response.data;
};

export const eliminarEstructuraPorComponente = async (id) => {
  const response = await api.delete(`/estructura-por-componente/${id}`);
  return response.data;
};
