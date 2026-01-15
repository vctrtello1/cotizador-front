<template>
    <div class="editar-cotizacion-container">
        <div v-if="cargandoDatos" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando cotización...</p>
        </div>

        <div v-else-if="cotizacion" class="cotizacion-form">
            <div class="form-header">
                <button class="btn-back" @click="$router.back()">← Volver</button>
                <h1 class="form-title">Editar Cotización #{{ cotizacion.id }}</h1>
            </div>

            <div class="form-content">
                <!-- Información básica -->
                <div class="form-section">
                    <h2 class="section-title">📋 Información de la Cotización</h2>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="cliente">Cliente</label>
                            <select v-model="cotizacion.cliente_id" id="cliente" class="form-input">
                                <option value="">Seleccionar Cliente</option>
                                <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                                    {{ cliente.nombre }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="fecha">Fecha</label>
                            <input 
                                v-model="cotizacion.fecha" 
                                id="fecha" 
                                type="date" 
                                class="form-input"
                            />
                        </div>

                        <div class="form-group">
                            <label for="estado">Estado</label>
                            <select v-model="cotizacion.estado" id="estado" class="form-input">
                                <option value="activa">Activa</option>
                                <option value="completada">Completada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Información del Cliente -->
                <div class="form-section">
                    <h2 class="section-title">👤 Datos del Cliente</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Cliente:</span>
                            <span class="info-value">{{ cotizacion.cliente?.nombre || 'Sin Cliente' }}</span>
                        </div>
                        <div v-if="cotizacion.cliente?.empresa" class="info-item">
                            <span class="info-label">Empresa:</span>
                            <span class="info-value">{{ cotizacion.cliente?.empresa }}</span>
                        </div>
                        <div v-if="cotizacion.cliente?.email" class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ cotizacion.cliente?.email }}</span>
                        </div>
                        <div v-if="cotizacion.cliente?.telefono" class="info-item">
                            <span class="info-label">Teléfono:</span>
                            <span class="info-value">{{ cotizacion.cliente?.telefono }}</span>
                        </div>
                    </div>
                </div>

                <!-- Módulos editable -->
                <div class="form-section">
                    <div class="section-header">
                        <h2 class="section-title">🧩 Módulos Asignados</h2>
                        <button @click="abrirSelectorModulos" class="btn-add-module">+ Agregar Módulo</button>
                    </div>

                    <!-- Debug info -->
                    <div v-if="cotizacion" class="debug-info">
                        <p style="font-size: 0.8rem; color: #999;">
                            Debug: {{ modulosAsignados.length }} módulos | Detalles: {{ detalles.length }} | 
                            Estructura: {{ cotizacion.modulos_ordenados ? 'modulos_ordenados' : cotizacion.detalles ? 'detalles' : 'ninguna' }}
                        </p>
                    </div>

                    <div v-if="modulosAsignados.length === 0" class="empty-state">
                        <p>No hay módulos asignados a esta cotización</p>
                    </div>

                    <div v-else class="modulos-editable">
                        <div class="table-header">
                            <div class="col-nombre">Módulo</div>
                            <div class="col-codigo">Código</div>
                            <div class="col-cantidad">Cantidad</div>
                            <div class="col-precio">Precio Unit.</div>
                            <div class="col-subtotal">Subtotal</div>
                            <div class="col-acciones">Acciones</div>
                        </div>

                        <div v-for="(modulo, index) in modulosAsignados" :key="index" class="table-row modulo-row">
                            <div class="col-nombre">{{ modulo.nombre }}</div>
                            <div class="col-codigo">{{ modulo.codigo }}</div>
                            <div class="col-cantidad">
                                <input 
                                    v-model.number="modulo.cantidad" 
                                    type="number" 
                                    min="1" 
                                    class="input-cantidad"
                                    @change="actualizarTotales"
                                />
                            </div>
                            <div class="col-precio">${{ formatCurrency(calcularPrecioUnitarioModulo(modulo)) }}</div>
                            <div class="col-subtotal">${{ formatCurrency(calcularSubtotalModulo(modulo)) }}</div>
                            <div class="col-acciones">
                                <button @click="eliminarModuloAsignado(index)" class="btn-delete-small">🗑️</button>
                            </div>
                        </div>
                    </div>

                    <!-- Selector de módulos modal -->
                    <div v-if="mostrarSelectorModulos" class="modal-overlay" @click="cerrarSelectorModulos">
                        <div class="modal-content" @click.stop>
                            <div class="modal-header">
                                <h3>Agregar Módulo</h3>
                                <button class="btn-close" @click="cerrarSelectorModulos">✕</button>
                            </div>

                            <div class="modal-body">
                                <div class="form-group">
                                    <label>Seleccionar Módulo:</label>
                                    <select v-model="moduloSeleccionado" class="form-input">
                                        <option value="">Seleccionar...</option>
                                        <option v-for="modulo in modulosDisponibles" :key="modulo.id" :value="modulo.id">
                                            {{ modulo.nombre }} ({{ modulo.codigo }}) - ${{ formatCurrency(modulo.precio) }}
                                        </option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>Cantidad:</label>
                                    <input 
                                        v-model.number="cantidadNuevaModulo" 
                                        type="number" 
                                        min="1" 
                                        class="form-input"
                                    />
                                </div>
                            </div>

                            <div class="modal-footer">
                                <button @click="cerrarSelectorModulos" class="btn-cancel">Cancelar</button>
                                <button @click="agregarModuloAsignado" class="btn-primary" :disabled="!moduloSeleccionado">
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen de totales -->
                <div class="form-section">
                    <h2 class="section-title">💰 Resumen Financiero</h2>
                    <div class="resumen-card">
                        <div class="resumen-item">
                            <span class="resumen-label">Subtotal:</span>
                            <span class="resumen-value">${{ formatCurrency(totalCotizacion) }}</span>
                        </div>
                        <div class="resumen-item total">
                            <span class="resumen-label">Total:</span>
                            <span class="resumen-value">${{ formatCurrency(totalCotizacion) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                    <button @click="$router.back()" class="btn-cancel">Cancelar</button>
                    <button @click="guardarCambios" class="btn-primary" :disabled="guardando">
                        {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
                    </button>
                </div>

                <!-- Mensaje de error -->
                <div v-if="error" class="alert alert-error">
                    {{ error }}
                </div>
            </div>
        </div>

        <div v-else class="error-state">
            <p>No se encontró la cotización</p>
            <button @click="$router.back()" class="btn-primary">Volver</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCotizacionById } from '../../http/cotizaciones-api';
import { fetchClientes } from '../../http/clientes-api';
import { fetchModulos } from '../../http/modulos-api';

const route = useRoute();
const router = useRouter();

const cotizacion = ref(null);
const clientes = ref([]);
const modulos = ref([]);
const cargandoDatos = ref(true);
const guardando = ref(false);
const error = ref(null);
const mostrarSelectorModulos = ref(false);
const moduloSeleccionado = ref('');
const cantidadNuevaModulo = ref(1);

const modulosAsignados = computed(() => {
    // Los módulos están en cotizacion.modulos
    return cotizacion.value?.modulos || [];
});

const modulosDisponibles = computed(() => {
    const idsAsignados = modulosAsignados.value.map(m => m.id);
    return modulos.value.filter(m => !idsAsignados.includes(m.id));
});

const detalles = computed(() => {
    return cotizacion.value?.detalles || [];
});

const totalCotizacion = computed(() => {
    // Sumar todos los subtotales de los módulos
    return modulosAsignados.value.reduce((sum, modulo) => {
        return sum + calcularSubtotalModulo(modulo);
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
    if (componente.subtotal !== null && componente.subtotal !== undefined && componente.subtotal !== '') {
        const subtotal = Number(componente.subtotal);
        if (!isNaN(subtotal)) return subtotal;
    }
    return (Number(componente.cantidad) || 0) * (Number(componente.precio_unitario) || 0);
};

const calcularPrecioUnitarioModulo = (modulo) => {
    // Sumar el precio de todos los componentes del módulo
    if (!modulo.componentes || !Array.isArray(modulo.componentes)) return 0;
    return modulo.componentes.reduce((sum, comp) => {
        const precio = Number(comp.precio_unitario) || 0;
        const cantidad = Number(comp.cantidad) || 1;
        return sum + (precio * cantidad);
    }, 0);
};

const calcularSubtotalModulo = (modulo) => {
    // Precio unitario del módulo × cantidad
    const precioUnitario = calcularPrecioUnitarioModulo(modulo);
    const cantidad = Number(modulo.cantidad) || 1;
    return precioUnitario * cantidad;
};

const actualizarTotales = () => {
    // Fuerza actualización del computed totalCotizacion
};

const abrirSelectorModulos = () => {
    moduloSeleccionado.value = '';
    cantidadNuevaModulo.value = 1;
    mostrarSelectorModulos.value = true;
};

const cerrarSelectorModulos = () => {
    mostrarSelectorModulos.value = false;
    moduloSeleccionado.value = '';
    cantidadNuevaModulo.value = 1;
};

const agregarModuloAsignado = () => {
    if (!moduloSeleccionado.value) return;
    
    const moduloEncontrado = modulos.value.find(m => m.id == moduloSeleccionado.value);
    if (!moduloEncontrado) return;

    if (!cotizacion.value.modulos) {
        cotizacion.value.modulos = [];
    }

    cotizacion.value.modulos.push({
        id: moduloEncontrado.id,
        nombre: moduloEncontrado.nombre,
        codigo: moduloEncontrado.codigo,
        descripcion: moduloEncontrado.descripcion,
        cantidad: cantidadNuevaModulo.value,
        componentes: moduloEncontrado.componentes || []
    });

    cerrarSelectorModulos();
};

const eliminarModuloAsignado = (index) => {
    cotizacion.value.modulos.splice(index, 1);
};

const cargarCotizacion = async () => {
    try {
        cargandoDatos.value = true;
        const id = route.params.id;
        
        const response = await getCotizacionById(id);
        const data = response?.data || response;
        
        if (Array.isArray(data)) {
            cotizacion.value = data[0];
        } else {
            cotizacion.value = data;
        }

        // Inicializar si no existen
        if (!cotizacion.value.modulos_ordenados) {
            cotizacion.value.modulos_ordenados = [];
        }
        if (!cotizacion.value.detalles) {
            cotizacion.value.detalles = [];
        }

        // Cargar clientes
        const clientesResponse = await fetchClientes();
        const clientesData = clientesResponse?.data || clientesResponse;
        clientes.value = Array.isArray(clientesData) ? clientesData : [];

        // Cargar módulos
        const modulosResponse = await fetchModulos();
        const modulosData = modulosResponse?.data || modulosResponse;
        modulos.value = Array.isArray(modulosData) ? modulosData : [];

        console.log('Cotización cargada:', cotizacion.value);
        console.log('Detalles:', cotizacion.value.detalles);
        console.log('Módulos ordenados:', cotizacion.value.modulos_ordenados);
        console.log('Todas las propiedades:', Object.keys(cotizacion.value));
        console.log('Estructura completa:', JSON.stringify(cotizacion.value, null, 2));
    } catch (err) {
        console.error('Error al cargar cotización:', err);
        error.value = 'Error al cargar la cotización';
    } finally {
        cargandoDatos.value = false;
    }
};

const guardarCambios = async () => {
    try {
        guardando.value = true;
        error.value = null;

        // Aquí iría la llamada a la API para actualizar la cotización
        // await actualizarCotizacion(cotizacion.value.id, cotizacion.value);
        
        setTimeout(() => {
            router.push(`/cotizacion-detallada/${cotizacion.value.id}`);
        }, 1000);
    } catch (err) {
        console.error('Error al guardar:', err);
        error.value = 'Error al guardar los cambios';
    } finally {
        guardando.value = false;
    }
};

onMounted(() => {
    cargarCotizacion();
});
</script>

<style scoped>
.editar-cotizacion-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 32px;
    font-family: 'Georgia', 'Garamond', serif;
}

.form-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
}

.btn-back {
    padding: 8px 16px;
    background: #e8ddd7;
    color: #5a4037;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn-back:hover {
    background: #d4a574;
    color: white;
    transform: translateY(-2px);
}

.form-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.08);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.btn-add-module {
    padding: 10px 16px;
    background: #d4a574;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    white-space: nowrap;
}

.btn-add-module:hover {
    background: #c89564;
    transform: translateY(-2px);
}

.modulos-editable {
    border: 1px solid #e8ddd7;
    border-radius: 8px;
    overflow: hidden;
}

.modulo-row {
    background: white;
}

.modulo-row:hover {
    background: #f9f7f4;
}

.input-cantidad {
    width: 60px;
    padding: 8px 12px;
    border: 1px solid #d4a574;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
}

.input-cantidad:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.1);
}

