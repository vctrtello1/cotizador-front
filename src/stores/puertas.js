import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchPuertas as fetchPuertasApi, 
  getPuertaById,
  crearPuerta as crearPuertaApi,
  actualizarPuerta as actualizarPuertaApi,
  eliminarPuerta as eliminarPuertaApi
} from "../http/puertas-api.js";

export const usePuertasStore = defineStore("puertas", () => {
  const puertas = ref([]);
  const loading = ref(false);

  const fetchPuertas = async () => {
    loading.value = true;
    try {
      const response = await fetchPuertasApi();
      console.log("Response from API (puertas):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final puertas data:", data);
      
      puertas.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching puertas:", error);
      puertas.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getPuertaByIdStore = async (id) => {
    try {
      const response = await getPuertaById(id);
      console.log("Puerta fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching puerta by ID:", error);
      return null;
    }
  };

  const crearPuerta = async (datos) => {
    loading.value = true;
    try {
      const response = await crearPuertaApi(datos);
      console.log("Puerta creada:", response);
      await fetchPuertas(); // Recargar la lista
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error creando puerta:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const actualizarPuerta = async (id, datos) => {
    loading.value = true;
    try {
      const response = await actualizarPuertaApi(id, datos);
      console.log("Puerta actualizada:", response);
      await fetchPuertas(); // Recargar la lista
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error actualizando puerta:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const eliminarPuerta = async (id) => {
    loading.value = true;
    try {
      const response = await eliminarPuertaApi(id);
      console.log("Puerta eliminada:", response);
      await fetchPuertas(); // Recargar la lista
      return response;
    } catch (error) {
      console.error("⚠️ Error eliminando puerta:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    puertas,
    loading,
    fetchPuertas,
    getPuertaByIdStore,
    crearPuerta,
    actualizarPuerta,
    eliminarPuerta,
  };
});
