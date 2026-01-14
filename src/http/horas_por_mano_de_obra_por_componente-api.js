import api from "./apl";

export const fetchHorasDeManoDeObraPorComponentes = async () => {
  const response = await api.get("/horas-de-mano-de-obra-por-componentes");
  return response.data;
};

export const getCantidadPorHerrajeId = async (herrajeId) => {
  const response = await api.get(`/horas-de-mano-de-obra-por-componentes/herraje/${herrajeId}`);
  return response.data;
};

export const getCantidadPorHerrajeById = async (id) => {
  const response = await api.get(`/horas-de-mano-de-obra-por-componentes/${id}`);
  return response.data;
};

export const crearCantidadPorHerraje = async (datos) => {
  const response = await api.post("/horas-de-mano-de-obra-por-componentes", datos);
  return response.data;
};