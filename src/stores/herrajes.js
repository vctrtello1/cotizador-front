import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchHerrajes, getHerrajeById } from '@/http/herrajes-api';

export const useHerrajes = defineStore('herrajes', () => {
    const herrajes = ref([]);
    const loading = ref(false);

    const fetchHerralesAction = async () => {
        loading.value = true;
        try {
            const response = await fetchHerrajes();
            console.log('Herrajes cargados desde store:', response);
            herrajes.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            console.error('Error cargando herrajes en store:', error);
            herrajes.value = [];
        } finally {
            loading.value = false;
        }
    };

    const getHerrajeByIdStore = async (id) => {
        try {
            const response = await getHerrajeById(id);
            console.log('Herraje cargado desde store:', response);
            return response;
        } catch (error) {
            console.error('Error cargando herraje en store:', error);
            throw error;
        }
    };

    return {
        herrajes,
        loading,
        fetchHerralesAction,
        getHerrajeByIdStore
    };
});
