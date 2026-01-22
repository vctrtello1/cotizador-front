import api from "./apl";

export const fetchClientes = async () => {
  const response = await api.get("/clientes");
  return response.data;
};

export const getClienteById = async (id) => {
  const response = await api.get(`/clientes/${id}`);
  return response.data;
};

export const crearCliente = async (datos) => {
  const response = await api.post("/clientes", datos);
  return response.data;
};

export const actualizarCliente = async (id, datos) => {
  const response = await api.put(`/clientes/${id}`, datos);
  return response.data;
};