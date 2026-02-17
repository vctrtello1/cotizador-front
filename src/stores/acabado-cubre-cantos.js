import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchAcabadoCubreCantos as fetchAcabadoCubreCantosApi,
  getAcabadoCubreCantoById,
  crearAcabadoCubreCanto,
  actualizarAcabadoCubreCanto,
  eliminarAcabadoCubreCanto,
} from "@/http/acabado_cubre-cantos-api.js";

export const useAcabadoCubreCantosStore = defineStore("acabado-cubre-cantos", () => {
  const acabadoCubreCantos = ref([]);
  const loading = ref(false);

  const fetchAcabadoCubreCantos = async () => {
    loading.value = true;
    try {
      const response = await fetchAcabadoCubreCantosApi();
      console.log("Acabado cubre cantos cargados desde store:", response);
      const data = Array.isArray(response) ? response : (response.data || response || []);
      acabadoCubreCantos.value = data;
      return data;
    } catch (error) {
      console.error("Error cargando acabado cubre cantos en store:", error);
      acabadoCubreCantos.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getAcabadoCubreCantoByIdStore = async (id) => {
    try {
      const response = await getAcabadoCubreCantoById(id);
      console.log("Acabado cubre canto cargado desde store:", response);
      return response?.data || response;
    } catch (error) {
      console.error("Error cargando acabado cubre canto en store:", error);
      throw error;
    }
  };

  const crearAcabadoCubreCantoStore = async (datos) => {
    try {
      const response = await crearAcabadoCubreCanto(datos);
      console.log("Acabado cubre canto creado:", response);
      await fetchAcabadoCubreCantos();
      return response;
    } catch (error) {
      console.error("Error creando acabado cubre canto en store:", error);
      throw error;
    }
  };

  const actualizarAcabadoCubreCantoStore = async (id, datos) => {
    try {
      const response = await actualizarAcabadoCubreCanto(id, datos);
      console.log("Acabado cubre canto actualizado:", response);
      await fetchAcabadoCubreCantos();
      return response;
    } catch (error) {
      console.error("Error actualizando acabado cubre canto en store:", error);
      throw error;
    }
  };

  const eliminarAcabadoCubreCantoStore = async (id) => {
    try {
      const response = await eliminarAcabadoCubreCanto(id);
      console.log("Acabado cubre canto eliminado:", response);
      await fetchAcabadoCubreCantos();
      return response;
    } catch (error) {
      console.error("Error eliminando acabado cubre canto en store:", error);
      throw error;
    }
  };

  return {
    acabadoCubreCantos,
    loading,
    fetchAcabadoCubreCantos,
    getAcabadoCubreCantoByIdStore,
    crearAcabadoCubreCantoStore,
    actualizarAcabadoCubreCantoStore,
    eliminarAcabadoCubreCantoStore,
  };
});
