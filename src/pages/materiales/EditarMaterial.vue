<template>
    <div class="editar-material-container">
        <!-- Header -->
        <div class="page-header">
            <button class="btn-back" @click="$router.push('/materiales')">
                <span class="btn-back-icon">←</span>
                <span>Volver a Materiales</span>
            </button>
            <div class="header-content">
                <h1 class="page-title">✏️ Editar Material</h1>
                <p class="page-subtitle">Modifica la información y características del material</p>
            </div>
        </div>

        <!-- Cargando -->
        <div v-if="cargando" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando información del material...</span>
        </div>

        <!-- Contenido -->
        <div v-else>
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

            <!-- Formulario -->
            <div class="info-card">
                <div class="card-header">
                    <div class="card-header-icon">📋</div>
                    <div class="card-header-title">
                        <h2 class="section-title">Información del Material</h2>
                        <p class="section-subtitle">Completa todos los campos requeridos (*)</p>
                    </div>
                </div>
                <div class="info-grid">
                    <div class="form-group">
                        <label class="form-label">Nombre del Material *</label>
                        <input 
                            v-model="formData.nombre" 
                            type="text" 
                            class="form-input" 
                            placeholder="Ej: Madera Pino"
                            @blur="validarCampo('nombre')"
                        >
                        <span v-if="erroresValidacion.nombre" class="error-text">{{ erroresValidacion.nombre }}</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Código del Material *</label>
                        <input 
                            v-model="formData.codigo" 
                            type="text" 
                            class="form-input input-codigo" 
                            placeholder="Ej: MAD_PINO_1"
                            @blur="validarCampo('codigo')"
                        >
                        <span v-if="erroresValidacion.codigo" class="error-text">{{ erroresValidacion.codigo }}</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tipo de Material</label>
                        <button 
                            class="form-input btn-select" 
                            @click="mostrarModalTipo = true"
                        >
                            {{ formData.tipo || 'Seleccionar tipo...' }} 🔽
                        </button>
                    </div>

                    <div class="form-group full-width">
                        <label class="form-label">Descripción del Material</label>
                        <textarea 
                            v-model="formData.descripcion" 
                            class="form-input textarea-input" 
                            placeholder="Descripción detallada del material"
                            rows="3"
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Unidad de Medida *</label>
                        <input 
                            v-model="formData.unidad_medida" 
                            type="text" 
                            class="form-input" 
                            placeholder="Ej: Metro, Kg, Unidad"
                            @blur="validarCampo('unidad_medida')"
                        >
                        <span v-if="erroresValidacion.unidad_medida" class="error-text">{{ erroresValidacion.unidad_medida }}</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Alto *</label>
                        <input 
                            v-model.number="formData.alto" 
                            type="number" 
                            min="0" 
                            class="form-input" 
                            placeholder="Ej: 100"
                            @blur="validarCampo('alto')"
                        >
                        <span v-if="erroresValidacion.alto" class="error-text">{{ erroresValidacion.alto }}</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Ancho *</label>
                        <input v-model.number="formData.ancho" type="number" min="0" class="form-input"
                            placeholder="Ej: 100" @blur="validarCampo('ancho')">
                        <span v-if="erroresValidacion.ancho" class="error-text">{{ erroresValidacion.ancho }}</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Largo *</label>
                        <input v-model.number="formData.largo" type="number" min="0" class="form-input"
                            placeholder="Ej: 100" @blur="validarCampo('largo')">
                        <span v-if="erroresValidacion.largo" class="error-text">{{ erroresValidacion.largo }}</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Precio Unitario *</label>
                        <input 
                            v-model.number="formData.precio_unitario" 
                            type="number" 
                            min="0" 
                            step="0.01"
                            class="form-input" 
                            placeholder="Ej: 250.75"
                            @blur="validarCampo('precio_unitario')"
                        >
                        <span v-if="erroresValidacion.precio_unitario" class="error-text">{{ erroresValidacion.precio_unitario }}</span>
                    </div>
                </div>
            </div>

            <!-- Resumen -->
            <div class="resumen-card">
                <div class="card-header">
                    <div class="card-header-icon">📊</div>
                    <div class="card-header-title">
                        <h2 class="section-title">Resumen en Tiempo Real</h2>
                        <p class="section-subtitle">Vista previa de los datos ingresados</p>
                    </div>
                </div>
                <div class="resumen-grid">
                    <div class="resumen-item">
                        <label>Nombre</label>
                        <span class="resumen-valor">{{ formData.nombre || 'Sin definir' }}</span>
                    </div>
                    <div class="resumen-item">
                        <label>Código</label>
                        <span class="resumen-valor">{{ formData.codigo || 'Sin definir' }}</span>
                    </div>
                    <div class="resumen-item">
                        <label>Tipo</label>
                        <span class="resumen-valor">{{ formData.tipo || 'Sin definir' }}</span>
                    </div>
                    <div class="resumen-item">
                        <label>Costo Unitario</label>
                        <span class="resumen-valor">${{ formatCurrency(formData.precio_unitario) }}</span>
                    </div>
                
                </div>
            </div>

            <!-- Botones de Acción -->
            <div class="action-buttons">
                <button class="btn-secondary" @click="$router.push('/materiales')">
                    <span>✕ Cancelar</span>
                </button>
                <button 
                    class="btn-primary" 
                    @click="guardarMaterial"
                    :disabled="cargandoGuardar"
                >
                    <span v-if="cargandoGuardar" class="btn-spinner"></span>
                    <span>{{ cargandoGuardar ? 'Guardando...' : '✓ Guardar Cambios' }}</span>
                </button>
            </div>
        </div>

        <!-- Modal de selección de tipo de material -->
        <div v-if="mostrarModalTipo" class="modal-overlay" @click.self="cerrarModalTipo">
            <div class="modal-content modal-tipo-material">
                <div class="modal-header">
                    <h3 class="modal-title">Seleccionar Tipo de Material</h3>
                    <button class="modal-close" @click="cerrarModalTipo">✕</button>
                </div>

                <div class="modal-body">
                    <!-- Campo de búsqueda -->
                    <div class="search-box">
                        <input 
                            v-model="busquedaTipo" 
                            type="text" 
                            class="form-input"
                            placeholder="Buscar tipo de material..."
                        >
                    </div>

                    <!-- Lista de tipos de material -->
                    <div class="tipos-list">
                        <div v-if="tiposFiltrados.length === 0" class="empty-state">
                            <p>No hay tipos de material disponibles</p>
                        </div>
                        <button 
                            v-for="tipo in tiposFiltrados" 
                            :key="tipo.id"
                            class="tipo-item"
                            :class="{ 'tipo-item-selected': formData.tipo === tipo.nombre }"
                            @click="seleccionarTipo(tipo)"
                        >
                            <span class="tipo-nombre">{{ tipo.nombre }}</span>
                            <span v-if="formData.tipo === tipo.nombre" class="tipo-checkmark">✓</span>
                        </button>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" @click="cerrarModalTipo">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getMaterialById, actualizarMaterial } from '@/http/materiales-api';
