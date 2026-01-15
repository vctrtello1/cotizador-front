<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <h1 class="form-title">Nuevo Acabado</h1>
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

        <!-- Formulario oculto - No se muestra -->
        <form @submit.prevent="guardarAcabado" class="form-content" style="display: none;">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { crearAcabado, fetchAcabados } from '@/http/acabado-api .js';

const router = useRouter();

// Estado
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: 'Descripción del acabado',
    tipo: 'Pintura',
    precio: 100.00,
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
        
        console.log('Guardando acabado:', datos);
        const response = await crearAcabado(datos);
        const acabadoId = response.data?.id || response.id;
        console.log('Acabado guardado:', response);
        console.log('ID del acabado:', acabadoId);
        
        exito.value = '✓ Acabado guardado exitosamente';
        router.push('/acabados');
    } catch (err) {
        console.error('Error guardando acabado:', err);
        error.value = err.response?.data?.message || 'Error al guardar el acabado';
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(async () => {
    console.log('NuevoAcabado mounted');
    
    // Cargar acabados existentes para generar nombre incremental
    let numeroAcabado = 1;
    try {
        const response = await fetchAcabados();
        const acabadosExistentes = Array.isArray(response) ? response : (response.data || []);
        // Contar acabados con nombre "Acabado Nuevo X" para obtener el siguiente número
        const acabadosNuevos = acabadosExistentes.filter(a => 
            a.nombre && a.nombre.startsWith('Acabado Nuevo')
        );
        numeroAcabado = acabadosNuevos.length + 1;
        console.log('Número de acabados nuevos existentes:', acabadosNuevos.length);
    } catch (err) {
        console.error('Error contando acabados existentes:', err);
    }
    
    // Actualizar nombres con número incremental
    formData.value.nombre = `Acabado Nuevo ${numeroAcabado}`;
    formData.value.codigo = `ACB_${numeroAcabado}_${Date.now().toString().slice(-4)}`;
    console.log('Nombre asignado:', formData.value.nombre);
    console.log('Código asignado:', formData.value.codigo);
    
    // Guardar automáticamente el acabado con datos por defecto
    await guardarAcabado();
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
