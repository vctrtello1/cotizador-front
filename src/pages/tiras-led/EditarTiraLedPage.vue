<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <div class="header-content">
                <h1 class="form-title">✏️ Editar Tira LED</h1>
                <p class="form-subtitle">Actualiza los detalles de esta tira LED</p>
            </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando tira LED...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarTiraLed" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: Tira LED blanco cálido"
                    required
                />
                <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
            </div>

            <div class="form-group">
                <label for="codigo">Código *</label>
                <input
                    v-model="formData.codigo"
                    type="text"
                    id="codigo"
                    placeholder="Ej: TIRA_LED_001"
                    required
                />
                <span v-if="errors.codigo" class="error-text">{{ errors.codigo }}</span>
            </div>

            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea
                    v-model="formData.descripcion"
                    id="descripcion"
                    placeholder="Descripción de la tira LED..."
                    rows="3"
                ></textarea>
            </div>

            <div class="form-group">
                <label for="precio_unitario">Precio Unitario *</label>
                <input
                    v-model.number="formData.precio_unitario"
                    type="number"
                    id="precio_unitario"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                />
                <span v-if="errors.precio_unitario" class="error-text">{{ errors.precio_unitario }}</span>
            </div>

            <div class="form-group">
                <label for="unidades_por_metro">Unidades por Metro *</label>
                <input
                    v-model.number="formData.unidades_por_metro"
                    type="number"
                    id="unidades_por_metro"
                    min="1"
                    placeholder="1"
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
                    step="0.001"
                    min="0"
                    placeholder="0.000"
                    required
                />
                <span v-if="errors.porcentaje_utilizacion" class="error-text">{{ errors.porcentaje_utilizacion }}</span>
            </div>

            <div class="form-group">
                <label for="cantidad_compra">Cantidad de Compra *</label>
                <input
                    v-model.number="formData.cantidad_compra"
                    type="number"
                    id="cantidad_compra"
                    min="1"
                    placeholder="1"
                    required
                />
                <span v-if="errors.cantidad_compra" class="error-text">{{ errors.cantidad_compra }}</span>
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
import { useTirasLedStore } from '@/stores/tiras-led.js';

const router = useRouter();
const route = useRoute();
const tirasLedStore = useTirasLedStore();

// Estado
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    precio_unitario: '',
    unidades_por_metro: '',
    porcentaje_utilizacion: '',
    cantidad_compra: '',
});

const errors = ref({});
const error = ref(null);
const guardando = ref(false);
const cargando = ref(true);

// Cargar tira LED
const cargarTiraLed = async () => {
    try {
        cargando.value = true;
        const response = await tirasLedStore.fetchTiraLedPorId(route.params.id);
        const data = response?.data || response;
        formData.value = {
            nombre: data.nombre || '',
            codigo: data.codigo || '',
            descripcion: data.descripcion || '',
            precio_unitario: data.precio_unitario || '',
            unidades_por_metro: data.unidades_por_metro || '',
            porcentaje_utilizacion: data.porcentaje_utilizacion || '',
            cantidad_compra: data.cantidad_compra || '',
        };
    } catch (err) {
        error.value = 'Error al cargar la tira LED';
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

    if (!formData.value.codigo || !formData.value.codigo.toString().trim()) {
        errors.value.codigo = 'El código es requerido';
    }

    if (formData.value.precio_unitario === '' || formData.value.precio_unitario < 0) {
        errors.value.precio_unitario = 'El precio unitario es requerido y debe ser mayor o igual a 0';
    }

    if (formData.value.unidades_por_metro === '' || formData.value.unidades_por_metro < 1) {
        errors.value.unidades_por_metro = 'Las unidades por metro son requeridas y deben ser al menos 1';
    }

    if (formData.value.porcentaje_utilizacion === '' || formData.value.porcentaje_utilizacion < 0) {
        errors.value.porcentaje_utilizacion = 'El porcentaje de utilización es requerido';
    }

    if (formData.value.cantidad_compra === '' || formData.value.cantidad_compra < 1) {
        errors.value.cantidad_compra = 'La cantidad de compra es requerida y debe ser al menos 1';
    }

    return Object.keys(errors.value).length === 0;
};

// Guardar cambios
const guardarTiraLed = async () => {
    if (!validar()) return;

    try {
        guardando.value = true;
        error.value = null;

        const datos = {
            nombre: formData.value.nombre.toString().trim(),
            codigo: formData.value.codigo.toString().trim(),
            descripcion: formData.value.descripcion ? formData.value.descripcion.trim() : '',
            precio_unitario: parseFloat(formData.value.precio_unitario),
            unidades_por_metro: parseInt(formData.value.unidades_por_metro),
            porcentaje_utilizacion: parseFloat(formData.value.porcentaje_utilizacion),
            cantidad_compra: parseInt(formData.value.cantidad_compra),
        };

        console.log('Guardando cambios:', datos);

        await tirasLedStore.actualizarTiraLed(route.params.id, datos);
        router.push('/tiras-led');
    } catch (err) {
        error.value = 'Error al guardar los cambios';
        console.error(err);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(() => {
    cargarTiraLed();
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
    padding-bottom: 2rem;
    border-bottom: 2px solid #d4a574;
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
    font-size: 0.95rem;
    color: #8b7355;
    margin: 0;
    font-weight: 500;
}

.error-message {
    padding: 1.2rem 1.5rem;
    margin-bottom: 1.5rem;
    background-color: #ffebee;
    color: #c62828;
    border: 2px solid #ef5350;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
}

.error-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.4rem;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
}

.error-close:hover {
    opacity: 0.7;
}

.loading-state {
    text-align: center;
    padding: 4rem 2rem;
    background-color: white;
    border-radius: 12px;
    color: #999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-state p {
    font-size: 1.1rem;
    margin: 0;
    color: #8b7355;
}

.form-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede6dd;
}

.form-group {
    margin-bottom: 1.8rem;
}

.form-group:last-of-type {
    margin-bottom: 2.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: #5a4037;
    font-size: 0.95rem;
    letter-spacing: 0.4px;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #d4a574;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
    transition: all 0.3s;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    color: #5a4037;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
    color: #d4a574;
    opacity: 0.6;
}

.form-group input:hover,
.form-group textarea:hover {
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
    border-color: #c89564;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    background: white;
    border-color: #c89564;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

.error-text {
    display: block;
    color: #c62828;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
}

.btn-primary,
.btn-secondary {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.btn-primary {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(158, 158, 158, 0.2);
}

.btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(158, 158, 158, 0.3);
}
</style>
