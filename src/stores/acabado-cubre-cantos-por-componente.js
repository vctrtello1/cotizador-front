import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchAcabadoCubreCantosPorComponente as fetchApi,
  getAcabadoCubreCantosPorComponenteById as getByIdApi,
  crearAcabadoCubreCantoPorComponente as crearApi,
  actualizarAcabadoCubreCantoPorComponente as actualizarApi,
  eliminarAcabadoCubreCantoPorComponente as eliminarApi,
} from "@/http/acabado-cubre-cantos-por-componente-api";

export const useAcabadoCubreCantosPorComponenteStore = defineStore("acabado-cubre-cantos-por-componente", () => {
  const acabadoCubreCantosPorComponente = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchAcabadoCubreCantosPorComponente = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      acabadoCubreCantosPorComponente.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando acabado cubre cantos por componente:", err);
      error.value = err.message || "Error al cargar acabado cubre cantos por componente";
      acabadoCubreCantosPorComponente.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAcabadoCubreCantoPorComponenteById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando acabado cubre canto por componente ${id}:`, err);
      error.value = err.message || "Error al cargar acabado cubre canto por componente";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearAcabadoCubreCantoPorComponente = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchAcabadoCubreCantosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando acabado cubre canto por componente:", err);
      error.value = err.message || "Error al crear acabado cubre canto por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarAcabadoCubreCantoPorComponente = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchAcabadoCubreCantosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando acabado cubre canto por componente ${id}:`, err);
      error.value = err.message || "Error al actualizar acabado cubre canto por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarAcabadoCubreCantoPorComponente = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await eliminarApi(id);
      await fetchAcabadoCubreCantosPorComponente();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error eliminando acabado cubre canto por componente ${id}:`, err);
      error.value = err.message || "Error al eliminar acabado cubre canto por componente";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    acabadoCubreCantosPorComponente,
    loading,
    error,
    fetchAcabadoCubreCantosPorComponente,
    fetchAcabadoCubreCantoPorComponenteById,
    crearAcabadoCubreCantoPorComponente,
    actualizarAcabadoCubreCantoPorComponente,
    eliminarAcabadoCubreCantoPorComponente,
  };
});
