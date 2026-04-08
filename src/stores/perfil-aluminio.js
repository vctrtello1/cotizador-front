import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchPerfilAluminio as fetchApi,
  getPerfilAluminioPorId as getByIdApi,
  crearPerfilAluminio as crearApi,
  actualizarPerfilAluminio as actualizarApi,
  eliminarPerfilAluminio as eliminarApi,
} from "@/http/perfil-aluminio-api";

export const usePerfilAluminioStore = defineStore("perfilAluminio", () => {
  const perfilAluminio = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchPerfilAluminio = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      perfilAluminio.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando perfil aluminio:", err);
      error.value = err.message || "Error al cargar perfil aluminio";
      perfilAluminio.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchPerfilAluminioPorId = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getByIdApi(id);
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error cargando perfil aluminio ${id}:`, err);
      error.value = err.message || "Error al cargar perfil aluminio";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const crearPerfilAluminio = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchPerfilAluminio();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando perfil aluminio:", err);
      error.value = err.message || "Error al crear perfil aluminio";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarPerfilAluminio = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchPerfilAluminio();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando perfil aluminio ${id}:`, err);
      error.value = err.message || "Error al actualizar perfil aluminio";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarPerfilAluminio = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await eliminarApi(id);
      await fetchPerfilAluminio();
    } catch (err) {
      console.error(`⚠️ Error eliminando perfil aluminio ${id}:`, err);
      error.value = err.message || "Error al eliminar perfil aluminio";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    perfilAluminio,
    loading,
    error,
    fetchPerfilAluminio,
    fetchPerfilAluminioPorId,
    crearPerfilAluminio,
    actualizarPerfilAluminio,
    eliminarPerfilAluminio,
  };
});
