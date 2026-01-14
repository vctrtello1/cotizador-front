import api from "./apl";

export const fetchModulos = async () => {
  const response = await api.get("/modulos");
  return response.data;
};

export const getModuloById = async (id) => {
  const response = await api.get(`/modulos/${id}?include=componentes`);
  return response.data;
};

export const getComponentesByModulo = async (moduloId) => {
  const response = await api.get(`/modulos/${moduloId}/componentes`);
  return response.data;
};

export const agregarComponenteAModulo = async (moduloId, datos) => {
  const response = await api.post(`/modulos/${moduloId}/componentes`, datos);
  return response.data;
};

export const actualizarComponenteEnModulo = async (moduloId, componenteId, datos) => {
  const response = await api.put(`/modulos/${moduloId}/componentes/${componenteId}`, datos);
  return response.data;
};

export const eliminarComponenteDelModulo = async (moduloId, componenteId) => {
  const response = await api.delete(`/modulos/${moduloId}/componentes/${componenteId}`);
  return response.data;
};

export const crearModulo = async (datos) => {
  const response = await api.post("/modulos", datos);
  return response.data;
};

export const actualizarModulo = async (id, datos) => {
  const response = await api.put(`/modulos/${id}`, datos);
  return response.data;
};

export const eliminarModulo = async (id) => {
  const response = await api.delete(`/modulos/${id}`);
  return response.data;
};

export const fetchAcabados = async () => {
  const response = await api.get("/acabados");
  return response.data;
};

export const fetchManosDeObra = async () => {
  const response = await api.get("/mano-de-obras");
  return response.data;
};