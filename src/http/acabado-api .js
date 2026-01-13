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

export const actualizarAcabado = async (id, datos) => {
  const response = await api.put(`/acabados/${id}`, datos);
  return response.data;
};

export const eliminarAcabado = async (id) => {
  const response = await api.delete(`/acabados/${id}`);
  return response.data;
};