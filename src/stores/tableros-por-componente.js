import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchModulosPorCotizacion as fetchTablerosPorComponenteApi,
  getModulosPorCotizacionId as getTablerosPorComponenteIdApi,
  getModuloPorCotizacionById as getTableroPorComponenteByIdApi,
  crearModuloPorCotizacion as crearTableroPorComponenteApi,
  actualizarModuloPorCotizacion as actualizarTableroPorComponenteApi,
  eliminarModuloPorCotizacion as eliminarTableroPorComponenteApi,
} from "@/http/tableros-por-componente-api";

export const useTablerosPorComponenteStore = defineStore("tableros-por-componente", () => {
  const tablerosPorComponente = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchTablerosPorComponente = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchTablerosPorComponenteApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      tablerosPorComponente.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando tableros por componente:", err);
      error.value = err.message || "Error al cargar tableros por componente";
      tablerosPorComponente.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchTablerosPorCotizacionIdStore = async (cotizacionId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getTablerosPorComponenteIdApi(cotizacionId);
      const data = Array.isArray(response) ? response : response?.data || [];
      return data;
    } catch (err) {
      console.error(`⚠️ Error cargando tableros de la cotización ${cotizacionId}:`, err);
      error.value = err.message || "Error al cargar tableros de la cotización";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchTableroPorComponenteById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getTableroPorComponenteByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando tablero por componente ${id}:`, err);
      error.value = err.message || "Error al cargar tablero por componente";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearTableroPorComponente = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearTableroPorComponenteApi(datos);
      await fetchTablerosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando tablero por componente:", err);
      error.value = err.message || "Error al crear tablero por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarTableroPorComponente = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarTableroPorComponenteApi(id, datos);
      await fetchTablerosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando tablero por componente ${id}:`, err);
      error.value = err.message || "Error al actualizar tablero por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarTableroPorComponente = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await eliminarTableroPorComponenteApi(id);
      await fetchTablerosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error eliminando tablero por componente ${id}:`, err);
      error.value = err.message || "Error al eliminar tablero por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    tablerosPorComponente,
    loading,
    error,
    fetchTablerosPorComponente,
    fetchTablerosPorCotizacionIdStore,
    fetchTableroPorComponenteById,
    crearTableroPorComponente,
    actualizarTableroPorComponente,
    eliminarTableroPorComponente,
  };
});
