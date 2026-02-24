import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchUsuarios as fetchApi,
  getUsuarioPorId as getByIdApi,
  crearUsuario as crearApi,
  actualizarUsuario as actualizarApi,
  eliminarUsuario as eliminarApi,
} from "@/http/usuarios-api";

export const useUsuariosStore = defineStore("usuarios", () => {
  const usuarios = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchUsuarios = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetchApi();
      const data = Array.isArray(response) ? response : response?.data || [];
      usuarios.value = data;
      return data;
    } catch (err) {
      console.error("⚠️ Error cargando usuarios:", err);
      error.value = err.message || "Error al cargar usuarios";
      usuarios.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const crearUsuario = async (datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await crearApi(datos);
      await fetchUsuarios();
      return response?.data || response;
    } catch (err) {
      console.error("⚠️ Error creando usuario:", err);
      error.value = err.message || "Error al crear usuario";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarUsuario = async (id, datos) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await actualizarApi(id, datos);
      await fetchUsuarios();
      return response?.data || response;
    } catch (err) {
      console.error(`⚠️ Error actualizando usuario ${id}:`, err);
      error.value = err.message || "Error al actualizar usuario";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarUsuario = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await eliminarApi(id);
      await fetchUsuarios();
    } catch (err) {
      console.error(`⚠️ Error eliminando usuario ${id}:`, err);
      error.value = err.message || "Error al eliminar usuario";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    usuarios,
    loading,
    error,
    fetchUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
  };
});