import { useTiposDeMaterial } from '@/stores/tipo-de-material';

const router = useRouter();
const route = useRoute();
const tiposMaterialStore = useTiposDeMaterial();

// Estado del modal de tipo de material
const mostrarModalTipo = ref(false);
const busquedaTipo = ref('');

// Estado del formulario
const formData = ref({
    nombre: '',
    codigo: '',
    tipo: '',
    tipo_de_material_id: null,
    descripcion: '',
    unidad_medida: '',
    cantidad_disponible: 0,
    precio_unitario: 0,
    alto: 0,
    ancho: 0,
    largo: 0
});

// Estado de UI
const error = ref(null);
const exito = ref(null);
const cargando = ref(true);
const cargandoGuardar = ref(false);
const erroresValidacion = ref({
    nombre: null,
    codigo: null,
    unidad_medida: null,
    cantidad_disponible: null,
    precio_unitario: null,
    alto: null,
    ancho: null,
    largo: null
});

// Configuración de campos para validación
const CAMPOS_CONFIG = {
    nombre: { 
        requerido: true, 
        tipo: 'texto',
        mensaje: 'El nombre es requerido'
    },
    codigo: { 
        requerido: true, 
        tipo: 'texto',
        mensaje: 'El código es requerido'
    },
    unidad_medida: { 
        requerido: true, 
        tipo: 'texto',
        mensaje: 'La unidad de medida es requerida'
    },
    cantidad_disponible: { 
        requerido: false, 
        tipo: 'numero',
        minimo: 0,
        mensaje: 'La cantidad debe ser mayor o igual a 0'
    },
    precio_unitario: { 
        requerido: false, 
        tipo: 'numero',
        minimo: 0,
        mensaje: 'El precio debe ser mayor o igual a 0'
    },
    alto: { 
        requerido: false, 
        tipo: 'numero',
        minimo: 0,
        mensaje: 'El alto debe ser mayor o igual a 0'
    },
    ancho: { 
        requerido: false, 
        tipo: 'numero',
        minimo: 0,
        mensaje: 'El ancho debe ser mayor o igual a 0'
    },
    largo: { 
        requerido: false, 
        tipo: 'numero',
        minimo: 0,
        mensaje: 'El largo debe ser mayor o igual a 0'
    }
};

