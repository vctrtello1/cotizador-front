import { defineStore } from "pinia";
import { ref } from "vue"; 
import { fetchCotizaciones as fetchCotizacionesApi, getCotizacionById, actualizarCotizacion as actualizarCotizacionApi } from "../http/cotizaciones-api";


export const useCotizacionesStore = defineStore("cotizaciones", () => {
  const cotizaciones = ref([]);
  const cotizacionesLocales = ref([]);

  const fetchCotizaciones = async () => {
    try {
      const response = await fetchCotizacionesApi();
      console.log("Response from API:", response);
      
      // La respuesta debería ser { data: [...] }
      const data = Array.isArray(response) ? response : (response.data || response || []);
      console.log("Final data to store:", data);
      
      if (data.length > 0) {
        cotizaciones.value = data;
        // Limpiar locales que ya existan en el API
        cotizacionesLocales.value = cotizacionesLocales.value.filter(
          local => !data.some(api => api.id === local.id)
        );
      } else {
        // Si el API no devuelve nada, mantener las creadas localmente
        cotizaciones.value = [...cotizacionesLocales.value];
      }
    } catch (error) {
      console.error("⚠️ Error fetching cotizaciones:", error);
      cotizaciones.value = [...cotizacionesLocales.value];
    }
  };

  const agregarCotizacionLocal = (cotizacion) => {
    cotizacionesLocales.value.push(cotizacion);
    if (!cotizaciones.value.some(c => c.id === cotizacion.id)) {
      cotizaciones.value = [...cotizaciones.value, cotizacion];
    }
  };

  const eliminarCotizacionLocal = (id) => {
    cotizacionesLocales.value = cotizacionesLocales.value.filter(c => c.id !== id);
    cotizaciones.value = cotizaciones.value.filter(c => c.id !== id);
  };

  const updateCotizacion = async (id, datos) => {
    try {
      const response = await actualizarCotizacionApi(id, datos);
      const updated = response.data || response;
      const idx = cotizaciones.value.findIndex(c => c.id === id);
      if (idx !== -1) cotizaciones.value[idx] = { ...cotizaciones.value[idx], ...updated };
      return updated;
    } catch (error) {
      console.error('⚠️ Error actualizando cotización:', error);
      throw error;
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
    cotizacionesLocales,
    fetchCotizaciones,
    agregarCotizacionLocal,
    eliminarCotizacionLocal,
    fecthCotizacionById,
    updateCotizacion,
  };
});