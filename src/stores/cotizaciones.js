import { defineStore } from "pinia";
import { ref } from "vue"; 
import { fetchCotizaciones as fetchCotizacionesApi, getCotizacionById } from "../http/cotizaciones-api";


export const useCotizacionesStore = defineStore("cotizaciones", () => {
  const cotizaciones = ref([]);

  const fetchCotizaciones = async () => {
    try {
      const response = await fetchCotizacionesApi();
      console.log("Response from API:", response);
      
      // La respuesta debería ser { data: [...] }
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final data to store:", data);
      
      cotizaciones.value = data;
    } catch (error) {
      console.error("⚠️ Error fetching cotizaciones:", error);
      cotizaciones.value = [];
    }
  };

  const fecthCotizacionById = async (id) => {
    try {
      const response = await getCotizacionById(id);
      console.log("Cotización fetched by ID:", response);
      // Si la respuesta viene envuelta en un objeto data, extrae el valor
      return response.data || response;
    } catch (error) {
      console.warn("⚠️ Error fetching cotización by ID:", error);
      return null;
    }
  };

  return {
    cotizaciones,
    fetchCotizaciones,
    fecthCotizacionById,
  };
});