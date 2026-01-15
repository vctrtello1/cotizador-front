<template>
    <div class="nuevo-modulo-container">
        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Mensaje personalizado (warning/success/info) -->
        <transition name="slide-down">
            <div v-if="mensaje" class="custom-message" :class="`message-${tipoMensaje}`">
                <div class="message-content">
                    <span class="message-text">{{ mensaje }}</span>
                    <button @click="cerrarMensaje" class="message-close">✕</button>
                </div>
            </div>
        </transition>

        <!-- Botón para volver -->
        <button class="btn-back" @click="$router.push('/modulos')">← Volver</button>

        <h1 class="page-title">Crear Nuevo Módulo</h1>

        <!-- Estado de carga de catálogos -->
        <div v-if="cargandoCatalogos" class="loading-state">
            <p>⏳ Cargando catálogos...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarModulo" class="form">
            <!-- Información básica -->
            <div class="form-section">
                <h2>Información del Módulo</h2>
                <div class="form-group">
                    <label>Nombre del Módulo *</label>
                    <input v-model="formData.nombre" type="text" required placeholder="Ej: Comedor Moderno">
                </div>
                <div class="form-group">
                    <label>Código del Módulo *</label>
                    <input v-model="formData.codigo" type="text" required placeholder="Ej: COM_MODERNO">
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea v-model="formData.descripcion" placeholder="Descripción detallada"></textarea>
                </div>
            </div>

            <!-- Botones -->
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="$router.push('/modulos')">
                    ✕ Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="cargando">
                    <span v-if="cargando">⏳ Guardando...</span>
                    <span v-else>✓ Guardar Módulo</span>
                </button>
            </div>

            <!-- Componentes del Módulo -->
            <div class="form-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2>Componentes del Módulo</h2>
                    <button type="button" class="btn btn-primary" @click="mostrarModalComponentes = true">
                        ➕ Agregar Componente
                    </button>
                </div>

                <div v-if="formData.componentes.length === 0" class="empty-message">
                    No hay componentes seleccionados
                </div>

                <div v-else class="componentes-grid">
                    <div v-for="(comp, idx) in formData.componentes" :key="idx" class="componente-item">
                        <div class="componente-body">
                            <h4>{{ comp.nombre }}</h4>
                            <p class="componente-codigo">{{ comp.codigo }}</p>
                            <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #666;">
                                <p><strong>Cantidad:</strong> {{ comp.cantidad }}</p>
                                <p><strong>Acabado:</strong> {{ obtenerNombreAcabado(comp.acabado_id) }}</p>
                                <p><strong>Mano de Obra:</strong> {{ obtenerNombreManodeObra(comp.mano_de_obra_id) }}</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button type="button" class="btn-small btn-primary" @click="abrirModalEdicionComponente(comp, idx)" title="Editar componente">
                                ✏️
                            </button>
                            <button type="button" class="btn-small btn-danger" @click="eliminarComponente(idx)" title="Eliminar componente">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>

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
                        <div 
                            v-for="componente in todosLosComponentes" 
                            :key="componente.id" 
                            class="componente-item"
                            @click="!formData.componentes.some(c => c.id == componente.id) && abrirModalConfiguracion(componente)"
                            :class="{ 'componente-item-disabled': formData.componentes.some(c => c.id == componente.id) }"
                        >
                            <div class="componente-info-modal">
                                <h4>{{ componente.nombre }}</h4>
                                <p>{{ componente.codigo }}</p>
                            </div>
                            <div v-if="formData.componentes.some(c => c.id == componente.id)" class="componente-item-badge">
                                ✓ Agregado
                            </div>
                            <div v-else class="componente-item-icon">
                                ➜
                            </div>
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
                        <div class="horas-editor">
                            <button type="button" class="btn-horas-moins" @click="decrementarCantidad">−</button>
                            <input 
                                v-model.number="componenteActual.cantidad" 
                                type="number" 
                                min="1"
                                step="1"
                                class="input-horas"
                                @keyup.enter="guardarCantidad"
                                @blur="guardarCantidad"
                            >
                            <span class="horas-unit">unidades</span>
                            <button type="button" class="btn-horas-plus" @click="incrementarCantidad">+</button>
                        </div>
                    </div>

                    <div class="modal-item">
                        <label class="modal-label">Acabado *</label>
                        <button 
                            class="btn-select-modal"
                            @click="mostrarModalSeleccionarAcabado = true"
                        >
                            {{ obtenerNombreAcabado(componenteActual.acabado_id) || 'Seleccionar acabado...' }}
                        </button>
                    </div>

                    <div class="modal-item">
                        <label class="modal-label">Mano de Obra *</label>
                        <button 
                            class="btn-select-modal"
                            @click="abrirModalManoDeObra"
                        >
                            {{ obtenerNombreManodeObra(componenteActual.mano_de_obra_id) || 'Seleccionar mano de obra...' }}
                        </button>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
                    <button class="btn-primary" @click="guardarComponente">Guardar Componente</button>
                </div>
            </div>
        </div>

        <!-- Modal para seleccionar Acabado -->
        <div v-if="mostrarModalSeleccionarAcabado" class="modal-overlay" @click.self="mostrarModalSeleccionarAcabado = false">
            <div class="modal-content modal-seleccion">
                <div class="modal-header">
                    <h3>Seleccionar Acabado</h3>
                    <button class="modal-close" @click="mostrarModalSeleccionarAcabado = false">✕</button>
                </div>

                <div class="modal-body modal-seleccion-body">
                    <div v-if="acabados.length === 0" class="empty-state">
                        <p>No hay acabados disponibles</p>
                    </div>

                    <div v-else class="items-lista">
                        <div 
                            v-for="acabado in acabados" 
                            :key="acabado.id" 
                            class="item-seleccion"
                            :class="{ 'item-seleccionado': componenteActual.acabado_id == acabado.id }"
                            @click="seleccionarAcabado(acabado)"
                        >
                            <div class="item-info">
                                <h4>{{ acabado.nombre }}</h4>
                                <p class="item-codigo">{{ acabado.codigo }}</p>
                                <p v-if="acabado.descripcion" class="item-descripcion">{{ acabado.descripcion }}</p>
                                <p class="item-precio">Costo: <strong>${{ formatCurrency(acabado.costo) }}</strong></p>
                            </div>
                            <div v-if="componenteActual.acabado_id == acabado.id" class="item-checkmark">✓</div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalSeleccionarAcabado = false">Cancelar</button>
                    <button class="btn-primary" @click="mostrarModalSeleccionarAcabado = false" :disabled="!componenteActual.acabado_id">Confirmar</button>
                </div>
            </div>
        </div>

        <!-- Modal para seleccionar Mano de Obra -->
        <div v-if="mostrarModalSeleccionarManoDeObra" class="modal-overlay" @click.self="mostrarModalSeleccionarManoDeObra = false">
            <div class="modal-content modal-seleccion">
                <div class="modal-header">
                    <h3>Seleccionar Mano de Obra</h3>
                    <button class="modal-close" @click="mostrarModalSeleccionarManoDeObra = false">✕</button>
                </div>

                <div class="modal-body modal-seleccion-body">
                    <div v-if="manosDeObra.length === 0" class="empty-state">
                        <p>No hay manos de obra disponibles</p>
                    </div>

                    <div v-else class="items-lista">
                        <div 
                            v-for="mano in manosDeObra" 
                            :key="mano.id" 
                            class="item-seleccion"
                            :class="{ 'item-seleccionado': componenteActual.mano_de_obra_id == mano.id }"
                            @click="seleccionarManoDeObra(mano)"
                        >
                            <div class="item-info">
                                <h4>{{ mano.nombre }}</h4>
                                <p class="item-codigo">{{ mano.codigo }}</p>
                                <p v-if="mano.descripcion" class="item-descripcion">{{ mano.descripcion }}</p>
                                <div class="item-details">
                                    <div class="detail-row">
                                        <span class="detail-label">Costo/hora:</span>
                                        <strong class="detail-value">${{ formatCurrency(mano.costo_hora) }}</strong>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Horas asignadas:</span>
                                        <div class="horas-editor">
                                            <button class="btn-horas-moins" @click.stop="decrementarHoras(mano)">−</button>
                                            <input 
                                                v-model.number="mano.horas" 
                                                type="number" 
                                                min="0"
                                                step="1"
                                                class="input-horas"
                                                @click.stop
                                                @change.stop
                                            >
                                            <span class="horas-unit">hrs</span>
                                            <button class="btn-horas-plus" @click.stop="incrementarHoras(mano)">+</button>
                                        </div>
                                    </div>
                                    <div class="detail-row total">
                                        <span class="detail-label">Subtotal:</span>
                                        <strong class="detail-value">${{ formatCurrency(mano.costo_hora * (mano.horas || 0)) }}</strong>
                                    </div>
                                </div>
                            </div>
                            <div v-if="componenteActual.mano_de_obra_id == mano.id" class="item-checkmark">✓</div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalSeleccionarManoDeObra = false">Cancelar</button>
                    <button class="btn-primary" @click="confirmarManoDeObra" :disabled="!componenteActual.mano_de_obra_id">Confirmar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { crearModulo, getModuloById, fetchAcabados, fetchManosDeObra, fetchModulos } from '@/http/modulos-api';
