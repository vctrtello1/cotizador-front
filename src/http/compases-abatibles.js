import api from "./apl";

export const fetchCompasesAbatibles = async () => {
  const response = await api.get("/compases-abatibles");
  return response.data;
};

export const getCompasAbatibleById = async (id) => {
  const response = await api.get(`/compases-abatibles/${id}`);
  return response.data;
};

export const crearCompasAbatible = async (datos) => {
  const response = await api.post("/compases-abatibles", datos);
  return response.data;
};

export const actualizarCompasAbatible = async (id, datos) => {
  const response = await api.put(`/compases-abatibles/${id}`, datos);
  return response.data;
};

export const eliminarCompasAbatible = async (id) => {
  const response = await api.delete(`/compases-abatibles/${id}`);
  return response.data;
};