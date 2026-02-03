import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchAcabadoTableros as fetchAcabadoTablerosApi, 
  getAcabadoTableroById 
} from "../http/acabado_tablero-api.js";

export const useAcabadoTableroStore = defineStore("acabado-tablero", () => {
  const acabadoTableros = ref([]);
  const loading = ref(false);

  const fetchAcabadoTableros = async () => {
    loading.value = true;
    try {
      const response = await fetchAcabadoTablerosApi();
      console.log("Response from API (acabado tableros):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final acabado tableros data:", data);
      
      acabadoTableros.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching acabado tableros:", error);
      acabadoTableros.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getAcabadoTableroByIdStore = async (id) => {
    try {
      const response = await getAcabadoTableroById(id);
      console.log("Acabado tablero fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching acabado tablero by ID:", error);
      return null;
    }
  };

  return {
    acabadoTableros,
    loading,
    fetchAcabadoTableros,
    getAcabadoTableroByIdStore,
  };
});