import { crearAcabado } from '@/http/acabado-api .js';
import { crearCliente as crearManoDeObra } from '@/http/mano_de_obra-api .js';
import { useHorasPorManoDeObraComponente } from '@/stores/horas-por-mano-de-obra-componente';

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
const mostrarModalSeleccionarAcabado = ref(false);
const mostrarModalSeleccionarManoDeObra = ref(false);
const componenteActual = ref({
    id: null,
    nombre: '',
    codigo: '',
    cantidad: 1,
    acabado_id: '',
    mano_de_obra_id: ''
});
const indiceComponenteActual = ref(-1);

// Estado de UI
const error = ref(null);
const exito = ref(null);
const mensaje = ref(null);
const tipoMensaje = ref(null);
const cargando = ref(false);
const cargandoCatalogos = ref(true);
const erroresValidacion = ref({
    nombre: null,
    codigo: null
});

// Función para mostrar mensajes
const mostrarMensaje = (texto, tipo = 'info', duracion = 3000) => {
    mensaje.value = texto;
    tipoMensaje.value = tipo;
    if (duracion > 0) {
        setTimeout(() => {
            mensaje.value = null;
            tipoMensaje.value = null;
        }, duracion);
    }
};

const cerrarMensaje = () => {
    mensaje.value = null;
    tipoMensaje.value = null;
};

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
        if (!componente.acabado_id || componente.acabado_id === '' || componente.acabado_id === 0) {
            error.value = 'Todos los componentes deben tener un acabado';
            return false;
        }
        if (!componente.mano_de_obra_id || componente.mano_de_obra_id === '' || componente.mano_de_obra_id === 0) {
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

// Abrir modal para editar componente existente
const abrirModalEdicionComponente = (componente, idx) => {
    componenteActual.value = {...componente};
    indiceComponenteActual.value = idx;
    mostrarModal.value = true;
};

// Métodos de cálculo
const calcularCostoTotal = () => {
    return formData.value.componentes.reduce((total, comp) => {
        const acabado = acabados.value.find(a => a.id === Number(comp.acabado_id));
        const mano = manosDeObra.value.find(m => m.id === Number(comp.mano_de_obra_id));
        const costoAcabado = parseFloat(acabado?.costo || 0);
        const costoMano = parseFloat(mano?.costo_total || 0);
        const costUnit = costoAcabado + costoMano;
        return total + (costUnit * (comp.cantidad || 0));
    }, 0);
};

const obtenerNombreAcabado = (acabadoId) => {
    const acabado = acabados.value.find(a => a.id === Number(acabadoId));
    return acabado?.nombre || 'Sin seleccionar';
};

const obtenerNombreManodeObra = (manoId) => {
    const mano = manosDeObra.value.find(m => m.id === Number(manoId));
    return mano?.nombre || 'Sin seleccionar';
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
                id: Number(comp.id),
                cantidad: comp.cantidad,
                acabado_id: Number(comp.acabado_id),
                mano_de_obra_id: Number(comp.mano_de_obra_id)
            }))
        };

        console.log('=== GUARDANDO MÓDULO ===');
        console.log('Formulario completo:', formData.value);
        console.log('Componentes en formulario:', formData.value.componentes);
        console.log('Datos a enviar al backend:', datosModulo);
        console.log('Número de componentes:', datosModulo.componentes.length);
        
        const response = await crearModulo(datosModulo);
        console.log('Respuesta del create:', response);
        
        // Extraer el ID del módulo creado
        let moduloGuardado = response;
        if (response.data) {
            moduloGuardado = response.data;
        } else if (response.modulo) {
            moduloGuardado = response.modulo;
        }
        
        const moduloId = moduloGuardado.id;
        
        // El backend no retorna componentes en el create, así que hacemos una query adicional
        const moduloCompleto = await getModuloById(moduloId);
        moduloGuardado = moduloCompleto.data || moduloCompleto;
        
        console.log('Respuesta completa del servidor (con componentes):', moduloCompleto);
        console.log('Módulo guardado:', moduloGuardado);
        console.log('Componentes en respuesta:', moduloGuardado.componentes);
        
        // Guardar horas en la API para cada componente
        if (moduloGuardado.componentes && moduloGuardado.componentes.length > 0) {
            const storeHoras = useHorasPorManoDeObraComponente();
            
            for (let componente of moduloGuardado.componentes) {
                try {
                    await storeHoras.actualizarHorasPorManoDeObraComponenteAction(
                        componente.id,
                        componente.mano_de_obra_id,
                        { horas: 1 }
                    );
                    console.log(`✅ Horas guardadas para componente ${componente.id}`);
                } catch (err) {
                    console.warn(`⚠️ No se pudo guardar horas para componente ${componente.id}:`, err);
                }
            }
        } else {
            console.warn('⚠️ No hay componentes en la respuesta del servidor');
        }

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
const abrirModalConfiguracion = async (componente) => {
    try {
        cargando.value = true;
        
        // Buscar o crear el acabado estándar de roble
        let acabadoEstandar = acabados.value.find(a => a.nombre && a.nombre.toLowerCase().includes('estándar') && a.nombre.toLowerCase().includes('roble'));
        
        if (!acabadoEstandar) {
            // Si no existe, intentar crearlo
            try {
                const nuevoAcabado = await crearAcabado({
                    nombre: 'Estándar de Roble',
                    codigo: 'EST_ROBLE',
                    descripcion: 'Acabado estándar de roble',
                    costo: 0
                });
                
                // Agregar a la lista de acabados
                const acabadoCreado = nuevoAcabado.data || nuevoAcabado;
                acabados.value.push(acabadoCreado);
                acabadoEstandar = acabadoCreado;
            } catch (err) {
                console.warn('⚠️ No se pudo crear acabado estándar:', err);
            }
        }
        
        // Buscar o crear la mano de obra estándar
        let manoDeObraEstandar = manosDeObra.value.find(m => m.nombre && m.nombre.toLowerCase().includes('estándar'));
        
        if (!manoDeObraEstandar) {
            // Si no existe, intentar crearla
            try {
                const nuevaMano = await crearManoDeObra({
                    nombre: 'Mano de Obra Estándar',
                    codigo: 'MO_EST',
                    descripcion: 'Mano de obra estándar',
                    costo_hora: 0
                });
                
                // Agregar a la lista de manos de obra
                const manoCreada = nuevaMano.data || nuevaMano;
                manosDeObra.value.push(manoCreada);
                manoDeObraEstandar = manoCreada;
            } catch (err) {
                console.warn('⚠️ No se pudo crear mano de obra estándar:', err);
            }
        }
        
        // Crear el componente con valores por defecto
        const nuevoComponente = {
            id: componente.id,
            nombre: componente.nombre,
            codigo: componente.codigo,
            descripcion: componente.descripcion,
            cantidad: 1,
            acabado_id: acabadoEstandar?.id ? Number(acabadoEstandar.id) : null,
            mano_de_obra_id: manoDeObraEstandar?.id ? Number(manoDeObraEstandar.id) : null
        };
        
        // Validar que tenga valores por defecto
        if (!nuevoComponente.acabado_id || !nuevoComponente.mano_de_obra_id) {
            mostrarMensaje('⚠️ No se pudieron crear los valores por defecto', 'error', 2000);
            console.error('Faltan valores por defecto:', { acabadoEstandar, manoDeObraEstandar });
            return;
        }
        
        // Agregar a formData inmediatamente
        formData.value.componentes.push({...nuevoComponente});
        
        // Asignar al componenteActual para poder editar en el modal
        componenteActual.value = nuevoComponente;
        indiceComponenteActual.value = formData.value.componentes.length - 1;
        
        mostrarModal.value = true;
        mostrarModalComponentes.value = false;
        mostrarMensaje('✅ Componente agregado', 'success', 1500);
    } catch (err) {
        console.error('❌ Error al abrir configuración:', err);
        mostrarMensaje('Error al agregar componente', 'error', 2000);
        // Revertir si falla
        formData.value.componentes.pop();
    } finally {
        cargando.value = false;
    }
};

