import api from "./apl";

export const fetchCantidadPorHerraje = async () => {
  const response = await api.get("/cantidad-por-herrajes");
  return response.data;
};

export const getCantidadPorHerrajeId = async (herrajeId) => {
  const response = await api.get(`/cantidad-por-herrajes/herraje/${herrajeId}`);
  return response.data;
};

export const getCantidadPorHerrajeById = async (id) => {
  const response = await api.get(`/cantidad-por-herrajes/${id}`);
  return response.data;
};

export const crearCantidadPorHerraje = async (datos) => {
  const response = await api.post("/cantidad-por-herrajes", datos);
  return response.data;
};

export const actualizarCantidadPorHerraje = async (id, datos) => {
  const response = await api.put(`/cantidad-por-herrajes/${id}`, datos);
  return response.data;
};

export const eliminarCantidadPorHerraje = async (id) => {
  const response = await api.delete(`/cantidad-por-herrajes/${id}`);
  return response.data;
};