<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <div class="header-content">
                <h1 class="form-title">🔘 Editar Apagador</h1>
                <p class="form-subtitle">Actualiza los detalles de este apagador</p>
            </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando apagador...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarApagador" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: APAGADOR"
                    required
                />
                <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
            </div>

            <div class="form-group">
                <label for="precio">Precio *</label>
                <input
                    v-model.number="formData.precio"
                    type="number"
                    id="precio"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                />
                <span v-if="errors.precio" class="error-text">{{ errors.precio }}</span>
            </div>

            <div class="form-group">
                <label for="unidades_por_metro">Unidades por Metro *</label>
                <input
                    v-model.number="formData.unidades_por_metro"
                    type="number"
                    id="unidades_por_metro"
                    min="0"
                    placeholder="0"
                    required
                />
                <span v-if="errors.unidades_por_metro" class="error-text">{{ errors.unidades_por_metro }}</span>
            </div>

            <div class="form-group">
                <label for="porcentaje_utilizacion">Porcentaje de Utilización *</label>
                <input
                    v-model.number="formData.porcentaje_utilizacion"
                    type="number"
                    id="porcentaje_utilizacion"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    required
                />
                <span v-if="errors.porcentaje_utilizacion" class="error-text">{{ errors.porcentaje_utilizacion }}</span>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" @click="$router.back()">
                    <span>✕ Cancelar</span>
                </button>
                <button type="submit" class="btn-primary" :disabled="guardando">
                    <span v-if="guardando">⏳ Guardando...</span>
                    <span v-else>✓ Guardar Cambios</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApagadoresStore } from '@/stores/apagadores.js';

const router = useRouter();
const route = useRoute();
const apagadoresStore = useApagadoresStore();

// Estado
const formData = ref({
    nombre: '',
    precio: '',
    unidades_por_metro: '',
    porcentaje_utilizacion: '',
});

const errors = ref({});
const error = ref(null);
const guardando = ref(false);
const cargando = ref(true);

// Cargar apagador
const cargarApagador = async () => {
    try {
        cargando.value = true;
        const response = await apagadoresStore.fetchApagadorPorId(route.params.id);
        const data = response?.data || response;
        formData.value = {
            nombre: data.nombre || '',
            precio: data.precio || '',
            unidades_por_metro: data.unidades_por_metro || '',
            porcentaje_utilizacion: data.porcentaje_utilizacion || '',
        };
    } catch (err) {
        error.value = 'Error al cargar el apagador';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Validar formulario
const validar = () => {
    errors.value = {};

    if (!formData.value.nombre || !formData.value.nombre.toString().trim()) {
        errors.value.nombre = 'El nombre es requerido';
    }

    if (formData.value.precio === '' || formData.value.precio < 0) {
        errors.value.precio = 'El precio es requerido y debe ser mayor o igual a 0';
    }

    if (formData.value.unidades_por_metro === '' || formData.value.unidades_por_metro < 0) {
        errors.value.unidades_por_metro = 'Las unidades por metro son requeridas y deben ser mayor o igual a 0';
    }

    if (formData.value.porcentaje_utilizacion === '' || formData.value.porcentaje_utilizacion < 0 || formData.value.porcentaje_utilizacion > 100) {
        errors.value.porcentaje_utilizacion = 'El porcentaje de utilización es requerido y debe estar entre 0 y 100';
    }

    return Object.keys(errors.value).length === 0;
};

// Guardar cambios
const guardarApagador = async () => {
    if (!validar()) return;

    try {
        guardando.value = true;
        error.value = null;

        const datos = {
            nombre: formData.value.nombre.toString().trim(),
            precio: parseFloat(formData.value.precio),
            unidades_por_metro: parseInt(formData.value.unidades_por_metro),
            porcentaje_utilizacion: parseFloat(formData.value.porcentaje_utilizacion),
        };

        console.log('Guardando cambios:', datos);

        await apagadoresStore.actualizarApagador(route.params.id, datos);
        router.push('/apagadores');
    } catch (err) {
        error.value = 'Error al guardar los cambios';
        console.error(err);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(() => {
    cargarApagador();
});
</script>

<style scoped>
.form-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    min-height: 100vh;
}

.form-header {
    margin-bottom: 2rem;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.form-subtitle {
    color: #8b7355;
    margin: 0;
}

.error-message {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: inherit;
}

.loading-state {
    text-align: center;
    padding: 3rem;
    color: #8b7355;
}

.form-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    border: 2px solid #e8ddd0;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #5a4037;
    margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e8ddd0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #d4a574;
}

.error-text {
    display: block;
    color: #c62828;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c99a63 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f5f5f5;
    color: #5a4037;
}

.btn-secondary:hover {
    background: #e8ddd0;
}
</style>
