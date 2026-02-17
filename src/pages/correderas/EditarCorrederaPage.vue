<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <div class="header-content">
                <h1 class="form-title">✏️ Editar Corredera</h1>
                <p class="form-subtitle">Actualiza los detalles de esta corredera</p>
            </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando corredera...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarCorredera" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: CORREDERA TANDEM PARCIAL BLUMOTION"
                    required
                />
                <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
            </div>

            <div class="form-group">
                <label for="capacidad_carga">Capacidad de Carga (kg) *</label>
                <input
                    v-model.number="formData.capacidad_carga"
                    type="number"
                    id="capacidad_carga"
                    min="0"
                    step="1"
                    placeholder="Ej: 65"
                    required
                />
                <span v-if="errors.capacidad_carga" class="error-text">{{ errors.capacidad_carga }}</span>
            </div>

            <div class="form-group">
                <label for="tipo">Tipo *</label>
                <select v-model="formData.tipo" id="tipo" required>
                    <option value="">Selecciona un tipo</option>
                    <option value="PARCIAL">PARCIAL</option>
                    <option value="TOTAL">TOTAL</option>
                    <option value="TOTAL_TIP_ON">TOTAL TIP-ON</option>
                </select>
                <span v-if="errors.tipo" class="error-text">{{ errors.tipo }}</span>
            </div>

            <div class="form-group checkbox-group">
                <label class="checkbox-label">
                    <input
                        v-model="formData.incluye_varilla"
                        type="checkbox"
                    />
                    <span>Incluye Varilla</span>
                </label>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="precio_base">Precio Base *</label>
                    <input
                        v-model.number="formData.precio_base"
                        type="number"
                        id="precio_base"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                    />
                    <span v-if="errors.precio_base" class="error-text">{{ errors.precio_base }}</span>
                </div>

                <div class="form-group">
                    <label for="precio_con_acoplamiento">Precio con Acoplamiento *</label>
                    <input
                        v-model.number="formData.precio_con_acoplamiento"
                        type="number"
                        id="precio_con_acoplamiento"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                    />
                    <span v-if="errors.precio_con_acoplamiento" class="error-text">{{ errors.precio_con_acoplamiento }}</span>
                </div>
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
import { useCorrederasStore } from '@/stores/correderas.js';

const router = useRouter();
const route = useRoute();
const correderasStore = useCorrederasStore();

// Estado
const formData = ref({
    nombre: '',
    capacidad_carga: '',
    tipo: '',
    incluye_varilla: false,
    precio_base: '',
    precio_con_acoplamiento: '',
});

const errors = ref({});
const error = ref(null);
const guardando = ref(false);
const cargando = ref(true);

// Cargar corredera
const cargarCorredera = async () => {
    try {
        cargando.value = true;
        const response = await correderasStore.getCorrederaByIdStore(route.params.id);
        const data = response.data || response;
        formData.value = {
            nombre: data.nombre || '',
            capacidad_carga: data.capacidad_carga || '',
            tipo: data.tipo || '',
            incluye_varilla: data.incluye_varilla || false,
            precio_base: data.precio_base || '',
            precio_con_acoplamiento: data.precio_con_acoplamiento || '',
        };
    } catch (err) {
        error.value = 'Error al cargar la corredera';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Validar formulario
const validar = () => {
    errors.value = {};
    
    if (!formData.value.nombre.trim()) {
        errors.value.nombre = 'El nombre es requerido';
    }
    
    if (!formData.value.tipo) {
        errors.value.tipo = 'El tipo es requerido';
    }
    
    if (formData.value.capacidad_carga === '' || formData.value.capacidad_carga <= 0) {
        errors.value.capacidad_carga = 'La capacidad de carga debe ser mayor a 0';
    }
    
    if (formData.value.precio_base === '' || formData.value.precio_base < 0) {
        errors.value.precio_base = 'El precio base es requerido y debe ser mayor o igual a 0';
    }
    
    if (formData.value.precio_con_acoplamiento === '' || formData.value.precio_con_acoplamiento < 0) {
        errors.value.precio_con_acoplamiento = 'El precio con acoplamiento es requerido y debe ser mayor o igual a 0';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Guardar cambios
const guardarCorredera = async () => {
    if (!validar()) return;
    
    try {
        guardando.value = true;
        error.value = null;
        
        const datos = {
            nombre: formData.value.nombre.trim(),
            capacidad_carga: parseInt(formData.value.capacidad_carga),
            tipo: formData.value.tipo,
            incluye_varilla: formData.value.incluye_varilla,
            precio_base: parseFloat(formData.value.precio_base),
            precio_con_acoplamiento: parseFloat(formData.value.precio_con_acoplamiento),
        };
        
        console.log('Guardando cambios:', datos);
        
        await correderasStore.actualizarCorredera(route.params.id, datos);
        router.push('/correderas');
    } catch (err) {
        error.value = 'Error al guardar los cambios';
        console.error(err);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(() => {
    cargarCorredera();
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

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.checkbox-group {
    margin-bottom: 1.5rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-weight: 600;
    color: #5a4037;
}

.checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #d4a574;
}

.checkbox-label span {
    font-size: 0.95rem;
}

.form-group select {
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
    cursor: pointer;
}

.form-group select:hover {
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
    border-color: #c89564;
}

.form-group select:focus {
    outline: none;
    background: white;
    border-color: #c89564;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
}
</style>