// Propiedades calculadas
const tieneErrores = computed(() => {
    return Object.values(erroresValidacion.value).some(error => error !== null);
});

const puedeGuardar = computed(() => {
    return !cargando.value && !cargandoGuardar.value && !tieneErrores.value;
});

// Tipos de material filtrados por búsqueda
const tiposFiltrados = computed(() => {
    return tiposMaterialStore.tiposDeMaterial.filter(tipo => 
        tipo.nombre.toLowerCase().includes(busquedaTipo.value.toLowerCase())
    );
});

// Métodos de validación
const validarCampo = (campo) => {
    const config = CAMPOS_CONFIG[campo];
    if (!config) return;

    const valor = formData.value[campo];

    if (config.requerido && !String(valor).trim()) {
        erroresValidacion.value[campo] = config.mensaje;
        return;
    }

    if (config.tipo === 'numero' && config.minimo !== undefined) {
        if (Number(valor) < config.minimo) {
            erroresValidacion.value[campo] = config.mensaje;
            return;
        }
    }

    erroresValidacion.value[campo] = null;
};

const validarFormulario = () => {
    let valido = true;
    
    Object.keys(CAMPOS_CONFIG).forEach(campo => {
        validarCampo(campo);
        if (erroresValidacion.value[campo] !== null) {
            valido = false;
        }
    });

    return valido;
};

const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Cargar material
const cargarMaterial = async () => {
    cargando.value = true;
    error.value = null;
    
    try {
        const id = route.params.id;
        
        if (!id) {
            error.value = 'ID del material no disponible';
            return;
        }
        
        const material = await getMaterialById(id);
        
        if (!material || Object.keys(material).length === 0) {
            error.value = 'El material no fue encontrado';
            return;
        }
        
        // Usar Object.assign para mantener reactivity
        Object.assign(formData.value, {
            nombre: String(material.nombre || '').trim(),
            codigo: String(material.codigo || '').trim(),
            tipo: material.tipo_de_material?.nombre || material.tipo || '',
            tipo_de_material_id: material.tipo_de_material?.id || material.tipo_de_material_id || null,
            descripcion: String(material.descripcion || '').trim(),
            unidad_medida: String(material.unidad_medida || '').trim(),
            cantidad_disponible: Number(material.cantidad_disponible) || 0,
            precio_unitario: Number(material.precio_unitario || material.costo_unitario) || 0,
            alto: Number(material.alto) || 0,
            ancho: Number(material.ancho) || 0,
            largo: Number(material.largo) || 0
        });
        
    } catch (err) {
        error.value = 'Error al cargar el material: ' + (err.response?.data?.message || err.message);
    } finally {
        cargando.value = false;
    }
};