.col-acciones {
    text-align: center;
}

.btn-delete-small {
    padding: 6px 10px;
    background: #ffebee;
    color: #c62828;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
}

.btn-delete-small:hover {
    background: #ef5350;
    color: white;
}

/* Modal styles */
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
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid #e8ddd7;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #5a4037;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    transition: all 0.2s;
}

.btn-close:hover {
    color: #5a4037;
    transform: scale(1.2);
}

.modal-body {
    padding: 2rem;
}

.modal-body .form-group {
    margin-bottom: 1.5rem;
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 2px solid #e8ddd7;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.section-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 2px solid #d4a574;
    line-height: 1.2;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    color: #5a4037;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-input {
    padding: 12px 16px;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info-label {
    font-size: 0.9rem;
    color: #6B4423;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 1.1rem;
    color: #2C1810;
    font-weight: 500;
}

.modulo-card {
    background: #fafafa;
    border: 1px solid #e8ddd7;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    overflow: hidden;
}

.modulo-header {
    background: linear-gradient(135deg, #6B4423, #8B5A3C);
    color: #F5F1E8;
    padding: 24px 32px;
}

.modulo-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    gap: 16px;
}

.modulo-nombre {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
    flex: 1;
}

.modulo-cantidad-badge {
    background: rgba(245, 241, 232, 0.2);
    border: 1px solid rgba(245, 241, 232, 0.4);
    color: #F5F1E8;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
}

.modulo-codigo {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0;
    font-family: 'Courier New', monospace;
}

.modulo-descripcion {
    margin: 0;
    opacity: 0.95;
    line-height: 1.6;
}

.articulos-table {
    padding: 0;
    overflow-x: auto;
}

.table-header {
    display: grid;
    grid-template-columns: 1.5fr 0.8fr 0.7fr 1fr 1fr 0.6fr;
    gap: 16px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #8B6F47 0%, #A88860 100%);
    color: #F5F1E8;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1px;
    word-wrap: break-word;
}

.table-row {
    display: grid;
    grid-template-columns: 1.5fr 0.8fr 0.7fr 1fr 1fr 0.6fr;
    gap: 16px;
    padding: 18px 24px;
    border-bottom: 1px solid #e8ddd7;
    transition: all 0.2s ease;
    align-items: center;
    background: white;
    word-wrap: break-word;
}

.table-row:hover {
    background: #F5F1E8;
}

.col-nombre {
    color: #2C1810;
    font-size: 0.9rem;
    line-height: 1.4;
}

.col-cantidad,
.col-precio,
.col-subtotal {
    color: #4A3020;
    text-align: right;
}

.col-subtotal {
    font-weight: 700;
    color: #C9A961;
    font-size: 1.05rem;
}

.resumen-card {
    background: #f9f7f4;
    border: 1px solid #e8ddd7;
    border-radius: 8px;
    padding: 1.5rem;
}

.resumen-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e8ddd7;
}

.resumen-item.total {
    border-bottom: none;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 2px solid #d4a574;
    font-weight: 700;
    font-size: 1.1rem;
}

.resumen-label {
    color: #5a4037;
}

.resumen-value {
    color: #d4a574;
    font-weight: 600;
}

.resumen-item.total .resumen-value {
    font-size: 1.2rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 2px solid #e8ddd7;
}

.btn-primary,
.btn-cancel {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.btn-primary {
    background: #d4a574;
    color: white;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background: #c89564;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-cancel {
    background: #e8ddd7;
    color: #5a4037;
}

.btn-cancel:hover {
    background: #ccc;
    color: #333;
}

.alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-top: 1rem;
}

.alert-error {
    background: #ffebee;
    color: #c62828;
    border: 2px solid #ef5350;
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e8ddd7;
    border-top-color: #d4a574;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .editar-cotizacion-container {
        padding: 20px 16px;
    }

    .form-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 16px 16px;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-primary,
    .btn-cancel {
        width: 100%;
    }
}
</style>
