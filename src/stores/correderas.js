import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchCorrederas as fetchCorrederasApi, 
  getCorrederaById,
  crearCorredera as crearCorrederaApi,
  actualizarCorredera as actualizarCorrederaApi,
  eliminarCorredera as eliminarCorrederaApi
} from "../http/acabado_correderas.js";

export const useCorrederasStore = defineStore("correderas", () => {
  const correderas = ref([]);
  const loading = ref(false);

  const fetchCorrederas = async () => {
    loading.value = true;
    try {
      const response = await fetchCorrederasApi();
      console.log("Response from API (correderas):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final correderas data:", data);
      
      correderas.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching correderas:", error);
      correderas.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getCorrederaByIdStore = async (id) => {
    try {
      const response = await getCorrederaById(id);
      console.log("Corredera fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching corredera by ID:", error);
      return null;
    }
  };

  const crearCorredera = async (datos) => {
    loading.value = true;
    try {
      const response = await crearCorrederaApi(datos);
      console.log("Corredera creada:", response);
      await fetchCorrederas(); // Recargar la lista
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error creando corredera:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const actualizarCorredera = async (id, datos) => {
    loading.value = true;
    try {
      const response = await actualizarCorrederaApi(id, datos);
      console.log("Corredera actualizada:", response);
      await fetchCorrederas(); // Recargar la lista
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error actualizando corredera:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const eliminarCorredera = async (id) => {
    loading.value = true;
    try {
      const response = await eliminarCorrederaApi(id);
      console.log("Corredera eliminada:", response);
      await fetchCorrederas(); // Recargar la lista
      return response;
    } catch (error) {
      console.error("⚠️ Error eliminando corredera:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    correderas,
    loading,
    fetchCorrederas,
    getCorrederaByIdStore,
    crearCorredera,
    actualizarCorredera,
    eliminarCorredera,
  };
});
