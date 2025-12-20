import { defineStore } from "pinia";
import { ref } from "vue"; 
import { fetchCotizaciones as fetchCotizacionesApi } from "../http/cotizaciones";

const mockCotizaciones = [
  { id: 1, description: "Cotización de prueba 1", amount: 1500.00, date: "2023-10-26" },
  { id: 2, description: "Cotización de prueba 2", amount: 2300.50, date: "2023-10-27" },
  { id: 3, description: "Cotización de prueba 3", amount: 950.00, date: "2023-10-28" },
];

export const useCotizacionesStore = defineStore("cotizaciones", () => {
  const cotizaciones = ref([]);
  const usingMockData = ref(false);

  const fetchCotizaciones = async () => {
    try {
      const response = await fetchCotizacionesApi();
      // Handle if response is wrapped in a data property or is the array directly
      const data = Array.isArray(response) ? response : (response.data || []);
      cotizaciones.value = data;
      usingMockData.value = false;
      console.log("Cotizaciones fetched:", data);
    } catch (error) {
      console.warn("⚠️ Backend no disponible, usando datos de prueba");
      cotizaciones.value = mockCotizaciones;
      usingMockData.value = true;
    }
  };

  return {
    cotizaciones,
    usingMockData,
    fetchCotizaciones,
  };
});