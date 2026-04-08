import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchTirasLed as fetchApi,
  getTiraLedPorId as getByIdApi,
  crearTiraLed as crearApi,
  actualizarTiraLed as actualizarApi,
  eliminarTiraLed as eliminarApi,
} from "@/http/tiras-led-api";

export const useTirasLedStore = defineStore("tirasLed", () => {
  const tirasLed = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchTirasLed = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      tirasLed.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando tiras LED:", err);
      error.value = err.message || "Error al cargar tiras LED";
      tirasLed.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchTiraLedPorId = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando tira LED ${id}:`, err);
      error.value = err.message || "Error al cargar tira LED";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearTiraLed = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchTirasLed();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando tira LED:", err);
      error.value = err.message || "Error al crear tira LED";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarTiraLed = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchTirasLed();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando tira LED ${id}:`, err);
      error.value = err.message || "Error al actualizar tira LED";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarTiraLed = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await eliminarApi(id);
      await fetchTirasLed();
    } catch (err) {
      console.error(`⚠️ Error eliminando tira LED ${id}:`, err);
      error.value = err.message || "Error al eliminar tira LED";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    tirasLed,
    loading,
    error,
    fetchTirasLed,
    fetchTiraLedPorId,
    crearTiraLed,
    actualizarTiraLed,
    eliminarTiraLed,
  };
});
