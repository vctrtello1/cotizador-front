import api from "./apl";

export const fetchHorasDeManoDeObraPorComponentes = async () => {
  const response = await api.get("/horas-de-mano-de-obra-por-componentes");
  return response.data;
};

export const getHorasPorComponenteId = async (componenteId) => {
  const response = await api.get(`/horas-de-mano-de-obra-por-componentes/componente/${componenteId}`);
  return response.data;
};

export const getHorasById = async (id) => {
  const response = await api.get(`/horas-de-mano-de-obra-por-componentes/${id}`);
  return response.data;
};

export const crearHoras = async (datos) => {
  const response = await api.post("/horas-de-mano-de-obra-por-componentes", datos);
  return response.data;
};

export const actualizarHoras = async (id, datos) => {
  const response = await api.put(`/horas-de-mano-de-obra-por-componentes/${id}`, datos);
  return response.data;
};