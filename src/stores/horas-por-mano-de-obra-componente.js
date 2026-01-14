import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
    fetchHorasDeManoDeObraPorComponentes, 
    getCantidadPorHerrajeId,
    getCantidadPorHerrajeById,
    crearCantidadPorHerraje 
} from '@/http/horas_por_mano_de_obra_por_componente-api';

export const useHorasPorManoDeObraComponente = defineStore('horas-por-mano-de-obra-componente', () => {
    const horasPorManoDeObraComponente = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchHorasPorManoDeObraComponenteAction = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await fetchHorasDeManoDeObraPorComponentes();
            console.log('📡 Respuesta bruta del API (horas):', response);
            console.log('   Tipo:', typeof response);
            console.log('   Es array:', Array.isArray(response));
            
            if (response.data && Array.isArray(response.data)) {
                horasPorManoDeObraComponente.value = response.data;
                console.log('✅ Usando response.data');
            } else if (Array.isArray(response)) {
                horasPorManoDeObraComponente.value = response;
                console.log('✅ Usando response directamente');
            } else {
                console.warn('⚠️ Respuesta no es un array ni tiene .data:', response);
                horasPorManoDeObraComponente.value = [];
            }
            
            console.log('✅ Horas por mano de obra en store:', horasPorManoDeObraComponente.value);
            console.log('   Total guardados:', horasPorManoDeObraComponente.value.length);
        } catch (err) {
            console.error('❌ Error cargando horas por mano de obra en store:', err);
            error.value = err.message || 'Error al cargar horas por mano de obra';
            horasPorManoDeObraComponente.value = [];
        } finally {
            loading.value = false;
        }
    };

    const getHorasPorManoDeObraByComponenteIdAction = async (componenteId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getCantidadPorHerrajeId(componenteId);
            console.log('📡 Respuesta API para horas por componente:', response);
            return response;
        } catch (err) {
            console.error('❌ Error cargando horas por mano de obra por componente:', err);
            error.value = err.message || 'Error al cargar horas';
            return null;
        } finally {
            loading.value = false;
        }
    };

    const getHorasPorManoDeObraByIdAction = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getCantidadPorHerrajeById(id);
            console.log('📡 Horas por mano de obra cargadas:', response);
            return response;
        } catch (err) {
            console.error('❌ Error cargando horas por mano de obra:', err);
            error.value = err.message || 'Error al cargar horas';
            return null;
        } finally {
            loading.value = false;
        }
    };

    const crearHorasPorManoDeObraAction = async (datos) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await crearCantidadPorHerraje(datos);
            console.log('✅ Horas por mano de obra creadas:', response);
            
            // Agregar a la lista local
            if (response.data) {
                horasPorManoDeObraComponente.value.push(response.data);
            }
            
            return response;
        } catch (err) {
            console.error('❌ Error creando horas por mano de obra:', err);
            error.value = err.message || 'Error al crear horas por mano de obra';
            return null;
        } finally {
            loading.value = false;
        }
    };

    return {
        horasPorManoDeObraComponente,
        loading,
        error,
        fetchHorasPorManoDeObraComponenteAction,
        getHorasPorManoDeObraByComponenteIdAction,
        getHorasPorManoDeObraByIdAction,
        crearHorasPorManoDeObraAction
    };
});
