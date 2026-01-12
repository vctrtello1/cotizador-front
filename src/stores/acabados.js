import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchAcabados as fetchAcabadosApi, 
  getAcabadoById 
} from "../http/acabado-api .js";

export const useAcabadosStore = defineStore("acabados", () => {
  const acabados = ref([]);
  const loading = ref(false);

  const fetchAcabados = async () => {
    loading.value = true;
    try {
      const response = await fetchAcabadosApi();
      console.log("Response from API (acabados):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final acabados data:", data);
      
      acabados.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching acabados:", error);
      acabados.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getAcabadoByIdStore = async (id) => {
    try {
      const response = await getAcabadoById(id);
      console.log("Acabado fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching acabado by ID:", error);
      return null;
    }
  };

  return {
    acabados,
    loading,
    fetchAcabados,
    getAcabadoByIdStore,
  };
});
