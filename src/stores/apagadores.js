import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchApagadores as fetchApi,
  getApagadorPorId as getByIdApi,
  crearApagador as crearApi,
  actualizarApagador as actualizarApi,
  eliminarApagador as eliminarApi,
} from "@/http/apagadores-api";

export const useApagadoresStore = defineStore("apagadores", () => {
  const apagadores = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchApagadores = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      apagadores.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando apagadores:", err);
      error.value = err.message || "Error al cargar apagadores";
      apagadores.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchApagadorPorId = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando apagador ${id}:`, err);
      error.value = err.message || "Error al cargar apagador";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearApagador = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchApagadores();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando apagador:", err);
      error.value = err.message || "Error al crear apagador";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarApagador = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchApagadores();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando apagador ${id}:`, err);
      error.value = err.message || "Error al actualizar apagador";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarApagador = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await eliminarApi(id);
      await fetchApagadores();
    } catch (err) {
      console.error(`⚠️ Error eliminando apagador ${id}:`, err);
      error.value = err.message || "Error al eliminar apagador";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    apagadores,
    loading,
    error,
    fetchApagadores,
    fetchApagadorPorId,
    crearApagador,
    actualizarApagador,
    eliminarApagador,
  };
});