// Guardar material
const guardarMaterial = async () => {
    error.value = null;
    exito.value = null;

    if (!validarFormulario()) {
        error.value = 'Por favor, completa todos los campos requeridos correctamente';
        return;
    }

    cargandoGuardar.value = true;

    try {
        const id = route.params.id;
        const datosMaterial = {
            nombre: formData.value.nombre,
            codigo: formData.value.codigo,
            tipo_de_material_id: formData.value.tipo_de_material_id,
            descripcion: formData.value.descripcion,
            unidad_medida: formData.value.unidad_medida,
            cantidad_disponible: formData.value.cantidad_disponible,
            precio_unitario: formData.value.precio_unitario,
            alto: formData.value.alto,
            ancho: formData.value.ancho,
            largo: formData.value.largo
        };

        await actualizarMaterial(id, datosMaterial);

        exito.value = '✓ Material actualizado exitosamente';
        setTimeout(() => {
            router.push('/materiales');
        }, 1500);
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al actualizar el material';
    } finally {
        cargandoGuardar.value = false;
    }
};

// Métodos del modal
const seleccionarTipo = (tipo) => {
    formData.value.tipo = tipo.nombre;
    formData.value.tipo_de_material_id = tipo.id;
    cerrarModalTipo();
};

const cerrarModalTipo = () => {
    mostrarModalTipo.value = false;
    busquedaTipo.value = '';
};

// Cargar tipos de material
const cargarTiposMaterial = async () => {
    try {
        await tiposMaterialStore.fetchTiposDeMaterialAction();
    } catch (err) {
        console.error('Error cargando tipos de material:', err);
    }
};

onMounted(() => {
    cargarTiposMaterial();
    cargarMaterial();
});

// Watch para cuando cambia el ID de la ruta
watch(() => route.params.id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        cargarMaterial();
    }
});
</script>

<style scoped>
.editar-material-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    min-height: 100vh;
}

.page-header {
    display: flex;
    align-items: flex-start;
    gap: 30px;
    margin-bottom: 40px;
    padding: 30px;
    background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(200, 149, 100, 0.05) 100%);
    border-radius: 12px;
    border-left: 4px solid #d4a574;
}

.btn-back {
    padding: 12px 20px;
    background: white;
    color: #d4a574;
    border: 2px solid #d4a574;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-back:hover {
    background: #d4a574;
    color: white;
    transform: translateX(-4px);
}

.btn-back-icon {
    font-size: 18px;
}

.header-content {
    flex: 1;
}

.page-title {
    font-size: 36px;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 8px 0;
}

.page-subtitle {
    font-size: 15px;
    color: #8d6e63;
    margin: 0;
    font-weight: 400;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 60px 20px;
    color: #5a4037;
    font-size: 18px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f5f1ed;
    border-top: 4px solid #d4a574;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-message,
.success-message {
    padding: 16px 20px;
    margin-bottom: 24px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
}

.error-message {
    background: #fee;
    color: #c33;
    border-left: 4px solid #c33;
    border: 2px solid #f8d7da;
}

.success-message {
    background: #efe;
    color: #3c3;
    border-left: 4px solid #3c3;
    border: 2px solid #d4edda;
}

.error-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    transition: all 0.3s;
    border-radius: 4px;
}

.info-card,
.resumen-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede7e0;
    transition: all 0.3s;
}

.info-card:hover,
.resumen-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f5f1ed;
}

.card-header-icon {
    font-size: 32px;
    flex-shrink: 0;
}

.card-header-title {
    flex: 1;
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 6px 0;
}

