import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchAcabadoTablerosPorComponente as fetchApi,
  getAcabadoTableroPorComponenteById as getByIdApi,
  crearAcabadoTableroPorComponente as crearApi,
  actualizarAcabadoTableroPorComponente as actualizarApi,
  eliminarAcabadoTableroPorComponente as eliminarApi,
} from "@/http/acabado-tablero-por-componente-api";

export const useAcabadoTableroPorComponenteStore = defineStore("acabado-tablero-por-componente", () => {
  const acabadoTablerosPorComponente = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchAcabadoTablerosPorComponente = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      acabadoTablerosPorComponente.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando acabado tableros por componente:", err);
      error.value = err.message || "Error al cargar acabado tableros por componente";
      acabadoTablerosPorComponente.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAcabadoTableroPorComponenteById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando acabado tablero por componente ${id}:`, err);
      error.value = err.message || "Error al cargar acabado tablero por componente";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearAcabadoTableroPorComponente = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchAcabadoTablerosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando acabado tablero por componente:", err);
      error.value = err.message || "Error al crear acabado tablero por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarAcabadoTableroPorComponente = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchAcabadoTablerosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando acabado tablero por componente ${id}:`, err);
      error.value = err.message || "Error al actualizar acabado tablero por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarAcabadoTableroPorComponente = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await eliminarApi(id);
      await fetchAcabadoTablerosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error eliminando acabado tablero por componente ${id}:`, err);
      error.value = err.message || "Error al eliminar acabado tablero por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    acabadoTablerosPorComponente,
    loading,
    error,
    fetchAcabadoTablerosPorComponente,
    fetchAcabadoTableroPorComponenteById,
    crearAcabadoTableroPorComponente,
    actualizarAcabadoTableroPorComponente,
    eliminarAcabadoTableroPorComponente,
  };
});
