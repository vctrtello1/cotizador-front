<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <div class="header-content">
                <h1 class="form-title">✏️ Editar Puerta</h1>
                <p class="form-subtitle">Actualiza los detalles de esta puerta</p>
            </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando puerta...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarPuerta" class="form-content">
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
                    <span v-else>✓ Guardar Cambios</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePuertasStore } from '@/stores/puertas.js';

const router = useRouter();
const route = useRoute();
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
const guardando = ref(false);
const cargando = ref(true);

// Cargar puerta
const cargarPuerta = async () => {
    try {
        cargando.value = true;
        const response = await puertasStore.getPuertaByIdStore(route.params.id);
        const data = response.data || response;
        formData.value = {
            nombre: data.nombre || '',
            alto_maximo: data.alto_maximo || '',
            ancho_maximo: data.ancho_maximo || '',
            precio_perfil_aluminio: data.precio_perfil_aluminio || '',
            precio_escuadras: data.precio_escuadras || '',
            precio_silicon: data.precio_silicon || '',
            precio_cristal_m2: data.precio_cristal_m2 || '',
        };
    } catch (err) {
        error.value = 'Error al cargar la puerta';
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

// Guardar cambios
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
        
        console.log('Guardando cambios:', datos);
        
        await puertasStore.actualizarPuerta(route.params.id, datos);
        router.push('/puertas');
    } catch (err) {
        error.value = 'Error al guardar los cambios';
        console.error(err);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(() => {
    cargarPuerta();
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
</style>
