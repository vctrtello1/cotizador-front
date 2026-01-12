<template>
    <div class="nuevo-modulo-container">
        <!-- Header -->
        <div class="page-header">
            <button class="btn-back" @click="$router.push('/modulos')">← Volver</button>
            <h1 class="page-title">Nuevo Módulo</h1>
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

        <!-- Estado de carga de catálogos -->
        <div v-if="cargandoCatalogos" class="loading-state">
            <p>Cargando catálogos...</p>
        </div>

        <template v-if="!cargandoCatalogos">
        <div class="info-card">
            <h2 class="section-title">Información del Módulo</h2>
            <div class="info-grid">
                <div class="form-group">
                    <label class="form-label">Nombre del Módulo *</label>
                    <input 
                        v-model="formData.nombre" 
                        type="text" 
                        class="form-input" 
                        placeholder="Ej: Comedor Moderno"
                        @blur="validarCampo('nombre')"
                    >
                    <span v-if="erroresValidacion.nombre" class="error-text">{{ erroresValidacion.nombre }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Código del Módulo *</label>
                    <input 
                        v-model="formData.codigo" 
                        type="text" 
                        class="form-input" 
                        placeholder="Ej: COM_MODERNO"
                        @blur="validarCampo('codigo')"
                    >
                    <span v-if="erroresValidacion.codigo" class="error-text">{{ erroresValidacion.codigo }}</span>
                </div>

                <div class="form-group full-width">
                    <label class="form-label">Descripción del Módulo</label>
                    <textarea 
                        v-model="formData.descripcion" 
                        class="form-input textarea-input" 
                        placeholder="Descripción detallada del módulo"
                        rows="3"
                    ></textarea>
                </div>
            </div>
        </div>

        <!-- Componentes del Módulo -->
        <div class="componentes-section">
            <div class="componentes-header">
                <h2 class="section-title">Componentes del Módulo</h2>
                <button class="btn-primary" @click="agregarComponente">+ Agregar Componente</button>
            </div>

            <div v-if="formData.componentes.length === 0" class="empty-state">
                <p>No hay componentes agregados. Haz clic en "+ Agregar Componente" para añadir.</p>
            </div>

            <div v-else class="componentes-list">
                <div v-for="(componente, idx) in formData.componentes" :key="idx" class="componente-card">
                    <div class="componente-header">
                        <div class="componente-title">
                            <h4>Componente {{ idx + 1 }}</h4>
                            <button class="btn-delete-small" @click="eliminarComponente(idx)">Eliminar</button>
                        </div>
                    </div>

                    <div class="componente-grid">
                        <div class="form-group">
                            <label class="form-label">Nombre *</label>
                            <input 
                                v-model="componente.nombre" 
                                type="text" 
                                class="form-input" 
                                placeholder="Ej: Silla Moderno"
                            >
                        </div>

                        <div class="form-group">
                            <label class="form-label">Código *</label>
                            <input 
                                v-model="componente.codigo" 
                                type="text" 
                                class="form-input" 
                                placeholder="Ej: COMP_SILLA"
                            >
                        </div>

                        <div class="form-group">
                            <label class="form-label">Cantidad *</label>
                            <input 
                                v-model.number="componente.cantidad" 
                                type="number" 
                                min="1" 
                                class="form-input"
                            >
                        </div>

                        <div class="form-group">
                            <label class="form-label">Acabado *</label>
                            <select v-model="componente.acabado_id" class="form-input">
                                <option value="">Seleccionar acabado...</option>
                                <option v-for="acabado in acabados" :key="acabado.id" :value="acabado.id">
                                    {{ acabado.nombre }} - ${{ formatCurrency(acabado.costo) }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Mano de Obra *</label>
                            <select v-model="componente.mano_de_obra_id" class="form-input">
                                <option value="">Seleccionar mano de obra...</option>
                                <option v-for="mano in manosDeObra" :key="mano.id" :value="mano.id">
                                    {{ mano.nombre }} - ${{ formatCurrency(mano.costo_total) }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">Descripción</label>
                            <textarea 
                                v-model="componente.descripcion" 
                                class="form-input textarea-input" 
                                placeholder="Descripción del componente"
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resumen de Costos -->
        <div v-if="formData.componentes.length > 0" class="resumen-card">
            <h2 class="section-title">Resumen de Costos</h2>
            <div class="resumen-grid">
                <div class="resumen-item">
                    <label>Cantidad de Componentes</label>
                    <span class="resumen-valor">{{ formData.componentes.length }}</span>
                </div>
                <div class="resumen-item">
                    <label>Costo Total Aproximado</label>
                    <span class="resumen-valor">${{ formatCurrency(calcularCostoTotal()) }}</span>
                </div>
            </div>
        </div>

        <!-- Botones de Acción -->
        <div class="action-buttons">
            <button class="btn-secondary" @click="$router.push('/modulos')">Cancelar</button>
            <button 
                class="btn-primary" 
                @click="guardarModulo"
                :disabled="cargando"
            >
                {{ cargando ? 'Guardando...' : 'Guardar Módulo' }}
            </button>
        </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { crearModulo, fetchAcabados, fetchManosDeObra } from '@/http/modulos-api';

const router = useRouter();

// Estado del formulario
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    componentes: []
});

// Catálogos
const acabados = ref([]);
const manosDeObra = ref([]);

// Estado de UI
const error = ref(null);
const exito = ref(null);
const cargando = ref(false);
const cargandoCatalogos = ref(true);
const erroresValidacion = ref({
    nombre: null,
    codigo: null
});

// Métodos de validación
const validarCampo = (campo) => {
    switch(campo) {
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
    }
};

const validarFormulario = () => {
    let valido = true;

    // Validar módulo
    if (!formData.value.nombre.trim()) {
        erroresValidacion.value.nombre = 'El nombre es requerido';
        valido = false;
    }
    if (!formData.value.codigo.trim()) {
        erroresValidacion.value.codigo = 'El código es requerido';
        valido = false;
    }

    // Validar componentes
    if (formData.value.componentes.length === 0) {
        error.value = 'Debe agregar al menos un componente';
        return false;
    }

    for (let componente of formData.value.componentes) {
        if (!componente.nombre.trim()) {
            error.value = 'Todos los componentes deben tener un nombre';
            return false;
        }
        if (!componente.codigo.trim()) {
            error.value = 'Todos los componentes deben tener un código';
            return false;
        }
        if (!componente.cantidad || componente.cantidad < 1) {
            error.value = 'Todos los componentes deben tener una cantidad válida';
            return false;
        }
        if (!componente.acabado_id) {
            error.value = 'Todos los componentes deben tener un acabado';
            return false;
        }
        if (!componente.mano_de_obra_id) {
            error.value = 'Todos los componentes deben tener mano de obra';
            return false;
        }
    }

    return valido;
};

// Métodos de componentes
const agregarComponente = () => {
    formData.value.componentes.push({
        nombre: '',
        codigo: '',
        descripcion: '',
        cantidad: 1,
        acabado_id: null,
        mano_de_obra_id: null
    });
};

const eliminarComponente = (idx) => {
    formData.value.componentes.splice(idx, 1);
};

// Métodos de cálculo
const calcularCostoTotal = () => {
    return formData.value.componentes.reduce((total, comp) => {
        const acabado = acabados.value.find(a => a.id === Number(comp.acabado_id));
        const mano = manosDeObra.value.find(m => m.id === Number(comp.mano_de_obra_id));
        const costUnit = (acabado?.costo || 0) + (mano?.costo_total || 0);
        return total + (costUnit * (comp.cantidad || 0));
    }, 0);
};

const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Guardar módulo
const guardarModulo = async () => {
    error.value = null;
    exito.value = null;

    if (!validarFormulario()) {
        return;
    }

    cargando.value = true;

    try {
        // Transformar componentes para enviar al backend
        const datosModulo = {
            nombre: formData.value.nombre,
            codigo: formData.value.codigo,
            descripcion: formData.value.descripcion,
            componentes: formData.value.componentes.map(comp => ({
                nombre: comp.nombre,
                codigo: comp.codigo,
                descripcion: comp.descripcion,
                cantidad: comp.cantidad,
                acabado_id: Number(comp.acabado_id),
                mano_de_obra_id: Number(comp.mano_de_obra_id)
            }))
        };

        console.log('Guardando módulo:', datosModulo);
        const response = await crearModulo(datosModulo);
        console.log('Módulo guardado:', response);

        exito.value = '✓ Módulo guardado exitosamente';
        setTimeout(() => {
            router.push('/modulos');
        }, 1500);
    } catch (err) {
        console.error('Error guardando módulo:', err);
        error.value = err.response?.data?.message || 'Error al guardar el módulo';
    } finally {
        cargando.value = false;
    }
};

// Cargar catálogos
const cargarCatalogos = async () => {
    try {
        cargandoCatalogos.value = true;
        
        const [acabadosRes, manosDeObraRes] = await Promise.all([
            fetchAcabados(),
            fetchManosDeObra()
        ]);

        acabados.value = acabadosRes.data || [];
        manosDeObra.value = manosDeObraRes.data || [];
    } catch (err) {
        console.error('Error cargando catálogos:', err);
        error.value = 'No se pudieron cargar los catálogos. Intenta nuevamente.';
    } finally {
        cargandoCatalogos.value = false;
    }
};

// Lifecycle
onMounted(() => {
    cargarCatalogos();
});
</script>

<style scoped>
.nuevo-modulo-container {
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

.loading-state {
    background: #f0f4f8;
    color: #5a4037;
    border-left: 4px solid #d4a574;
    padding: 16px 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    font-weight: 500;
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

.info-grid,
.componente-grid {
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

/* Componentes */
.componentes-section {
    background: white;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede7e0;
}

.componentes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.componentes-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.componente-card {
    border: 1px solid #ede7e0;
    border-radius: 8px;
    padding: 20px;
    background: #faf7f2;
}

.componente-header {
    margin-bottom: 20px;
}

.componente-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.componente-title h4 {
    font-size: 16px;
    font-weight: 600;
    color: #5a4037;
    margin: 0;
}

.btn-delete-small {
    padding: 6px 12px;
    background: #fee;
    color: #c33;
    border: 1px solid #c33;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s;
}

.btn-delete-small:hover {
    background: #c33;
    color: white;
}

.empty-state {
    padding: 40px 20px;
    text-align: center;
    color: #999;
    background: #faf7f2;
    border-radius: 8px;
    border: 2px dashed #d4a574;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
}

/* Resumen */
.resumen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.resumen-item {
    padding: 20px;
    background: #faf7f2;
    border-radius: 8px;
    border-left: 4px solid #d4a574;
}

.resumen-item label {
    display: block;
    font-size: 12px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.resumen-valor {
    font-size: 24px;
    font-weight: 700;
    color: #5a4037;
}

/* Botones de acción */
.action-buttons {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 40px;
}

.btn-primary,
.btn-secondary {
    padding: 12px 30px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-primary {
    background: #d4a574;
    color: white;
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
    .componente-grid,
    .resumen-grid {
        grid-template-columns: 1fr;
    }

    .action-buttons {
        flex-direction: column-reverse;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
    }
}
</style>
