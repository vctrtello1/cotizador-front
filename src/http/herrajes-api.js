import api from "./apl";

export const fetchHerrajes = async () => {
  const response = await api.get("/herrajes");
  return response.data;
};

export const getHerrajeById = async (id) => {
  const response = await api.get(`/herrajes/${id}`);
  return response.data;
};

export const crearHerraje = async (datos) => {
  const response = await api.post("/herrajes", datos);
  return response.data;
};
