<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <h1 class="form-title">🚪 Nueva Puerta</h1>
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

        <form @submit.prevent="guardarPuerta" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: Puerta Cristal Standard"
                    required
                />
                <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="alto_maximo">Alto Máximo (m) *</label>
                    <input
                        v-model.number="formData.alto_maximo"
                        type="number"
                        id="alto_maximo"
                        step="0.01"
                        min="0"
                        placeholder="Ej: 2.40"
                        required
                    />
                    <span v-if="errors.alto_maximo" class="error-text">{{ errors.alto_maximo }}</span>
                </div>

                <div class="form-group">
                    <label for="ancho_maximo">Ancho Máximo (m) *</label>
                    <input
                        v-model.number="formData.ancho_maximo"
                        type="number"
                        id="ancho_maximo"
                        step="0.01"
                        min="0"
                        placeholder="Ej: 0.60"
                        required
                    />
                    <span v-if="errors.ancho_maximo" class="error-text">{{ errors.ancho_maximo }}</span>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="precio_perfil_aluminio">Precio Perfil Aluminio *</label>
                    <input
                        v-model.number="formData.precio_perfil_aluminio"
                        type="number"
                        id="precio_perfil_aluminio"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                    />
                    <span v-if="errors.precio_perfil_aluminio" class="error-text">{{ errors.precio_perfil_aluminio }}</span>
                </div>

                <div class="form-group">
                    <label for="precio_escuadras">Precio Escuadras *</label>
                    <input
                        v-model.number="formData.precio_escuadras"
                        type="number"
                        id="precio_escuadras"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                    />
                    <span v-if="errors.precio_escuadras" class="error-text">{{ errors.precio_escuadras }}</span>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="precio_silicon">Precio Silicon *</label>
                    <input
                        v-model.number="formData.precio_silicon"
                        type="number"
                        id="precio_silicon"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                    />
                    <span v-if="errors.precio_silicon" class="error-text">{{ errors.precio_silicon }}</span>
                </div>

                <div class="form-group">
                    <label for="precio_cristal_m2">Precio Cristal m² *</label>
                    <input
                        v-model.number="formData.precio_cristal_m2"
                        type="number"
                        id="precio_cristal_m2"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                    />
                    <span v-if="errors.precio_cristal_m2" class="error-text">{{ errors.precio_cristal_m2 }}</span>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" @click="$router.back()">
                    <span>✕ Cancelar</span>
                </button>
                <button type="submit" class="btn-primary" :disabled="guardando">
                    <span v-if="guardando">⏳ Guardando...</span>
                    <span v-else>✓ Guardar</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePuertasStore } from '@/stores/puertas.js';

const router = useRouter();
const puertasStore = usePuertasStore();

// Estado
const formData = ref({
    nombre: '',
    alto_maximo: '',
    ancho_maximo: '',
    precio_perfil_aluminio: '',
    precio_escuadras: '',
    precio_silicon: '',
    precio_cristal_m2: '',
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

    if (formData.value.alto_maximo === '' || formData.value.alto_maximo <= 0) {
        errors.value.alto_maximo = 'El alto máximo es requerido y debe ser mayor a 0';
    }

    if (formData.value.ancho_maximo === '' || formData.value.ancho_maximo <= 0) {
        errors.value.ancho_maximo = 'El ancho máximo es requerido y debe ser mayor a 0';
    }

    if (formData.value.precio_perfil_aluminio === '' || formData.value.precio_perfil_aluminio < 0) {
        errors.value.precio_perfil_aluminio = 'El precio es requerido y debe ser mayor o igual a 0';
    }

    if (formData.value.precio_escuadras === '' || formData.value.precio_escuadras < 0) {
        errors.value.precio_escuadras = 'El precio es requerido y debe ser mayor o igual a 0';
    }

    if (formData.value.precio_silicon === '' || formData.value.precio_silicon < 0) {
        errors.value.precio_silicon = 'El precio es requerido y debe ser mayor o igual a 0';
    }

    if (formData.value.precio_cristal_m2 === '' || formData.value.precio_cristal_m2 < 0) {
        errors.value.precio_cristal_m2 = 'El precio es requerido y debe ser mayor o igual a 0';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Guardar puerta
const guardarPuerta = async () => {
    if (!validar()) return;
    
    try {
        guardando.value = true;
        error.value = null;
        
        const datos = {
            nombre: formData.value.nombre.trim(),
            alto_maximo: parseFloat(formData.value.alto_maximo),
            ancho_maximo: parseFloat(formData.value.ancho_maximo),
            precio_perfil_aluminio: parseFloat(formData.value.precio_perfil_aluminio),
            precio_escuadras: parseFloat(formData.value.precio_escuadras),
            precio_silicon: parseFloat(formData.value.precio_silicon),
            precio_cristal_m2: parseFloat(formData.value.precio_cristal_m2),
        };
        
        console.log('Guardando puerta:', datos);
        
        await puertasStore.crearPuerta(datos);
        exito.value = 'Puerta creada correctamente';
        
        setTimeout(() => {
            router.push('/puertas');
        }, 1500);
    } catch (err) {
        error.value = 'Error al guardar la puerta';
        console.error(err);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(async () => {
    console.log('NuevaPuerta mounted');
    
    // Cargar puertas existentes para generar nombre incremental
    let numeroPuerta = 1;
    try {
        await puertasStore.fetchPuertas();
        const puertasExistentes = puertasStore.puertas;
        numeroPuerta = puertasExistentes.length + 1;
        console.log('Número total de puertas:', puertasExistentes.length);
    } catch (err) {
        console.error('Error contando puertas existentes:', err);
    }
    
    // Actualizar nombre con número incremental
    formData.value.nombre = `PUERTA ${numeroPuerta}`;
    console.log('Nombre asignado:', formData.value.nombre);
});
</script>

<style scoped>
.form-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
    min-height: 100vh;
}

.form-header {
    margin-bottom: 2rem;
}

.form-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.error-message {
    padding: 1rem 1.5rem;
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

.success-message {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #4caf50;
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
}

.form-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede6dd;
}

.form-group {
    margin-bottom: 1.5rem;
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
</style>
