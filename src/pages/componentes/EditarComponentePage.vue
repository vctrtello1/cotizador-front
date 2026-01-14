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
                <div class="section-header">
                    <h3 class="section-title">📋 Materiales</h3>
                    <button type="button" class="btn-edit-small" @click="mostrarModalMateriales = true">✏️ Editar</button>
                </div>
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
                <div class="section-header">
                    <h3 class="section-title">🔩 Herrajes</h3>
                    <button type="button" class="btn-edit-small" @click="mostrarModalHerrajes = true">✏️ Editar</button>
                </div>
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
                <div class="section-header">
                    <h3 class="section-title">👷 Mano de Obra</h3>
                    <button type="button" class="btn-edit-small" @click="mostrarModalManoDeObra = true">✏️ Editar</button>
                </div>
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
                <div class="section-header">
                    <h3 class="section-title">🎨 Acabado</h3>
                    <button type="button" class="btn-edit-small" @click="mostrarModalAcabado = true">✏️ Editar</button>
                </div>
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

        <!-- Modal Materiales -->
        <div v-if="mostrarModalMateriales" class="modal-overlay" @click.self="mostrarModalMateriales = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">📋 Editar Materiales</h3>
                    <button class="modal-close" @click="mostrarModalMateriales = false">✕</button>
                </div>
                <div class="modal-body">
                    <!-- Sección para agregar nuevo material -->
                    <div class="add-section">
                        <h4 class="items-subtitle">Agregar Material</h4>
                        <div class="search-bar">
                            <input 
                                v-model="busquedaMaterial" 
                                type="text" 
                                placeholder="Buscar material..." 
                                class="search-input"
                                @focus="cargarMateriales"
                            />
                        </div>
                        <div v-if="busquedaMaterial && materialesFiltrados().length > 0" class="available-list">
                            <div v-for="material in materialesFiltrados()" :key="material.id" class="available-item">
                                <div class="item-info">
                                    <div class="item-name">{{ material.nombre }}</div>
                                    <div class="item-code">{{ material.codigo }}</div>
                                    <div class="item-price">${{ formatCurrency(material.precio_unitario) }}</div>
                                </div>
                                <button 
                                    type="button" 
                                    class="btn-add" 
                                    @click="materialSeleccionadoId = material.id; agregarMaterial()"
                                >+ Agregar</button>
                            </div>
                        </div>
                        <div v-else-if="busquedaMaterial && materialesFiltrados().length === 0" class="empty-search">
                            No hay materiales disponibles
                        </div>
                    </div>

                    <!-- Sección de materiales seleccionados -->
                    <div v-if="formData.materiales && formData.materiales.length > 0" class="selected-items">
                        <h4 class="items-subtitle">Materiales Seleccionados</h4>
                        <div class="items-grid">
                            <div v-for="material in formData.materiales" :key="material.id" class="selected-item">
                                <div class="item-info">
                                    <div class="item-name">{{ material.nombre }}</div>
                                    <div class="item-code">{{ material.codigo }}</div>
                                    <div class="item-price">${{ formatCurrency(material.precio_unitario) }}</div>
                                </div>
                                <button class="btn-remove" @click="removerMaterial(material.id)" title="Remover">×</button>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="!busquedaMaterial" class="empty-list">
                        <p>📭 No hay materiales seleccionados</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalMateriales = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Herrajes -->
        <div v-if="mostrarModalHerrajes" class="modal-overlay" @click.self="mostrarModalHerrajes = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">🔩 Editar Herrajes</h3>
                    <button class="modal-close" @click="mostrarModalHerrajes = false">✕</button>
                </div>
                <div class="modal-body">
                    <div v-if="formData.herrajes && formData.herrajes.length > 0" class="selected-items">
                        <h4 class="items-subtitle">Herrajes Seleccionados</h4>
                        <div class="items-grid">
                            <div v-for="herraje in formData.herrajes" :key="herraje.id" class="selected-item">
                                <div class="item-info">
                                    <div class="item-name">{{ herraje.nombre }}</div>
                                    <div class="item-code">{{ herraje.codigo }}</div>
                                    <div class="item-price">${{ formatCurrency(herraje.precio_unitario) }}</div>
                                </div>
                                <button class="btn-remove" @click="removerHerraje(herraje.id)" title="Remover">×</button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-list">
                        <p>📭 No hay herrajes seleccionados</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalHerrajes = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Mano de Obra -->
        <div v-if="mostrarModalManoDeObra" class="modal-overlay" @click.self="mostrarModalManoDeObra = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">👷 Editar Mano de Obra</h3>
                    <button class="modal-close" @click="mostrarModalManoDeObra = false">✕</button>
                </div>
                <div class="modal-body">
                    <div v-if="formData.mano_de_obra" class="selected-items">
                        <div class="selected-item-full">
                            <div class="item-info-full">
                                <div class="item-name">{{ formData.mano_de_obra.nombre }}</div>
                                <div class="item-code">{{ formData.mano_de_obra.descripcion }}</div>
                                <div class="info-row">
                                    <span class="info-label">Costo/hora:</span>
                                    <span class="info-value">${{ formatCurrency(formData.mano_de_obra.costo_hora) }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Tiempo:</span>
                                    <span class="info-value">{{ formData.mano_de_obra.tiempo }} horas</span>
                                </div>
                            </div>
                            <button class="btn-remove-large" @click="removerManoDeObra" title="Remover">✕ Quitar</button>
                        </div>
                    </div>
                    <div v-else class="empty-list">
                        <p>📭 No hay mano de obra asignada</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalManoDeObra = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Acabado -->
        <div v-if="mostrarModalAcabado" class="modal-overlay" @click.self="mostrarModalAcabado = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">🎨 Editar Acabado</h3>
                    <button class="modal-close" @click="mostrarModalAcabado = false">✕</button>
                </div>
                <div class="modal-body">
                    <div v-if="formData.acabado" class="selected-items">
                        <div class="selected-item-full">
                            <div class="item-info-full">
                                <div class="item-name">{{ formData.acabado.nombre }}</div>
                                <div class="item-code">{{ formData.acabado.descripcion }}</div>
                                <div class="info-row">
                                    <span class="info-label">Costo:</span>
                                    <span class="info-value">${{ formatCurrency(formData.acabado.costo) }}</span>
                                </div>
                            </div>
                            <button class="btn-remove-large" @click="removerAcabado" title="Remover">✕ Quitar</button>
                        </div>
                    </div>
                    <div v-else class="empty-list">
                        <p>📭 No hay acabado asignado</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalAcabado = false">Cerrar</button>
                </div>
            </div>
        </div>
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

// Modales
const mostrarModalMateriales = ref(false);
const mostrarModalHerrajes = ref(false);
const mostrarModalManoDeObra = ref(false);
const mostrarModalAcabado = ref(false);

// Datos para seleccionar materiales
const materialesDisponibles = ref([]);
const materialSeleccionadoId = ref(null);
const busquedaMaterial = ref('');

// Cargar componente (placeholder - actualizar con API real)
const cargarComponente = async () => {
    try {
        cargando.value = true;
        const response = await getComponenteById(route.params.id);
        const data = response.data || response;
        console.log('Componente cargado:', data);
        console.log('costo_unitario:', data.costo_unitario);
        console.log('costo_total:', data.costo_total);
        formData.value = {
            nombre: data.nombre || '',
            codigo: data.codigo || '',
            descripcion: data.descripcion || '',
            costo_unitario: data.costo_unitario || data.costo_total || '',
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

// Métodos para remover elementos de los modales
const removerMaterial = (id) => {
    formData.value.materiales = formData.value.materiales.filter(m => m.id !== id);
};

const removerHerraje = (id) => {
    formData.value.herrajes = formData.value.herrajes.filter(h => h.id !== id);
};

const removerManoDeObra = () => {
    formData.value.mano_de_obra = null;
};

const removerAcabado = () => {
    formData.value.acabado = null;
};

// Cargar materiales disponibles
const cargarMateriales = async () => {
    try {
        const api = (await import('@/http/apl')).default;
        const response = await api.get('/materiales');
        const data = response.data.data || response.data || [];
        materialesDisponibles.value = Array.isArray(data) ? data : [];
        console.log('Materiales disponibles:', materialesDisponibles.value);
    } catch (err) {
        console.error('Error al cargar materiales:', err);
        materialesDisponibles.value = [];
    }
};

// Agregar material seleccionado
const agregarMaterial = () => {
    if (!materialSeleccionadoId.value) return;
    const material = materialesDisponibles.value.find(m => m.id === materialSeleccionadoId.value);
    if (material && !formData.value.materiales.some(m => m.id === material.id)) {
        formData.value.materiales.push(material);
        materialSeleccionadoId.value = null;
    }
};

// Filtrar materiales disponibles
const materialesFiltrados = () => {
    return materialesDisponibles.value.filter(m => {
        const yaAgregado = formData.value.materiales.some(mat => mat.id === m.id);
        const coincideBusqueda = m.nombre.toLowerCase().includes(busquedaMaterial.value.toLowerCase()) ||
                                 m.codigo.toLowerCase().includes(busquedaMaterial.value.toLowerCase());
        return !yaAgregado && coincideBusqueda;
    });
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

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
}

.section-header .section-title {
    margin: 0;
}

.btn-edit-small {
    padding: 6px 12px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
}

.btn-edit-small:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.3);
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    max-height: 80vh;
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e8ddd7;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #ccc;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    border-radius: 6px;
}

.modal-close:hover {
    background: #f5f1ed;
    color: #5a4037;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
}

.selected-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.items-subtitle {
    font-size: 14px;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.items-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

.selected-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 6px;
    gap: 12px;
}

.item-info {
    flex: 1;
}

.item-name {
    font-weight: 700;
    color: #5a4037;
    font-size: 14px;
    margin-bottom: 4px;
}

.item-code {
    font-size: 12px;
    color: #8b7355;
    margin-bottom: 4px;
}

.item-price {
    font-size: 13px;
    color: #d4a574;
    font-weight: 600;
}

.btn-remove {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #c62828;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-remove:hover {
    background: #ff9999;
    color: white;
}

.add-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e0d5c7;
}

.search-bar {
    margin-bottom: 16px;
}

.search-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0d5c7;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.3s;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
    background: #fff9f0;
}

