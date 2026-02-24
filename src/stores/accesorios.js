import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchAccesorios as fetchApi,
  getAccesorioPorId as getByIdApi,
  crearAccesorio as crearApi,
  actualizarAccesorio as actualizarApi,
  eliminarAccesorio as eliminarApi,
} from "@/http/accesorios-api";

export const useAccesoriosStore = defineStore("accesorios", () => {
  const accesorios = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchAccesorios = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      accesorios.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando accesorios:", err);
      error.value = err.message || "Error al cargar accesorios";
      accesorios.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAccesorioPorId = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando accesorio ${id}:`, err);
      error.value = err.message || "Error al cargar accesorio";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearAccesorio = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchAccesorios();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando accesorio:", err);
      error.value = err.message || "Error al crear accesorio";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarAccesorio = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchAccesorios();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando accesorio ${id}:`, err);
      error.value = err.message || "Error al actualizar accesorio";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarAccesorio = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await eliminarApi(id);
      await fetchAccesorios();
    } catch (err) {
      console.error(`⚠️ Error eliminando accesorio ${id}:`, err);
      error.value = err.message || "Error al eliminar accesorio";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    accesorios,
    loading,
    error,
    fetchAccesorios,
    fetchAccesorioPorId,
    crearAccesorio,
    actualizarAccesorio,
    eliminarAccesorio,
  };
});
