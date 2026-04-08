import api from "./apl";

export const fetchTirasLed = async () => {
  const response = await api.get("/tira-leds/");
  return response.data;
};

export const getTiraLedPorId = async (id) => {
  const response = await api.get(`/tira-leds/${id}`);
  return response.data;
};

export const crearTiraLed = async (datos) => {
  const response = await api.post("/tira-leds/", datos);
  return response.data;
};

export const actualizarTiraLed = async (id, datos) => {
  const response = await api.put(`/tira-leds/${id}`, datos);
  return response.data;
};

export const eliminarTiraLed = async (id) => {
  const response = await api.delete(`/tira-leds/${id}`);
  return response.data;
};
