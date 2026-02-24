import api from "./apl";

export const fetchAccesoriosPorComponente = async () => {
  const response = await api.get("/accesorios-por-componente");
  return response.data;
};

export const getAccesorioPorComponenteById = async (id) => {
  const response = await api.get(`/accesorios-por-componente/${id}`);
  return response.data;
};

export const crearAccesorioPorComponente = async (datos) => {
  const response = await api.post("/accesorios-por-componente", datos);
  return response.data;
};

export const actualizarAccesorioPorComponente = async (id, datos) => {
  const response = await api.put(`/accesorios-por-componente/${id}`, datos);
  return response.data;
};

export const eliminarAccesorioPorComponente = async (id) => {
  const response = await api.delete(`/accesorios-por-componente/${id}`);
  return response.data;
};
