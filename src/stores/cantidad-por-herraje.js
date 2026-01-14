import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
    fetchCantidadPorHerraje, 
    getCantidadPorHerrajeId,
    getCantidadPorHerrajeById,
    crearCantidadPorHerraje 
} from '@/http/cantidad_por_herraje-api';

export const useCantidadPorHerraje = defineStore('cantidad-por-herraje', () => {
    const cantidadPorHerraje = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchCantidadPorHerrajeAction = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await fetchCantidadPorHerraje();
            console.log('📡 Respuesta bruta del API:', response);
            console.log('   Tipo:', typeof response);
            console.log('   Es array:', Array.isArray(response));
            
            if (response.data && Array.isArray(response.data)) {
                cantidadPorHerraje.value = response.data;
                console.log('✅ Usando response.data');
            } else if (Array.isArray(response)) {
                cantidadPorHerraje.value = response;
                console.log('✅ Usando response directamente');
            } else {
                console.warn('⚠️ Respuesta no es un array ni tiene .data:', response);
                cantidadPorHerraje.value = [];
            }
            
            console.log('✅ Cantidad por herraje en store:', cantidadPorHerraje.value);
            console.log('   Total guardados:', cantidadPorHerraje.value.length);
        } catch (err) {
            console.error('❌ Error cargando cantidad por herraje en store:', err);
            error.value = err.message || 'Error al cargar cantidad por herraje';
            cantidadPorHerraje.value = [];
        } finally {
            loading.value = false;
        }
    };

    const getCantidadPorHerrajeByIdAction = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getCantidadPorHerrajeById(id);
            console.log('Material por herraje cargado desde store:', response);
            return response;
        } catch (err) {
            console.error('Error cargando cantidad por herraje en store:', err);
            error.value = err.message || 'Error al cargar cantidad por herraje';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    const crearCantidadPorHerrajeAction = async (datos) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await crearCantidadPorHerraje(datos);
            console.log('Cantidad por herraje creada:', response);
            if (Array.isArray(cantidadPorHerraje.value)) {
                cantidadPorHerraje.value.push(response);
            }
            return response;
        } catch (err) {
            console.error('Error creando cantidad por herraje en store:', err);
            error.value = err.message || 'Error al crear cantidad por herraje';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    const getCantidadPorComponente = (componenteId) => {
        return cantidadPorHerraje.value.filter(
            herraje => herraje.componente_id === componenteId
        );
    };

    const getCantidadHerrajesPorComponente = (componenteId) => {
        return getCantidadPorComponente(componenteId).length;
    };

    return {
        cantidadPorHerraje,
        loading,
        error,
        fetchCantidadPorHerrajeAction,
        getCantidadPorHerrajeByIdAction,
        crearCantidadPorHerrajeAction,
        getCantidadPorComponente,
        getCantidadHerrajesPorComponente
    };
});