// Guardar componente del modal (actualizar si ya está agregado)
const guardarComponente = () => {
    if (!componenteActual.value.acabado_id || !componenteActual.value.mano_de_obra_id) {
        error.value = 'Debe seleccionar acabado y mano de obra';
        return;
    }
    
    // Actualizar el componente en formData (ya fue agregado en abrirModalConfiguracion)
    if (indiceComponenteActual.value !== -1) {
        formData.value.componentes[indiceComponenteActual.value] = {...componenteActual.value};
    }
    
    cerrarModal();
};

// Cerrar modal
const cerrarModal = () => {
    mostrarModal.value = false;
    componenteSeleccionado.value = '';
    indiceComponenteActual.value = -1;
    componenteActual.value = {
        id: null,
        nombre: '',
        codigo: '',
        cantidad: 1,
        acabado_id: '',
        mano_de_obra_id: ''
    };
};

// Seleccionar acabado
const seleccionarAcabado = (acabado) => {
    // Actualizar el componente actual
    componenteActual.value.acabado_id = acabado.id;
    
    // Actualizar en formData
    if (indiceComponenteActual.value !== -1) {
        formData.value.componentes[indiceComponenteActual.value].acabado_id = acabado.id;
    }
    
    mostrarMensaje('✅ Acabado actualizado', 'success', 1000);
    mostrarModalSeleccionarAcabado.value = false;
};

