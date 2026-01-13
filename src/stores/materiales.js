import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchMateriales, getMaterialById } from '@/http/materiales-api';

export const useMateriales = defineStore('materiales', () => {
    const materiales = ref([]);
    const loading = ref(false);

    const fetchMaterialesAction = async () => {
        loading.value = true;
        try {
            const response = await fetchMateriales();
            console.log('Materiales cargados desde store:', response);
            materiales.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            console.error('Error cargando materiales en store:', error);
            materiales.value = [];
        } finally {
            loading.value = false;
        }
    };

    const getMaterialByIdStore = async (id) => {
        try {
            const response = await getMaterialById(id);
            console.log('Material cargado desde store:', response);
            return response;
        } catch (error) {
            console.error('Error cargando material en store:', error);
            throw error;
        }
    };

    return {
        materiales,
        loading,
        fetchMaterialesAction,
        getMaterialByIdStore
    };
});
