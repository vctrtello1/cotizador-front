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
                <button class="btn-primary" @click="mostrarModalComponentes = true">+ Seleccionar Componentes</button>
            </div>

            <div v-if="formData.componentes.length === 0" class="empty-state">
                <p>No hay componentes seleccionados. Elige uno del desplegable arriba.</p>
            </div>

            <div v-else class="componentes-list">
                <div v-for="(componente, idx) in formData.componentes" :key="idx" class="componente-row">
                    <div class="componente-info">
                        <div class="componente-name">
                            <strong>{{ componente.nombre }}</strong>
                            <span class="componente-codigo">{{ componente.codigo }}</span>
                        </div>
                    </div>

                    <div class="componente-controls">
                        <div class="quantity-input">
                            <label>Cantidad:</label>
                            <input 
                                v-model.number="componente.cantidad" 
                                type="number" 
                                min="1" 
                                class="form-input"
                            >
                        </div>

                        <div class="select-input">
                            <label>Acabado:</label>
                            <select v-model="componente.acabado_id" class="form-input">
                                <option value="">Seleccionar...</option>
                                <option v-for="acabado in acabados" :key="acabado.id" :value="acabado.id">
                                    {{ acabado.nombre }}
                                </option>
                            </select>
                        </div>

                        <div class="select-input">
                            <label>Mano de Obra:</label>
                            <select v-model="componente.mano_de_obra_id" class="form-input">
                                <option value="">Seleccionar...</option>
                                <option v-for="mano in manosDeObra" :key="mano.id" :value="mano.id">
                                    {{ mano.nombre }}
                                </option>
                            </select>
                        </div>

                        <button class="btn-delete-small" @click="eliminarComponente(idx)">Eliminar</button>
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

        <!-- Modal para seleccionar componentes -->
        <div v-if="mostrarModalComponentes" class="modal-overlay" @click.self="mostrarModalComponentes = false">
            <div class="modal-content modal-componentes">
                <div class="modal-header">
                    <h3>Seleccionar Componentes</h3>
                    <button class="modal-close" @click="mostrarModalComponentes = false">✕</button>
                </div>

                <div class="modal-body modal-componentes-body">
                    <div v-if="todosLosComponentes.length === 0" class="empty-state">
                        <p>No hay componentes disponibles</p>
                    </div>

                    <div v-else class="componentes-lista">
                        <div v-for="componente in todosLosComponentes" :key="componente.id" class="componente-item">
                            <div class="componente-info-modal">
                                <h4>{{ componente.nombre }}</h4>
                                <p>{{ componente.codigo }}</p>
                            </div>
                            <button 
                                class="btn-add-component"
                                @click="abrirModalConfiguracion(componente)"
                                :disabled="formData.componentes.some(c => c.id == componente.id)"
                            >
                                {{ formData.componentes.some(c => c.id == componente.id) ? 'Agregado' : 'Agregar' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para agregar/editar componente -->
        <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Agregar Componente</h3>
                    <button class="modal-close" @click="cerrarModal">✕</button>
                </div>

                <div class="modal-body">
                    <div class="modal-item">
                        <label class="modal-label">Componente:</label>
                        <div class="modal-value">{{ componenteActual?.nombre }}</div>
                    </div>

                    <div class="modal-item">
                        <label class="modal-label">Código:</label>
                        <div class="modal-value">{{ componenteActual?.codigo }}</div>
                    </div>

                    <div class="modal-item">
                        <label class="modal-label">Cantidad *</label>
                        <input 
                            v-model.number="componenteActual.cantidad" 
                            type="number" 
                            min="1" 
                            class="form-input"
                        >
                    </div>

                    <div class="modal-item">
                        <label class="modal-label">Acabado *</label>
                        <select v-model="componenteActual.acabado_id" class="form-input">
                            <option value="">Seleccionar acabado...</option>
                            <option v-for="acabado in acabados" :key="acabado.id" :value="acabado.id">
                                {{ acabado.nombre }} - ${{ formatCurrency(acabado.costo) }}
                            </option>
                        </select>
                    </div>

                    <div class="modal-item">
                        <label class="modal-label">Mano de Obra *</label>
                        <select v-model="componenteActual.mano_de_obra_id" class="form-input">
                            <option value="">Seleccionar mano de obra...</option>
                            <option v-for="mano in manosDeObra" :key="mano.id" :value="mano.id">
                                {{ mano.nombre }} - ${{ formatCurrency(mano.costo_total) }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
                    <button class="btn-primary" @click="guardarComponente">Guardar Componente</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { crearModulo, fetchAcabados, fetchManosDeObra, fetchModulos } from '@/http/modulos-api';

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
const todosLosComponentes = ref([]);
const componenteSeleccionado = ref('');

// Modal
const mostrarModal = ref(false);
const mostrarModalComponentes = ref(false);
const componenteActual = ref({
    id: null,
    nombre: '',
    codigo: '',
    cantidad: 1,
    acabado_id: '',
    mano_de_obra_id: ''
});

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
        
        // Cargar todos los componentes disponibles
        cargarTodosLosComponentes();
    } catch (err) {
        console.error('Error cargando catálogos:', err);
        error.value = 'No se pudieron cargar los catálogos. Intenta nuevamente.';
    } finally {
        cargandoCatalogos.value = false;
    }
};

// Cargar todos los componentes de todos los módulos
const cargarTodosLosComponentes = async () => {
    try {
        const response = await fetchModulos();
        const modulos = response.data || response;
        const componentesMap = new Map();
        
        modulos.forEach(modulo => {
            if (modulo.componentes) {
                modulo.componentes.forEach(comp => {
                    if (!componentesMap.has(comp.id)) {
                        componentesMap.set(comp.id, {
                            id: comp.id,
                            nombre: comp.nombre,
                            codigo: comp.codigo,
                            descripcion: comp.descripcion,
                            cantidad: 1,
                            acabado_id: null,
                            mano_de_obra_id: null
                        });
                    }
                });
            }
        });
        
        todosLosComponentes.value = Array.from(componentesMap.values());
    } catch (err) {
        console.error('Error cargando componentes:', err);
    }
};

// Observar cambios en el combobox de componentes
watch(componenteSeleccionado, (nuevoComponenteId) => {
    if (nuevoComponenteId) {
        const componente = todosLosComponentes.value.find(c => c.id == nuevoComponenteId);
        if (componente) {
            abrirModalConfiguracion(componente);
        }
    }
});

// Abrir modal de configuración para agregar componente
const abrirModalConfiguracion = (componente) => {
    componenteActual.value = {
        id: componente.id,
        nombre: componente.nombre,
        codigo: componente.codigo,
        cantidad: 1,
        acabado_id: '',
        mano_de_obra_id: ''
    };
    mostrarModal.value = true;
    mostrarModalComponentes.value = false;
};

// Guardar componente del modal
const guardarComponente = () => {
    if (!componenteActual.value.acabado_id || !componenteActual.value.mano_de_obra_id) {
        error.value = 'Debe seleccionar acabado y mano de obra';
        return;
    }
    
    formData.value.componentes.push({...componenteActual.value});
    cerrarModal();
};

// Cerrar modal
const cerrarModal = () => {
    mostrarModal.value = false;
    componenteSeleccionado.value = '';
    componenteActual.value = {
        id: null,
        nombre: '',
        codigo: '',
        cantidad: 1,
        acabado_id: '',
        mano_de_obra_id: ''
    };
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

.componente-row {
    border: 1px solid #ede7e0;
    border-radius: 8px;
    padding: 16px;
    background: #faf7f2;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.componente-info {
    border-bottom: 1px solid #e0d7d0;
    padding-bottom: 12px;
}

.componente-name {
    display: flex;
    align-items: center;
    gap: 12px;
}

.componente-name strong {
    color: #5a4037;
    font-size: 15px;
}

.componente-codigo {
    background: #d4a574;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.componente-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    align-items: flex-end;
}

.quantity-input,
.select-input {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.quantity-input label,
.select-input label {
    font-size: 12px;
    font-weight: 600;
    color: #5a4037;
}

.quantity-input input,
.select-input select {
    padding: 6px 8px;
    font-size: 13px;
    border: 1px solid #d4a574;
    border-radius: 4px;
    background: white;
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
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e0d7d0;
    background: #faf7f2;
}

.modal-header h3 {
    margin: 0;
    color: #5a4037;
    font-size: 18px;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.modal-close:hover {
    background: #e0d7d0;
    color: #5a4037;
}

.modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.modal-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.modal-label {
    font-size: 13px;
    font-weight: 600;
    color: #5a4037;
}

.modal-value {
    padding: 10px 12px;
    background: #faf7f2;
    border: 1px solid #e0d7d0;
    border-radius: 4px;
    font-size: 14px;
    color: #5a4037;
}

.modal-footer {
    display: flex;
    gap: 12px;
    padding: 24px;
    border-top: 1px solid #e0d7d0;
    background: #faf7f2;
}

.modal-footer button {
    flex: 1;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
}

/* Modal de Componentes */
.modal-componentes {
    max-width: 700px;
}

.modal-componentes-body {
    max-height: 500px;
    overflow-y: auto;
}

.componentes-lista {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.componente-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #faf7f2;
    border: 1px solid #e0d7d0;
    border-radius: 6px;
    transition: all 0.2s;
}

.componente-item:hover {
    background: #f5f1ed;
    border-color: #d4a574;
}

.componente-info-modal {
    flex: 1;
}

.componente-info-modal h4 {
    margin: 0;
    color: #5a4037;
    font-size: 14px;
    font-weight: 600;
}

.componente-info-modal p {
    margin: 4px 0 0 0;
    color: #999;
    font-size: 12px;
}

.btn-add-component {
    padding: 6px 16px;
    background: #d4a574;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s;
    white-space: nowrap;
}

.btn-add-component:hover:not(:disabled) {
    background: #c5965c;
}

.btn-add-component:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