.section-subtitle {
    font-size: 13px;
    color: #999;
    margin: 0;
    font-weight: 400;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-label {
    font-size: 13px;
    font-weight: 700;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.form-input {
    padding: 14px 16px;
    border: 2px solid #d4a574;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.3s;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    color: #5a4037;
}

.form-input::placeholder {
    color: #d4a574;
    opacity: 0.6;
}

.form-input:hover {
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
    border-color: #c89564;
}

.form-input:focus {
    outline: none;
    background: white;
    border-color: #c89564;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
}

/* Estilo especial para el código de material */
.input-codigo {
    font-family: 'Courier New', monospace;
    font-weight: 700;
    letter-spacing: 0.8px;
    color: #8b5a2b;
}

.textarea-input {
    resize: vertical;
    min-height: 80px;
}

.error-text {
    color: #c33;
    font-size: 12px;
    margin-top: -4px;
}

/* Resumen */
.resumen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
}

.resumen-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    background: linear-gradient(135deg, #faf7f2 0%, #f5f1ed 100%);
    border-radius: 10px;
    border: 2px solid #e8ddd7;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
}

.resumen-item:hover {
    border-color: #d4a574;
    background: linear-gradient(135deg, white 0%, #faf7f2 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
}

.resumen-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #d4a574 0%, transparent 100%);
}

.resumen-item label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
    letter-spacing: 0.5px;
}

.resumen-valor {
    font-size: 16px;
    font-weight: 700;
    color: #5a4037;
}

/* Botones */
.action-buttons {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-top: 40px;
}

.btn-primary,
.btn-secondary {
    padding: 14px 32px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.35);
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #c89564 0%, #b8854c 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(212, 165, 116, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: white;
    color: #d4a574;
    border: 2px solid #d4a574;
}

.btn-secondary:hover {
    background: #f5f1ed;
    border-color: #c89564;
    color: #c89564;
}

.btn-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.btn-select {
    background: #f9f6f3;
    color: #5a4037;
    border: 2px solid #e8ddd7;
    text-align: left;
    padding: 14px 16px !important;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
    font-weight: 500;
}

.btn-select:hover {
    background: white;
    border-color: #d4a574;
}

/* Modal Overlay */
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
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
}

.modal-tipo-material {
    max-height: 70vh;
}

.modal-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e8ddd7;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #3e2723;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 28px;
    color: #ccc;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
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

.modal-close:hover {
    background: #f5f1ed;
    color: #5a4037;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
}

.modal-footer {
    padding: 20px 24px;
    border-top: 1px solid #e8ddd7;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background: #faf7f2;
}

/* Search Box */
.search-box {
    margin-bottom: 16px;
}

.search-box .form-input {
    width: 100%;
}

/* Tipos List */
.tipos-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.empty-state {
    text-align: center;
    padding: 32px 16px;
    color: #999;
}

.empty-state p {
    margin: 0;
}

.tipo-item {
    padding: 16px;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    background: #f9f6f3;
    color: #5a4037;
    cursor: pointer;
    text-align: left;
    transition: all 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    font-weight: 500;
}

.tipo-item:hover {
    background: white;
    border-color: #d4a574;
    transform: translateX(4px);
}

.tipo-item-selected {
    background: linear-gradient(135deg, #faf7f2 0%, white 100%);
    border-color: #d4a574;
    font-weight: 700;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.tipo-nombre {
    flex: 1;
}

.tipo-checkmark {
    color: #4caf50;
    font-weight: 700;
    font-size: 18px;
    margin-left: 8px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        padding: 20px;
    }

    .page-title {
        font-size: 28px;
    }

    .page-subtitle {
        font-size: 14px;
    }

    .btn-back {
        width: 100%;
        justify-content: center;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .form-label {
        font-size: 12px;
    }

    .form-input {
        padding: 12px 14px;
        font-size: 16px;
    }

    .section-title {
        font-size: 18px;
    }

    .resumen-grid {
        grid-template-columns: 1fr;
    }

    .action-buttons {
        flex-direction: column-reverse;
        gap: 12px;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        padding: 12px 24px;
    }

    .modal-content {
        width: 95%;
        max-height: 90vh;
    }

    .tipos-list {
        max-height: 50vh;
    }
}
</style>
