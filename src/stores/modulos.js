import { defineStore } from "pinia";
import { ref } from "vue"; 
import { fetchModulos as fetchModulosApi, getModuloById } from "../http/modulos-api";


export const useModulosStore = defineStore("modulos", () => {
  const modulos = ref([]);
  const loading = ref(false);

  const fetchModulos = async () => {
    loading.value = true;
    try {
      const response = await fetchModulosApi();
      console.log("Response from API (modulos):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final modulos data:", data);
      
      modulos.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching modulos:", error);
      modulos.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getModuloById = async (id) => {
    try {
      const response = await getModuloById(id);
      console.log("Módulo fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching módulo by ID:", error);
      return null;
    }
  };

  return {
    modulos,
    loading,
    fetchModulos,
    getModuloById,
  };
});
