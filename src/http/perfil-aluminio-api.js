import api from "./apl";

export const fetchPerfilAluminio = async () => {
  const response = await api.get("/perfiles-aluminio/");
  return response.data;
};

export const getPerfilAluminioPorId = async (id) => {
  const response = await api.get(`/perfiles-aluminio/${id}`);
  return response.data;
};

export const crearPerfilAluminio = async (datos) => {
  const response = await api.post("/perfiles-aluminio/", datos);
  return response.data;
};

export const actualizarPerfilAluminio = async (id, datos) => {
  const response = await api.put(`/perfiles-aluminio/${id}`, datos);
  return response.data;
};

export const eliminarPerfilAluminio = async (id) => {
  const response = await api.delete(`/perfiles-aluminio/${id}`);
  return response.data;
};
