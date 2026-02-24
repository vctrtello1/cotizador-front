import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchPuertasPorComponente as fetchApi,
  getPuertaPorComponenteById as getByIdApi,
  crearPuertaPorComponente as crearApi,
  actualizarPuertaPorComponente as actualizarApi,
  eliminarPuertaPorComponente as eliminarApi,
} from "@/http/puertas-por-componente-api";

export const usePuertasPorComponenteStore = defineStore("puertas-por-componente", () => {
  const puertasPorComponente = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchPuertasPorComponente = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      puertasPorComponente.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando puertas por componente:", err);
      error.value = err.message || "Error al cargar puertas por componente";
      puertasPorComponente.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchPuertaPorComponenteById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando puerta por componente ${id}:`, err);
      error.value = err.message || "Error al cargar puerta por componente";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearPuertaPorComponente = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchPuertasPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando puerta por componente:", err);
      error.value = err.message || "Error al crear puerta por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarPuertaPorComponente = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchPuertasPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando puerta por componente ${id}:`, err);
      error.value = err.message || "Error al actualizar puerta por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarPuertaPorComponente = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await eliminarApi(id);
      await fetchPuertasPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error eliminando puerta por componente ${id}:`, err);
      error.value = err.message || "Error al eliminar puerta por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    puertasPorComponente,
    loading,
    error,
    fetchPuertasPorComponente,
    fetchPuertaPorComponenteById,
    crearPuertaPorComponente,
    actualizarPuertaPorComponente,
    eliminarPuertaPorComponente,
  };
});
