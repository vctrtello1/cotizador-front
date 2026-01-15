import api from "./apl";

export const fetchTiposDeMaterial = async () => {
  const response = await api.get("/tipo-de-materiales");
  return response.data;
};

export const getTipoDeMaterialById = async (id) => {
  const response = await api.get(`/tipo-de-materiales/${id}`);
  return response.data;
};

export const crearTipoDeMaterial = async (datos) => {
  const response = await api.post("/tipo-de-materiales", datos);
  return response.data;
};

export const actualizarTipoDeMaterial = async (id, datos) => {
  const response = await api.put(`/tipo-de-materiales/${id}`, datos);
  return response.data;
};

export const eliminarTipoAPI = async (id) => {
  const response = await api.delete(`/tipo-de-materiales/${id}`);
  return response.data;
};