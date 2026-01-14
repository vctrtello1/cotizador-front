import api from "./apl";

export const fetchMaterialesPorComponente = async () => {
  const response = await api.get("/materiales-por-componente");
  return response.data;
};

export const getMaterialesPorComponenteId = async (componenteId) => {
  const response = await api.get(`/materiales-por-componente/componente/${componenteId}`);
  return response.data;
};

export const getMaterialPorComponenteById = async (id) => {
  const response = await api.get(`/materiales-por-componente/${id}`);
  return response.data;
};

export const crearMaterialPorComponente = async (datos) => {
  const response = await api.post("/materiales-por-componente", datos);
  return response.data;
};

export const actualizarMaterialPorComponente = async (id, datos) => {
  const response = await api.put(`/materiales-por-componente/${id}`, datos);
  return response.data;
};

export const eliminarMaterialPorComponente = async (id) => {
  const response = await api.delete(`/materiales-por-componente/${id}`);
  return response.data;
};