// Seleccionar mano de obra
const seleccionarManoDeObra = async (mano) => {
    try {
        cargando.value = true;
        
        // Seleccionar la nueva mano de obra e inicializar en 1 hora
        mano.horas = 1;
        componenteActual.value.mano_de_obra_id = mano.id;
        componenteActual.value.mano_de_obra_horas = 1;
        
        // Actualizar en formData
        if (indiceComponenteActual.value !== -1) {
            formData.value.componentes[indiceComponenteActual.value].mano_de_obra_id = mano.id;
        }
        
        // Guardar la nueva mano de obra con 1 hora (solo si el módulo ya existe)
        // En nuevo módulo, esto se guardará cuando se cree el módulo
        const storeHoras = useHorasPorManoDeObraComponente();
        if (componenteActual.value.id) {
            await storeHoras.actualizarHorasPorManoDeObraComponenteAction(
                componenteActual.value.id,
                mano.id,
                { horas: 1 }
            );
        }
        
        mostrarMensaje('✅ Mano de obra actualizada', 'success', 1000);
        mostrarModalSeleccionarManoDeObra.value = false;
    } catch (err) {
        console.error('❌ Error al guardar mano de obra:', err);
        mostrarMensaje('Error al guardar mano de obra', 'error', 2000);
    } finally {
        cargando.value = false;
    }
};

