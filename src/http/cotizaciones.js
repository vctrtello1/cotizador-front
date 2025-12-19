import api from "./apl";

export const fetchCotizaciones = async () => {
  const response = await api.get("/cotizaciones");
  return response.data;
};