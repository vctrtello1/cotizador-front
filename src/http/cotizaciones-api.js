import api from "./apl";

export const fetchCotizaciones = async () => {
  const response = await api.get("/cotizaciones");
  return response.data;
};

export const getCotizacionById = async (id) => {
  const response = await api.get(`/cotizaciones/${id}`);
  return response.data;
}