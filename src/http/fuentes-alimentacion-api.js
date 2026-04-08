import api from "./apl";

export const fetchFuentesAlimentacion = async () => {
    const response = await api.get("/fuentes-de-alimentacion/");
  return response.data;
};

export const getFuenteAlimentacionPorId = async (id) => {
  const response = await api.get(`/fuentes-de-alimentacion/${id}`);
  return response.data;
};

export const crearFuenteAlimentacion = async (datos) => {
  const response = await api.post("/fuentes-de-alimentacion/", datos);
  return response.data;
};

export const actualizarFuenteAlimentacion = async (id, datos) => {
  const response = await api.put(`/fuentes-de-alimentacion/${id}`, datos);
  return response.data;
};

export const eliminarFuenteAlimentacion = async (id) => {
  const response = await api.delete(`/fuentes-de-alimentacion/${id}`);
  return response.data;
};
