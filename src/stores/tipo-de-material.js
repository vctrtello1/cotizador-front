import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchTiposDeMaterial, getTipoDeMaterialById, crearTipoDeMaterial } from '@/http/tipo_de_material-api';

export const useTiposDeMaterial = defineStore('tiposDeMaterial', () => {
    const tiposDeMaterial = ref([]);
    const loading = ref(false);

    const fetchTiposDeMaterialAction = async () => {
        loading.value = true;
        try {
            const response = await fetchTiposDeMaterial();
            console.log('Tipos de material cargados desde store:', response);
            tiposDeMaterial.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            console.error('Error cargando tipos de material en store:', error);
            tiposDeMaterial.value = [];
        } finally {
            loading.value = false;
        }
    };

    const getTipoDeMaterialByIdStore = async (id) => {
        try {
            const response = await getTipoDeMaterialById(id);
            console.log('Tipo de material cargado desde store:', response);
            return response;
        } catch (error) {
            console.error('Error cargando tipo de material en store:', error);
            throw error;
        }
    };

    const crearTipoDeMaterialStore = async (datos) => {
        try {
            const response = await crearTipoDeMaterial(datos);
            console.log('Tipo de material creado:', response);
            // Recargar la lista después de crear
            await fetchTiposDeMaterialAction();
            return response;
        } catch (error) {
            console.error('Error creando tipo de material en store:', error);
            throw error;
        }
    };

    return {
        tiposDeMaterial,
        loading,
        fetchTiposDeMaterialAction,
        getTipoDeMaterialByIdStore,
        crearTipoDeMaterialStore
    };
});
