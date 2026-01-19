import api from "./apl";

export const fetchComponentesPorCotizacion = async () => {
  const response = await api.get("/componentes-por-cotizacion");
  return response.data;
};

export const getComponentesPorCotizacionId = async (cotizacionId) => {
  const response = await api.get(`/componentes-por-cotizacion/cotizacion/${cotizacionId}`);
  return response.data;
};

export const getComponentesPorCotizacionById = async (id) => {
  const response = await api.get(`/componentes-por-cotizacion/${id}`);
  return response.data;
};

export const crearComponentesPorCotizacion = async (datos) => {
  const response = await api.post("/componentes-por-cotizacion", datos);
  return response.data;
};

export const actualizarComponentesPorCotizacion = async (id, datos) => {
  const response = await api.put(`/componentes-por-cotizacion/${id}`, datos);
  return response.data;
};

export const eliminarComponentesPorCotizacion = async (id) => {
  const response = await api.delete(`/componentes-por-cotizacion/${id}`);
  return response.data;
};