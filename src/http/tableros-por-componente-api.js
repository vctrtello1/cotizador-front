import api from "./apl";

export const fetchModulosPorCotizacion = async () => {
  const response = await api.get("tableros-por-componente");
  return response.data;
};

export const getModulosPorCotizacionId = async (cotizacionId) => {
  const response = await api.get(`/tableros-por-componente/${cotizacionId}`);
  return response.data;
};

export const getModuloPorCotizacionById = async (id) => {
  const response = await api.get(`/tableros-por-componente/${id}`);
  return response.data;
};

export const crearModuloPorCotizacion = async (datos) => {
  const response = await api.post("/tableros-por-componente", datos);
  return response.data;
};

export const actualizarModuloPorCotizacion = async (id, datos) => {
  const response = await api.put(`/tableros-por-componente/${id}`, datos);
  return response.data;
};

export const eliminarModuloPorCotizacion = async (id) => {
  const response = await api.delete(`/tableros-por-componente/${id}`);
  return response.data;
};
