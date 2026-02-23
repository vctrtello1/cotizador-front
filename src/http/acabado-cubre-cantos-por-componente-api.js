import api from "./apl";

export const fetchAcabadoCubreCantosPorComponente = async () => {
  const response = await api.get("/acabado-cubre-canto-por-componente");
  return response.data;
};

export const getAcabadoCubreCantosPorComponenteById = async (id) => {
  const response = await api.get(`/acabado-cubre-canto-por-componente/${id}`);
  return response.data;
};

export const crearAcabadoCubreCantoPorComponente = async (datos) => {
  const response = await api.post("/acabado-cubre-canto-por-componente", datos);
  return response.data;
};

export const actualizarAcabadoCubreCantoPorComponente = async (id, datos) => {
  const response = await api.put(`/acabado-cubre-canto-por-componente/${id}`, datos);
  return response.data;
};

export const eliminarAcabadoCubreCantoPorComponente = async (id) => {
  const response = await api.delete(`/acabado-cubre-canto-por-componente/${id}`);
  return response.data;
};
