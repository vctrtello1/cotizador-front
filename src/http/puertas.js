import api from "./apl";

export const fetchPuertas = async () => {
  const response = await api.get("/puertas");
  return response.data;
};

export const getPuertaById = async (id) => {
  const response = await api.get(`/puertas/${id}`);
  return response.data;
};

export const crearPuerta = async (datos) => {
  const response = await api.post("/puertas", datos);
  return response.data;
};

export const actualizarPuerta = async (id, datos) => {
  const response = await api.put(`/puertas/${id}`, datos);
  return response.data;
};

export const eliminarPuerta = async (id) => {
  const response = await api.delete(`/puertas/${id}`);
  return response.data;
};