.available-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 8px;
    background: #f5f1ed;
    border-radius: 6px;
}

.available-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: white;
    border: 1px solid #e0d5c7;
    border-radius: 4px;
    transition: all 0.3s;
    gap: 12px;
}

.available-item:hover {
    background: #fff9f0;
    border-color: #d4a574;
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.2);
}

.btn-add {
    background: #d4a574;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-add:hover {
    background: #c89564;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.3);
}

.btn-add:active {
    transform: translateY(0);
}

.empty-search {
    padding: 24px;
    text-align: center;
    color: #8b7355;
    font-size: 14px;
    background: #f5f1ed;
    border-radius: 6px;
}

.selected-item-full {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 6px;
    gap: 16px;
}

.item-info-full {
    flex: 1;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e8ddd7;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-weight: 600;
    color: #8b7355;
    font-size: 13px;
}

.info-value {
    font-weight: 700;
    color: #d4a574;
    font-size: 14px;
}

.btn-remove-large {
    padding: 8px 12px;
    background: #ffebee;
    color: #c62828;
    border: 1px solid #c62828;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    white-space: nowrap;
}

.btn-remove-large:hover {
    background: #ff9999;
    color: white;
}

.empty-list {
    text-align: center;
    padding: 32px 24px;
    color: #999;
}

.empty-list p {
    margin: 0;
    font-size: 16px;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e8ddd7;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background: #faf7f2;
}
</style>
