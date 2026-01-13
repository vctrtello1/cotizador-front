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
                    <input v-model="formData.nombre" type="text" class="form-input" placeholder="Ej: Madera Pino"
                        @blur="validarCampo('nombre')">
                    <span v-if="erroresValidacion.nombre" class="error-text">{{ erroresValidacion.nombre }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Código del Material *</label>
                    <input v-model="formData.codigo" type="text" class="form-input" placeholder="Ej: MAD_PINO_1"
                        @blur="validarCampo('codigo')">
                    <span v-if="erroresValidacion.codigo" class="error-text">{{ erroresValidacion.codigo }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Tipo de Material</label>
                    <input v-model="formData.tipo" type="text" class="form-input"
                        placeholder="Ej: Madera, Metal, Plástico">
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
                    <label class="form-label">Costo Unitario *</label>
                    <input v-model.number="formData.costo_unitario" type="number" min="0" step="0.01" class="form-input"
                        placeholder="Ej: 250.75" @blur="validarCampo('costo_unitario')">
                    <span v-if="erroresValidacion.costo_unitario" class="error-text">{{ erroresValidacion.costo_unitario
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
                    <label>Costo Unitario</label>
                    <span class="resumen-valor">${{ formatCurrency(formData.costo_unitario) }}</span>
                </div>
                <div class="resumen-item">
                    <label>Stock Disponible</label>
                    <span class="resumen-valor">{{ formData.cantidad_disponible || 0 }} {{ formData.unidad_medida ||
                        'unidades' }}</span>
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
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { crearMaterial } from '@/http/materiales-api';

const router = useRouter();

// Estado del formulario
const formData = ref({
    nombre: '',
    codigo: '',
    tipo: '',
    descripcion: '',
    unidad_medida: '',
    cantidad_disponible: 0,
    costo_unitario: 0
});

// Estado de UI
const error = ref(null);
const exito = ref(null);
const cargando = ref(false);
const erroresValidacion = ref({
    nombre: null,
    codigo: null,
    unidad_medida: null,
    cantidad_disponible: null,
    costo_unitario: null
});

// Métodos de validación
const validarCampo = (campo) => {
    switch (campo) {
        case 'nombre':
            if (!formData.value.nombre.trim()) {
                erroresValidacion.value.nombre = 'El nombre es requerido';
            } else {
                erroresValidacion.value.nombre = null;
            }
            break;
        case 'codigo':
            if (!formData.value.codigo.trim()) {
                erroresValidacion.value.codigo = 'El código es requerido';
            } else {
                erroresValidacion.value.codigo = null;
            }
            break;
        case 'unidad_medida':
            if (!formData.value.unidad_medida.trim()) {
                erroresValidacion.value.unidad_medida = 'La unidad de medida es requerida';
            } else {
                erroresValidacion.value.unidad_medida = null;
            }
            break;
        case 'cantidad_disponible':
            if (formData.value.cantidad_disponible < 0) {
                erroresValidacion.value.cantidad_disponible = 'La cantidad debe ser mayor o igual a 0';
            } else {
                erroresValidacion.value.cantidad_disponible = null;
            }
            break;
        case 'costo_unitario':
            if (formData.value.costo_unitario < 0) {
                erroresValidacion.value.costo_unitario = 'El costo debe ser mayor o igual a 0';
            } else {
                erroresValidacion.value.costo_unitario = null;
            }
            break;
    }
};

const validarFormulario = () => {
    let valido = true;

    if (!formData.value.nombre.trim()) {
        erroresValidacion.value.nombre = 'El nombre es requerido';
        valido = false;
    }
    if (!formData.value.codigo.trim()) {
        erroresValidacion.value.codigo = 'El código es requerido';
        valido = false;
    }
    if (!formData.value.unidad_medida.trim()) {
        erroresValidacion.value.unidad_medida = 'La unidad de medida es requerida';
        valido = false;
    }
    if (formData.value.cantidad_disponible < 0) {
        erroresValidacion.value.cantidad_disponible = 'La cantidad debe ser mayor o igual a 0';
        valido = false;
    }
    if (formData.value.costo_unitario < 0) {
        erroresValidacion.value.costo_unitario = 'El costo debe ser mayor o igual a 0';
        valido = false;
    }

    return valido;
};

const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Guardar material
const guardarMaterial = async () => {
    error.value = null;
    exito.value = null;

    if (!validarFormulario()) {
        error.value = 'Por favor, completa todos los campos requeridos correctamente';
        return;
    }

    cargando.value = true;

    try {
        const datosMaterial = {
            nombre: formData.value.nombre,
            codigo: formData.value.codigo,
            tipo: formData.value.tipo,
            descripcion: formData.value.descripcion,
            unidad_medida: formData.value.unidad_medida,
            cantidad_disponible: formData.value.cantidad_disponible,
            costo_unitario: formData.value.costo_unitario
        };

        console.log('Guardando material:', datosMaterial);
        const response = await crearMaterial(datosMaterial);
        console.log('Material guardado:', response);

        exito.value = '✓ Material guardado exitosamente';
        setTimeout(() => {
            router.push('/materiales');
        }, 1500);
    } catch (err) {
        console.error('Error guardando material:', err);
        error.value = err.response?.data?.message || 'Error al guardar el material';
    } finally {
        cargando.value = false;
    }
};

onMounted(() => {
    console.log('NuevoMaterial mounted');
});
</script>

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
