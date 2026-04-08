import api from "./apl";

export const fetchTirasLed = async () => {
  const response = await api.get("/tiras-led");
  return response.data;
};

export const getTiraLedPorId = async (id) => {
  const response = await api.get(`/tiras-led/${id}`);
  return response.data;
};

export const crearTiraLed = async (datos) => {
  const response = await api.post("/tiras-led", datos);
  return response.data;
};

export const actualizarTiraLed = async (id, datos) => {
  const response = await api.put(`/tiras-led/${id}`, datos);
  return response.data;
};

export const eliminarTiraLed = async (id) => {
  const response = await api.delete(`/tiras-led/${id}`);
  return response.data;
};