// Abrir modal de mano de obra con horas inicializadas en 1
const abrirModalManoDeObra = () => {
    // Inicializar horas en 1 para todas las manos de obra
    manosDeObra.value.forEach(mano => {
        if (!mano.horas) {
            mano.horas = 1;
        }
    });
    mostrarModalSeleccionarManoDeObra.value = true;
};

// Incrementar horas de mano de obra
const incrementarHoras = async (mano) => {
    if (!mano) return;
    
    mano.horas = (mano.horas || 0) + 1;
    await guardarHorasEnAPI(mano);
};

// Decrementar horas de mano de obra
const decrementarHoras = async (mano) => {
    if (!mano || (mano.horas || 0) <= 1) return;  // No bajar de 1 hora
    
    mano.horas = (mano.horas || 0) - 1;
    await guardarHorasEnAPI(mano);
};

// Guardar horas en la API
const guardarHorasEnAPI = async (mano) => {
    if (!mano || !componenteActual.value.id) return;
    
    try {
        const storeHoras = useHorasPorManoDeObraComponente();
        
        // Actualizar horas en el store con el ID del componente
        await storeHoras.actualizarHorasPorManoDeObraComponenteAction(
            componenteActual.value.id, 
            mano.id, 
            { horas: mano.horas || 0 }
        );
        
        mostrarMensaje('✅ Horas actualizadas', 'success', 1500);
    } catch (err) {
        console.error('Error guardando horas:', err);
        // No mostrar error si es porque el registro no existe (es normal en nuevos módulos)
        if (err.response?.status !== 404) {
            mostrarMensaje('⚠️ Horas actualizadas localmente', 'warning', 1500);
        }
    }
};

