<template>
    <div class="editar-cotizacion-container">
        <div v-if="cargandoDatos" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando cotización...</p>
        </div>

        <div v-else-if="cotizacion" class="cotizacion-form">
            <div class="form-header">
                <div class="header-content">
                    <button class="btn-back" @click="$router.back()">
                        <span class="back-icon">←</span>
                        <span>Volver</span>
                    </button>
                    <div class="header-title-section">
                        <h1 class="form-title">📝 Editar Cotización</h1>
                        <span class="cotizacion-badge">#{{ cotizacion.id }}</span>
                        <select 
                            v-model="cotizacion.estado" 
                            @change="cambiarEstado"
                            class="estado-selector"
                            :class="`estado-${cotizacion.estado}`"
                        >
                            <option value="activa">Activa</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="form-content">
                <!-- Información básica -->
                <div class="form-section info-section">
                    <div class="section-header-inline">
                        <h2 class="section-title">📋 Información de la Cotización</h2>
                        <span class="section-subtitle">Datos principales</span>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="cliente">Cliente</label>
                            <button @click="abrirSelectorClientes" class="btn-selector-cliente" type="button">
                                <span class="cliente-icon">👤</span>
                                <span class="cliente-nombre" v-if="cotizacion.cliente">
                                    {{ cotizacion.cliente.nombre }}
                                </span>
                                <span class="cliente-placeholder" v-else>
                                    Seleccionar Cliente
                                </span>
                                <span class="selector-arrow">▼</span>
                            </button>
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
                <div class="form-section cliente-section">
                    <div class="section-header-inline">
                        <h2 class="section-title">👤 Datos del Cliente</h2>
                        <span class="section-subtitle">Información de contacto</span>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-icon">👨‍💼</span>
                            <div class="info-content">
                                <span class="info-label">Cliente</span>
                                <span class="info-value">{{ cotizacion.cliente?.nombre || 'Sin Cliente' }}</span>
                            </div>
                        </div>
                        <div v-if="cotizacion.cliente?.empresa" class="info-item">
                            <span class="info-icon">🏢</span>
                            <div class="info-content">
                                <span class="info-label">Empresa</span>
                                <span class="info-value">{{ cotizacion.cliente?.empresa }}</span>
                            </div>
                        </div>
                        <div v-if="cotizacion.cliente?.email" class="info-item">
                            <span class="info-icon">📧</span>
                            <div class="info-content">
                                <span class="info-label">Email</span>
                                <span class="info-value">{{ cotizacion.cliente?.email }}</span>
                            </div>
                        </div>
                        <div v-if="cotizacion.cliente?.telefono" class="info-item">
                            <span class="info-icon">📱</span>
                            <div class="info-content">
                                <span class="info-label">Teléfono</span>
                                <span class="info-value">{{ cotizacion.cliente?.telefono }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Módulos editable -->
                <div class="form-section modulos-section">
                    <div class="section-header">
                        <div class="section-header-inline">
                            <h2 class="section-title">🧩 Módulos Asignados</h2>
                            <span class="section-subtitle">{{ modulosAsignados.length }} módulo(s)</span>
                        </div>
                        <button @click="abrirSelectorModulos" class="btn-add-module">
                            <span class="btn-icon">➕</span>
                            <span>Agregar Módulo</span>
                        </button>
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
                                        <div v-for="(comp, compIndex) in modulo.componentes" :key="comp.id" class="component-item-mejorado">
                                            <div class="comp-info">
                                                <div class="comp-name">{{ comp.nombre }}</div>
                                                <div class="comp-price">${{ formatCurrency(comp.precio_unitario) }}</div>
                                            </div>
                                            <div class="comp-controls">
                                                <div class="cantidad-control-mini">
                                                    <button 
                                                        type="button" 
                                                        class="btn-control-mini minus" 
                                                        @click="decrementarCantidadComponente(comp, modulo)"
                                                        :disabled="comp.cantidad <= 1"
                                                    >
                                                        <span>−</span>
                                                    </button>
                                                    <input 
                                                        v-model.number="comp.cantidad" 
                                                        type="number" 
                                                        min="1" 
                                                        class="input-cantidad-componente"
                                                        @change="actualizarCantidadComponente(comp, modulo)"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        class="btn-control-mini plus" 
                                                        @click="incrementarCantidadComponente(comp, modulo)"
                                                    >
                                                        <span>+</span>
                                                    </button>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    class="btn-eliminar-componente" 
                                                    @click="eliminarComponente(comp, modulo, compIndex)"
                                                    title="Eliminar componente"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
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
                                        <span class="label">Precio Unitario:</span>
                                        <span class="value">${{ formatCurrency(modulo.costo_total || calcularPrecioUnitarioModulo(modulo)) }}</span>
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
                        <div class="modal-content modal-modulos-mejorado" @click.stop>
                            <div class="modal-header-modulos">
                                <div class="modal-icon">🧩</div>
                                <h3>Selecciona un Módulo</h3>
                                <button class="btn-close-modulos" @click="cerrarSelectorModulos">✕</button>
                            </div>

                            <div class="modal-body-modulos">
                                <div v-if="modulosDisponibles.length === 0" class="empty-state-mejorado">
                                    <div class="empty-icon">📦</div>
                                    <p>No hay módulos disponibles para agregar</p>
                                </div>

                                <div v-else class="modulos-grid-selector">
                                    <div 
                                        v-for="modulo in modulosDisponibles" 
                                        :key="modulo.id"
                                        class="modulo-card-selector"
                                        @click="seleccionarModulo(modulo)"
                                    >
                                        <div class="modulo-card-header">
                                            <div class="modulo-icon">🏗️</div>
                                            <h4>{{ modulo.nombre }}</h4>
                                        </div>
                                        <div class="modulo-card-body">
                                            <p v-if="modulo.descripcion" class="modulo-descripcion">{{ modulo.descripcion }}</p>
                                            <div class="modulo-card-footer">
                                                <div class="modulo-price">
                                                    <span class="label">Precio:</span>
                                                    <span class="value">${{ formatCurrency(modulo.costo_total || calcularPrecioUnitarioModulo(modulo)) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="modulo-card-action">
                                            <span>✓ Seleccionar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Modal para definir cantidad del módulo -->
                    <template v-if="moduloSeleccionadoModal && !cargandoModuloModal">
                        <div class="modal-overlay" @click="cerrarModalCantidad">
                            <div class="modal-content modal-cantidad-mejorado" @click.stop>
                                <div class="modal-header-cantidad">
                                    <div class="modal-icon">📦</div>
                                    <h3>¿Cuántos módulos necesitas?</h3>
                                    <button class="btn-close-cantidad" @click="cerrarModalCantidad">✕</button>
                                </div>

                                <div class="modal-body-cantidad">
                                    <div class="modulo-preview">
                                        <div class="preview-icon">🧩</div>
                                        <div class="preview-info">
                                            <h4>{{ moduloSeleccionadoModal.nombre }}</h4>
                                            <p v-if="moduloSeleccionadoModal.descripcion">{{ moduloSeleccionadoModal.descripcion }}</p>
                                        </div>
                                    </div>

                                    <div class="cantidad-section">
                                        <label class="cantidad-label">Cantidad de módulos</label>
                                        <div class="cantidad-control">
                                            <button type="button" class="btn-cantidad-control minus" @click="decrementarCantidad" :disabled="cantidadNuevaModulo <= 1">
                                                <span>−</span>
                                            </button>
                                            <div class="cantidad-display">
                                                <input 
                                                    v-model.number="cantidadNuevaModulo" 
                                                    type="number" 
                                                    min="1"
                                                    step="1"
                                                    class="input-cantidad-mejorado"
                                                    @keyup.enter="confirmarAgregarModulo"
                                                >
                                                <span class="cantidad-unidad">módulos</span>
                                            </div>
                                            <button type="button" class="btn-cantidad-control plus" @click="incrementarCantidad">
                                                <span>+</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="modal-footer-cantidad">
                                    <button @click="cambiarModuloSeleccionado" class="btn-modal-secondary">
                                        <span>🔄</span> Cambiar Módulo
                                    </button>
                                    <button @click="confirmarAgregarModulo" class="btn-modal-primary">
                                        <span>✓</span> Agregar Módulo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Modal selector de clientes -->
                    <div v-if="mostrarSelectorClientes" class="modal-overlay" @click="cerrarSelectorClientes">
                        <div class="modal-content modal-clientes-mejorado" @click.stop>
                            <div class="modal-header-clientes">
                                <div class="modal-icon">👥</div>
                                <h3>Selecciona un Cliente</h3>
                                <button class="btn-close-clientes" @click="cerrarSelectorClientes">✕</button>
                            </div>

                            <div class="modal-body-clientes">
                                <div v-if="clientes.length === 0" class="empty-state-mejorado">
                                    <div class="empty-icon">📋</div>
                                    <p>No hay clientes disponibles</p>
                                </div>

                                <div v-else class="clientes-grid-selector">
                                    <div 
                                        v-for="cliente in clientes" 
                                        :key="cliente.id"
                                        class="cliente-card-selector"
                                        :class="{ 'selected': cotizacion.cliente_id === cliente.id }"
                                        @click="seleccionarCliente(cliente)"
                                    >
                                        <div class="cliente-card-header">
                                            <div class="cliente-icon-large">👤</div>
                                            <div class="cliente-info">
                                                <h4>{{ cliente.nombre }}</h4>
                                                <p v-if="cliente.empresa" class="cliente-empresa">{{ cliente.empresa }}</p>
                                            </div>
                                        </div>
                                        <div class="cliente-card-body">
                                            <div v-if="cliente.email" class="cliente-detail">
                                                <span class="detail-icon">📧</span>
                                                <span class="detail-text">{{ cliente.email }}</span>
                                            </div>
                                            <div v-if="cliente.telefono" class="cliente-detail">
                                                <span class="detail-icon">📱</span>
                                                <span class="detail-text">{{ cliente.telefono }}</span>
                                            </div>
                                        </div>
                                        <div class="cliente-card-action">
                                            <span>✓ Seleccionar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen de totales -->
                <div class="form-section resumen-section">
                    <h2 class="section-title">💰 Resumen Financiero</h2>
                    <div class="resumen-card">
                        <div class="resumen-grid">
                            <div class="resumen-item">
                                <span class="resumen-icon">📊</span>
                                <div class="resumen-content">
                                    <span class="resumen-label">Subtotal</span>
                                    <span class="resumen-value">${{ formatCurrency(totalCotizacion) }}</span>
                                </div>
                            </div>
                            <div class="resumen-item total">
                                <span class="resumen-icon">💵</span>
                                <div class="resumen-content">
                                    <span class="resumen-label">Total a Pagar</span>
                                    <span class="resumen-value">${{ formatCurrency(totalCotizacion) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                    <button @click="$router.back()" class="btn-cancel">
                        <span class="btn-icon">✕</span>
                        <span>Cancelar</span>
                    </button>
                    <button @click="generarPDF" class="btn-secondary" :disabled="generandoPDF">
                        <span class="btn-icon">{{ generandoPDF ? '⏳' : '📝' }}</span>
                        <span>{{ generandoPDF ? 'Generando PDF...' : 'Generar PDF' }}</span>
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
import { getCotizacionById, actualizarCotizacion, sincronizarModulos, actualizarEstadoCotizacion } from '../../http/cotizaciones-api';
import { fetchClientes } from '../../http/clientes-api';
import { fetchModulos, getModuloById } from '../../http/modulos-api';
import { useComponentesPorCotizacionStore } from '@/stores/componentes-por-cotizacion';

const route = useRoute();
const router = useRouter();
const storeComponentesPorCotizacion = useComponentesPorCotizacionStore();

const cotizacion = ref(null);
const clientes = ref([]);
const modulos = ref([]);
const cargandoDatos = ref(true);
const guardando = ref(false);
const generandoPDF = ref(false);
const error = ref(null);
const success = ref(null);
const mostrarSelectorModulos = ref(false);
const moduloSeleccionadoModal = ref(null);
const cantidadNuevaModulo = ref(1);
const cargandoModuloModal = ref(false);
const mostrarSelectorClientes = ref(false);

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
    const cleaned = typeof value === 'string'
        ? value.replace(/[^\d.-]/g, '')
        : value;
    const num = Number(cleaned);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('es-MX', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
};

const normalizarCostoTotal = (modulo) => {
    if (!modulo) return 0;
    const raw =
        modulo.costo_total ??
        modulo.costoTotal ??
        modulo.precio_total ??
        modulo.precio ??
        null;
    if (raw === null || raw === undefined || raw === '') return 0;
    const cleaned = typeof raw === 'string'
        ? raw.replace(/[^\d.-]/g, '')
        : raw;
    const num = Number(cleaned);
    if (isNaN(num)) return 0;
    return num;
};

const calcularSubtotal = (componente) => {
    if (componente.subtotal !== null && componente.subtotal !== undefined && componente.subtotal !== '') {
        const subtotal = Number(componente.subtotal);
        if (!isNaN(subtotal)) return subtotal;
    }
    return (Number(componente.cantidad) || 0) * (Number(componente.precio_unitario) || 0);
};

const calcularPrecioUnitarioModulo = (modulo) => {
    // Sumar el precio unitario de todos los componentes del módulo
    if (!modulo.componentes || !Array.isArray(modulo.componentes)) return 0;
    return modulo.componentes.reduce((sum, comp) => {
        const precio = Number(comp.precio_unitario) || 0;
        return sum + precio;
    }, 0);
};

const calcularSubtotalModulo = (modulo) => {
    // Usar costo_total del API si existe, sino calcular desde componentes
    if (modulo.costo_total) {
        const cantidad = Number(modulo.cantidad) || 1;
        return Number(modulo.costo_total) * cantidad;
    }
    
    // Fallback: calcular desde componentes
    const precioUnitario = calcularPrecioUnitarioModulo(modulo);
    const cantidad = Number(modulo.cantidad) || 1;
    return precioUnitario * cantidad;
};

const actualizarTotales = () => {
    // Fuerza actualización del computed totalCotizacion
};

const actualizarCantidadComponente = async (componente, modulo) => {
    try {
        console.log(`🔵 Actualizando "${componente.nombre}" - Nueva cantidad: ${componente.cantidad}`);
        
        try {
            const todosComponentes = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
            
            const registroExistente = todosComponentes.find(cpc => 
                cpc.cotizacion_id == cotizacion.value.id && cpc.componente_id == componente.id
            );
            
            if (registroExistente) {
                // Actualizar el registro existente
                await storeComponentesPorCotizacion.actualizarComponentePorCotizacion(registroExistente.id, {
                    cotizacion_id: cotizacion.value.id,
                    componente_id: componente.id,
                    modulo_id: modulo.id,
                    cantidad: componente.cantidad
                });
                console.log(`✅ "${componente.nombre}" actualizado a cantidad ${componente.cantidad} en la API`);
            } else {
                // Crear nuevo registro
                await storeComponentesPorCotizacion.crearComponentePorCotizacion({
                    cotizacion_id: cotizacion.value.id,
                    componente_id: componente.id,
                    modulo_id: modulo.id,
                    cantidad: componente.cantidad
                });
                console.log(`✅ "${componente.nombre}" creado en la API con cantidad ${componente.cantidad}`);
            }
            
            success.value = `"${componente.nombre}" actualizado`;
            setTimeout(() => { success.value = null; }, 2000);
        } catch (apiErr) {
            console.error(`❌ Error al guardar "${componente.nombre}":`, apiErr.response?.data || apiErr.message);
            throw apiErr;
        }
    } catch (err) {
        console.error('❌ Error:', err);
        error.value = 'Error al actualizar: ' + (err.response?.data?.message || err.message);
        setTimeout(() => { error.value = null; }, 5000);
    }
};

const incrementarCantidadComponente = async (componente, modulo) => {
    componente.cantidad = (componente.cantidad || 1) + 1;
    await actualizarCantidadComponente(componente, modulo);
};

const decrementarCantidadComponente = async (componente, modulo) => {
    if (componente.cantidad > 1) {
        componente.cantidad--;
        await actualizarCantidadComponente(componente, modulo);
    }
};

const eliminarComponente = async (componente, modulo, compIndex) => {
    try {
        console.log('🔴 Eliminando componente:', componente.nombre);
        
        // Guardar el componente para poder revertir si falla
        const componenteEliminado = { ...componente };
        
        // Eliminar del array local primero
        modulo.componentes.splice(compIndex, 1);
        console.log('🗑️ Componente eliminado localmente');
        
        // Intentar eliminar de la API
        try {
            const todosComponentes = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
            console.log('📋 Todos los componentes obtenidos:', todosComponentes);
            
            // Buscar el registro que corresponde a este componente en esta cotización
            const registroAEliminar = todosComponentes.find(cpc => 
                cpc.cotizacion_id === cotizacion.value.id && 
                cpc.componente_id === componenteEliminado.id
            );
            
            if (registroAEliminar) {
                console.log('🎯 Registro encontrado para eliminar:', registroAEliminar);
                await storeComponentesPorCotizacion.eliminarComponentePorCotizacion(registroAEliminar.id);
                console.log('✅ Componente eliminado de componentes_por_cotizacion API');
                
                success.value = `"${componenteEliminado.nombre}" eliminado`;
                setTimeout(() => { success.value = null; }, 3000);
            } else {
                console.warn('⚠️ No se encontró el registro en componentes_por_cotizacion');
                success.value = 'Componente eliminado localmente';
                setTimeout(() => { success.value = null; }, 3000);
            }
        } catch (apiErr) {
            console.error('❌ Error al eliminar de la API:', apiErr);
            console.error('❌ Detalles:', apiErr.response?.data || apiErr.message);
            
            // Deshacer cambio local si la API falla
            modulo.componentes.splice(compIndex, 0, componenteEliminado);
            console.log('🔄 Cambio revertido localmente');
            
            error.value = 'No se pudo eliminar: ' + (apiErr.response?.data?.message || apiErr.message);
            setTimeout(() => { error.value = null; }, 5000);
        }
    } catch (err) {
        console.error('❌ Error al eliminar componente:', err);
        error.value = 'Error al eliminar el componente';
    }
};

const enriquecerModulosConCostoTotal = async (modulosList) => {
    // Obtener costo_total del API para cada módulo
    if (!modulosList || !Array.isArray(modulosList)) return modulosList;
    
    const modulosEnriquecidos = await Promise.all(
        modulosList.map(async (moduloCotizacion) => {
            if (moduloCotizacion.costo_total) {
                return moduloCotizacion; // Ya tiene costo_total
            }
            
            try {
                const response = await getModuloById(moduloCotizacion.id);
                const moduloCompleto = response?.data || response;
                
                if (moduloCompleto && moduloCompleto.costo_total) {
                    return {
                        ...moduloCotizacion,
                        costo_total: moduloCompleto.costo_total
                    };
                }
            } catch (err) {
                console.warn(`No se pudo obtener costo_total para módulo ${moduloCotizacion.id}:`, err);
            }
            
            return moduloCotizacion;
        })
    );
    
    return modulosEnriquecidos;
};

const abrirSelectorModulos = () => {
    moduloSeleccionadoModal.value = null;
    cantidadNuevaModulo.value = 1;
    mostrarSelectorModulos.value = true;
};

const abrirSelectorClientes = () => {
    mostrarSelectorClientes.value = true;
};

const cerrarSelectorClientes = () => {
    mostrarSelectorClientes.value = false;
};

const seleccionarCliente = async (cliente) => {
    try {
        // Actualizar localmente primero
        cotizacion.value.cliente_id = cliente.id;
        cotizacion.value.cliente = cliente;
        cerrarSelectorClientes();

        // Guardar en la API
        const datosActualizados = {
            cliente_id: cliente.id,
            fecha: cotizacion.value.fecha,
            estado: cotizacion.value.estado
        };

        await actualizarCotizacion(cotizacion.value.id, datosActualizados);
        
        // Mostrar mensaje de éxito
        success.value = 'Cliente actualizado correctamente';
        setTimeout(() => {
            success.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error al actualizar cliente:', err);
        error.value = 'Error al actualizar el cliente: ' + (err.response?.data?.message || err.message);
        setTimeout(() => {
            error.value = null;
        }, 5000);
    }
};

const cambiarEstado = async () => {
    try {
        await actualizarEstadoCotizacion(cotizacion.value.id, cotizacion.value.estado);
        
        success.value = `Estado actualizado a: ${cotizacion.value.estado}`;
        setTimeout(() => {
            success.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error al actualizar estado:', err);
        error.value = 'Error al actualizar el estado: ' + (err.response?.data?.message || err.message);
        setTimeout(() => {
            error.value = null;
        }, 5000);
    }
};

const cerrarSelectorModulos = () => {
    mostrarSelectorModulos.value = false;
    moduloSeleccionadoModal.value = null;
    cantidadNuevaModulo.value = 1;
};

const cerrarModalCantidad = () => {
    moduloSeleccionadoModal.value = null;
    cantidadNuevaModulo.value = 1;
};

const cambiarModuloSeleccionado = () => {
    // Cerrar modal de cantidad y volver a abrir selector
    moduloSeleccionadoModal.value = null;
    cantidadNuevaModulo.value = 1;
    mostrarSelectorModulos.value = true;
};

const seleccionarModulo = async (modulo) => {
    cargandoModuloModal.value = true;
    
    try {
        // Obtener el módulo completo del API con todos sus datos
        const moduloCompleto = await getModuloById(modulo.id);
        const datos = moduloCompleto?.data || moduloCompleto;
        
        // Asignar el módulo con su costo_total del API
        // Hacer copia profunda para asegurar reactividad de Vue
        const moduloAsignado = {
            ...JSON.parse(JSON.stringify(datos)),
            costo_total: normalizarCostoTotal(datos)
        };
        moduloSeleccionadoModal.value = moduloAsignado;
        
        cantidadNuevaModulo.value = 1;
        mostrarSelectorModulos.value = false;
    } catch (err) {
        console.error('Error al obtener módulo:', err);
        // Fallback: usar el módulo local si falla la API
        const moduloLocal = modulos.value.find(m => m.id === modulo.id) || modulo;
        
        moduloSeleccionadoModal.value = { ...moduloLocal };
        cantidadNuevaModulo.value = 1;
        mostrarSelectorModulos.value = false;
    } finally {
        cargandoModuloModal.value = false;
    }
};

const decrementarCantidad = () => {
    if (cantidadNuevaModulo.value > 1) {
        cantidadNuevaModulo.value--;
    }
};

const incrementarCantidad = () => {
    cantidadNuevaModulo.value++;
};

const confirmarAgregarModulo = async () => {
    if (!moduloSeleccionadoModal.value) return;
    
    const modulo = moduloSeleccionadoModal.value;
    
    try {
        if (!cotizacion.value.modulos) {
            cotizacion.value.modulos = [];
        }

        cotizacion.value.modulos.push({
            id: modulo.id,
            nombre: modulo.nombre,
            codigo: modulo.codigo,
            descripcion: modulo.descripcion,
            cantidad: cantidadNuevaModulo.value,
            componentes: modulo.componentes || [],
            costo_total: normalizarCostoTotal(modulo)
        });

        console.log('Módulo agregado localmente:', modulo.nombre);

        // Guardar los componentes del módulo en componentes_por_cotizacion
        try {
            if (modulo.componentes && modulo.componentes.length > 0) {
                console.log('🔵 Guardando componentes del módulo en componentes_por_cotizacion...');
                for (const componente of modulo.componentes) {
                    try {
                        const datosComponente = {
                            cotizacion_id: cotizacion.value.id,
                            componente_id: componente.id,
                            modulo_id: modulo.id,
                            cantidad: componente.cantidad || 1
                        };
                        console.log('📤 Guardando componente:', componente.nombre, datosComponente);
                        await storeComponentesPorCotizacion.crearComponentePorCotizacion(datosComponente);
                        console.log('✅ Componente guardado:', componente.nombre);
                    } catch (compErr) {
                        console.warn('⚠️ Error guardando componente:', componente.nombre, compErr);
                        // Continuar con los demás componentes aunque uno falle
                    }
                }
                console.log('✅ Todos los componentes guardados');
            }
            
            success.value = 'Módulo agregado correctamente';
            setTimeout(() => { success.value = null; }, 3000);
        } catch (apiErr) {
            console.error('❌ Error al guardar componentes:', apiErr);
            console.error('❌ Detalles del error:', apiErr.response?.data || apiErr.message);
            
            // Mostrar advertencia pero mantener el módulo
            error.value = 'Módulo agregado, pero algunos componentes no se guardaron';
            setTimeout(() => { error.value = null; }, 5000);
        }

        cerrarModalCantidad();
        cerrarSelectorModulos();
    } catch (err) {
        console.error('Error al agregar módulo:', err);
        error.value = 'Error al agregar el módulo';
    }
};

const eliminarModuloAsignado = async (index) => {
    try {
        const modulo = cotizacion.value.modulos[index];
        const moduloId = modulo.id;
        console.log('🔴 Eliminando módulo:', modulo.nombre, 'ID:', moduloId);
        
        // Eliminar del array local
        cotizacion.value.modulos.splice(index, 1);
        console.log('🗑️ Módulo eliminado localmente');
        
        success.value = 'Módulo eliminado correctamente';
        setTimeout(() => { success.value = null; }, 3000);
    } catch (err) {
        console.error('❌ Error al eliminar módulo:', err);
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

        // Enriquecer módulos de la cotización con costo_total desde el API
        if (cotizacion.value.modulos && Array.isArray(cotizacion.value.modulos)) {
            const modulosEnriquecidos = await enriquecerModulosConCostoTotal(cotizacion.value.modulos);
            
            // Hacer copia profunda para asegurar reactividad de Vue
            const copia = JSON.parse(JSON.stringify(cotizacion.value));
            copia.modulos = modulosEnriquecidos;
            cotizacion.value = copia;
        }

        console.log('Cotización cargada:', cotizacion.value);
        console.log('Detalles:', cotizacion.value.detalles);
        console.log('Módulos ordenados:', cotizacion.value.modulos_ordenados);
        console.log('Todas las propiedades:', Object.keys(cotizacion.value));
        console.log('Estructura completa:', JSON.stringify(cotizacion.value, null, 2));
        
        // Sincronizar componentes existentes con la API
        await sincronizarComponentesExistentes();
    } catch (err) {
        console.error('Error al cargar cotización:', err);
        error.value = 'Error al cargar la cotización';
    } finally {
        cargandoDatos.value = false;
    }
};

const sincronizarComponentesExistentes = async () => {
    try {
        console.log('🔄 Sincronizando componentes existentes con la API...');
        
        // Obtener todos los componentes ya guardados en la API
        const componentesEnApi = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
        console.log('📋 Componentes en API:', componentesEnApi.length);
        
        // Primero, eliminar duplicados en la API
        const componentesPorCotizacion = componentesEnApi.filter(cpc => cpc.cotizacion_id === cotizacion.value.id);
        const duplicados = new Map();
        
        for (const comp of componentesPorCotizacion) {
            const clave = `${comp.cotizacion_id}-${comp.componente_id}`;
            if (duplicados.has(clave)) {
                // Es un duplicado, eliminar el más antiguo
                const existente = duplicados.get(clave);
                const aEliminar = new Date(comp.created_at) < new Date(existente.created_at) ? comp : existente;
                const aMantener = new Date(comp.created_at) < new Date(existente.created_at) ? existente : comp;
                
                console.log(`⚠️ Duplicado encontrado para componente ${comp.componente_id}, eliminando registro ${aEliminar.id}`);
                try {
                    await storeComponentesPorCotizacion.eliminarComponentePorCotizacion(aEliminar.id);
                } catch (err) {
                    console.warn('Error eliminando duplicado:', err);
                }
                
                duplicados.set(clave, aMantener);
            } else {
                duplicados.set(clave, comp);
            }
        }
        
        // Recargar componentes después de limpiar duplicados
        const componentesLimpios = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
        const componentesEstaCotzacion = componentesLimpios.filter(cpc => cpc.cotizacion_id === cotizacion.value.id);
        
        // Inicializar array de módulos si no existe
        if (!cotizacion.value.modulos) {
            cotizacion.value.modulos = [];
        }
        
        // Si hay componentes en la API pero no hay módulos, reconstruir módulos desde los componentes
        if (componentesEstaCotzacion.length > 0 && cotizacion.value.modulos.length === 0) {
            console.log('🏗️ Reconstruyendo módulos desde componentes de la API...');
            
            // Agrupar componentes por modulo_id
            const modulosPorId = new Map();
            
            for (const compApi of componentesEstaCotzacion) {
                if (compApi.modulo_id) {
                    if (!modulosPorId.has(compApi.modulo_id)) {
                        // Buscar el módulo completo en el store de módulos
                        const moduloCompleto = modulos.value.find(m => m.id === compApi.modulo_id);
                        
                        if (moduloCompleto) {
                            // Crear una copia del módulo con sus componentes
                            modulosPorId.set(compApi.modulo_id, {
                                ...moduloCompleto,
                                cantidad: 1,
                                componentes: []
                            });
                        }
                    }
                    
                    // Agregar el componente al módulo
                    const moduloEnMapa = modulosPorId.get(compApi.modulo_id);
                    if (moduloEnMapa) {
                        // Buscar el componente completo en el módulo original
                        const moduloOriginal = modulos.value.find(m => m.id === compApi.modulo_id);
                        if (moduloOriginal && moduloOriginal.componentes) {
                            const componenteCompleto = moduloOriginal.componentes.find(c => c.id === compApi.componente_id);
                            if (componenteCompleto) {
                                moduloEnMapa.componentes.push({
                                    ...componenteCompleto,
                                    cantidad: compApi.cantidad
                                });
                            }
                        }
                    }
                }
            }
            
            // Agregar los módulos reconstruidos a la cotización
            cotizacion.value.modulos = Array.from(modulosPorId.values());
            console.log(`✅ ${cotizacion.value.modulos.length} módulos reconstruidos con sus componentes`);
        }
        
        // Recorrer todos los módulos y sus componentes para sincronizar
        if (cotizacion.value.modulos && cotizacion.value.modulos.length > 0) {
            for (const modulo of cotizacion.value.modulos) {
                if (modulo.componentes && modulo.componentes.length > 0) {
                    for (const componente of modulo.componentes) {
                        // Verificar si ya existe en la API
                        const existeEnApi = componentesLimpios.find(cpc => 
                            cpc.cotizacion_id === cotizacion.value.id && 
                            cpc.componente_id === componente.id
                        );
                        
                        if (!existeEnApi) {
                            // No existe, crearlo
                            try {
                                const datosComponente = {
                                    cotizacion_id: cotizacion.value.id,
                                    componente_id: componente.id,
                                    modulo_id: modulo.id,
                                    cantidad: componente.cantidad || 1
                                };
                                console.log('➕ Sincronizando componente:', componente.nombre);
                                await storeComponentesPorCotizacion.crearComponentePorCotizacion(datosComponente);
                            } catch (err) {
                                console.warn('⚠️ Error sincronizando componente:', componente.nombre, err);
                            }
                        } else {
                            // Actualizar cantidad si es diferente
                            if (existeEnApi.cantidad !== componente.cantidad) {
                                componente.cantidad = existeEnApi.cantidad;
                            }
                        }
                    }
                }
            }
            console.log('✅ Sincronización de componentes completada');
        }
    } catch (err) {
        console.error('❌ Error en sincronización de componentes:', err);
        // No lanzar error para no bloquear la carga de la cotización
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

const generarPDF = async () => {
    try {
        generandoPDF.value = true;
        console.log('Iniciando generación de PDF...');
        
        // Importar jsPDF dinámicamente
        console.log('Importando jsPDF...');
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
        console.log('jsPDF importado correctamente');
        
        const doc = new jsPDF();
        console.log('Documento PDF creado');
        
        // Configuración
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;
        
        // Título
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('COTIZACIÓN', pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Número de cotización
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Número: #${cotizacion.value.id}`, margin, y);
        y += 8;
        doc.text(`Fecha: ${new Date(cotizacion.value.fecha).toLocaleDateString('es-ES')}`, margin, y);
        y += 8;
        doc.text(`Estado: ${cotizacion.value.estado}`, margin, y);
        y += 15;
        
        // Información del cliente
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENTE', margin, y);
        y += 8;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        if (cotizacion.value.cliente) {
            doc.text(`Nombre: ${cotizacion.value.cliente.nombre}`, margin, y);
            y += 6;
            if (cotizacion.value.cliente.empresa) {
                doc.text(`Empresa: ${cotizacion.value.cliente.empresa}`, margin, y);
                y += 6;
            }
            if (cotizacion.value.cliente.email) {
                doc.text(`Email: ${cotizacion.value.cliente.email}`, margin, y);
                y += 6;
            }
            if (cotizacion.value.cliente.telefono) {
                doc.text(`Teléfono: ${cotizacion.value.cliente.telefono}`, margin, y);
                y += 6;
            }
        }
        y += 10;
        
        // Módulos
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MÓDULOS', margin, y);
        y += 10;
        
        console.log('Agregando módulos al PDF:', modulosAsignados.value.length);
        modulosAsignados.value.forEach((modulo, index) => {
            // Verificar si necesitamos una nueva página
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${modulo.nombre}`, margin, y);
            y += 6;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            if (modulo.descripcion) {
                doc.text(`   ${modulo.descripcion}`, margin, y);
                y += 6;
            }
            
            doc.text(`   Código: ${modulo.codigo}`, margin, y);
            y += 6;
            doc.text(`   Cantidad: ${modulo.cantidad}`, margin, y);
            y += 6;
            doc.text(`   Precio Unitario: $${formatCurrency(modulo.costo_total || calcularPrecioUnitarioModulo(modulo))}`, margin, y);
            y += 6;
            doc.text(`   Subtotal: $${formatCurrency(calcularSubtotalModulo(modulo))}`, margin, y);
            y += 10;
        });
        
        // Total
        y += 5;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: $${formatCurrency(totalCotizacion.value)}`, pageWidth - margin, y, { align: 'right' });
        
        console.log('Guardando PDF...');
        // Guardar el PDF
        doc.save(`Cotizacion_${cotizacion.value.id}.pdf`);
        console.log('PDF guardado correctamente');
        
        success.value = 'PDF generado correctamente';
        setTimeout(() => {
            success.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error al generar PDF:', err);
        console.error('Stack trace:', err.stack);
        error.value = 'Error al generar el PDF: ' + err.message;
        setTimeout(() => {
            error.value = null;
        }, 5000);
    } finally {
        generandoPDF.value = false;
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
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 2rem;
    margin: -2rem -2rem 2rem -2rem;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.header-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn-back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 10px 18px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    font-size: 0.95rem;
}

.btn-back:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.back-icon {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
}

.btn-back:hover .back-icon {
    transform: translateX(-3px);
}

.form-title {
    margin: 0;
    color: white;
    font-size: 2rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cotizacion-badge {
    background: rgba(255, 255, 255, 0.25);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.estado-badge {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.estado-selector {
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    border: 2px solid rgba(255, 255, 255, 0.3);
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.estado-selector:hover {
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
}

.estado-activa {
    background: rgba(76, 175, 80, 0.9);
    color: white;
}

.estado-completada {
    background: rgba(33, 150, 243, 0.9);
    color: white;
}

.estado-cancelada {
    background: rgba(244, 67, 54, 0.9);
    color: white;
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

.section-header-inline {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.section-subtitle {
    color: #999;
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
}

.btn-add-module {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 12px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-add-module:hover {
    background: linear-gradient(135deg, #c89564 0%, #b8845a 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
}

.btn-icon {
    font-size: 1.1rem;
    line-height: 1;
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

.component-item-mejorado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #faf8f5;
    border-radius: 8px;
    margin-bottom: 8px;
    border: 1px solid #e8ddd7;
    transition: all 0.2s ease;
}

.component-item-mejorado:hover {
    background: #f5f1e8;
    border-color: #d4a574;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.1);
}

.comp-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.comp-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.cantidad-control-mini {
    display: flex;
    align-items: center;
    gap: 4px;
    background: white;
    border: 1px solid #d4a574;
    border-radius: 6px;
    padding: 2px;
}

.btn-control-mini {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #8B5A3C;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-control-mini:hover:not(:disabled) {
    background: #d4a574;
    color: white;
}

.btn-control-mini:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-control-mini.minus span {
    line-height: 1;
    padding-bottom: 2px;
}

.btn-control-mini.plus span {
    line-height: 1;
}

.input-cantidad-componente {
    width: 45px;
    padding: 4px 6px;
    border: none;
    background: transparent;
    text-align: center;
    font-weight: 600;
    font-size: 0.9rem;
    color: #2c2c2c;
}

.input-cantidad-componente:focus {
    outline: none;
}

.btn-eliminar-componente {
    width: 32px;
    height: 32px;
    border: 1px solid #e8ddd7;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-eliminar-componente:hover {
    background: #ff4444;
    border-color: #ff4444;
    transform: scale(1.05);
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

.modal-modulos {
    max-width: 600px;
}

/* ===== MODAL: Selector de Módulos Mejorado ===== */
.modal-modulos-mejorado {
    background: #ffffff;
    border-radius: 20px;
    width: 90%;
    max-width: 900px;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
}

.modal-header-modulos {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 30px;
    text-align: center;
    position: relative;
    border-bottom: 3px solid rgba(255, 255, 255, 0.3);
}

.modal-header-modulos .modal-icon {
    font-size: 48px;
    margin-bottom: 10px;
    display: block;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.modal-header-modulos h3 {
    margin: 0;
    color: #ffffff;
    font-size: 28px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-close-modulos {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
    color: #ffffff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
}

.btn-close-modulos:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-body-modulos {
    padding: 30px;
    overflow-y: auto;
    max-height: calc(85vh - 140px);
}

.empty-state-mejorado {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-state-mejorado .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-state-mejorado p {
    font-size: 18px;
    color: #999;
    margin: 0;
}

/* ===== MODAL: Selector de Clientes ===== */
.modal-clientes-mejorado {
    background: #ffffff;
    border-radius: 20px;
    width: 90%;
    max-width: 900px;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
}

.modal-header-clientes {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 30px;
    text-align: center;
    position: relative;
    border-bottom: 3px solid rgba(255, 255, 255, 0.3);
}

.modal-header-clientes .modal-icon {
    font-size: 48px;
    margin-bottom: 10px;
    display: block;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.modal-header-clientes h3 {
    margin: 0;
    color: #ffffff;
    font-size: 28px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-close-clientes {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
    color: #ffffff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
}

.btn-close-clientes:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-body-clientes {
    padding: 30px;
    overflow-y: auto;
    max-height: calc(85vh - 140px);
}

.clientes-grid-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.cliente-card-selector {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.cliente-card-selector:hover {
    border-color: #d4a574;
    box-shadow: 0 12px 30px rgba(212, 165, 116, 0.3);
    transform: translateY(-8px) scale(1.02);
}

.cliente-card-selector.selected {
    border-color: #d4a574;
    border-width: 3px;
    box-shadow: 0 8px 20px rgba(212, 165, 116, 0.4);
}

.cliente-card-header {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 1.2rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.cliente-icon-large {
    font-size: 2.5rem;
    line-height: 1;
    flex-shrink: 0;
    filter: brightness(0) invert(1);
}

.cliente-info {
    flex: 1;
}

.cliente-info h4 {
    margin: 0 0 0.3rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
}

.cliente-empresa {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

.cliente-card-body {
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    background: #fafafa;
}

.cliente-detail {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.9rem;
}

.detail-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
}

.detail-text {
    color: #666;
    flex: 1;
}

.cliente-card-action {
    padding: 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    text-align: center;
    color: #ffffff;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s ease;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.cliente-card-action span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.cliente-card-selector:hover .cliente-card-action {
    background: linear-gradient(135deg, #c89564 0%, #b8845a 100%);
    padding: 18px 16px;
}

.modal-modulos-body {
    max-height: 450px;
    overflow-y: auto;
    padding: 0;
}

.modulos-lista {
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* Grid de módulos en modal selector */
.modulos-grid-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 0;
}

.modulo-card-selector {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.modulo-card-selector:hover {
    border-color: #d4a574;
    box-shadow: 0 12px 30px rgba(212, 165, 116, 0.3);
    transform: translateY(-8px) scale(1.02);
}

.modulo-card-header {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 1.2rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
}

.modulo-card-header .modulo-icon {
    font-size: 28px;
    line-height: 1;
    flex-shrink: 0;
}

.modulo-card-header h4 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    flex: 1;
}

.modulo-card-body {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.modulo-card-body .modulo-descripcion {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
    flex: 1;
}

.modulo-card-footer {
    margin-top: auto;
    padding-top: 0.8rem;
    border-top: 1px solid #f0f0f0;
}

.modulo-card-footer .modulo-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
}

.modulo-card-footer .modulo-price .label {
    color: #666;
    font-weight: 500;
}

.modulo-card-footer .modulo-price .value {
    color: #d4a574;
    font-weight: 700;
    font-size: 1.1rem;
}

.modulo-card-action {
    padding: 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    text-align: center;
    color: #ffffff;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s ease;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.modulo-card-action span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.modulo-card-selector:hover .modulo-card-action {
    background: linear-gradient(135deg, #c89564 0%, #b8845a 100%);
    padding: 18px 16px;
}

/* Estilos legacy para compatibilidad */
.modulo-item-selector {
    padding: 1.2rem 2rem;
    border-bottom: 1px solid #e8ddd7;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
}

.modulo-item-selector:hover {
    background: #f9f7f4;
    border-left: 4px solid #d4a574;
    padding-left: calc(2rem - 4px);
}

.modulo-info h4 {
    margin: 0 0 0.3rem 0;
    color: #2c2c2c;
    font-size: 1rem;
    font-weight: 600;
}

.modulo-codigo {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #999;
    font-weight: 500;
}

.modulo-descripcion {
    margin: 0.5rem 0 0.5rem 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.3;
}

.modulo-price {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    color: #d4a574;
    font-weight: 500;
}

.modulo-selector-icon {
    color: #d4a574;
    font-size: 1.2rem;
    font-weight: bold;
    flex-shrink: 0;
    margin-left: 1rem;
}

/* Modal mejorado de cantidad */
.modal-cantidad-mejorado {
    max-width: 480px;
    border-radius: 16px;
    overflow: hidden;
}

.modal-header-cantidad {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 2rem;
    text-align: center;
    position: relative;
}

.modal-header-cantidad .modal-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.modal-header-cantidad h3 {
    color: white;
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
}

.btn-close-cantidad {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-close-cantidad:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.modal-body-cantidad {
    padding: 2rem;
}

.modulo-preview {
    background: #f9f7f4;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 2rem;
}

.preview-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
}

.preview-info h4 {
    margin: 0 0 0.5rem 0;
    color: #2c2c2c;
    font-size: 1.1rem;
    font-weight: 600;
}

.preview-info p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
}

.cantidad-section {
    text-align: center;
}

.cantidad-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.cantidad-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.btn-cantidad-control {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #d4a574;
    background: white;
    color: #d4a574;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-cantidad-control:hover:not(:disabled) {
    background: #d4a574;
    color: white;
    transform: scale(1.1);
}

.btn-cantidad-control:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-cantidad-control.minus span {
    margin-bottom: 2px;
}

.cantidad-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.input-cantidad-mejorado {
    width: 80px;
    height: 60px;
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    color: #2c2c2c;
    border: 3px solid #e8ddd7;
    border-radius: 12px;
    background: #fef5e7;
    transition: all 0.2s;
}

.input-cantidad-mejorado:focus {
    outline: none;
    border-color: #d4a574;
    background: white;
}

.cantidad-unidad {
    font-size: 0.85rem;
    color: #999;
    font-weight: 500;
}

.modal-footer-cantidad {
    padding: 1.5rem 2rem;
    background: #f9f7f4;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-top: 1px solid #e8ddd7;
}

.modal-actions-group {
    display: flex;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
}

.btn-modal-cancel,
.btn-modal-confirm,
.btn-modal-secondary {
    padding: 0.9rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-modal-secondary {
    background: white;
    color: #d4a574;
    border: 2px solid #d4a574;
    padding: 0.9rem 1.2rem;
}

.btn-modal-secondary:hover {
    background: #d4a574;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
}

.btn-modal-cancel {
    background: white;
    color: #666;
    border: 2px solid #e0e0e0;
    flex: 1;
}

.btn-modal-cancel:hover {
    background: #f5f5f5;
    border-color: #d0d0d0;
}

.btn-modal-confirm {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    flex: 1;
}

.btn-modal-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

/* Legacy styles */
.modal-cantidad {
    max-width: 400px;
}

.modal-item {
    margin-bottom: 1.5rem;
}

.modal-label {
    display: block;
    font-weight: 600;
    color: #2c2c2c;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.modal-value {
    padding: 0.75rem 1rem;
    background: #f9f7f4;
    border-radius: 6px;
    border: 1px solid #e8ddd7;
    color: #2c2c2c;
    font-weight: 500;
}

.precio-highlight {
    background: #fef5e7;
    border-color: #d4a574;
    color: #d4a574;
    font-weight: 600;
    font-size: 1.1rem;
}

.cantidad-editor {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.btn-cantidad-minus,
.btn-cantidad-plus {
    padding: 8px 12px;
    background: #d4a574;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-cantidad-minus:hover,
.btn-cantidad-plus:hover {
    background: #c89564;
    transform: scale(1.05);
}

.input-cantidad-modal {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d4a574;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
    font-size: 1rem;
}

.input-cantidad-modal:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.1);
}

.cantidad-unit {
    color: #999;
    font-size: 0.9rem;
    font-weight: 500;
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

/* Botón selector de cliente */
.btn-selector-cliente {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 12px 16px;
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
}

.btn-selector-cliente:hover {
    border-color: #d4a574;
    background: #faf8f5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
}

.cliente-icon {
    font-size: 1.5rem;
    line-height: 1;
}

.cliente-nombre {
    flex: 1;
    color: #2c2c2c;
    font-weight: 600;
}

.cliente-placeholder {
    flex: 1;
    color: #999;
    font-weight: 500;
}

.selector-arrow {
    color: #d4a574;
    font-size: 0.8rem;
    transition: transform 0.3s ease;
}

.btn-selector-cliente:hover .selector-arrow {
    transform: translateY(3px);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.2rem;
    background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
    border-radius: 12px;
    border: 2px solid #e8ddd7;
    transition: all 0.3s ease;
}

.info-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.15);
    border-color: #d4a574;
}

.info-icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    flex: 1;
}

.info-label {
    font-size: 0.8rem;
    color: #999;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 1rem;
    color: #2c2c2c;
    font-weight: 600;
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
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.resumen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.resumen-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: #faf8f5;
    border-radius: 12px;
    border: 2px solid #e8ddd7;
    transition: all 0.3s ease;
}

.resumen-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.resumen-item.total {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    border-color: #c89564;
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.3);
}

.resumen-item.total:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(212, 165, 116, 0.4);
}

.resumen-item.total .resumen-label,
.resumen-item.total .resumen-value {
    color: white;
}

.resumen-icon {
    font-size: 2.5rem;
    line-height: 1;
    flex-shrink: 0;
}

.resumen-item.total .resumen-icon {
    filter: brightness(0) invert(1);
}

.resumen-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
}

.resumen-label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.resumen-value {
    font-size: 2rem;
    color: #2c2c2c;
    font-weight: 700;
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
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 14px 32px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-cancel {
    background: white;
    color: #666;
    border: 2px solid #e0e0e0;
}

.btn-cancel:hover {
    background: #f5f5f5;
    border-color: #d0d0d0;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
    background: linear-gradient(135deg, #c89564 0%, #b8845a 100%);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 14px 32px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.section-header-inline {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.section-subtitle {
    color: #999;
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
}

.cliente-section,
.modulos-section,
.resumen-section {
    border: 2px solid #e8ddd7;
    transition: all 0.3s ease;
}

.info-section {
    border-left: 4px solid #d4a574;
}

.cliente-section {
    border-left: 4px solid #4caf50;
}

.modulos-section {
    border-left: 4px solid #2196f3;
}

.resumen-section {
    background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
    border: 3px solid #d4a574 !important;
    border-left: 3px solid #d4a574 !important;
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
