import api from "./apl";

export const fetchModulos = async () => {
  const response = await api.get("/modulos");
  return response.data;
};

export const getModuloById = async (id) => {
  const response = await api.get(`/modulos/${id}`);
  return response.data;
};

export const getComponentesByModulo = async (moduloId) => {
  const response = await api.get(`/modulos/${moduloId}/componentes`);
  return response.data;
};

export const crearModulo = async (datos) => {
  const response = await api.post("/modulos", datos);
  return response.data;
};