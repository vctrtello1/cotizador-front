import api from "./apl";

export const fetchCotizaciones = async () => {
  const response = await api.get("/cotizaciones");
  return response.data;
};

export const getCotizacionById = async (id) => {
  const response = await api.get(`/cotizaciones/${id}`);
  return response.data;
};

export const crearCotizacion = async (datos) => {
  const response = await api.post("/cotizaciones", datos);
  return response.data;
};

export const actualizarCotizacion = async (id, datos) => {
  const response = await api.put(`/cotizaciones/${id}`, datos);
  return response.data;
};

export const eliminarModuloDeCotizacion = async (cotizacionId, moduloId) => {
  const response = await api.delete(`/cotizaciones/${cotizacionId}/modulos/${moduloId}`);
  return response.data;
};

export const sincronizarModulos = async (cotizacionId, modulosData) => {
  const response = await api.post(`/cotizaciones/${cotizacionId}/sync-modulos`, { modulos: modulosData });
  return response.data;
};