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

                    <div v-else class="modulos-cards-grid">
                        <div v-for="(modulo, index) in modulosAsignados" :key="index" class="modulo-card">
                            <div class="card-header">
                                <div class="card-title">
                                    <h3>{{ modulo.nombre }}</h3>
                                    <span class="card-codigo">{{ modulo.codigo }}</span>
                                </div>
                                <button @click="eliminarModuloAsignado(index)" class="btn-delete" title="Eliminar módulo">🗑️</button>
                            </div>

                            <div class="card-body">
                                <div class="card-description">{{ modulo.descripcion }}</div>

                                <!-- Componentes del módulo -->
                                <div class="components-section">
                                    <h4>Componentes</h4>
                                    <div class="components-list">
                                        <div v-for="comp in modulo.componentes" :key="comp.id" class="component-item">
                                            <div class="comp-name">{{ comp.nombre }}</div>
                                            <div class="comp-qty">x{{ comp.cantidad }}</div>
                                            <div class="comp-price">${{ formatCurrency(comp.precio_unitario) }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Cantidad del módulo -->
                                <div class="card-quantity">
                                    <label>Cantidad de Módulos:</label>
                                    <input 
                                        v-model.number="modulo.cantidad" 
                                        type="number" 
                                        min="1" 
                                        class="input-cantidad"
                                        @change="actualizarTotales"
                                    />
                                </div>
                            </div>

                            <div class="card-footer">
                                <div class="price-section">
                                    <div class="price-item">
                                        <span class="label">Precio Unit.:</span>
                                        <span class="value">${{ formatCurrency(calcularPrecioUnitarioModulo(modulo)) }}</span>
                                    </div>
                                    <div class="price-item subtotal">
                                        <span class="label">Subtotal:</span>
                                        <span class="value">${{ formatCurrency(calcularSubtotalModulo(modulo)) }}</span>
                                    </div>
                                </div>
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

                <!-- Mensaje de éxito -->
                <div v-if="success" class="alert alert-success">
                    {{ success }}
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
import { getCotizacionById, actualizarCotizacion, sincronizarModulos } from '../../http/cotizaciones-api';
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
const success = ref(null);
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

const agregarModuloAsignado = async () => {
    try {
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

        console.log('Módulo agregado localmente:', moduloEncontrado.nombre);

        // Sincronizar módulos en la API
        try {
            const modulosParaSincronizar = cotizacion.value.modulos.map(m => ({
                id: m.id,
                cantidad: m.cantidad
            }));
            
            console.log('Sincronizando módulos con nuevo:', modulosParaSincronizar);
            await sincronizarModulos(cotizacion.value.id, modulosParaSincronizar);
            console.log('Módulo agregado correctamente en la API');
            
            // Recargar cotización para verificar que el cambio persistió
            const response = await getCotizacionById(cotizacion.value.id);
            const dataReloaded = response?.data || response;
            console.log('Cotización recargada, modulos:', dataReloaded.modulos);
            cotizacion.value.modulos = dataReloaded.modulos;
            
            success.value = 'Módulo agregado correctamente';
            setTimeout(() => { success.value = null; }, 3000);
        } catch (apiErr) {
            console.warn('No se pudo sincronizar en la API:', apiErr.message);
            console.warn('Error completo:', apiErr);
            
            // Deshacer cambio local si la API falla
            cotizacion.value.modulos.pop();
            console.log('Cambio revertido localmente');
            
            error.value = 'No se pudo agregar el módulo. Por favor intenta nuevamente.';
            setTimeout(() => { error.value = null; }, 5000);
        }

        cerrarSelectorModulos();
        moduloSeleccionado.value = '';
        cantidadNuevaModulo.value = 1;
    } catch (err) {
        console.error('Error al agregar módulo:', err);
        error.value = 'Error al agregar el módulo';
    }
};

const eliminarModuloAsignado = async (index) => {
    try {
        const modulo = cotizacion.value.modulos[index];
        const moduloId = modulo.id;
        console.log('Eliminando módulo:', modulo.nombre, 'ID:', moduloId);
        
        // Eliminar del array local primero
        cotizacion.value.modulos.splice(index, 1);
        console.log('Módulo eliminado localmente');
        
        // Sincronizar módulos en la API
        try {
            const modulosParaSincronizar = cotizacion.value.modulos.map(m => ({
                id: m.id,
                cantidad: m.cantidad
            }));
            
            console.log('Sincronizando módulos:', modulosParaSincronizar);
            await sincronizarModulos(cotizacion.value.id, modulosParaSincronizar);
            console.log('Módulos sincronizados en la API');
            
            // Recargar cotización para verificar que el cambio persistió
            const response = await getCotizacionById(cotizacion.value.id);
            const dataReloaded = response?.data || response;
            console.log('Cotización recargada, modulos:', dataReloaded.modulos);
            cotizacion.value.modulos = dataReloaded.modulos;
            
            success.value = 'Módulo eliminado correctamente';
            setTimeout(() => { success.value = null; }, 3000);
        } catch (apiErr) {
            console.warn('No se pudo sincronizar en la API:', apiErr.message);
            console.warn('Error completo:', apiErr);
            
            // Deshacer cambio local si la API falla
            cotizacion.value.modulos.splice(index, 0, modulo);
            console.log('Cambio revertido localmente');
            
            error.value = 'No se pudo eliminar el módulo. Por favor intenta nuevamente.';
            setTimeout(() => { error.value = null; }, 5000);
        }
    } catch (err) {
        console.error('Error al eliminar módulo:', err);
        error.value = 'Error al eliminar el módulo';
    }
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

        // Preparar datos para enviar a la API
        const datosActualizados = {
            cliente_id: cotizacion.value.cliente_id,
            fecha: cotizacion.value.fecha,
            estado: cotizacion.value.estado,
            modulos: cotizacion.value.modulos.map(m => ({
                id: m.id,
                cantidad: m.cantidad
            }))
        };

        console.log('Intentando guardar:', datosActualizados);

        // Intentar guardar en la API
        try {
            await actualizarCotizacion(cotizacion.value.id, datosActualizados);
            console.log('Cotización actualizada en la API');
        } catch (apiErr) {
            console.warn('No se pudo actualizar en la API:', apiErr.message);
            // Mostrar advertencia pero continuar
            error.value = 'Nota: Los cambios locales se han hecho, pero puede que no se hayan guardado en la API';
        }
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            router.push(`/cotizacion-detallada/${cotizacion.value.id}`);
        }, 1500);
    } catch (err) {
        console.error('Error al guardar:', err);
        error.value = 'Error: ' + (err.response?.data?.message || err.message);
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

.modulos-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 1rem;
}

