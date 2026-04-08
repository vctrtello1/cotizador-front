import api from "./apl";

export const fetchConectores = async () => {
  const response = await api.get("/conectores/");
  return response.data;
};

export const getConectorPorId = async (id) => {
  const response = await api.get(`/conectores/${id}`);
  return response.data;
};

export const crearConector = async (datos) => {
  const response = await api.post("/conectores/", datos);
  return response.data;
};

export const actualizarConector = async (id, datos) => {
  const response = await api.put(`/conectores/${id}`, datos);
  return response.data;
};

export const eliminarConector = async (id) => {
  const response = await api.delete(`/conectores/${id}`);
  return response.data;
};
