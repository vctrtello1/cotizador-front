import api from "./apl";

export const fetchModulosPorCotizacion = async () => {
  const response = await api.get("/modulos-por-cotizacion");
  return response.data;
};

export const getModulosPorCotizacionId = async (cotizacionId) => {
  const response = await api.get(`/modulos-por-cotizacion/cotizacion/${cotizacionId}`);
  return response.data;
};

export const getModuloPorCotizacionById = async (id) => {
  const response = await api.get(`/modulos-por-cotizacion/${id}`);
  return response.data;
};

export const crearModuloPorCotizacion = async (datos) => {
  const response = await api.post("/modulos-por-cotizacion", datos);
  return response.data;
};

export const actualizarModuloPorCotizacion = async (id, datos) => {
  const response = await api.put(`/modulos-por-cotizacion/${id}`, datos);
  return response.data;
};

export const eliminarModuloPorCotizacion = async (id) => {
  const response = await api.delete(`/modulos-por-cotizacion/${id}`);
  return response.data;
};
