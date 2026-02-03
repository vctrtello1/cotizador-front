import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchEstructuras as fetchEstructurasApi, 
  getEstructuraById 
} from "../http/estructura-api.js";

export const useEstructuraStore = defineStore("estructura", () => {
  const estructuras = ref([]);
  const loading = ref(false);

  const fetchEstructuras = async () => {
    loading.value = true;
    try {
      const response = await fetchEstructurasApi();
      console.log("Response from API (estructuras):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final estructuras data:", data);
      
      estructuras.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching estructuras:", error);
      estructuras.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getEstructuraByIdStore = async (id) => {
    try {
      const response = await getEstructuraById(id);
      console.log("Estructura fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching estructura by ID:", error);
      return null;
    }
  };

  return {
    estructuras,
    loading,
    fetchEstructuras,
    getEstructuraByIdStore,
  };
});
