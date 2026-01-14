<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <h1 class="form-title">Editar Acabado</h1>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando acabado...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarAcabado" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: Pintura mate"
                    required
                />
                <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
            </div>

            <div class="form-group">
                <label for="codigo">Código</label>
                <input
                    v-model="formData.codigo"
                    type="text"
                    id="codigo"
                    placeholder="Ej: ACB-001"
                />
            </div>

            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea
                    v-model="formData.descripcion"
                    id="descripcion"
                    placeholder="Descripción detallada del acabado"
                    rows="4"
                ></textarea>
            </div>

            <div class="form-group">
                <label for="tipo">Tipo</label>
                <input
                    v-model="formData.tipo"
                    type="text"
                    id="tipo"
                    placeholder="Ej: Pintura, Lacado, Vitrificado"
                />
            </div>

            <div class="form-group">
                <label for="costo">Costo *</label>
                <input
                    v-model.number="formData.costo"
                    type="number"
                    id="costo"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                />
                <span v-if="errors.costo" class="error-text">{{ errors.costo }}</span>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" @click="$router.back()">Cancelar</button>
                <button type="submit" class="btn-primary" :disabled="guardando">
                    {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getAcabadoById, actualizarAcabado } from '@/http/acabado-api .js';

const router = useRouter();
const route = useRoute();

// Estado
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    tipo: '',
    costo: '',
});

const errors = ref({});
const error = ref(null);
const guardando = ref(false);
const cargando = ref(true);

// Cargar acabado
const cargarAcabado = async () => {
    try {
        cargando.value = true;
        const response = await getAcabadoById(route.params.id);
        const data = response.data || response;
        formData.value = {
            nombre: data.nombre || '',
            codigo: data.codigo || '',
            descripcion: data.descripcion || '',
            tipo: data.tipo || '',
            costo: data.costo || '',
        };
    } catch (err) {
        error.value = 'Error al cargar el acabado';
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
    
    if (formData.value.costo === '' || formData.value.costo <= 0) {
        errors.value.costo = 'El costo debe ser mayor a 0';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Guardar cambios
const guardarAcabado = async () => {
    if (!validar()) return;
    
    try {
        guardando.value = true;
        error.value = null;
        
        const datos = {
            nombre: formData.value.nombre.trim(),
            codigo: formData.value.codigo.trim(),
            descripcion: formData.value.descripcion.trim(),
            tipo: formData.value.tipo.trim(),
            costo: parseFloat(formData.value.costo),
        };
        
        // TODO: Implementar actualización en la API
        console.log('Guardando cambios:', datos);
        
        await actualizarAcabado(route.params.id, datos);
        router.push('/acabados');
    } catch (err) {
        error.value = 'Error al guardar los cambios';
        console.error(err);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(() => {
    cargarAcabado();
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

.error-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.2rem;
}

.loading-state {
    text-align: center;
    padding: 3rem 2rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    color: #666;
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
</style>
