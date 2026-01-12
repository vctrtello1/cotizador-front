import { defineStore } from "pinia";
import { ref } from "vue"; 
import { fetchClientes as fetchClientesApi, getClienteById } from "../http/clientes-api";


export const useClientesStore = defineStore("clientes", () => {
  const clientes = ref([]);
  const loading = ref(false);

  const fetchClientes = async () => {
    loading.value = true;
    try {
      const response = await fetchClientesApi();
      console.log("Response from API (clientes):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final clientes data:", data);
      
      clientes.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching clientes:", error);
      clientes.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getClienteById = async (id) => {
    try {
      const response = await getClienteById(id);
      console.log("Cliente fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching cliente by ID:", error);
      return null;
    }
  };

  return {
    clientes,
    loading,
    fetchClientes,
    getClienteById,
  };
});
