import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchModulosPorCotizacion as fetchModulosPorCotizacionApi,
  getModulosPorCotizacionId,
  getModuloPorCotizacionById,
  crearModuloPorCotizacion as crearModuloPorCotizacionApi,
  actualizarModuloPorCotizacion as actualizarModuloPorCotizacionApi,
  eliminarModuloPorCotizacion as eliminarModuloPorCotizacionApi
} from "../http/modulos_por_cotizacion-api";

export const useModulosPorCotizacionStore = defineStore("modulos-por-cotizacion", () => {
  const modulosPorCotizacion = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Obtener todos los módulos por cotización
  const fetchModulosPorCotizacion = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchModulosPorCotizacionApi();
      console.log("Response from API (módulos por cotización):", response);
      
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final módulos por cotización data:", data);
      
      modulosPorCotizacion.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error fetching módulos por cotización:", err);
      error.value = err.message || "Error al cargar módulos por cotización";
      modulosPorCotizacion.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Obtener módulos por ID de cotización
  const fetchModulosPorCotizacionIdStore = async (cotizacionId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getModulosPorCotizacionId(cotizacionId);
      console.log(`Módulos por cotización ${cotizacionId}:`, response);
      
      const data = Array.isArray(response) ? response : (response.data || response || []);
      return data;
    } catch (err) {
      console.error(`⚠️ Error fetching módulos por cotización ${cotizacionId}:`, err);
      error.value = err.message || "Error al cargar módulos de la cotización";
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Obtener un módulo por cotización por ID
  const fetchModuloPorCotizacionById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getModuloPorCotizacionById(id);
      console.log(`Módulo por cotización con ID ${id}:`, response);
      return response.data || response;
    } catch (err) {
      console.error(`⚠️ Error fetching módulo por cotización ${id}:`, err);
      error.value = err.message || "Error al cargar el módulo";
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Crear un nuevo módulo por cotización
  const crearModuloPorCotizacion = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearModuloPorCotizacionApi(datos);
      console.log("Módulo por cotización creado:", response);
      
      // Recargar la lista después de crear
      await fetchModulosPorCotizacion();
      
      return response.data || response;
    } catch (err) {
      console.error("⚠️ Error creando módulo por cotización:", err);
      error.value = err.message || "Error al crear módulo por cotización";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar un módulo por cotización
  const actualizarModuloPorCotizacion = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarModuloPorCotizacionApi(id, datos);
      console.log(`Módulo por cotización ${id} actualizado:`, response);
      
      // Recargar la lista después de actualizar
      await fetchModulosPorCotizacion();
      
      return response.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando módulo por cotización ${id}:`, err);
      error.value = err.message || "Error al actualizar módulo por cotización";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar un módulo por cotización
  const eliminarModuloPorCotizacion = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await eliminarModuloPorCotizacionApi(id);
      console.log(`Módulo por cotización ${id} eliminado:`, response);
      
      // Recargar la lista después de eliminar
      await fetchModulosPorCotizacion();
      
      return response.data || response;
    } catch (err) {
      console.error(`⚠️ Error eliminando módulo por cotización ${id}:`, err);
      error.value = err.message || "Error al eliminar módulo por cotización";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    modulosPorCotizacion,
    loading,
    error,
    
    // Actions
    fetchModulosPorCotizacion,
    fetchModulosPorCotizacionIdStore,
    fetchModuloPorCotizacionById,
    crearModuloPorCotizacion,
    actualizarModuloPorCotizacion,
    eliminarModuloPorCotizacion,
  };
});
