<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <h1 class="form-title">🔲 Nuevo Perfil Aluminio</h1>
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

        <form @submit.prevent="guardarPerfilAluminio" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: PERFIL ALUMINIO LED"
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
import { usePerfilAluminioStore } from '@/stores/perfil-aluminio.js';

const router = useRouter();
const perfilAluminioStore = usePerfilAluminioStore();

// Estado
const formData = ref({
    nombre: '',
    precio: '',
    porcentaje_utilizacion: '',
});

const errors = ref({});
const error = ref(null);
const exito = ref(null);
const guardando = ref(false);

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

// Guardar perfil aluminio
const guardarPerfilAluminio = async () => {
    if (!validar()) return;

    try {
        guardando.value = true;
        error.value = null;

        const datos = {
            nombre: formData.value.nombre.toString().trim(),
            precio: parseFloat(formData.value.precio),
            porcentaje_utilizacion: parseFloat(formData.value.porcentaje_utilizacion),
        };

        console.log('Guardando perfil aluminio:', datos);

        await perfilAluminioStore.crearPerfilAluminio(datos);
        exito.value = 'Perfil de aluminio creado correctamente';

        setTimeout(() => {
            router.push('/perfil-aluminio');
        }, 1500);
    } catch (err) {
        error.value = 'Error al guardar el perfil de aluminio';
        console.error(err);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(async () => {
    let numeroPerfil = 1;
    try {
        await perfilAluminioStore.fetchPerfilAluminio();
        const perfilesExistentes = perfilAluminioStore.perfilAluminio;
        numeroPerfil = perfilesExistentes.length + 1;
    } catch (err) {
        console.error('Error contando perfiles existentes:', err);
    }

    formData.value.nombre = `PERFIL ALUMINIO ${numeroPerfil}`;
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
    border: 1px solid #ef9a9a;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.success-message {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
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
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #5a4037;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e8ddd0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #d4a574;
}

.error-text {
    display: block;
    margin-top: 0.25rem;
    color: #c62828;
    font-size: 0.875rem;
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
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89a6a 100%);
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
    background: #e0e0e0;
}

@media (max-width: 768px) {
    .form-container {
        padding: 1rem;
    }

    .form-content {
        padding: 1.5rem;
    }
}
</style>
