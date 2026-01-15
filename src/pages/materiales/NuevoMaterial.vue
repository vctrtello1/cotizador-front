<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { crearMaterial, fetchMateriales } from '@/http/materiales-api';
import { useTiposDeMaterial } from '@/stores/tipo-de-material';

const router = useRouter();
const tiposDeMaterialStore = useTiposDeMaterial();

// ============ ESTADO DEL FORMULARIO ============
const formData = ref({
    nombre: '',
    codigo: '',
    tipo: '',
    tipo_de_material_id: null,
    descripcion: 'Descripción del material',
    unidad_medida: 'Metro',
    alto: 1,
    ancho: 1,
    largo: 1,
    precio_unitario: 100
});

// ============ ESTADO DE UI ============
const error = ref(null);
const exito = ref(null);
const cargando = ref(false);
const modalTiposVisible = ref(false);
const tiposLoading = ref(false);
const tiposDeMaterial = ref([]);

const erroresValidacion = ref({
    nombre: null,
    codigo: null,
    unidad_medida: null,
    precio_unitario: null
});

// ============ MÉTODOS DE VALIDACIÓN ============
const reglas = {
    nombre: (valor) => valor.trim() ? null : 'El nombre es requerido',
    codigo: (valor) => valor.trim() ? null : 'El código es requerido',
    unidad_medida: (valor) => valor.trim() ? null : 'La unidad de medida es requerida',
    precio_unitario: (valor) => valor < 0 ? 'El precio debe ser mayor o igual a 0' : null
};

const validarCampo = (campo) => {
    if (reglas[campo]) {
        erroresValidacion.value[campo] = reglas[campo](formData.value[campo]);
    }
};

const validarFormulario = () => {
    Object.keys(reglas).forEach(campo => validarCampo(campo));
    return !Object.values(erroresValidacion.value).some(e => e !== null);
};

// ============ MÉTODOS DE FORMATO ============
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const limpiarMensajes = () => {
    error.value = null;
    exito.value = null;
};

// ============ MÉTODOS DE FORMULARIO ============
const guardarMaterial = async () => {
    limpiarMensajes();

    if (!validarFormulario()) {
        error.value = 'Por favor, completa todos los campos requeridos correctamente';
        return;
    }

    cargando.value = true;

    try {
        const datosMaterial = {
            nombre: formData.value.nombre.trim(),
            codigo: formData.value.codigo.trim(),
            tipo_de_material_id: formData.value.tipo_de_material_id,
            descripcion: formData.value.descripcion.trim(),
            unidad_medida: formData.value.unidad_medida.trim(),
            alto: parseFloat(formData.value.alto) || 0,
            ancho: parseFloat(formData.value.ancho) || 0,
            largo: parseFloat(formData.value.largo) || 0,
            precio_unitario: parseFloat(formData.value.precio_unitario) || 0
        };

        console.log('Guardando material:', datosMaterial);
        const response = await crearMaterial(datosMaterial);
        const materialId = response.data?.id || response.id;
        console.log('Material guardado:', response);
        console.log('ID del material:', materialId);
        
        exito.value = '✓ Material guardado exitosamente';
        router.push('/materiales');
    } catch (err) {
        console.error('Error guardando material:', err);
        error.value = err.response?.data?.message || err.response?.data?.error || 'Error al guardar el material';
    } finally {
        cargando.value = false;
    }
};

// ============ MÉTODOS DEL MODAL DE TIPOS ============
const cargarTiposDeMaterial = async () => {
    try {
        tiposLoading.value = true;
        await tiposDeMaterialStore.fetchTiposDeMaterialAction();
        tiposDeMaterial.value = tiposDeMaterialStore.tiposDeMaterial;
        
        // Usar el primer tipo disponible si existe
        if (tiposDeMaterial.value.length > 0) {
            formData.value.tipo = tiposDeMaterial.value[0].nombre;
            formData.value.tipo_de_material_id = tiposDeMaterial.value[0].id;
            console.log('Tipo de material por defecto asignado:', tiposDeMaterial.value[0].id);
        }
    } catch (err) {
        console.error('Error cargando tipos de material:', err);
        error.value = 'Error al cargar los tipos de material';
    } finally {
        tiposLoading.value = false;
    }
};

const mostrarModalTipos = async () => {
    modalTiposVisible.value = true;
    if (tiposDeMaterial.value.length === 0) {
        await cargarTiposDeMaterial();
    }
};

const cerrarModalTipos = () => {
    modalTiposVisible.value = false;
};

const seleccionarTipo = (tipo) => {
    formData.value.tipo = tipo.nombre;
    formData.value.tipo_de_material_id = tipo.id;
    cerrarModalTipos();
};

