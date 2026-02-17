import api from "./apl";

export const fetchAcabadoCubreCantos = async () => {
  const response = await api.get("/acabado-cubre-cantos");
  return response.data;
};

export const getAcabadoCubreCantoById = async (id) => {
  const response = await api.get(`/acabado-cubre-cantos/${id}`);
  return response.data;
};

export const crearAcabadoCubreCanto = async (datos) => {
  const response = await api.post("/acabado-cubre-cantos", datos);
  return response.data;
};

export const actualizarAcabadoCubreCanto = async (id, datos) => {
  const response = await api.put(`/acabado-cubre-cantos/${id}`, datos);
  return response.data;
};

export const eliminarAcabadoCubreCanto = async (id) => {
  const response = await api.delete(`/acabado-cubre-cantos/${id}`);
  return response.data;
};