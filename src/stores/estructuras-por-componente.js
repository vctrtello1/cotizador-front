import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchEstructurasPorComponente as fetchEstructurasPorComponenteApi,
  getEstructuraPorComponenteById as getEstructuraPorComponenteByIdApi,
  crearEstructuraPorComponente as crearEstructuraPorComponenteApi,
  actualizarEstructuraPorComponente as actualizarEstructuraPorComponenteApi,
  eliminarEstructuraPorComponente as eliminarEstructuraPorComponenteApi,
} from "@/http/estructuras-por-componente-api";

export const useEstructurasPorComponenteStore = defineStore("estructuras-por-componente", () => {
  const estructurasPorComponente = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchEstructurasPorComponente = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchEstructurasPorComponenteApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      estructurasPorComponente.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando estructuras por componente:", err);
      error.value = err.message || "Error al cargar estructuras por componente";
      estructurasPorComponente.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchEstructuraPorComponenteById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getEstructuraPorComponenteByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando estructura por componente ${id}:`, err);
      error.value = err.message || "Error al cargar estructura por componente";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearEstructuraPorComponente = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearEstructuraPorComponenteApi(datos);
      await fetchEstructurasPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando estructura por componente:", err);
      error.value = err.message || "Error al crear estructura por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarEstructuraPorComponente = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarEstructuraPorComponenteApi(id, datos);
      await fetchEstructurasPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando estructura por componente ${id}:`, err);
      error.value = err.message || "Error al actualizar estructura por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarEstructuraPorComponente = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await eliminarEstructuraPorComponenteApi(id);
      await fetchEstructurasPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error eliminando estructura por componente ${id}:`, err);
      error.value = err.message || "Error al eliminar estructura por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    estructurasPorComponente,
    loading,
    error,
    fetchEstructurasPorComponente,
    fetchEstructuraPorComponenteById,
    crearEstructuraPorComponente,
    actualizarEstructuraPorComponente,
    eliminarEstructuraPorComponente,
  };
});
