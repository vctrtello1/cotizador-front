import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchAcabados as fetchApi,
  getAcabadoById as getByIdApi,
  crearAcabado as crearApi,
  actualizarAcabado as actualizarApi,
  eliminarAcabado as eliminarApi,
} from "@/http/acabado-api";

export const useAcabadosStore = defineStore("acabados", () => {
  const acabados = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchAcabados = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      acabados.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando acabados:", err);
      error.value = err.message || "Error al cargar acabados";
      acabados.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAcabadoPorId = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando acabado ${id}:`, err);
      error.value = err.message || "Error al cargar acabado";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearAcabado = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchAcabados();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando acabado:", err);
      error.value = err.message || "Error al crear acabado";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarAcabado = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchAcabados();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando acabado ${id}:`, err);
      error.value = err.message || "Error al actualizar acabado";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarAcabado = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await eliminarApi(id);
      await fetchAcabados();
    } catch (err) {
      console.error(`⚠️ Error eliminando acabado ${id}:`, err);
      error.value = err.message || "Error al eliminar acabado";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    acabados,
    loading,
    error,
    fetchAcabados,
    fetchAcabadoPorId,
    crearAcabado,
    actualizarAcabado,
    eliminarAcabado,
  };
});
