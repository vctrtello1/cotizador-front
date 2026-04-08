import api from "./apl";

export const fetchApagadores = async () => {
  const response = await api.get("/apagadores/");
  return response.data;
};

export const getApagadorPorId = async (id) => {
  const response = await api.get(`/apagadores/${id}`);
  return response.data;
};

export const crearApagador = async (datos) => {
  const response = await api.post("/apagadores/", datos);
  return response.data;
};

export const actualizarApagador = async (id, datos) => {
  const response = await api.put(`/apagadores/${id}`, datos);
  return response.data;
};

export const eliminarApagador = async (id) => {
  const response = await api.delete(`/apagadores/${id}`);
  return response.data;
};
