<template>
    <div class="editar-fuente-container">
        <div class="page-header">
            <button class="btn-back" @click="$router.push('/fuentes-alimentacion')" title="Regresar">
                ← Regresar
            </button>
            <h1 class="page-title">✏️ Editar Fuente de Alimentación</h1>
        </div>

        <div v-if="loading && !formData.nombre" class="loading-message">Cargando fuente de alimentación...</div>
        <form v-else @submit.prevent="guardarFuente" class="fuente-form">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: FUENTE 1"
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
                <button type="button" @click="$router.push('/fuentes-alimentacion')" class="btn-secondary">
                    Cancelar
                </button>
                <button type="submit" class="btn-primary" :disabled="loading">
                    {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFuentesAlimentacionStore } from '@/stores/fuentes-alimentacion';

const router = useRouter();
const route = useRoute();
const fuentesStore = useFuentesAlimentacionStore();

// Estado
const formData = ref({
    nombre: '',
    precio: '',
    porcentaje_utilizacion: '',
});

const errors = ref({});
const loading = ref(false);

// Cargar fuente de alimentación
const cargarFuente = async () => {
    loading.value = true;
    try {
        const response = await fuentesStore.fetchFuentePorId(route.params.id);
        const data = response?.data || response;
        formData.value = {
            nombre: data.nombre || '',
            precio: data.precio || '',
            porcentaje_utilizacion: data.porcentaje_utilizacion || '',
        };
    } catch (error) {
        console.error('Error al cargar fuente de alimentación:', error);
        alert('Error al cargar la fuente de alimentación');
        router.push('/fuentes-alimentacion');
    } finally {
        loading.value = false;
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

    if (formData.value.porcentaje_utilizacion === '' || formData.value.porcentaje_utilizacion < 0 || formData.value.porcentaje_utilizacion > 100) {
        errors.value.porcentaje_utilizacion = 'El porcentaje de utilización es requerido y debe estar entre 0 y 100';
    }

    return Object.keys(errors.value).length === 0;
};

// Guardar cambios
const guardarFuente = async () => {
    if (!validar()) return;

    loading.value = true;
    try {
        const datos = {
            nombre: formData.value.nombre.toString().trim(),
            precio: parseFloat(formData.value.precio),
            porcentaje_utilizacion: parseFloat(formData.value.porcentaje_utilizacion),
        };

        await fuentesStore.actualizarFuente(route.params.id, datos);
        router.push('/fuentes-alimentacion');
    } catch (error) {
        console.error('Error al actualizar fuente de alimentación:', error);
        alert('Error al actualizar la fuente de alimentación');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    cargarFuente();
});
</script>

<style scoped>
.editar-fuente-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
}

.page-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
}

.btn-back {
    padding: 0.6rem 1.2rem;
    margin-bottom: 1rem;
    background: white;
    border: 2px solid #e8ddd0;
    border-radius: 8px;
    color: #5a4037;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-back:hover {
    border-color: #d4a574;
    background: #fafbfc;
    transform: translateX(-4px);
}

.page-title {
    font-size: 2rem;
    color: #5a4037;
    margin: 0;
    font-weight: 700;
}

.loading-message {
    text-align: center;
    padding: 3rem;
    color: #8b7355;
    font-size: 1.1rem;
}

.fuente-form {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    border: 2px solid #e8ddd0;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #5a4037;
    font-weight: 600;
    font-size: 0.95rem;
}

.form-group input {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid #e8ddd0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.error-text {
    display: block;
    color: #d32f2f;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid #e8ddd0;
}

.btn-secondary {
    padding: 0.75rem 1.5rem;
    background: #e8ddd0;
    border: none;
    border-radius: 8px;
    color: #5a4037;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background: #d4c5b3;
}

.btn-primary {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #d4a574 0%, #c89960 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
