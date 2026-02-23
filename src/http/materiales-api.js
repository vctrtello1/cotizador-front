export const fetchMateriales = async () => {
  return { data: [] };
};

export const getMaterialById = async (id) => {
  return null;
};

export const crearMaterial = async (datos) => {
  return {
    data: null,
    deprecated: true,
    message: "El dominio de materiales fue eliminado en backend.",
  };
};

export const actualizarMaterial = async (id, datos) => {
  return {
    data: null,
    deprecated: true,
    message: "El dominio de materiales fue eliminado en backend.",
  };
};

export const eliminarMaterial = async (id) => {
  return {
    success: true,
    deprecated: true,
    message: "El dominio de materiales fue eliminado en backend.",
  };
};
