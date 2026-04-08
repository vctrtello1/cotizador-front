import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
    fetchFuentesAlimentacion,
    getFuenteAlimentacionPorId,
    crearFuenteAlimentacion,
    actualizarFuenteAlimentacion,
    eliminarFuenteAlimentacion,
} from '@/http/fuentes-alimentacion-api';

export const useFuentesAlimentacionStore = defineStore('fuentesAlimentacion', () => {
    const fuentesAlimentacion = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchFuentes = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await fetchFuentesAlimentacion();
            fuentesAlimentacion.value = response?.data || response || [];
            console.log('⚡ Fuentes de alimentación cargadas:', fuentesAlimentacion.value);
        } catch (err) {
            error.value = err;
            console.warn('⚠️ Error cargando fuentes de alimentación:', err);
        } finally {
            loading.value = false;
        }
    };

    const fetchFuentePorId = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getFuenteAlimentacionPorId(id);
            return response?.data || response;
        } catch (err) {
            error.value = err;
            console.error('❌ Error cargando fuente de alimentación:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const crearFuente = async (datos) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await crearFuenteAlimentacion(datos);
            await fetchFuentes();
            return response;
        } catch (err) {
            error.value = err;
            console.error('❌ Error creando fuente de alimentación:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const actualizarFuente = async (id, datos) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await actualizarFuenteAlimentacion(id, datos);
            await fetchFuentes();
            return response;
        } catch (err) {
            error.value = err;
            console.error('❌ Error actualizando fuente de alimentación:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const eliminarFuente = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await eliminarFuenteAlimentacion(id);
            await fetchFuentes();
            return response;
        } catch (err) {
            error.value = err;
            console.error('❌ Error eliminando fuente de alimentación:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        fuentesAlimentacion,
        loading,
        error,
        fetchFuentes,
        fetchFuentePorId,
        crearFuente,
        actualizarFuente,
        eliminarFuente,
    };
});
