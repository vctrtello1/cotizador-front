import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchAccesoriosPorComponente as fetchApi,
  getAccesorioPorComponenteById as getByIdApi,
  crearAccesorioPorComponente as crearApi,
  actualizarAccesorioPorComponente as actualizarApi,
  eliminarAccesorioPorComponente as eliminarApi,
} from "@/http/accesorios-por-componente-api";

export const useAccesoriosPorComponenteStore = defineStore("accesorios-por-componente", () => {
  const accesoriosPorComponente = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchAccesoriosPorComponente = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      accesoriosPorComponente.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando accesorios por componente:", err);
      error.value = err.message || "Error al cargar accesorios por componente";
      accesoriosPorComponente.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAccesorioPorComponenteById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando accesorio por componente ${id}:`, err);
      error.value = err.message || "Error al cargar accesorio por componente";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearAccesorioPorComponente = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchAccesoriosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando accesorio por componente:", err);
      error.value = err.message || "Error al crear accesorio por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarAccesorioPorComponente = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchAccesoriosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando accesorio por componente ${id}:`, err);
      error.value = err.message || "Error al actualizar accesorio por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarAccesorioPorComponente = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await eliminarApi(id);
      await fetchAccesoriosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error eliminando accesorio por componente ${id}:`, err);
      error.value = err.message || "Error al eliminar accesorio por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    accesoriosPorComponente,
    loading,
    error,
    fetchAccesoriosPorComponente,
    fetchAccesorioPorComponenteById,
    crearAccesorioPorComponente,
    actualizarAccesorioPorComponente,
    eliminarAccesorioPorComponente,
  };
});
