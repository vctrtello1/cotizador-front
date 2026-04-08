import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
    fetchConectores,
    getConectorPorId,
    crearConector,
    actualizarConector,
    eliminarConector,
} from '@/http/conectores-api';

export const useConectoresStore = defineStore('conectores', () => {
    const conectores = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchConectoresData = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await fetchConectores();
            conectores.value = response?.data || response || [];
            console.log('🔌 Conectores cargados:', conectores.value);
        } catch (err) {
            error.value = err;
            console.warn('⚠️ Error cargando conectores:', err);
        } finally {
            loading.value = false;
        }
    };

    const fetchConectorPorId = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getConectorPorId(id);
            return response?.data || response;
        } catch (err) {
            error.value = err;
            console.error('❌ Error cargando conector:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const crearConectorNuevo = async (datos) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await crearConector(datos);
            await fetchConectoresData();
            return response;
        } catch (err) {
            error.value = err;
            console.error('❌ Error creando conector:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const actualizarConectorExistente = async (id, datos) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await actualizarConector(id, datos);
            await fetchConectoresData();
            return response;
        } catch (err) {
            error.value = err;
            console.error('❌ Error actualizando conector:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const eliminarConectorExistente = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await eliminarConector(id);
            await fetchConectoresData();
            return response;
        } catch (err) {
            error.value = err;
            console.error('❌ Error eliminando conector:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        conectores,
        loading,
        error,
        fetchConectoresData,
        fetchConectorPorId,
        crearConectorNuevo,
        actualizarConectorExistente,
        eliminarConectorExistente,
    };
});
