<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <h1 class="form-title">🎚️ Nueva Corredera</h1>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Mensaje de éxito -->
        <div v-if="exito" class="success-message">
            <span>✓ {{ exito }}</span>
            <button @click="exito = null" class="error-close">✕</button>
        </div>

        <form @submit.prevent="guardarCorredera" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: CORREDERA TANDEM PARCIAL BLUMOTION 30kgs 350mm"
                    required
                />
                <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="capacidad_carga">Capacidad de Carga (kg) *</label>
                    <input
                        v-model.number="formData.capacidad_carga"
                        type="number"
                        id="capacidad_carga"
                        min="0"
                        placeholder="Ej: 30"
                        required
                    />
                    <span v-if="errors.capacidad_carga" class="error-text">{{ errors.capacidad_carga }}</span>
                </div>

                <div class="form-group">
                    <label for="tipo">Tipo *</label>
                    <select
                        v-model="formData.tipo"
                        id="tipo"
                        required
                    >
                        <option value="">Seleccionar tipo</option>
                        <option value="PARCIAL">Parcial</option>
                        <option value="TOTAL">Total</option>
                        <option value="TOTAL_TIP_ON">Total Tip-On</option>
                    </select>
                    <span v-if="errors.tipo" class="error-text">{{ errors.tipo }}</span>
                </div>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input
                        v-model="formData.incluye_varilla"
                        type="checkbox"
                        id="incluye_varilla"
                    />
                    <span>Incluye varilla</span>
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
                <button type="button" class="btn-secondary" @click="$router.back()">Cancelar</button>
                <button type="submit" class="btn-primary" :disabled="guardando">
                    {{ guardando ? 'Guardando...' : 'Guardar' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCorrederasStore } from '@/stores/correderas.js';

const router = useRouter();
const correderasStore = useCorrederasStore();

// Estado
const formData = ref({
    nombre: '',
    capacidad_carga: 30,
    tipo: '',
    incluye_varilla: false,
    precio_base: 0,
    precio_con_acoplamiento: 0,
});

const errors = ref({});
const error = ref(null);
const exito = ref(null);
const guardando = ref(false);

// Validar formulario
const validar = () => {
    errors.value = {};
    
    if (!formData.value.nombre.trim()) {
        errors.value.nombre = 'El nombre es requerido';
    }
    
    if (!formData.value.tipo) {
        errors.value.tipo = 'El tipo es requerido';
    }
    
    if (!formData.value.capacidad_carga || formData.value.capacidad_carga <= 0) {
        errors.value.capacidad_carga = 'La capacidad de carga debe ser mayor a 0';
    }
    
    if (formData.value.precio_base === '' || formData.value.precio_base < 0) {
        errors.value.precio_base = 'El precio base es requerido';
    }
    
    if (formData.value.precio_con_acoplamiento === '' || formData.value.precio_con_acoplamiento < 0) {
        errors.value.precio_con_acoplamiento = 'El precio con acoplamiento es requerido';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Guardar corredera
const guardarCorredera = async () => {
    if (!validar()) {
        console.log('Validación fallida, errores:', errors.value);
        return;
    }
    
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
        
        console.log('Guardando corredera:', datos);
        const response = await correderasStore.crearCorredera(datos);
        const correderaId = response?.data?.id || response?.id;

        if (!correderaId) {
            throw new Error('El servidor no devolvió un ID válido de la corredera');
        }

        console.log('Corredera guardada:', response);
        console.log('ID de la corredera:', correderaId);
        
        exito.value = '✓ Corredera guardada exitosamente';
        console.log('Redirigiendo a /editar-corredera/' + correderaId);
        
        // Redirigir después de un pequeño delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push(`/editar-corredera/${correderaId}`);
    } catch (err) {
        console.error('Error guardando corredera:', err);
        error.value = err.response?.data?.message || err.message || 'Error al guardar la corredera';
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(async () => {
    console.log('NuevaCorredera mounted');
    
    // Cargar correderas existentes para generar nombre incremental
    let numeroCorredera = 1;
    try {
        await correderasStore.fetchCorrederas();
        const correderasExistentes = correderasStore.correderas;
        numeroCorredera = correderasExistentes.length + 1;
        console.log('Número total de correderas:', correderasExistentes.length);
    } catch (err) {
        console.error('Error contando correderas existentes:', err);
    }
    
    // Actualizar nombre con número incremental
    formData.value.nombre = `CORREDERA ${numeroCorredera}`;
    console.log('Nombre asignado:', formData.value.nombre);
});
</script>

<style scoped>
.form-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
}

.form-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
}

.form-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.error-message {
    padding: 1rem;
    margin-bottom: 1.5rem;
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef5350;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.success-message {
    padding: 1rem;
    margin-bottom: 1.5rem;
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #66bb6a;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.2rem;
}

.form-content {
    background: white;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group:last-of-type {
    margin-bottom: 2rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
    font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
    box-sizing: border-box;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
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
    justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.3s;
    font-weight: 500;
}

.btn-primary {
    background-color: #4CAF50;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    opacity: 0.9;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: #9e9e9e;
    color: white;
}

.btn-secondary:hover {
    opacity: 0.9;
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
    font-weight: 500;
    color: #333;
}

.checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #4CAF50;
}

.checkbox-label span {
    font-size: 0.95rem;
}

.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
    box-sizing: border-box;
    transition: border-color 0.3s;
    cursor: pointer;
    background-color: white;
}

.form-group select:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}
</style>
