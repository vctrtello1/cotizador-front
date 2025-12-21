import { defineStore } from "pinia";
import { ref } from "vue"; 
import { fetchCotizaciones as fetchCotizacionesApi, getCotizacionById } from "../http/cotizaciones-api";


export const useCotizacionesStore = defineStore("cotizaciones", () => {
  const cotizaciones = ref([]);

  const fetchCotizaciones = async () => {
    try {
      const response = await fetchCotizacionesApi();
      
      const data = Array.isArray(response) ? response : (response.data || []);
      cotizaciones.value = data;
      console.log("Cotizaciones fetched:", data);
    } catch (error) {
      console.warn("⚠️ Backend no disponible");
    }
  };

  const fecthCotizacionById = async (id) => {
    try {
      const response = await getCotizacionById(id);
      return response;
      console.log("Cotización fetched by ID:", response);
    } catch (error) {
      console.warn("⚠️ Error fetching cotización by ID:", error);
    }
  };

  return {
    cotizaciones,
    fetchCotizaciones,
    fecthCotizacionById,
  };
});