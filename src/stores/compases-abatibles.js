import { defineStore } from "pinia";
import { ref } from "vue"; 
import { 
  fetchCompasesAbatibles as fetchCompasesAbatiblesApi, 
  getCompasAbatibleById,
  crearCompasAbatible as crearCompasAbatibleApi,
  actualizarCompasAbatible as actualizarCompasAbatibleApi,
  eliminarCompasAbatible as eliminarCompasAbatibleApi
} from "../http/compases-abatibles.js";

export const useCompasesAbatiblesStore = defineStore("compasesAbatibles", () => {
  const compasesAbatibles = ref([]);
  const loading = ref(false);

  const fetchCompasesAbatibles = async () => {
    loading.value = true;
    try {
      const response = await fetchCompasesAbatiblesApi();
      console.log("Response from API (compases abatibles):", response);
      
      // La respuesta debería ser { data: [...] } o directamente [...]
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final compases abatibles data:", data);
      
      compasesAbatibles.value = data;
      return data;
    } catch (error) {
      console.error("⚠️ Error fetching compases abatibles:", error);
      compasesAbatibles.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getCompasAbatibleByIdStore = async (id) => {
    try {
      const response = await getCompasAbatibleById(id);
      console.log("Compas abatible fetched by ID:", response);
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching compas abatible by ID:", error);
      return null;
    }
  };

  const crearCompasAbatible = async (datos) => {
    loading.value = true;
    try {
      const response = await crearCompasAbatibleApi(datos);
      console.log("Compas abatible creado:", response);
      await fetchCompasesAbatibles(); // Recargar la lista
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error creando compas abatible:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const actualizarCompasAbatible = async (id, datos) => {
    loading.value = true;
    try {
      const response = await actualizarCompasAbatibleApi(id, datos);
      console.log("Compas abatible actualizado:", response);
      await fetchCompasesAbatibles(); // Recargar la lista
      return response.data || response;
    } catch (error) {
      console.error("⚠️ Error actualizando compas abatible:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const eliminarCompasAbatible = async (id) => {
    loading.value = true;
    try {
      const response = await eliminarCompasAbatibleApi(id);
      console.log("Compas abatible eliminado:", response);
      await fetchCompasesAbatibles(); // Recargar la lista
      return response;
    } catch (error) {
      console.error("⚠️ Error eliminando compas abatible:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    compasesAbatibles,
    loading,
    fetchCompasesAbatibles,
    getCompasAbatibleByIdStore,
    crearCompasAbatible,
    actualizarCompasAbatible,
    eliminarCompasAbatible,
  };
});
