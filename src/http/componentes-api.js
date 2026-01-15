import api from "./apl";

export const fetchComponentes = async () => {
  const response = await api.get("/componentes");
  return response.data;
};

export const getComponenteById = async (id) => {
  const response = await api.get(`/componentes/${id}`);
  return response.data;
};

export const crearComponente = async (datos) => {
  const response = await api.post("/componentes", datos);
  return response.data;
};

export const eliminarComponente = async (id) => {
  const response = await api.delete(`/componentes/${id}`);
  return response.data;
};