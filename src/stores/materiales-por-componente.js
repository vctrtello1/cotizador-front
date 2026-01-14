import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
    fetchMaterialesPorComponente, 
    getMaterialesPorComponenteId,
    getMaterialPorComponenteById,
    crearMaterialPorComponente 
} from '@/http/materiales_por_componente-api';

export const useMaterialesPorComponente = defineStore('materiales-por-componente', () => {
    const materialesPorComponente = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchMaterialesPorComponenteAction = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await fetchMaterialesPorComponente();
            console.log('📡 Respuesta bruta del API:', response);
            console.log('   Tipo:', typeof response);
            console.log('   Es array:', Array.isArray(response));
            
            if (response.data && Array.isArray(response.data)) {
                materialesPorComponente.value = response.data;
                console.log('✅ Usando response.data');
            } else if (Array.isArray(response)) {
                materialesPorComponente.value = response;
                console.log('✅ Usando response directamente');
            } else {
                console.warn('⚠️ Respuesta no es un array ni tiene .data:', response);
                materialesPorComponente.value = [];
            }
            
            console.log('✅ Materiales por componente en store:', materialesPorComponente.value);
            console.log('   Total guardados:', materialesPorComponente.value.length);
        } catch (err) {
            console.error('❌ Error cargando materiales por componente en store:', err);
            error.value = err.message || 'Error al cargar materiales por componente';
            materialesPorComponente.value = [];
        } finally {
            loading.value = false;
        }
    };

    const getMaterialPorComponenteByIdAction = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getMaterialPorComponenteById(id);
            console.log('Material por componente cargado desde store:', response);
            return response;
        } catch (err) {
            console.error('Error cargando material por componente en store:', err);
            error.value = err.message || 'Error al cargar material por componente';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    const crearMaterialPorComponenteAction = async (datos) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await crearMaterialPorComponente(datos);
            console.log('Material por componente creado:', response);
            if (Array.isArray(materialesPorComponente.value)) {
                materialesPorComponente.value.push(response);
            }
            return response;
        } catch (err) {
            console.error('Error creando material por componente en store:', err);
            error.value = err.message || 'Error al crear material por componente';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    const getMaterialesPorComponente = (componenteId) => {
        return materialesPorComponente.value.filter(
            material => material.componente_id === componenteId
        );
    };

    const getCantidadMaterialesPorComponente = (componenteId) => {
        return getMaterialesPorComponente(componenteId).length;
    };

    return {
        materialesPorComponente,
        loading,
        error,
        fetchMaterialesPorComponenteAction,
        getMaterialPorComponenteByIdAction,
        crearMaterialPorComponenteAction,
        getMaterialesPorComponente,
        getCantidadMaterialesPorComponente
    };
});