// ============ LIFECYCLE HOOKS ============
onMounted(async () => {
    console.log('NuevoMaterial mounted');
    
    // Cargar materiales existentes para generar nombre incremental
    let numeroMaterial = 1;
    try {
        const response = await fetchMateriales();
        const materialesExistentes = Array.isArray(response) ? response : (response.data || []);
        // Contar materiales con nombre "Material Nuevo X" para obtener el siguiente número
        const materialesNuevos = materialesExistentes.filter(m => 
            m.nombre && m.nombre.startsWith('Material Nuevo')
        );
        numeroMaterial = materialesNuevos.length + 1;
        console.log('Número de materiales nuevos existentes:', materialesNuevos.length);
    } catch (err) {
        console.error('Error contando materiales existentes:', err);
    }
    
    // Cargar tipos de material
    await cargarTiposDeMaterial();
    
    // Actualizar nombres con número incremental
    formData.value.nombre = `Material Nuevo ${numeroMaterial}`;
    formData.value.codigo = `MAT_${numeroMaterial}_${Date.now().toString().slice(-4)}`;
    console.log('Nombre asignado:', formData.value.nombre);
    console.log('Código asignado:', formData.value.codigo);
});
</script>

<template>
    <div class="nuevo-material-container">
        <!-- Header -->
        <div class="page-header">
            <button class="btn-back" @click="$router.push('/materiales')">← Volver</button>
            <h1 class="page-title">Nuevo Material</h1>
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

        <!-- Formulario -->
        <div class="info-card">
            <h2 class="section-title">Información del Material</h2>
            <div class="info-grid">
                <div class="form-group">
                    <label class="form-label">Nombre del Material *</label>
                    <input v-model="formData.nombre" type="text" class="form-input" placeholder="Ej: Pata De Mesa"
                        @blur="validarCampo('nombre')">
                    <span v-if="erroresValidacion.nombre" class="error-text">{{ erroresValidacion.nombre }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Código del Material *</label>
                    <input v-model="formData.codigo" type="text" class="form-input" placeholder="Ej: PAT_MES_1"
                        @blur="validarCampo('codigo')">
                    <span v-if="erroresValidacion.codigo" class="error-text">{{ erroresValidacion.codigo }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Tipo de Material</label>
                    <div class="tipo-display">
                        <span class="tipo-label">{{ formData.tipo || 'Seleccionar tipo...' }}</span>
                        <button type="button" class="btn-select-tipo" @click="mostrarModalTipos">
                            Cambiar
                        </button>
                    </div>
                </div>

                <div class="form-group full-width">
                    <label class="form-label">Descripción del Material</label>
                    <textarea v-model="formData.descripcion" class="form-input textarea-input"
                        placeholder="Descripción detallada del material" rows="3"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Unidad de Medida *</label>
                    <input v-model="formData.unidad_medida" type="text" class="form-input"
                        placeholder="Ej: Metro, Kg, Unidad" @blur="validarCampo('unidad_medida')">
                    <span v-if="erroresValidacion.unidad_medida" class="error-text">{{ erroresValidacion.unidad_medida
                    }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Alto*</label>
                    <input v-model.number="formData.alto" type="number" min="0" class="form-input" placeholder="Ej: 100"
                        @blur="validarCampo('alto')">
                    <span v-if="erroresValidacion.alto" class="error-text">{{ erroresValidacion.alto }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Ancho*</label>
                    <input v-model.number="formData.ancho" type="number" min="0" class="form-input"
                        placeholder="Ej: 100" @blur="validarCampo('ancho')">
                    <span v-if="erroresValidacion.ancho" class="error-text">{{ erroresValidacion.ancho }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Largo*</label>
                    <input v-model.number="formData.largo" type="number" min="0" class="form-input"
                        placeholder="Ej: 100" @blur="validarCampo('largo')">
                    <span v-if="erroresValidacion.largo" class="error-text">{{ erroresValidacion.largo }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Precio Unitario *</label>
                    <input v-model.number="formData.precio_unitario" type="number" min="0" step="0.01" class="form-input"
                        placeholder="Ej: 250.75" @blur="validarCampo('precio_unitario')">
                    <span v-if="erroresValidacion.precio_unitario" class="error-text">{{ erroresValidacion.precio_unitario
                    }}</span>
                </div>
            </div>
        </div>

        <!-- Resumen -->
        <div class="resumen-card">
            <h2 class="section-title">Resumen del Material</h2>
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
                    <label>Precio Unitario</label>
                    <span class="resumen-valor">${{ formatCurrency(formData.precio_unitario) }}</span>
                </div>
                
            </div>
        </div>

        <!-- Botones de Acción -->
        <div class="action-buttons">
            <button class="btn-secondary" @click="$router.push('/materiales')">Cancelar</button>
            <button class="btn-primary" @click="guardarMaterial" :disabled="cargando">
                {{ cargando ? 'Guardando...' : 'Guardar Material' }}
            </button>
        </div>

        <!-- Modal de Tipos de Material -->
        <div v-if="modalTiposVisible" class="modal-overlay" @click.self="cerrarModalTipos">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Seleccionar Tipo de Material</h2>
                    <button class="modal-close" @click="cerrarModalTipos">✕</button>
                </div>

                <!-- Loading -->
                <div v-if="tiposLoading" class="modal-loading">
                    <p>Cargando tipos de material...</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="tiposDeMaterial.length === 0" class="modal-empty">
                    <p>No hay tipos de material disponibles</p>
                </div>

                <!-- Lista de Tipos -->
                <div v-else class="tipos-list">
                    <div v-for="tipo in tiposDeMaterial" :key="tipo.id" class="tipo-item" @click="seleccionarTipo(tipo)">
                        <div class="tipo-info">
                            <h3>{{ tipo.nombre }}</h3>
                            <p v-if="tipo.descripcion" class="tipo-descripcion">{{ tipo.descripcion }}</p>
                        </div>
                        <div class="tipo-codigo">{{ tipo.codigo }}</div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" @click="cerrarModalTipos">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.nuevo-material-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    min-height: 100vh;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
}

.btn-back {
    padding: 8px 16px;
    background: #d4a574;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s;
}

.btn-back:hover {
    background: #c89564;
    transform: translateX(-2px);
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.error-message,
.success-message {
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
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
}

.success-message {
    background: #efe;
    color: #3c3;
    border-left: 4px solid #3c3;
}

.error-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 20px;
    cursor: pointer;
    padding: 0 8px;
}

.info-card,
.resumen-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede7e0;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: #5a4037;
    margin: 0 0 20px 0;
    padding-bottom: 15px;
    border-bottom: 2px solid #f5f1ed;
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
    font-size: 14px;
    font-weight: 600;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-input {
    padding: 12px 16px;
    border: 1px solid #d4a574;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.3s;
    background: white;
}

.form-input:focus {
    outline: none;
    border-color: #b8860b;
    box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.resumen-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: #faf7f2;
    border-radius: 8px;
    border: 1px solid #ede7e0;
}

.resumen-item label {
    font-size: 12px;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.resumen-valor {
    font-size: 16px;
    font-weight: 600;
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
    padding: 12px 32px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background: #c89564;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f5f1ed;
    color: #5a4037;
    border: 1px solid #d4a574;
}

.btn-secondary:hover {
    background: #ede7e0;
    border-color: #c89564;
}

/* Selector de Tipo */
.tipo-selector {
    display: flex;
    gap: 8px;
}

.tipo-selector .form-input {
    flex: 1;
    cursor: not-allowed;
}

.tipo-display {
    display: flex;
    gap: 8px;
    align-items: center;
}

.tipo-label {
    flex: 1;
    padding: 12px 16px;
    background: #faf7f2;
    border: 1px solid #d4a574;
    border-radius: 6px;
    font-size: 14px;
    color: #5a4037;
    font-weight: 500;
}

.btn-select-tipo {
    padding: 10px 16px;
    background: #d4a574;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
}

.btn-select-tipo:hover {
    background: #c89564;
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
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
}

.modal-content {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid #ede7e0;
}

.modal-header h2 {
    margin: 0;
    color: #5a4037;
    font-size: 20px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0;
    transition: color 0.3s;
}

.modal-close:hover {
    color: #5a4037;
}

.modal-loading,
.modal-empty {
    padding: 40px 30px;
    text-align: center;
    color: #999;
}

.tipos-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px 30px;
}

.tipo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    margin-bottom: 12px;
    background: #faf7f2;
    border: 1px solid #ede7e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.tipo-item:hover {
    background: #f0e8df;
    border-color: #d4a574;
    transform: translateX(4px);
}

.tipo-info h3 {
    margin: 0 0 4px 0;
    color: #5a4037;
    font-size: 16px;
    font-weight: 600;
}

.tipo-descripcion {
    margin: 0;
    color: #999;
    font-size: 13px;
}

.tipo-codigo {
    background: #d4a574;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.modal-footer {
    padding: 20px 30px;
    border-top: 1px solid #ede7e0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
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
    }

    .page-title {
        font-size: 24px;
    }

    .info-grid,
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
    }
}
</style>
