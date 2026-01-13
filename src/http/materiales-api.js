import api from "./apl";

export const fetchMateriales = async () => {
  const response = await api.get("/materiales");
  return response.data;
};

export const getMaterialById = async (id) => {
  const response = await api.get(`/materiales/${id}`);
  // La API devuelve { data: { ...material } }, extraer solo el material
  return response.data.data || response.data;
};

export const crearMaterial = async (datos) => {
  const response = await api.post("/materiales", datos);
  return response.data;
};

export const actualizarMaterial = async (id, datos) => {
  const response = await api.put(`/materiales/${id}`, datos);
  return response.data;
};

export const eliminarMaterial = async (id) => {
  const response = await api.delete(`/materiales/${id}`);
  return response.data;
};
