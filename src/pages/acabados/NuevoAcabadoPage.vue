<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <h1 class="form-title">{{ isEditing ? 'Editar Acabado' : 'Nuevo Acabado' }}</h1>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarAcabado" class="form-content">
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
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getAcabadoById, crearAcabado, actualizarAcabado } from '@/http/acabado-api .js';

const router = useRouter();
const route = useRoute();

// Estado
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    tipo: '',
    precio: '',
});

const errors = ref({});
const error = ref(null);
const guardando = ref(false);

// Computed
const isEditing = computed(() => !!route.params.id);

// Cargar acabado si es edición
const cargarAcabado = async () => {
    try {
        if (isEditing.value) {
            const response = await getAcabadoById(route.params.id);
            const data = response.data || response;
            formData.value = {
                nombre: data.nombre || '',
                codigo: data.codigo || '',
                descripcion: data.descripcion || '',
                tipo: data.tipo || '',
                precio: data.precio || '',
            };
        }
    } catch (err) {
        error.value = 'Error al cargar el acabado';
        console.error(err);
    }
};

// Validar formulario
const validar = () => {
    errors.value = {};
    
    if (!formData.value.nombre.trim()) {
        errors.value.nombre = 'El nombre es requerido';
    }
    
    if (formData.value.precio === '' || formData.value.precio <= 0) {
        errors.value.precio = 'El precio debe ser mayor a 0';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Guardar acabado
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
            precio: parseFloat(formData.value.precio),
        };
        
        if (isEditing.value) {
            // Editar acabado
            await actualizarAcabado(route.params.id, datos);
        } else {
            // Crear nuevo acabado
            await crearAcabado(datos);
        }
        
        router.push('/acabados');
    } catch (err) {
        error.value = 'Error al guardar el acabado';
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
</style>
