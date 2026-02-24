import api from "./apl";

export const fetchAccesorios = async () => {
  const response = await api.get("/accesorios");
  return response.data;
};

export const getAccesorioPorId = async (id) => {
  const response = await api.get(`/accesorios/${id}`);
  return response.data;
};

export const crearAccesorio = async (datos) => {
  const response = await api.post("/accesorios", datos);
  return response.data;
};

export const actualizarAccesorio = async (id, datos) => {
  const response = await api.put(`/accesorios/${id}`, datos);
  return response.data;
};

export const eliminarAccesorio = async (id) => {
  const response = await api.delete(`/accesorios/${id}`);
  return response.data;
};
