import { defineStore } from "pinia";
import { ref } from "vue"; 
import { fetchCotizaciones as fetchCotizacionesApi } from "../http/cotizaciones-api";


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

  return {
    cotizaciones,
    fetchCotizaciones,
  };
});