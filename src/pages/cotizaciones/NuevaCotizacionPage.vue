<template>
    <div class="nueva-cotizacion-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-left">
                <button class="btn-back" @click="$router.push('/cotizaciones')">
                    <span class="back-icon">←</span>
                    <span>Volver</span>
                </button>
                <div class="header-title-group">
                    <h1 class="page-title">✨ Nueva Cotización</h1>
                    <p class="page-subtitle">Crea una nueva cotización para tus clientes</p>
                </div>
            </div>
            <div class="header-stats">
                <div class="stat-badge">
                    <span class="stat-icon">📦</span>
                    <span class="stat-value">{{ formData.modulos.length }}</span>
                    <span class="stat-label">Módulos</span>
                </div>
                <div class="stat-badge">
                    <span class="stat-icon">💰</span>
                    <span class="stat-value">${{ formatCurrency(totalCotizacion) }}</span>
                    <span class="stat-label">Total</span>
                </div>
            </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Información del cliente -->
        <div class="info-card cliente-card">
            <div class="section-header-inline">
                <h2 class="section-title">👤 Información del Cliente</h2>
                <span v-if="clienteSeleccionado" class="cliente-badge">Cliente Seleccionado</span>
            </div>
            
            <div class="cliente-selector-container">
                <button @click="abrirSelectorClientes" class="btn-selector-cliente-main" type="button">
                    <span class="cliente-icon">👤</span>
                    <div class="cliente-info-display">
                        <span class="cliente-nombre" v-if="clienteSeleccionado">
                            {{ clienteSeleccionado.nombre }}
                        </span>
                        <span class="cliente-placeholder" v-else>
                            Seleccionar Cliente
                        </span>
                        <span v-if="clienteSeleccionado?.email" class="cliente-email-small">{{ clienteSeleccionado.email }}</span>
                    </div>
                    <span class="selector-arrow">▼</span>
                </button>
                <button class="btn-new-cliente-alt" @click="mostrarModalCliente = true">
                    <span>➕</span>
                    <span>Nuevo Cliente</span>
                </button>
            </div>

            <!-- Detalles del cliente seleccionado -->
            <transition name="fade-slide">
                <div v-if="clienteSeleccionado" class="cliente-details-card">
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-icon">👨‍💼</span>
                            <div class="detail-content">
                                <span class="detail-label">Nombre</span>
                                <span class="detail-value">{{ clienteSeleccionado.nombre }}</span>
                            </div>
                        </div>
                        <div v-if="clienteSeleccionado.empresa && clienteSeleccionado.nombre !== 'Publico En Geneal'" class="detail-item">
                            <span class="detail-icon">🏢</span>
                            <div class="detail-content">
                                <span class="detail-label">Empresa</span>
                                <span class="detail-value">{{ clienteSeleccionado.empresa }}</span>
                            </div>
                        </div>
                        <div v-if="clienteSeleccionado.email && clienteSeleccionado.nombre !== 'Publico En Geneal'" class="detail-item">
                            <span class="detail-icon">📧</span>
                            <div class="detail-content">
                                <span class="detail-label">Email</span>
                                <span class="detail-value">{{ clienteSeleccionado.email }}</span>
                            </div>
                        </div>
                        <div v-if="clienteSeleccionado.telefono" class="detail-item">
                            <span class="detail-icon">📱</span>
                            <div class="detail-content">
                                <span class="detail-label">Teléfono</span>
                                <span class="detail-value">{{ clienteSeleccionado.telefono }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>

            <div class="form-group-inline">
                <label class="form-label">📅 Fecha de Cotización</label>
                <input type="date" v-model="formData.fecha" class="form-input-date">
            </div>
        </div>

        <!-- Módulos -->
        <div class="modulos-section">
            <div class="modulos-header">
                <div class="section-header-content">
                    <h2 class="section-title">🧩 Módulos de la Cotización</h2>
                    <span class="section-subtitle">{{ formData.modulos.length }} módulo{{ formData.modulos.length !== 1 ? 's' : '' }} agregado{{ formData.modulos.length !== 1 ? 's' : '' }}</span>
                </div>
                <button class="btn-primary" @click="agregarModulo">
                    <span class="btn-icon">➕</span>
                    <span>Agregar Módulo</span>
                </button>
            </div>

            <div v-if="formData.modulos.length === 0" class="empty-state">
                <div class="empty-icon">📦</div>
                <p class="empty-title">No hay módulos agregados</p>
                <p class="empty-description">Haz clic en "Agregar Módulo" para comenzar a construir tu cotización</p>
                <button class="btn-empty-action" @click="agregarModulo">➕ Agregar Primer Módulo</button>
            </div>

            <div v-for="(modulo, moduloIdx) in formData.modulos" :key="moduloIdx" class="modulo-card">
                <div class="modulo-header">
                    <div class="modulo-title-row">
                        <div class="modulo-number">Módulo {{ moduloIdx + 1 }}</div>
                        <button class="btn-delete-icon" @click="eliminarModulo(moduloIdx)" title="Eliminar módulo">
                            <span>🗑️</span>
                        </button>
                    </div>
                    <div class="modulo-info">
                        <input v-model="modulo.nombre" class="modulo-input" placeholder="Nombre del módulo">
                        <span class="modulo-cantidad-badge">✕ {{ modulo.cantidad }}</span>
                    </div>
                    <div class="modulo-details-row">
                        <input v-model="modulo.codigo" class="modulo-codigo-input" placeholder="📋 Código">
                        <input v-model="modulo.descripcion" class="modulo-descripcion-input" placeholder="📝 Descripción">
                    </div>
                </div>

                <!-- Cantidad del módulo -->
                <div class="modulo-cantidad-section">
                    <label class="form-label">Cantidad</label>
                    <input v-model.number="modulo.cantidad" type="number" min="1" class="form-input cantidad-input">
                </div>

                <!-- Componentes -->
                <div class="componentes-section">
                    <div class="componentes-header">
                        <div class="componentes-title">
                            <span class="componentes-icon">🔧</span>
                            <h4>Componentes</h4>
                            <span class="componentes-count">{{ modulo.componentes.length }}</span>
                        </div>
                        <button class="btn-secondary" @click="agregarComponente(moduloIdx)">
                            <span>➕</span>
                            <span>Agregar Componente</span>
                        </button>
                    </div>

                    <div v-if="modulo.componentes.length === 0" class="empty-state-small">
                        <span class="empty-small-icon">🔧</span>
                        <p>Sin componentes - Agrega componentes para este módulo</p>
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

        <!-- Modal de Selección de Clientes -->
        <div v-if="mostrarSelectorClientes" class="modal-overlay" @click.self="cerrarSelectorClientes">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">Seleccionar Cliente</h3>
                    <button @click="cerrarSelectorClientes" class="btn-close-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="search-bar">
                        <input 
                            v-model="busquedaCliente" 
                            type="text" 
                            placeholder="Buscar cliente..." 
                            class="search-input"
                        />
                    </div>
                    <div class="clientes-list">
                        <div 
                            v-for="cliente in clientesFiltrados" 
                            :key="cliente.id"
                            @click="seleccionarCliente(cliente)"
                            class="cliente-item"
                            :class="{ 'selected': formData.cliente_id === cliente.id }"
                        >
                            <div class="cliente-info">
                                <span class="cliente-nombre-modal">{{ cliente.nombre }}</span>
                                <span v-if="cliente.empresa" class="cliente-empresa">{{ cliente.empresa }}</span>
                            </div>
                            <div class="cliente-contact">
                                <span v-if="cliente.email" class="cliente-email">{{ cliente.email }}</span>
                                <span v-if="cliente.telefono" class="cliente-telefono">{{ cliente.telefono }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

        <!-- Modal Seleccionar Módulo -->
        <div v-if="mostrarModalModulo" class="modal-overlay" @click.self="mostrarModalModulo = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Seleccionar Módulo</h3>
                    <button class="btn-close" @click="mostrarModalModulo = false">✕</button>
                </div>
                <div class="modal-body">
                    <div v-if="modulos.length === 0" class="empty-state-small">
                        <p>No hay módulos disponibles</p>
                    </div>
                    <div v-else class="modulos-list">
                        <div 
                            v-for="modulo in modulos" 
                            :key="modulo.id" 
                            class="modulo-item"
                            @click="seleccionarModulo(modulo)"
                        >
                            <div class="modulo-item-header">
                                <h4>{{ modulo.nombre }}</h4>
                                <span class="modulo-codigo">{{ modulo.codigo }}</span>
                            </div>
                            <p v-if="modulo.descripcion" class="modulo-descripcion">{{ modulo.descripcion }}</p>
                            <div v-if="modulo.componentes && modulo.componentes.length > 0" class="modulo-componentes-preview">
                                <span class="componentes-label">Componentes:</span>
                                <div class="componentes-list">
                                    <div v-for="(comp, idx) in modulo.componentes" :key="idx" class="componente-tag">
                                        {{ comp.nombre }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCotizacionesStore } from '../../stores/cotizaciones';
import { useClientesStore } from '../../stores/clientes';
import { useModulosStore } from '../../stores/modulos';
import { crearCotizacion } from '../../http/cotizaciones-api';
import { crearCliente } from '../../http/clientes-api';
import { obtenerTokenCsrf } from '../../http/apl';

const router = useRouter();
const storeC = useCotizacionesStore();
const storeClientes = useClientesStore();
const storeModulos = useModulosStore();

const formData = reactive({
    cliente_id: '',
    fecha: new Date().toISOString().split('T')[0],
    modulos: []
});

const clientes = computed(() => storeClientes.clientes);
const modulos = computed(() => storeModulos.modulos);

const clienteSeleccionado = computed(() => {
    if (!formData.cliente_id) return null;
    return clientes.value.find(c => c.id === Number(formData.cliente_id));
});

const clientesFiltrados = computed(() => {
    if (!busquedaCliente.value) return clientes.value;
    const busqueda = busquedaCliente.value.toLowerCase();
    return clientes.value.filter(cliente =>
        cliente.nombre?.toLowerCase().includes(busqueda) ||
        cliente.empresa?.toLowerCase().includes(busqueda) ||
        cliente.email?.toLowerCase().includes(busqueda)
    );
});

const loading = ref(false);
const error = ref(null);
const mostrarModalCliente = ref(false);
const mostrarModalModulo = ref(false);
const mostrarSelectorClientes = ref(false);
const busquedaCliente = ref('');
const creandoCliente = ref(false);

const nuevoCliente = reactive({
    nombre: '',
    empresa: '',
    email: '',
    telefono: ''
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

const abrirSelectorClientes = () => {
    mostrarSelectorClientes.value = true;
    busquedaCliente.value = '';
};

const cerrarSelectorClientes = () => {
    mostrarSelectorClientes.value = false;
    busquedaCliente.value = '';
};

const seleccionarCliente = (cliente) => {
    formData.cliente_id = cliente.id;
    cerrarSelectorClientes();
};

const agregarModulo = () => {
    // Mostrar modal para seleccionar módulo
    mostrarModalModulo.value = true;
};

const seleccionarModulo = (modulo) => {
    if (modulo.id) {
        // Usar los componentes que ya vienen en el módulo
        let componentes = [];
        
        if (modulo.componentes && Array.isArray(modulo.componentes) && modulo.componentes.length > 0) {
            componentes = modulo.componentes.map(comp => {
                // Calcular precio unitario: costo_total / cantidad
                const cantidad = comp.cantidad || 1;
                const costoTotal = comp.costo_total || 0;
                const precioUnitario = cantidad > 0 ? costoTotal / cantidad : 0;
                
                return {
                    nombre: comp.nombre || '',
                    descripcion: comp.descripcion || '',
                    cantidad: cantidad, // mantener la cantidad original del módulo
                    precio_unitario: precioUnitario
                };
            });
            console.log('Componentes del módulo:', modulo.nombre, componentes);
        }

        formData.modulos.push({
            modulo_id: modulo.id,
            nombre: modulo.nombre,
            codigo: modulo.codigo,
            descripcion: modulo.descripcion,
            cantidad: 1,
            componentes: componentes
        });
        mostrarModalModulo.value = false;
    }
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
    // Validaciones
    if (!formData.cliente_id) {
        error.value = 'Por favor selecciona un cliente';
        return;
    }

    if (!formData.fecha) {
        error.value = 'Por favor selecciona una fecha';
        return;
    }

    if (formData.modulos.length === 0) {
        error.value = 'Por favor agrega al menos un módulo';
        return;
    }

    // Validar que cada módulo tenga al menos un componente y cantidad válida
    for (let i = 0; i < formData.modulos.length; i++) {
        const modulo = formData.modulos[i];
        
        if (!modulo.nombre || modulo.nombre.trim() === '') {
            error.value = `El módulo ${i + 1} debe tener un nombre`;
            return;
        }
        
        if (!modulo.cantidad || modulo.cantidad < 1) {
            error.value = `El módulo "${modulo.nombre}" debe tener cantidad mayor a 0`;
            return;
        }
        
        if (modulo.componentes.length === 0) {
            error.value = `El módulo "${modulo.nombre}" debe tener al menos un componente`;
            return;
        }
        
        // Validar componentes
        for (let j = 0; j < modulo.componentes.length; j++) {
            const comp = modulo.componentes[j];
            
            if (!comp.nombre || comp.nombre.trim() === '') {
                error.value = `El componente ${j + 1} del módulo "${modulo.nombre}" debe tener un nombre`;
                return;
            }
            
            if (!comp.cantidad || comp.cantidad < 1) {
                error.value = `El componente "${comp.nombre}" debe tener cantidad mayor a 0`;
                return;
            }
            
            if (!comp.precio_unitario || comp.precio_unitario < 0) {
                error.value = `El componente "${comp.nombre}" debe tener un precio unitario válido`;
                return;
            }
        }
    }

    loading.value = true;
    error.value = null;

    try {
        // Transformar la estructura de modulos con componentes a detalles planos
        const detalles = [];
        const modulosCantidad = [];
        
        formData.modulos.forEach((modulo, index) => {
            const cantidadModulo = Number(modulo.cantidad) || 1;
            
            // Guardar la cantidad de cada módulo con su índice para evitar sobrescritura
            if (modulo.modulo_id) {
                modulosCantidad.push({
                    modulo_id: modulo.modulo_id,
                    cantidad: cantidadModulo,
                    index: index
                });
            }
            
            modulo.componentes.forEach(comp => {
                detalles.push({
                    modulo_id: modulo.modulo_id || null,
                    descripcion: `${modulo.nombre} - ${comp.nombre}`,
                    cantidad: Number(comp.cantidad) * cantidadModulo,
                    precio_unitario: Number(comp.precio_unitario),
                    subtotal: (Number(comp.cantidad) * cantidadModulo) * Number(comp.precio_unitario)
                });
            });
        });

        const datosParaEnviar = {
            cliente_id: Number(formData.cliente_id),
            fecha: formData.fecha,
            total: totalCotizacion.value,
            detalles: detalles,
            modulos_cantidad: modulosCantidad
        };

        console.log('Enviando cotización:', datosParaEnviar);
        const response = await crearCotizacion(datosParaEnviar);
        console.log('Cotización guardada:', response);
        
        // Recargar cotizaciones en el store
        await storeC.fetchCotizaciones();
        
        // Redirigir a la cotización creada o a la lista
        const cotizacionId = response.id || response.data?.id;
        if (cotizacionId) {
            router.push(`/cotizacion-detallada/${cotizacionId}`);
        } else {
            router.push('/cotizaciones');
        }
    } catch (err) {
        console.error('Error guardando cotización:', err);
        
        // Mostrar mensaje de error más detallado
        let mensaje = 'Error al guardar la cotización';
        if (err.response?.data?.message) {
            mensaje = err.response.data.message;
        } else if (err.response?.data?.errors) {
            // Capturar errores de validación
            const errores = Object.values(err.response.data.errors).flat();
            mensaje = errores.join(', ');
        } else if (err.message) {
            mensaje = err.message;
        }
        
        error.value = mensaje;
    } finally {
        loading.value = false;
    }
};

const cargarClientes = async () => {
    try {
        await storeClientes.fetchClientes();
        
        // Seleccionar automáticamente "Público General" si existe
        const clientePublicoGeneral = storeClientes.clientes.find(c => 
            c.nombre?.toLowerCase().includes('público') || 
            c.nombre?.toLowerCase().includes('publico') ||
            c.nombre?.toLowerCase().includes('general')
        );
        
        if (clientePublicoGeneral) {
            formData.cliente_id = clientePublicoGeneral.id;
            console.log('Cliente "Público General" seleccionado automáticamente');
        }
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
    cargarModulos();
});

const cargarModulos = async () => {
    try {
        await storeModulos.fetchModulos();
    } catch (err) {
        console.error('Error cargando módulos:', err);
        error.value = 'Error al cargar los módulos';
    }
};
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
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 32px;
    padding: 32px;
    background: linear-gradient(135deg, #F5F1E8 0%, #FAF8F3 100%);
    border-radius: 16px;
    border: 2px solid var(--color-border, #E5DFD0);
    box-shadow: 0 4px 20px rgba(44, 24, 16, 0.08);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 1;
}

.header-title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.header-stats {
    display: flex;
    gap: 12px;
}

.stat-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 20px;
    background: white;
    border: 2px solid #d4a574;
    border-radius: 12px;
    min-width: 100px;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.1);
}

.stat-icon {
    font-size: 1.5rem;
}

.stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #d4a574;
}

.stat-label {
    font-size: 0.75rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-back {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: #F5F1E8;
    border: none;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.15);
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-back:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(44, 24, 16, 0.25);
}

.back-icon {
    font-size: 1.2rem;
}

.page-title {
    font-size: 2.5rem;
    color: #2C1810;
    margin: 0;
    font-weight: 700;
    line-height: 1.2;
}

.page-subtitle {
    font-size: 0.95rem;
    color: #6B4423;
    margin: 0;
    font-weight: 400;
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
    background: white;
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 4px 16px rgba(44, 24, 16, 0.08);
}

.section-header-inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #d4a574;
}

.cliente-badge {
    background: linear-gradient(135deg, #d4a574 0%, #c9995c 100%);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.cliente-selector-container {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

.btn-selector-cliente-main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 12px;
    background: linear-gradient(135deg, #FAF8F3 0%, white 100%);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    font-family: inherit;
    box-shadow: 0 2px 8px rgba(44, 24, 16, 0.05);
}

.btn-selector-cliente-main:hover {
    border-color: #C9A961;
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.2);
}

.cliente-info-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.cliente-email-small {
    font-size: 0.85rem;
    color: #999;
}

.btn-new-cliente-alt {
    background: linear-gradient(135deg, #C9A961 0%, #B8995C 100%);
    color: white;
    border: none;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
}

.btn-new-cliente-alt:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(201, 169, 97, 0.4);
}

.cliente-details-card {
    background: linear-gradient(135deg, #F5F1E8 0%, #FAF8F3 100%);
    border: 1px solid #E5DFD0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #E5DFD0;
}

.detail-icon {
    font-size: 1.5rem;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.detail-label {
    font-size: 0.75rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.detail-value {
    font-size: 0.95rem;
    color: #2C1810;
    font-weight: 600;
}

.form-group-inline {
    display: flex;
    align-items: center;
    gap: 16px;
}

.form-input-date {
    flex: 1;
    max-width: 300px;
    padding: 12px 16px;
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 8px;
    font-size: 1rem;
    color: var(--wood-darkest, #2C1810);
    font-family: inherit;
    transition: all 0.3s ease;
}

.form-input-date:focus {
    outline: none;
    border-color: #C9A961;
    box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
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
    padding: 28px 32px;
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(44, 24, 16, 0.2);
}

.section-header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.modulos-header .section-title {
    margin: 0;
    color: #F5F1E8;
    border: none;
    padding: 0;
    font-size: 1.75rem;
}

.section-subtitle {
    font-size: 0.9rem;
    color: rgba(245, 241, 232, 0.8);
    font-weight: 400;
}

.btn-primary {
    background: linear-gradient(135deg, #C9A961 0%, #B8995C 100%);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.4);
}

.btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(201, 169, 97, 0.5);
}

.btn-icon {
    font-size: 1rem;
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
    background: white;
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 16px;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(44, 24, 16, 0.08);
    transition: all 0.3s ease;
}

.modulo-card:hover {
    box-shadow: 0 8px 24px rgba(44, 24, 16, 0.12);
    transform: translateY(-2px);
}

.modulo-header {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: #F5F1E8;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.modulo-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modulo-number {
    background: rgba(245, 241, 232, 0.2);
    color: #F5F1E8;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid rgba(245, 241, 232, 0.3);
}

.btn-delete-icon {
    background: rgba(255, 107, 107, 0.2);
    color: #FF6B6B;
    border: 1px solid rgba(255, 107, 107, 0.3);
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-delete-icon:hover {
    background: rgba(255, 107, 107, 0.3);
    border-color: rgba(255, 107, 107, 0.6);
    transform: scale(1.1);
}

.modulo-details-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 12px;
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

.componentes-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.componentes-icon {
    font-size: 1.3rem;
}

.componentes-title h4 {
    margin: 0;
    color: #2C1810;
    font-size: 1.2rem;
}

.componentes-count {
    background: linear-gradient(135deg, #d4a574 0%, #c9995c 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 700;
}

.empty-state {
    text-align: center;
    padding: 64px 32px;
    background: linear-gradient(135deg, #FAF8F3 0%, white 100%);
    border: 2px dashed #d4a574;
    border-radius: 16px;
    margin-bottom: 24px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-title {
    font-size: 1.3rem;
    color: #2C1810;
    font-weight: 700;
    margin: 0 0 8px 0;
}

.empty-description {
    color: #999;
    font-size: 1rem;
    margin: 0 0 24px 0;
}

.btn-empty-action {
    background: linear-gradient(135deg, #C9A961 0%, #B8995C 100%);
    color: white;
    border: none;
    padding: 14px 32px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
}

.btn-empty-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(201, 169, 97, 0.4);
}

.empty-state-small {
    text-align: center;
    padding: 32px 24px;
    color: #999;
    background: var(--cream, #F5F1E8);
    border-radius: 12px;
    border: 2px dashed var(--color-border, #E5DFD0);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.empty-small-icon {
    font-size: 2rem;
    opacity: 0.5;
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
    .page-header {
        flex-direction: column;
        align-items: stretch;
        padding: 20px;
    }

    .header-left {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .header-stats {
        justify-content: space-around;
    }

    .stat-badge {
        min-width: auto;
        flex: 1;
    }

    .page-title {
        font-size: 1.8rem;
    }

    .cliente-selector-container {
        flex-direction: column;
    }

    .btn-new-cliente-alt {
        width: 100%;
        justify-content: center;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .modulos-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        padding: 20px;
    }

    .btn-primary {
        width: 100%;
        justify-content: center;
    }

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

    .modulo-details-row {
        grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .acciones-footer {
        flex-direction: column;
    }

    .componentes-title {
        flex-wrap: wrap;
    }
}

.btn-selector-cliente {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--color-border, #E5DFD0);
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-family: inherit;
}

.btn-selector-cliente:hover {
    border-color: #C9A961;
    background: #fafafa;
}

.cliente-icon {
    font-size: 1.2rem;
}

.cliente-nombre {
    flex: 1;
    color: #2C1810;
    font-weight: 600;
}

.cliente-placeholder {
    flex: 1;
    color: #999;
}

.selector-arrow {
    color: #999;
    font-size: 0.8rem;
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
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Estilos para el modal de selección de clientes */
.modal-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-container .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid #e8ddd7;
    background: white;
    border-radius: 12px 12px 0 0;
}

.modal-title {
    font-size: 1.5rem;
    color: #2C1810;
    font-weight: 700;
    margin: 0;
}

.btn-close-modal {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.btn-close-modal:hover {
    background: #f0f0f0;
    color: #333;
}

.modal-body {
    padding: 1.5rem 2rem;
    overflow-y: auto;
    flex: 1;
}

.search-bar {
    margin-bottom: 1.5rem;
}

.search-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.clientes-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.cliente-item {
    padding: 1rem 1.25rem;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
}

.cliente-item:hover {
    border-color: #d4a574;
    background: #faf8f3;
    transform: translateX(4px);
}

.cliente-item.selected {
    border-color: #d4a574;
    background: #f5f1e8;
}

.cliente-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.cliente-nombre-modal {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2C1810;
}

.cliente-empresa {
    font-size: 0.9rem;
    color: #6B4423;
}

.cliente-contact {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #999;
}

.cliente-email,
.cliente-telefono {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

/* Estilos para el modal de nuevo cliente */
.modal-content {
    background: var(--cream, #F5F1E8);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-content .modal-header {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: #F5F1E8;
    padding: 24px 32px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-content .modal-header h3 {
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

.modal-content .modal-body {
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

.modulos-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.modulo-item {
    padding: 16px;
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--warm-white, #FAF8F3);
}

.modulo-item:hover {
    border-color: #C9A961;
    background: var(--cream, #F5F1E8);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.2);
}

.modulo-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.modulo-item-header h4 {
    margin: 0;
    color: #4A3020;
    font-size: 1rem;
    font-weight: 700;
}

.modulo-codigo {
    background: #8B6F47;
    color: #F5F1E8;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
}

.modulo-descripcion {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
}

.modulo-componentes-preview {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #E5DFD0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.componentes-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #4A3020;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.componentes-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.componente-tag {
    background: linear-gradient(135deg, #C9A961 0%, #B8995C 100%);
    color: white;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .modal-container {
        width: 95%;
        max-height: 90vh;
    }

    .modal-container .modal-header,
    .modal-container .modal-body {
        padding: 1rem 1.5rem;
    }

    .cliente-contact {
        flex-direction: column;
        gap: 0.25rem;
    }

    .btn-selector-cliente {
        font-size: 0.9rem;
    }
}
</style>
