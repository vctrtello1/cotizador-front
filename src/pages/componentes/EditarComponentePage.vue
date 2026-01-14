<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <div class="header-content">
                <h1 class="form-title">✏️ Editar Componente</h1>
                <p class="form-subtitle">Actualiza los detalles de este componente</p>
            </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando componente...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarComponente" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: Tablero MDF"
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
                    placeholder="Ej: TAB_MDF_001"
                />
            </div>

            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea
                    v-model="formData.descripcion"
                    id="descripcion"
                    placeholder="Descripción detallada del componente"
                    rows="4"
                ></textarea>
            </div>

            <div class="form-group">
                <label for="costo_unitario">Costo Unitario *</label>
                <input
                    v-model.number="formData.costo_unitario"
                    type="number"
                    id="costo_unitario"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                />
                <span v-if="errors.costo_unitario" class="error-text">{{ errors.costo_unitario }}</span>
            </div>

            <!-- Sección de Materiales -->
            <div class="section-info">
                <h3 class="section-title">📋 Materiales</h3>
                <div v-if="formData.materiales && formData.materiales.length > 0" class="info-list">
                    <div v-for="material in formData.materiales" :key="material.id" class="info-item-card">
                        <div class="info-label">{{ material.nombre }}</div>
                        <div class="info-detail">Código: {{ material.codigo }}</div>
                        <div class="info-detail">Precio: ${{ formatCurrency(material.precio_unitario) }}</div>
                    </div>
                </div>
                <div v-else class="empty-info">Sin materiales</div>
            </div>

            <!-- Sección de Herrajes -->
            <div class="section-info">
                <h3 class="section-title">🔩 Herrajes</h3>
                <div v-if="formData.herrajes && formData.herrajes.length > 0" class="info-list">
                    <div v-for="herraje in formData.herrajes" :key="herraje.id" class="info-item-card">
                        <div class="info-label">{{ herraje.nombre }}</div>
                        <div class="info-detail">Código: {{ herraje.codigo }}</div>
                        <div class="info-detail">Precio: ${{ formatCurrency(herraje.precio_unitario) }}</div>
                    </div>
                </div>
                <div v-else class="empty-info">Sin herrajes</div>
            </div>

            <!-- Sección de Mano de Obra -->
            <div class="section-info">
                <h3 class="section-title">👷 Mano de Obra</h3>
                <div v-if="formData.mano_de_obra" class="info-list">
                    <div class="info-item-card">
                        <div class="info-label">{{ formData.mano_de_obra.nombre }}</div>
                        <div class="info-detail">Descripción: {{ formData.mano_de_obra.descripcion }}</div>
                        <div class="info-detail">Costo/hora: ${{ formatCurrency(formData.mano_de_obra.costo_hora) }}</div>
                        <div class="info-detail">Tiempo: {{ formData.mano_de_obra.tiempo }} horas</div>
                    </div>
                </div>
                <div v-else class="empty-info">Sin mano de obra asignada</div>
            </div>

            <!-- Sección de Acabado -->
            <div class="section-info">
                <h3 class="section-title">🎨 Acabado</h3>
                <div v-if="formData.acabado" class="info-list">
                    <div class="info-item-card">
                        <div class="info-label">{{ formData.acabado.nombre }}</div>
                        <div class="info-detail">Descripción: {{ formData.acabado.descripcion }}</div>
                        <div class="info-detail">Costo: ${{ formatCurrency(formData.acabado.costo) }}</div>
                    </div>
                </div>
                <div v-else class="empty-info">Sin acabado asignado</div>
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
import { getComponenteById } from '@/http/componentes-api';

const router = useRouter();
const route = useRoute();

// Estado
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    costo_unitario: '',
    materiales: [],
    herrajes: [],
    mano_de_obra: null,
    acabado: null,
});

const errors = ref({});
const error = ref(null);
const guardando = ref(false);
const cargando = ref(true);

// Cargar componente (placeholder - actualizar con API real)
const cargarComponente = async () => {
    try {
        cargando.value = true;
        const response = await getComponenteById(route.params.id);
        const data = response.data || response;
        console.log('Componente cargado:', data);
        formData.value = {
            nombre: data.nombre || '',
            codigo: data.codigo || '',
            descripcion: data.descripcion || '',
            costo_unitario: data.costo_unitario || '',
            materiales: data.materiales || [],
            herrajes: data.herrajes || [],
            mano_de_obra: data.mano_de_obra_id || null,
            acabado: data.acabado_id || null,
        };
    } catch (err) {
        error.value = 'Error al cargar el componente';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Formatear moneda
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Validar formulario
const validar = () => {
    errors.value = {};
    
    if (!formData.value.nombre.trim()) {
        errors.value.nombre = 'El nombre es requerido';
    }
    
    if (formData.value.costo_unitario === '' || formData.value.costo_unitario <= 0) {
        errors.value.costo_unitario = 'El costo unitario debe ser mayor a 0';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Guardar cambios
const guardarComponente = async () => {
    if (!validar()) return;
    
    try {
        guardando.value = true;
        error.value = null;
        
        const datos = {
            nombre: formData.value.nombre.trim(),
            codigo: formData.value.codigo.trim(),
            descripcion: formData.value.descripcion.trim(),
            costo_unitario: parseFloat(formData.value.costo_unitario),
        };
        
        console.log('Guardando cambios:', datos);
        
        // TODO: Implementar actualización en la API cuando esté disponible
        // await actualizarComponente(route.params.id, datos);
        
        router.push('/componentes');
    } catch (err) {
        error.value = 'Error al guardar los cambios';
        console.error(err);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(() => {
    cargarComponente();
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

.section-info {
    margin-top: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border: 1px solid #e8ddd7;
    border-radius: 8px;
}

.section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 1rem 0;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.info-item-card {
    padding: 1rem;
    background: white;
    border-left: 3px solid #d4a574;
    border-radius: 4px;
}

.info-label {
    font-weight: 700;
    color: #5a4037;
    font-size: 1rem;
    margin-bottom: 0.5rem;
}

.info-detail {
    font-size: 0.9rem;
    color: #8b7355;
    margin: 0.25rem 0;
}

.empty-info {
    padding: 1rem;
    text-align: center;
    color: #999;
    font-style: italic;
    background: white;
    border-radius: 4px;
}
</style>
