import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchCorrederas as fetchCorrederasApi, 
  getCorrederaById,
  crearCorredera as crearCorrederaApi,
  actualizarCorredera as actualizarCorrederaApi,
  eliminarCorredera as eliminarCorrederaApi
} from "../http/capacidad-correderas.js";

export const useCapacidadCorrederasStore = defineStore("capacidad-correderas", () => {
  const capacidadCorrederas = ref([]);
  const loading = ref(false);

  const fetchCapacidadCorrederas = async () => {
    loading.value = true;
    try {
      const response = await fetchCorrederasApi();
      console.log("Response from API (capacidad-correderas):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final capacidad-correderas data:", data);
      
      capacidadCorrederas.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching capacidad-correderas:", error);
      capacidadCorrederas.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getCapacidadCorrederaById = async (id) => {
    try {
      const response = await getCorrederaById(id);
      console.log("Capacidad corredera fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching capacidad corredera by ID:", error);
      return null;
    }
  };

  const crearCapacidadCorredera = async (datos) => {
    loading.value = true;
    try {
      const response = await crearCorrederaApi(datos);
      console.log("Capacidad corredera creada:", response);
      await fetchCapacidadCorrederas(); // Recargar la lista
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error creando capacidad corredera:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const actualizarCapacidadCorredera = async (id, datos) => {
    loading.value = true;
    try {
      const response = await actualizarCorrederaApi(id, datos);
      console.log("Capacidad corredera actualizada:", response);
      await fetchCapacidadCorrederas(); // Recargar la lista
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error actualizando capacidad corredera:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const eliminarCapacidadCorredera = async (id) => {
    loading.value = true;
    try {
      const response = await eliminarCorrederaApi(id);
      console.log("Capacidad corredera eliminada:", response);
      await fetchCapacidadCorrederas(); // Recargar la lista
      return response;
    } catch (error) {
      console.error("⚠️ Error eliminando capacidad corredera:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    capacidadCorrederas,
    loading,
    fetchCapacidadCorrederas,
    getCapacidadCorrederaById,
    crearCapacidadCorredera,
    actualizarCapacidadCorredera,
    eliminarCapacidadCorredera,
  };
});
