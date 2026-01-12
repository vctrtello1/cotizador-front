<template>
    <div class="nueva-cotizacion-container">
        <!-- Header -->
        <div class="page-header">
            <button class="btn-back" @click="$router.push('/cotizaciones')">← Volver</button>
            <h1 class="page-title">Nueva Cotización</h1>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Información del cliente -->
        <div class="info-card cliente-card">
            <h2 class="section-title">Información del Cliente</h2>
            <div class="info-grid">
                <div class="form-group">
                    <label class="form-label">Cliente</label>
                    <div class="cliente-selector">
                        <select v-model="formData.cliente_id" class="form-input">
                            <option value="">Seleccionar cliente...</option>
                            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                                {{ cliente.nombre }}
                            </option>
                        </select>
                        <button v-if="!formData.cliente_id" class="btn-new-cliente" @click="mostrarModalCliente = true">+ Nuevo</button>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Empresa</label>
                    <input type="text" :value="clienteSeleccionado?.empresa || ''" disabled class="form-input" placeholder="Se llena automáticamente">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" :value="clienteSeleccionado?.email || ''" disabled class="form-input" placeholder="Se llena automáticamente">
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha</label>
                    <input type="date" v-model="formData.fecha" class="form-input">
                </div>
            </div>
        </div>

        <!-- Módulos -->
        <div class="modulos-section">
            <div class="modulos-header">
                <h2 class="section-title">Módulos</h2>
                <button class="btn-primary" @click="agregarModulo">+ Agregar Módulo</button>
            </div>

            <div v-if="formData.modulos.length === 0" class="empty-state">
                <p>No hay módulos agregados. Haz clic en "Agregar Módulo" para comenzar.</p>
            </div>

            <div v-for="(modulo, moduloIdx) in formData.modulos" :key="moduloIdx" class="modulo-card">
                <div class="modulo-header">
                    <div class="modulo-info">
                        <input v-model="modulo.nombre" class="modulo-input" placeholder="Nombre del módulo">
                        <span class="modulo-cantidad-badge">{{ modulo.cantidad }} unidad{{ modulo.cantidad !== 1 ? 'es' : '' }}</span>
                    </div>
                    <input v-model="modulo.codigo" class="modulo-codigo-input" placeholder="Código">
                    <input v-model="modulo.descripcion" class="modulo-descripcion-input" placeholder="Descripción">
                    <button class="btn-delete" @click="eliminarModulo(moduloIdx)">Eliminar</button>
                </div>

                <!-- Cantidad del módulo -->
                <div class="modulo-cantidad-section">
                    <label class="form-label">Cantidad</label>
                    <input v-model.number="modulo.cantidad" type="number" min="1" class="form-input cantidad-input">
                </div>

                <!-- Componentes -->
                <div class="componentes-section">
                    <div class="componentes-header">
                        <h4>Componentes</h4>
                        <button class="btn-secondary" @click="agregarComponente(moduloIdx)">+ Agregar Componente</button>
                    </div>

                    <div v-if="modulo.componentes.length === 0" class="empty-state-small">
                        <p>Sin componentes</p>
                    </div>

                    <div v-else class="articulos-table">
                        <div class="table-header">
                            <div class="col-nombre">Nombre</div>
                            <div class="col-cantidad">Cantidad</div>
                            <div class="col-precio">Precio Unit.</div>
                            <div class="col-subtotal">Subtotal</div>
                            <div class="col-acciones">Acciones</div>
                        </div>
                        <div v-for="(componente, compIdx) in modulo.componentes" :key="compIdx" class="table-row">
                            <input v-model="componente.nombre" class="table-input" placeholder="Nombre">
                            <input v-model.number="componente.cantidad" type="number" min="1" class="table-input">
                            <div class="precio-container">
                                <span>$</span>
                                <input v-model.number="componente.precio_unitario" type="number" step="0.01" min="0" class="table-input">
                            </div>
                            <div class="subtotal-display">${{ formatCurrency(calcularSubtotal(componente)) }}</div>
                            <button class="btn-delete-small" @click="eliminarComponente(moduloIdx, compIdx)">✕</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total -->
        <div class="total-card">
            <div class="total-content">
                <span class="total-label">Total de la Cotización</span>
                <span class="total-amount">${{ formatCurrency(totalCotizacion) }}</span>
            </div>
        </div>

        <!-- Botones de acción -->
        <div class="acciones-footer">
            <button class="btn-cancel" @click="$router.push('/cotizaciones')" :disabled="loading">Cancelar</button>
            <button class="btn-save" @click="guardarCotizacion" :disabled="loading">
                {{ loading ? 'Guardando...' : 'Guardar Cotización' }}
            </button>
        </div>

        <!-- Modal Nuevo Cliente -->
        <div v-if="mostrarModalCliente" class="modal-overlay" @click.self="mostrarModalCliente = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Nuevo Cliente</h3>
                    <button class="btn-close" @click="mostrarModalCliente = false">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Nombre</label>
                        <input v-model="nuevoCliente.nombre" type="text" class="form-input" placeholder="Nombre del cliente">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Empresa</label>
                        <input v-model="nuevoCliente.empresa" type="text" class="form-input" placeholder="Nombre de la empresa">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input v-model="nuevoCliente.email" type="email" class="form-input" placeholder="email@ejemplo.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Teléfono (opcional)</label>
                        <input v-model="nuevoCliente.telefono" type="tel" class="form-input" placeholder="+1 (555) 000-0000">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" @click="mostrarModalCliente = false" :disabled="creandoCliente">Cancelar</button>
                    <button class="btn-save" @click="crearNuevoCliente" :disabled="creandoCliente">
                        {{ creandoCliente ? 'Creando...' : 'Crear Cliente' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCotizacionesStore } from '../stores/cotizaciones';
import { useClientesStore } from '../stores/clientes';
import { crearCotizacion } from '../http/cotizaciones-api';
import { crearCliente } from '../http/clientes-api';
import { obtenerTokenCsrf } from '../http/apl';

const router = useRouter();
const storeC = useCotizacionesStore();
const storeClientes = useClientesStore();

const formData = reactive({
    cliente_id: '',
    fecha: new Date().toISOString().split('T')[0],
    modulos: []
});

const clientes = computed(() => storeClientes.clientes);
const loading = ref(false);
const error = ref(null);
const mostrarModalCliente = ref(false);
const creandoCliente = ref(false);

const nuevoCliente = reactive({
    nombre: '',
    empresa: '',
    email: '',
    telefono: ''
});

const clienteSeleccionado = computed(() => {
    if (!formData.cliente_id) return null;
    return clientes.value.find(c => c.id === Number(formData.cliente_id));
});

const totalCotizacion = computed(() => {
    return formData.modulos.reduce((sum, modulo) => {
        return sum + modulo.componentes.reduce((subtotal, comp) => 
            subtotal + calcularSubtotal(comp), 0
        );
    }, 0);
});

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    const num = Number(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('es-MX', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
};

const calcularSubtotal = (componente) => {
    return (Number(componente.cantidad) || 0) * (Number(componente.precio_unitario) || 0);
};

const agregarModulo = () => {
    formData.modulos.push({
        nombre: '',
        codigo: '',
        descripcion: '',
        cantidad: 1,
        componentes: []
    });
};

const eliminarModulo = (index) => {
    formData.modulos.splice(index, 1);
};

const agregarComponente = (moduloIdx) => {
    formData.modulos[moduloIdx].componentes.push({
        nombre: '',
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0
    });
};

const eliminarComponente = (moduloIdx, compIdx) => {
    formData.modulos[moduloIdx].componentes.splice(compIdx, 1);
};

const guardarCotizacion = async () => {
    if (!formData.cliente_id) {
        error.value = 'Por favor selecciona un cliente';
        return;
    }

    if (formData.modulos.length === 0) {
        error.value = 'Por favor agrega al menos un módulo';
        return;
    }

    // Validar que cada módulo tenga al menos un componente
    const modulosSinComponentes = formData.modulos.some(m => m.componentes.length === 0);
    if (modulosSinComponentes) {
        error.value = 'Cada módulo debe tener al menos un componente';
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const datosParaEnviar = {
            cliente_id: Number(formData.cliente_id),
            fecha: formData.fecha,
            total: totalCotizacion.value,
            modulos: formData.modulos.map(modulo => ({
                nombre: modulo.nombre,
                codigo: modulo.codigo,
                descripcion: modulo.descripcion,
                cantidad: modulo.cantidad,
                componentes: modulo.componentes.map(comp => ({
                    nombre: comp.nombre,
                    cantidad: comp.cantidad,
                    precio_unitario: comp.precio_unitario,
                    subtotal: calcularSubtotal(comp)
                }))
            }))
        };

        const response = await crearCotizacion(datosParaEnviar);
        console.log('Cotización guardada:', response);
        
        // Recargar cotizaciones en el store
        await storeC.fetchCotizaciones();
        
        router.push(`/cotizaciones/${response.id}`);
    } catch (err) {
        console.error('Error guardando cotización:', err);
        error.value = err.response?.data?.message || 'Error al guardar la cotización';
    } finally {
        loading.value = false;
    }
};

const cargarClientes = async () => {
    try {
        await storeClientes.fetchClientes();
    } catch (err) {
        console.error('Error cargando clientes:', err);
        error.value = 'Error al cargar los clientes';
    }
};

const crearNuevoCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.empresa || !nuevoCliente.email) {
        error.value = 'Por favor completa los campos obligatorios: Nombre, Empresa, Email';
        return;
    }

    creandoCliente.value = true;
    error.value = null;

    try {
        const datosCliente = {
            nombre: nuevoCliente.nombre,
            empresa: nuevoCliente.empresa,
            email: nuevoCliente.email,
            ...(nuevoCliente.telefono && { telefono: nuevoCliente.telefono })
        };

        const response = await crearCliente(datosCliente);
        console.log('Cliente creado:', response);

        // Recargar lista de clientes
        await storeClientes.fetchClientes();

        // Seleccionar el nuevo cliente automáticamente
        formData.cliente_id = response.id || response.data?.id;

        // Limpiar formulario y cerrar modal
        nuevoCliente.nombre = '';
        nuevoCliente.empresa = '';
        nuevoCliente.email = '';
        nuevoCliente.telefono = '';
        mostrarModalCliente.value = false;
    } catch (err) {
        console.error('Error creando cliente:', err);
        error.value = err.response?.data?.message || 'Error al crear el cliente';
    } finally {
        creandoCliente.value = false;
    }
};