.modulo-card {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.modulo-card:hover {
    border-color: #d4a574;
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.15);
    transform: translateY(-2px);
}

.card-header {
    padding: 16px;
    background: linear-gradient(135deg, #f5f3f0 0%, #ede8e2 100%);
    border-bottom: 2px solid #e8ddd7;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.card-title {
    flex: 1;
}

.card-title h3 {
    margin: 0 0 6px 0;
    color: #2c2c2c;
    font-size: 1.1rem;
    font-weight: 600;
}

.card-codigo {
    display: inline-block;
    padding: 4px 10px;
    background: #d4a574;
    color: white;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.btn-delete {
    padding: 8px 12px;
    background: #ffebee;
    color: #c62828;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.2s;
}

.btn-delete:hover {
    background: #ef5350;
    color: white;
}

.card-body {
    padding: 16px;
    flex: 1;
}

.card-description {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 12px;
    line-height: 1.4;
}

.components-section {
    margin-bottom: 12px;
}

.components-section h4 {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #2c2c2c;
    font-weight: 600;
}

.components-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.component-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #faf8f5;
    border-radius: 6px;
    font-size: 0.85rem;
}

.comp-name {
    flex: 1;
    color: #2c2c2c;
    font-weight: 500;
}

.comp-qty {
    color: #999;
    font-size: 0.8rem;
    margin: 0 8px;
}

.comp-price {
    color: #d4a574;
    font-weight: 600;
    min-width: 70px;
    text-align: right;
}

.card-quantity {
    display: flex;
    gap: 12px;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #e8ddd7;
}

.card-quantity label {
    font-size: 0.9rem;
    color: #2c2c2c;
    font-weight: 600;
    white-space: nowrap;
}

.input-cantidad {
    width: 70px;
    padding: 8px 12px;
    border: 1px solid #d4a574;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
    font-size: 1rem;
}

.input-cantidad:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.1);
}

.card-footer {
    padding: 16px;
    background: #faf8f5;
    border-top: 1px solid #e8ddd7;
}

.price-section {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.price-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.price-item .label {
    font-size: 0.8rem;
    color: #999;
    font-weight: 600;
}

.price-item .value {
    font-size: 1rem;
    color: #2c2c2c;
    font-weight: 600;
}

.price-item.subtotal .value {
    font-size: 1.2rem;
    color: #d4a574;
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

.alert-success {
    background: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #66bb6a;
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
