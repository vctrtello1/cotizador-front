import api from "./apl";

export const fetchAcabados = async () => {
  const response = await api.get("/acabados");
  return response.data;
};

export const getAcabadoById = async (id) => {
  const response = await api.get(`/acabados/${id}`);
  return response.data;
};

export const crearAcabado = async (datos) => {
  const response = await api.post("/acabados", datos);
  return response.data;
};