onMounted(() => {
    obtenerTokenCsrf();
    cargarClientes();
});
</script>

<style scoped>
.nueva-cotizacion-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 32px;
    font-family: 'Georgia', 'Garamond', serif;
    background: transparent;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 32px;
    padding: 24px;
    background: var(--cream, #F5F1E8);
    border-radius: 12px;
    border: 2px solid var(--color-border, #E5DFD0);
}

.btn-back {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: #F5F1E8;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.1);
    flex-shrink: 0;
}

.btn-back:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(44, 24, 16, 0.2);
}

.page-title {
    font-size: 2.5rem;
    color: #2C1810;
    margin: 0;
    font-weight: 700;
    line-height: 1.2;
}

.error-message {
    background: #FEE5E5;
    border: 2px solid #FF6B6B;
    border-radius: 8px;
    padding: 16px 24px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #C92A2A;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
}

.error-close {
    background: transparent;
    border: none;
    color: #FF6B6B;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;
}

.error-close:hover {
    color: #C92A2A;
}

.info-card {
    background: var(--cream, #F5F1E8);
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.08);
}

.section-title {
    font-size: 1.75rem;
    color: #4A3020;
    margin: 0 0 24px 0;
    font-weight: 700;
    padding-bottom: 16px;
    border-bottom: 2px solid #C9A961;
    line-height: 1.2;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

@media (max-width: 768px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.cliente-selector {
    display: flex;
    gap: 8px;
    align-items: stretch;
}

.cliente-selector .form-input {
    flex: 1;
}

.form-label {
    font-size: 0.9rem;
    color: var(--wood-medium, #6B4423);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-input {
    padding: 12px 16px;
    border: 1px solid var(--color-border, #E5DFD0);
    border-radius: 8px;
    font-size: 1rem;
    color: var(--wood-darkest, #2C1810);
    font-family: inherit;
    transition: border-color 0.3s ease;
}

.form-input:focus {
    outline: none;
    border-color: #C9A961;
    box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
}

.form-input:disabled {
    background-color: #f5f1e8;
    color: #999;
}

.modulos-section {
    margin-bottom: 32px;
}

.modulos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 24px 32px;
    background: linear-gradient(135deg, #F5F1E8 0%, #FAF8F3 100%);
    border-radius: 12px;
    border-left: 4px solid #C9A961;
    box-shadow: 0 2px 8px rgba(44, 24, 16, 0.08);
}

.modulos-header .section-title {
    margin: 0;
    flex: 1;
}

.btn-primary {
    background: linear-gradient(135deg, #C9A961 0%, #B8995C 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.4);
}

.btn-secondary {
    background: linear-gradient(135deg, #8B6F47 0%, #A88860 100%);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.btn-secondary:hover {
    transform: translateY(-1px);
}

.modulo-card {
    background: var(--warm-white, #FAF8F3);
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 12px;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.08);
}

.modulo-header {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: #F5F1E8;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.modulo-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.modulo-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid rgba(245, 241, 232, 0.3);
    border-radius: 8px;
    background: rgba(245, 241, 232, 0.1);
    color: #F5F1E8;
    font-size: 1.5rem;
    font-weight: 700;
    font-family: inherit;
}

.modulo-input::placeholder {
    color: rgba(245, 241, 232, 0.5);
}

.modulo-input:focus {
    outline: none;
    background: rgba(245, 241, 232, 0.2);
    border-color: rgba(245, 241, 232, 0.6);
}

.modulo-cantidad-badge {
    background: rgba(245, 241, 232, 0.2);
    border: 1px solid rgba(245, 241, 232, 0.4);
    color: #F5F1E8;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
    backdrop-filter: blur(10px);
}

.modulo-codigo-input,
.modulo-descripcion-input {
    padding: 12px 16px;
    border: 1px solid rgba(245, 241, 232, 0.3);
    border-radius: 8px;
    background: rgba(245, 241, 232, 0.1);
    color: #F5F1E8;
    font-family: inherit;
    font-size: 0.95rem;
}

.modulo-codigo-input::placeholder,
.modulo-descripcion-input::placeholder {
    color: rgba(245, 241, 232, 0.5);
}

.modulo-codigo-input:focus,
.modulo-descripcion-input:focus {
    outline: none;
    background: rgba(245, 241, 232, 0.2);
    border-color: rgba(245, 241, 232, 0.6);
}

.btn-delete {
    background: rgba(200, 0, 0, 0.2);
    color: #FF6B6B;
    border: 1px solid rgba(255, 107, 107, 0.3);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-delete:hover {
    background: rgba(200, 0, 0, 0.3);
    border-color: rgba(255, 107, 107, 0.6);
}

.modulo-cantidad-section {
    padding: 16px 32px;
    background: var(--warm-white, #FAF8F3);
    border-bottom: 1px solid var(--color-border, #E5DFD0);
}

.cantidad-input {
    max-width: 150px;
}

.componentes-section {
    padding: 24px 32px;
}

.componentes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.componentes-header h4 {
    margin: 0;
    color: #2C1810;
    font-size: 1.1rem;
}

.empty-state,
.empty-state-small {
    text-align: center;
    padding: 24px;
    color: #999;
    font-style: italic;
}

.empty-state-small {
    padding: 16px;
    background: var(--cream, #F5F1E8);
    border-radius: 8px;
    border: 1px dashed var(--color-border, #E5DFD0);
}

.articulos-table {
    margin-top: 16px;
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 0.8fr 1fr 1fr 0.6fr;
    gap: 12px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #8B6F47 0%, #A88860 100%);
    color: #F5F1E8;
    font-weight: 700;
    font-size: 0.8rem;
    border-radius: 8px;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 0.8fr 1fr 1fr 0.6fr;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border, #E5DFD0);
    align-items: center;
}

.table-input {
    padding: 8px 12px;
    border: 1px solid var(--color-border, #E5DFD0);
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
}

.table-input:focus {
    outline: none;
    border-color: #C9A961;
    box-shadow: 0 0 0 2px rgba(201, 169, 97, 0.1);
}

.precio-container {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #2C1810;
    font-weight: 600;
}

.precio-container .table-input {
    flex: 1;
}

.subtotal-display {
    text-align: right;
    font-weight: 700;
    color: #C9A961;
    font-size: 0.95rem;
}

.btn-delete-small {
    background: rgba(200, 0, 0, 0.1);
    color: #FF6B6B;
    border: 1px solid rgba(255, 107, 107, 0.2);
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s ease;
    width: 100%;
}

.btn-delete-small:hover {
    background: rgba(200, 0, 0, 0.2);
    border-color: rgba(255, 107, 107, 0.4);
}

.total-card {
    background: linear-gradient(135deg, #4A3020 0%, #6B4423 100%);
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 8px 24px rgba(44, 24, 16, 0.2);
}

.total-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total-label {
    font-size: 1.5rem;
    color: #F5F1E8;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.total-amount {
    font-size: 2.5rem;
    color: #C9A961;
    font-weight: 800;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.acciones-footer {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    padding-top: 32px;
    border-top: 2px solid var(--color-border, #E5DFD0);
}

.btn-cancel {
    background: transparent;
    color: #6B4423;
    border: 2px solid #6B4423;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-cancel:hover:not(:disabled) {
    background: #6B4423;
    color: #F5F1E8;
}

.btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-save {
    background: linear-gradient(135deg, #4A3020 0%, #6B4423 100%);
    color: #F5F1E8;
    border: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.2);
}

.btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(44, 24, 16, 0.3);
}

.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .modulo-header {
        padding: 16px;
    }

    .modulo-info {
        flex-direction: column;
        align-items: stretch;
    }

    .modulo-cantidad-badge {
        align-self: flex-start;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .acciones-footer {
        flex-direction: column;
    }
}

.btn-new-cliente {
    background: linear-gradient(135deg, #C9A961 0%, #B8995C 100%);
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    font-size: 0.95rem;
}

.btn-new-cliente:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.4);
}

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
    background: var(--cream, #F5F1E8);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: #F5F1E8;
    padding: 24px 32px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.btn-close {
    background: transparent;
    border: none;
    color: #F5F1E8;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;
}

.btn-close:hover {
    color: #FFC9C9;
}

.modal-body {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.modal-footer {
    padding: 24px 32px;
    border-top: 2px solid var(--color-border, #E5DFD0);
    display: flex;
    gap: 16px;
    justify-content: flex-end;
}

.modal-footer .btn-cancel,
.modal-footer .btn-save {
    padding: 10px 24px;
}
</style>