// Guardar cambios de cantidad (solo actualiza el estado local, se guarda con Guardar Módulo)
const guardarCambiosComponente = async () => {
    if (!componenteActual.value) return;
    
    try {
        cargando.value = true;
        
        // Pequeño delay para asegurar que el v-model actualiza
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Actualizar el componente en formData para reflejar los cambios
        const indiceComponente = formData.value.componentes.findIndex(c => c.id === componenteActual.value.id);
        if (indiceComponente !== -1) {
            formData.value.componentes[indiceComponente].cantidad = componenteActual.value.cantidad;
        }
        
        // Si el módulo ya existe (tiene ID), guardar en la API
        // En nuevo módulo, solo se guarda cuando se crea el módulo
        mostrarMensaje('✅ Cantidad actualizada', 'success', 1000);
    } catch (err) {
        console.error('Error al guardar cambios:', err);
        mostrarMensaje('Error al guardar cambios', 'error', 2000);
    } finally {
        cargando.value = false;
    }
};

// Incrementar cantidad de componente
const incrementarCantidad = async () => {
    if (!componenteActual.value) return;
    componenteActual.value.cantidad = (componenteActual.value.cantidad || 0) + 1;
    await guardarCambiosComponente();
};

// Decrementar cantidad de componente
const decrementarCantidad = async () => {
    if (!componenteActual.value || (componenteActual.value.cantidad || 0) <= 1) return;  // No bajar de 1
    componenteActual.value.cantidad = (componenteActual.value.cantidad || 0) - 1;
    await guardarCambiosComponente();
};

// Guardar cantidad cuando se cambia en el input (enter o blur)
const guardarCantidad = async () => {
    if (!componenteActual.value || componenteActual.value.cantidad < 1) {
        componenteActual.value.cantidad = 1;
    }
    await guardarCambiosComponente();
};

// Confirmar selección de mano de obra y guardar horas
const confirmarManoDeObra = async () => {
    const manoSeleccionada = manosDeObra.value.find(m => m.id === componenteActual.value.mano_de_obra_id);
    if (!manoSeleccionada) return;
    
    componenteActual.value.mano_de_obra_horas = manoSeleccionada.horas || 0;
    mostrarModalSeleccionarManoDeObra.value = false;
    
    // Guardar horas en la API
    try {
        const storeHoras = useHorasPorManoDeObraComponente();
        await storeHoras.actualizarHorasPorManoDeObraComponenteAction(
            componenteActual.value.id,
            manoSeleccionada.id,
            { horas: manoSeleccionada.horas || 1 }
        );
        console.log('✅ Mano de obra guardada en API');
    } catch (err) {
        console.warn('⚠️ No se pudo guardar mano de obra en API:', err);
    }
    
    mostrarMensaje('✅ Mano de obra confirmada', 'success', 1500);
};

// Lifecycle
onMounted(() => {
    cargarCatalogos();
});
</script>

<style scoped>
.nuevo-modulo-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
}

.btn-back {
    background: none;
    border: none;
    color: #d4a574;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
}

.btn-back:hover {
    opacity: 0.7;
}

.page-title {
    font-size: 2rem;
    margin: 1rem 0 2rem 0;
    color: #333;
}

.form {
    background: white;
    border: 1px solid #e0d0c0;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
}

.form-section {
    margin-bottom: 2rem;
}

.form-section h2 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    color: #333;
    border-bottom: 2px solid #d4a574;
    padding-bottom: 0.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #333;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d4c4b8;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.1);
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 3rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #d4a574;
}

.form-actions + .form-section {
    margin-top: 2rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-primary {
    background: #d4a574;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #c49464;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f0f0f0;
    color: #333;
    border: 1px solid #d0d0d0;
}

.btn-secondary:hover {
    background: #e8e8e8;
}

.btn-danger {
    background: #ff6b6b;
    color: white;
    padding: 0.5rem 1rem;
}

.btn-danger:hover {
    background: #ff5252;
}

.empty-message {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-style: italic;
}

.componentes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.componente-item {
    border: 1px solid #d4c4b8;
    border-radius: 6px;
    padding: 1rem;
    background: #fafaf8;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.componente-body {
    flex: 1;
}

.componente-body h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
}

