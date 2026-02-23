import api from "./apl";

export const fetchAcabadoTablerosPorComponente = async () => {
  const response = await api.get("/acabado-tablero-por-componente");
  return response.data;
};

export const getAcabadoTableroPorComponenteById = async (id) => {
  const response = await api.get(`/acabado-tablero-por-componente/${id}`);
  return response.data;
};

export const crearAcabadoTableroPorComponente = async (datos) => {
  const response = await api.post("/acabado-tablero-por-componente", datos);
  return response.data;
};

export const actualizarAcabadoTableroPorComponente = async (id, datos) => {
  const response = await api.put(`/acabado-tablero-por-componente/${id}`, datos);
  return response.data;
};

export const eliminarAcabadoTableroPorComponente = async (id) => {
  const response = await api.delete(`/acabado-tablero-por-componente/${id}`);
  return response.data;
};