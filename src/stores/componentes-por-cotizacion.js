import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchComponentesPorCotizacion as fetchComponentesPorCotizacionApi,
  getComponentesPorCotizacionId,
  getComponentesPorCotizacionById,
  crearComponentesPorCotizacion as crearComponentesPorCotizacionApi,
  actualizarComponentesPorCotizacion as actualizarComponentesPorCotizacionApi,
  eliminarComponentesPorCotizacion as eliminarComponentesPorCotizacionApi
} from "../http/componentes_por_cotizacion-api";

export const useComponentesPorCotizacionStore = defineStore("componentes-por-cotizacion", () => {
  const componentesPorCotizacion = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Obtener todos los componentes por cotización
  const fetchComponentesPorCotizacion = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchComponentesPorCotizacionApi();
      console.log("Response from API (componentes por cotización):", response);
      
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final componentes por cotización data:", data);
      
      componentesPorCotizacion.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error fetching componentes por cotización:", err);
      error.value = err.message || "Error al cargar componentes por cotización";
      componentesPorCotizacion.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Obtener componentes por ID de cotización
  const fetchComponentesPorCotizacionIdStore = async (cotizacionId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getComponentesPorCotizacionId(cotizacionId);
      console.log(`Componentes por cotización ${cotizacionId}:`, response);
      
      const data = Array.isArray(response) ? response : (response.data || response || []);
      return data;
    } catch (err) {
      console.error(`⚠️ Error fetching componentes por cotización ${cotizacionId}:`, err);
      error.value = err.message || "Error al cargar componentes de la cotización";
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Obtener un componente por cotización por ID
  const fetchComponentePorCotizacionById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getComponentesPorCotizacionById(id);
      console.log(`Componente por cotización con ID ${id}:`, response);
      return response.data || response;
    } catch (err) {
      console.error(`⚠️ Error fetching componente por cotización ${id}:`, err);
      error.value = err.message || "Error al cargar el componente";
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Crear un nuevo componente por cotización
  const crearComponentePorCotizacion = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearComponentesPorCotizacionApi(datos);
      console.log("Componente por cotización creado:", response);
      
      // Recargar la lista después de crear
      await fetchComponentesPorCotizacion();
      
      return response.data || response;
    } catch (err) {
      console.error("⚠️ Error creando componente por cotización:", err);
      error.value = err.message || "Error al crear componente por cotización";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar un componente por cotización
  const actualizarComponentePorCotizacion = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarComponentesPorCotizacionApi(id, datos);
      console.log(`Componente por cotización ${id} actualizado:`, response);
      
      // Recargar la lista después de actualizar
      await fetchComponentesPorCotizacion();
      
      return response.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando componente por cotización ${id}:`, err);
      error.value = err.message || "Error al actualizar componente por cotización";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar un componente por cotización
  const eliminarComponentePorCotizacion = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await eliminarComponentesPorCotizacionApi(id);
      console.log(`Componente por cotización ${id} eliminado:`, response);
      
      // Recargar la lista después de eliminar
      await fetchComponentesPorCotizacion();
      
      return response.data || response;
    } catch (err) {
      console.error(`⚠️ Error eliminando componente por cotización ${id}:`, err);
      error.value = err.message || "Error al eliminar componente por cotización";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    componentesPorCotizacion,
    loading,
    error,
    
    // Actions
    fetchComponentesPorCotizacion,
    fetchComponentesPorCotizacionIdStore,
    fetchComponentePorCotizacionById,
    crearComponentePorCotizacion,
    actualizarComponentePorCotizacion,
    eliminarComponentePorCotizacion,
  };
});