.componente-codigo {
    margin: 0;
    font-size: 0.85rem;
    color: #999;
}

/* Modales */
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
    border-radius: 8px;
    max-width: 600px;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e0d0c0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #333;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close:hover {
    color: #d4a574;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e0d0c0;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.modal-item {
    margin-bottom: 1.5rem;
}

.modal-label {
    display: block;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #d4a574;
}

.modal-value {
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 4px;
    color: #666;
}

.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d4c4b8;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
}

.form-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.1);
}

.btn-select-modal {
    width: 100%;
    padding: 0.75rem;
    text-align: left;
    background: white;
    border: 1px solid #d4c4b8;
    border-radius: 4px;
    cursor: pointer;
    color: #333;
    font-size: 1rem;
    transition: all 0.2s;
}

.btn-select-modal:hover {
    border-color: #d4a574;
}

/* Modal para componentes */
.modal-componentes {
    max-width: 500px;
}

.modal-componentes-body {
    max-height: 400px;
    overflow-y: auto;
}

.componentes-lista {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.componente-item-modal {
    padding: 1rem;
    border: 1px solid #d4c4b8;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.componente-item {
    background: #fafaf8;
}

.componente-item:hover:not(.componente-item-disabled) {
    background: #f0e8e0;
    border-color: #d4a574;
}

.componente-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f0f0f0;
}

.componente-info-modal h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
}

.componente-info-modal p {
    margin: 0;
    font-size: 0.85rem;
    color: #999;
}

.componente-item-badge,
.componente-item-icon {
    color: #d4a574;
    font-weight: bold;
}

/* Modal selección */
.modal-seleccion {
    max-width: 500px;
}

.modal-seleccion-body {
    max-height: 400px;
    overflow-y: auto;
}

.items-lista {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.item-seleccion {
    padding: 1rem;
    border: 2px solid #d4c4b8;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.item-seleccion:hover {
    border-color: #d4a574;
    background: #f5f5f5;
}

.item-seleccionado {
    border-color: #d4a574;
    background: #fffbf6;
}

.item-info h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
}

.item-codigo {
    margin: 0;
    font-size: 0.85rem;
    color: #999;
}

.item-descripcion {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: #666;
}

.item-precio {
    margin: 0.5rem 0 0 0;
    font-size: 0.95rem;
    color: #d4a574;
}

.item-checkmark {
    color: #d4a574;
    font-size: 1.5rem;
    font-weight: bold;
}

/* Horas editor */
.item-details {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e0d0c0;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.detail-row.total {
    font-weight: 600;
    color: #d4a574;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e0d0c0;
}

.detail-label {
    color: #666;
}

.detail-value {
    color: #333;
}

.horas-editor {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.input-horas {
    width: 60px;
    padding: 0.5rem;
    text-align: center;
    border: 2px solid #d4a574;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
}

.horas-unit {
    font-size: 0.85rem;
    color: #999;
}

.btn-horas-moins,
.btn-horas-plus {
    width: 28px;
    height: 28px;
    border: 1px solid #d4a574;
    background: white;
    color: #d4a574;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-horas-moins:hover,
.btn-horas-plus:hover {
    background: #d4a574;
    color: white;
}

/* Estado de carga */
.loading-state {
    text-align: center;
    padding: 2rem;
    color: #999;
}

/* Mensajes de error */
.error-message {
    background: #ffe0e0;
    border: 1px solid #ff9999;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-message span {
    color: #c00;
}

.error-close {
    background: none;
    border: none;
    color: #c00;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
}

.error-close:hover {
    opacity: 0.7;
}

.error-text {
    color: #c00;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    display: block;
}

/* Transiciones */
.slide-down-enter-active {
    transition: all 0.3s ease;
}

.slide-down-leave-active {
    transition: all 0.2s ease;
}

.slide-down-enter-from {
    transform: translateY(-10px);
    opacity: 0;
}

.slide-down-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

.custom-message {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.message-warning {
    background: #fff9e6;
    border: 1px solid #ffe58f;
    color: #cc8d00;
}

.message-success {
    background: #e6ffe6;
    border: 1px solid #b3ffb3;
    color: #00aa00;
}

.message-info {
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    color: #0050b3;
}

.message-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.message-close:hover {
    opacity: 0.7;
}

.btn-small {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
}
</style>
