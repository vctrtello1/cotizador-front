import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchClientes as fetchManosDeObraApi, 
  getClienteById as getManosDeObraById,
  actualizarManoDeObra as actualizarManoDeObraApi
} from "../http/mano_de_obra-api .js";

export const useManosDeObraStore = defineStore("manosDeObra", () => {
  const manosDeObra = ref([]);
  const loading = ref(false);

  const fetchManosDeObra = async () => {
    loading.value = true;
    try {
      const response = await fetchManosDeObraApi();
      console.log("Response from API (mano-de-obra):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final mano-de-obra data:", data);
      
      manosDeObra.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching mano-de-obra:", error);
      manosDeObra.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getManosDeObraByIdStore = async (id) => {
    try {
      const response = await getManosDeObraById(id);
      console.log("Mano de obra fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching mano-de-obra by ID:", error);
      return null;
    }
  };

  const actualizarManoDeObra = async (id, datos) => {
    try {
      const response = await actualizarManoDeObraApi(id, datos);
      console.log("Mano de obra actualizada:", response);
      
      // Actualizar el estado local si es necesario
      const index = manosDeObra.value.findIndex(m => m.id === id);
      if (index !== -1) {
        manosDeObra.value[index] = { ...manosDeObra.value[index], ...datos };
      }
      
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error actualizando mano-de-obra:", error);
      throw error;
    }
  };

  return {
    manosDeObra,
    loading,
    fetchManosDeObra,
    getManosDeObraByIdStore,
    actualizarManoDeObra,
  };
});
