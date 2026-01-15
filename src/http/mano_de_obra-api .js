import api from "./apl";

export const fetchClientes = async () => {
  const response = await api.get("/mano-de-obras");
  return response.data;
};

export const getClienteById = async (id) => {
  const response = await api.get(`/mano-de-obras/${id}`);
  return response.data;
};

export const crearCliente = async (datos) => {
  const response = await api.post("/mano-de-obras", datos);
  return response.data;
};

export const actualizarManoDeObra = async (id, datos) => {
  const response = await api.put(`/mano-de-obras/${id}`, datos);
  return response.data;
};

export const eliminarManoDeObraAPI = async (id) => {
  const response = await api.delete(`/mano-de-obras/${id}`);
  return response.data;
};