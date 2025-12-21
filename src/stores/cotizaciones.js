import { defineStore } from "pinia";
import { ref } from "vue"; 
import { fetchCotizaciones as fetchCotizacionesApi } from "../http/cotizaciones";

const mockCotizaciones = [
  { 
    id: 1, 
    description: "Desarrollo de sitio web corporativo", 
    total: 1500.00, 
    fecha: "2023-10-26",
    cliente: { nombre: "Empresa ABC S.A." }
  },
  { 
    id: 2, 
    description: "Sistema de gestión de inventarios", 
    total: 2300.50, 
    fecha: "2023-10-27",
    cliente: { nombre: "Comercial XYZ" }
  },
  { 
    id: 3, 
    description: "Aplicación móvil para delivery", 
    total: 950.00, 
    fecha: "2023-10-28",
    cliente: { nombre: "RestaurantePlus" }
  },
  { 
    id: 4, 
    description: "Rediseño de marca y logo corporativo", 
    total: 1750.00, 
    fecha: "2023-10-29",
    cliente: { nombre: "Industrias López" }
  },
  { 
    id: 5, 
    description: "Consultoría en transformación digital", 
    total: 3200.00, 
    fecha: "2023-10-30",
    cliente: { nombre: "TechCorp Internacional" }
  },
  { 
    id: 6, 
    description: "Implementación de CRM personalizado", 
    total: 2850.75, 
    fecha: "2023-10-31",
    cliente: { nombre: "Grupo Empresarial Delta" }
  },
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