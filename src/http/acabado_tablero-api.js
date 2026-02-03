import api from "./apl";

export const fetchAcabadoTableros = async () => {
  const response = await api.get("/acabado-tableros");
  return response.data;
};

export const getAcabadoTableroById = async (id) => {
  const response = await api.get(`/acabado-tableros/${id}`);
  return response.data;
};

export const crearAcabadoTablero = async (datos) => {
  const response = await api.post("/acabado-tableros", datos);
  return response.data;
};

export const actualizarAcabadoTablero = async (id, datos) => {
  const response = await api.put(`/acabado-tableros/${id}`, datos);
  return response.data;
};

export const eliminarAcabadoTablero = async (id) => {
  const response = await api.delete(`/acabado-tableros/${id}`);
  return response.data;
};