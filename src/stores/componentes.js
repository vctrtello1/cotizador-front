import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchComponentes as fetchComponentesApi, 
  getComponenteById 
} from "../http/componentes-api";

export const useComponentesStore = defineStore("componentes", () => {
  const componentes = ref([]);
  const loading = ref(false);

  const fetchComponentes = async () => {
    loading.value = true;
    try {
      const response = await fetchComponentesApi();
      console.log("Response from API (componentes):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final componentes data:", data);
      
      componentes.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching componentes:", error);
      componentes.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getComponenteByIdStore = async (id) => {
    try {
      const response = await getComponenteById(id);
      console.log("Componente fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching componente by ID:", error);
      return null;
    }
  };

  return {
    componentes,
    loading,
    fetchComponentes,
    getComponenteByIdStore,
  };
});
