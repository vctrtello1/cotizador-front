<template>
    <div class="editar-componente-container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
            <router-link to="/componentes" class="breadcrumb-link">Componentes</router-link>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">{{ formData.nombre || 'Editar' }}</span>
        </nav>

        <!-- Header -->
        <div class="page-header">
            <div class="header-left">
                <button class="btn-back" @click="$router.push('/componentes')" title="Volver a componentes">
                    <span class="back-arrow">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </span>
                </button>
                <div class="header-text">
                    <h1 class="page-title">Editar Componente</h1>
                    <p class="header-subtitle">{{ formData.nombre || 'Cargando...' }}</p>
                </div>
            </div>
            <div class="header-right">
                <span class="badge badge-code">{{ formData.codigo || '---' }}</span>
                <span v-if="guardando" class="badge badge-saving">
                    <span class="saving-dot"></span> Guardando...
                </span>
                <span v-else class="badge badge-status">✓ Listo</span>
            </div>
        </div>

        <!-- Mensaje de error -->
        <transition name="fade">
            <div v-if="error" class="alert alert-error">
                <span class="alert-icon">⚠️</span>
                <span class="alert-text">{{ error }}</span>
                <button @click="error = null" class="alert-close">×</button>
            </div>
        </transition>

        <!-- Mensaje personalizado (warning/success/info) -->
        <transition name="slide-down">
            <div v-if="mensaje" class="custom-message" :class="`message-${tipoMensaje}`">
                <div class="message-content">
                    <span class="message-text">{{ mensaje }}</span>
                    <button @click="cerrarMensaje" class="message-close">✕</button>
                </div>
            </div>
        </transition>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <div class="loading-card">
                <div class="spinner"></div>
                <p class="loading-text">Cargando componente...</p>
                <p class="loading-subtext">Obteniendo datos del servidor</p>
            </div>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarComponente">
            <!-- Resumen superior -->
            <div class="stats-bar">
                <div v-for="e in entidades" :key="`stat-${e.key}`" class="stat-card">
                    <div class="stat-icon">{{ e.icon }}</div>
                    <div class="stat-content">
                        <span class="stat-label">{{ e.labelCorto }}</span>
                        <strong class="stat-value">{{ e.items.length }} <small>tipos</small></strong>
                        <span class="stat-detail">{{ e.totalCantidad }} unidades</span>
                    </div>
                    <span v-if="!esViewer" class="stat-amount">${{ formatCurrency(e.totalCosto) }}</span>
                </div>
                <div class="stat-card stat-card--highlight" v-if="!esViewer">
                    <div class="stat-icon stat-icon--total">💰</div>
                    <div class="stat-content">
                        <span class="stat-label">Costo total</span>
                        <strong class="stat-value stat-value--total">${{ formatCurrency(costoTotalGeneral) }}</strong>
                    </div>
                </div>
            </div>

            <!-- Datos Generales -->
            <div class="info-card">
                <h2 class="section-title">
                    <span class="section-icon">📌</span>
                    Datos Generales
                </h2>
                <div class="info-grid">
                    <div class="form-group">
                        <label for="nombre" class="form-label">Nombre <span class="required">*</span></label>
                        <input
                            v-model="formData.nombre"
                            type="text"
                            id="nombre"
                            class="form-input"
                            placeholder="Ej: Tablero MDF"
                            required
                        />
                        <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
                    </div>

                    <div class="form-group">
                        <label for="codigo" class="form-label">Código</label>
                        <input
                            v-model="formData.codigo"
                            type="text"
                            id="codigo"
                            class="form-input"
                            placeholder="Ej: TAB_MDF_001"
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Precio Unitario</label>
                        <div class="input-with-prefix input-readonly">
                            <span class="input-prefix">$</span>
                            <span class="form-input form-input--prefixed readonly-value">{{ formatCurrency(formData.precio_unitario) }}</span>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="descripcion" class="form-label">Descripción</label>
                        <textarea
                            v-model="formData.descripcion"
                            id="descripcion"
                            class="form-input textarea-input"
                            placeholder="Descripción detallada del componente"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
            </div>

            <!-- Secciones de entidades -->
            <div v-for="e in entidades" :key="e.key" class="info-card">
                <EntitySection
                    :icon="e.icon"
                    :titulo="e.titulo"
                    :key-prefix="e.keyPrefix"
                    :items="e.items"
                    :items-ordenados="e.itemsOrdenados"
                    :total-cantidad="e.totalCantidad"
                    :total-costo="e.totalCosto"
                    :empty-title="e.emptyTitle"
                    :empty-desc="e.emptyDesc"
                    :add-label="e.addLabel"
                    :format-currency="formatCurrency"
                    :obtener-nombre="e.obtenerNombre"
                    :obtener-codigo="e.obtenerCodigo"
                    :obtener-costo-unitario="e.obtenerCostoUnitario"
                    :obtener-subtotal="e.obtenerSubtotal"
                    :ocultar-precios="esViewer"
                    @abrir-selector="e.abrirSelector"
                    @incrementar="e.incrementar"
                    @decrementar="e.decrementar"
                    @guardar-cantidad="e.guardarCantidad"
                    @remover="e.remover"
                />
            </div>

            <!-- Acciones -->
            <div class="form-actions form-actions--sticky">
                <button type="button" class="btn-secondary" @click="$router.back()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    Cancelar
                </button>
                <button type="submit" class="btn-primary" :disabled="guardando">
                    <span v-if="guardando" class="btn-loading">
                        <span class="spinner-sm"></span> Guardando...
                    </span>
                    <span v-else>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Guardar Cambios
                    </span>
                </button>
            </div>
        </form>

        <!-- Selectores de entidades -->
        <EntitySelectorModal
            v-for="e in entidades"
            :key="`modal-${e.key}`"
            :visible="e.selectorVisible"
            :icon="e.icon"
            :titulo="e.tituloModal"
            :label-singular="e.labelSingular"
            :busqueda="e.busqueda"
            :items-filtrados="e.itemsFiltrados"
            :format-currency="formatCurrency"
            :obtener-precio="obtenerPrecio"
            :ocultar-precios="esViewer"
            @close="e.cerrarSelector"
            @seleccionar="e.agregar"
            @update:busqueda="e.actualizarBusqueda($event)"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/http/apl';
import { getComponenteById } from '@/http/componentes-api';
import { useEstructurasPorComponenteStore } from '@/stores/estructuras-por-componente';
import { useEstructuraStore } from '@/stores/estructura';
import { useAcabadoCubreCantosPorComponenteStore } from '@/stores/acabado-cubre-cantos-por-componente';
import { useAcabadoCubreCantosStore } from '@/stores/acabado-cubre-cantos';
import { useAcabadoTableroPorComponenteStore } from '@/stores/acabado-tablero-por-componente';
import { useAcabadoTableroStore } from '@/stores/acabado-tablero';
import { usePuertasPorComponenteStore } from '@/stores/puertas-por-componente';
import { usePuertasStore } from '@/stores/puertas';
import { useAccesoriosPorComponenteStore } from '@/stores/accesorios-por-componente';
import { useAccesoriosStore } from '@/stores/accesorios';
import { useEntidadPorComponente } from '@/composables/useEntidadPorComponente';
import EntitySelectorModal from '@/components/EntitySelectorModal.vue';
import EntitySection from '@/components/EntitySection.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const esViewer = computed(() => {
    const role = authStore.user?.role || authStore.user?.rol || 'viewer';
    return role === 'viewer' || role === 'visualizador';
});
const componenteId = computed(() => Number.parseInt(route.params.id, 10) || 0);
const storeEstructurasPorComponente = useEstructurasPorComponenteStore();
const storeEstructuras = useEstructuraStore();
const storeAcabadoCubreCantosPorComponente = useAcabadoCubreCantosPorComponenteStore();
const storeAcabadoCubreCantos = useAcabadoCubreCantosStore();
const storeAcabadoTableroPorComponente = useAcabadoTableroPorComponenteStore();
const storeAcabadoTableros = useAcabadoTableroStore();
const storePuertasPorComponente = usePuertasPorComponenteStore();
const storePuertas = usePuertasStore();
const storeAccesoriosPorComponente = useAccesoriosPorComponenteStore();
const storeAccesorios = useAccesoriosStore();

// Estado
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    precio_unitario: '',
});

const errors = ref({});
const error = ref(null);
const mensaje = ref(null);
const tipoMensaje = ref(null); // 'success', 'error', 'warning'
const guardando = ref(false);
const cargando = ref(true);



// Función para mostrar mensajes amigables
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


const createDebouncedRef = (sourceRef, delay = 180) => {
    const debounced = ref(sourceRef.value);
    let timeoutId;
    const stopWatching = watch(sourceRef, (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { debounced.value = value; }, delay);
    });
    onBeforeUnmount(() => { clearTimeout(timeoutId); stopWatching(); });
    return debounced;
};


// ===== Catálogos disponibles para entidades =====
const estructurasDisponibles = ref([]);
const cubreCantosDisponibles = ref([]);
const acabadoTablerosDisponibles = ref([]);
const puertasDisponibles = ref([]);
const accesoriosDisponibles = ref([]);
const estructurasDisponiblesMap = computed(() => new Map((estructurasDisponibles.value || []).map(e => [e.id, e])));
const cubreCantosDisponiblesMap = computed(() => new Map((cubreCantosDisponibles.value || []).map(c => [c.id, c])));
const acabadoTablerosDisponiblesMap = computed(() => new Map((acabadoTablerosDisponibles.value || []).map(t => [t.id, t])));
const puertasDisponiblesMap = computed(() => new Map((puertasDisponibles.value || []).map(p => [p.id, p])));
const accesoriosDisponiblesMap = computed(() => new Map((accesoriosDisponibles.value || []).map(a => [a.id, a])));

// ===== Composables de entidades por componente =====
const {
    items: estructurasDelComponente,
    mostrarSelector: mostrarSelectorEstructuras,
    busqueda: busquedaEstructura,
    obtenerId: obtenerIdEstructuraRelacion,
    obtenerNombre: obtenerNombreEstructura,
    obtenerCodigo: obtenerCodigoEstructura,
    obtenerCostoUnitario: obtenerCostoUnitarioEstructura,
    obtenerSubtotal: obtenerSubtotalEstructura,
    itemsOrdenados: estructurasOrdenadasParaVista,
    totalCantidad: totalCantidadEstructuras,
    totalCosto: totalCostoEstructuras,
    cargar: cargarEstructurasPorComponente,
    agregar: agregarEstructura,
    guardarCantidad: guardarCantidadEstructura,
    incrementarCantidad: incrementarCantidadEstructura,
    decrementarCantidad: decrementarCantidadEstructura,
    remover: removerEstructura,
} = useEntidadPorComponente({
    label: 'Estructura',
    primaryIdField: 'estructura_id',
    alternateIdField: null,
    nestedKeys: ['estructura'],
    idAccessors: ['estructura_id', 'estructura.id', 'estructuraId'],
    costFields: ['costo_unitario', 'costo', 'precio'],
    disponiblesMap: estructurasDisponiblesMap,
    store: storeEstructurasPorComponente,
    storeCrear: 'crearEstructuraPorComponente',
    storeActualizar: 'actualizarEstructuraPorComponente',
    storeEliminar: 'eliminarEstructuraPorComponente',
    storeFetch: 'fetchEstructurasPorComponente',
    componenteId,
    mostrarMensaje,
});

const {
    items: acabadoCubreCantosDelComponente,
    mostrarSelector: mostrarSelectorCubreCantos,
    busqueda: busquedaCubreCanto,
    obtenerId: obtenerIdCubreCantoRelacion,
    obtenerNombre: obtenerNombreCubreCanto,
    obtenerCodigo: obtenerCodigoCubreCanto,
    obtenerCostoUnitario: obtenerCostoUnitarioCubreCanto,
    obtenerSubtotal: obtenerSubtotalCubreCanto,
    itemsOrdenados: cubreCantosOrdenadosParaVista,
    totalCantidad: totalCantidadCubreCantos,
    totalCosto: totalCostoCubreCantos,
    cargar: cargarCubreCantosPorComponente,
    agregar: agregarCubreCanto,
    guardarCantidad: guardarCantidadCubreCanto,
    incrementarCantidad: incrementarCantidadCubreCanto,
    decrementarCantidad: decrementarCantidadCubreCanto,
    remover: removerCubreCanto,
} = useEntidadPorComponente({
    label: 'Cubre Canto',
    primaryIdField: 'acabado_cubre_canto_id',
    alternateIdField: 'acabado_cubre_cantos_id',
    nestedKeys: ['acabado_cubre_canto', 'acabadoCubreCanto'],
    idAccessors: ['acabado_cubre_canto_id', 'acabado_cubre_cantos_id', 'acabadoCubreCanto.id', 'acabado_cubre_canto.id'],
    costFields: ['costo_unitario', 'costo', 'precio'],
    disponiblesMap: cubreCantosDisponiblesMap,
    store: storeAcabadoCubreCantosPorComponente,
    storeCrear: 'crearAcabadoCubreCantoPorComponente',
    storeActualizar: 'actualizarAcabadoCubreCantoPorComponente',
    storeEliminar: 'eliminarAcabadoCubreCantoPorComponente',
    storeFetch: 'fetchAcabadoCubreCantosPorComponente',
    componenteId,
    mostrarMensaje,
});

const {
    items: acabadoTablerosDelComponente,
    mostrarSelector: mostrarSelectorAcabadoTableros,
    busqueda: busquedaAcabadoTablero,
    obtenerId: obtenerIdAcabadoTableroRelacion,
    obtenerNombre: obtenerNombreAcabadoTablero,
    obtenerCodigo: obtenerCodigoAcabadoTablero,
    obtenerCostoUnitario: obtenerCostoUnitarioAcabadoTablero,
    obtenerSubtotal: obtenerSubtotalAcabadoTablero,
    itemsOrdenados: acabadoTablerosOrdenadosParaVista,
    totalCantidad: totalCantidadAcabadoTableros,
    totalCosto: totalCostoAcabadoTableros,
    cargar: cargarAcabadoTablerosPorComponente,
    agregar: agregarAcabadoTablero,
    guardarCantidad: guardarCantidadAcabadoTablero,
    incrementarCantidad: incrementarCantidadAcabadoTablero,
    decrementarCantidad: decrementarCantidadAcabadoTablero,
    remover: removerAcabadoTablero,
} = useEntidadPorComponente({
    label: 'Acabado Tablero',
    primaryIdField: 'acabado_tablero_id',
    alternateIdField: null,
    nestedKeys: ['acabado_tablero', 'acabadoTablero'],
    idAccessors: ['acabado_tablero_id', 'acabadoTablero.id', 'acabado_tablero.id'],
    costFields: ['costo_unitario', 'costo', 'precio'],
    disponiblesMap: acabadoTablerosDisponiblesMap,
    store: storeAcabadoTableroPorComponente,
    storeCrear: 'crearAcabadoTableroPorComponente',
    storeActualizar: 'actualizarAcabadoTableroPorComponente',
    storeEliminar: 'eliminarAcabadoTableroPorComponente',
    storeFetch: 'fetchAcabadoTablerosPorComponente',
    componenteId,
    mostrarMensaje,
});

const {
    items: puertasDelComponente,
    mostrarSelector: mostrarSelectorPuertas,
    busqueda: busquedaPuerta,
    obtenerId: obtenerIdPuertaRelacion,
    obtenerNombre: obtenerNombrePuerta,
    obtenerCodigo: obtenerCodigoPuerta,
    obtenerCostoUnitario: obtenerCostoUnitarioPuerta,
    obtenerSubtotal: obtenerSubtotalPuerta,
    itemsOrdenados: puertasOrdenadasParaVista,
    totalCantidad: totalCantidadPuertas,
    totalCosto: totalCostoPuertas,
    cargar: cargarPuertasPorComponente,
    agregar: agregarPuerta,
    guardarCantidad: guardarCantidadPuerta,
    incrementarCantidad: incrementarCantidadPuerta,
    decrementarCantidad: decrementarCantidadPuerta,
    remover: removerPuerta,
} = useEntidadPorComponente({
    label: 'Puerta',
    primaryIdField: 'puerta_id',
    alternateIdField: null,
    nestedKeys: ['puerta'],
    idAccessors: ['puerta_id', 'puerta.id', 'puertaId'],
    costFields: ['precio_final', 'costo_unitario', 'costo', 'precio'],
    disponiblesMap: puertasDisponiblesMap,
    store: storePuertasPorComponente,
    storeCrear: 'crearPuertaPorComponente',
    storeActualizar: 'actualizarPuertaPorComponente',
    storeEliminar: 'eliminarPuertaPorComponente',
    storeFetch: 'fetchPuertasPorComponente',
    componenteId,
    mostrarMensaje,
});

const {
    items: accesoriosDelComponente,
    mostrarSelector: mostrarSelectorAccesorios,
    busqueda: busquedaAccesorio,
    obtenerId: obtenerIdAccesorioRelacion,
    obtenerNombre: obtenerNombreAccesorio,
    obtenerCodigo: obtenerCodigoAccesorio,
    obtenerCostoUnitario: obtenerCostoUnitarioAccesorio,
    obtenerSubtotal: obtenerSubtotalAccesorio,
    itemsOrdenados: accesoriosOrdenadosParaVista,
    totalCantidad: totalCantidadAccesorios,
    totalCosto: totalCostoAccesorios,
    cargar: cargarAccesoriosPorComponente,
    agregar: agregarAccesorio,
    guardarCantidad: guardarCantidadAccesorio,
    incrementarCantidad: incrementarCantidadAccesorio,
    decrementarCantidad: decrementarCantidadAccesorio,
    remover: removerAccesorio,
} = useEntidadPorComponente({
    label: 'Accesorio',
    primaryIdField: 'accesorio',
    alternateIdField: 'accesorio_id',
    nestedKeys: ['accesorio'],
    idAccessors: ['accesorio', 'accesorio_id', 'accesorio.id', 'accesorioId'],
    costFields: ['precio', 'costo_unitario', 'costo'],
    payloadValueField: 'nombre',
    disponiblesMap: accesoriosDisponiblesMap,
    store: storeAccesoriosPorComponente,
    storeCrear: 'crearAccesorioPorComponente',
    storeActualizar: 'actualizarAccesorioPorComponente',
    storeEliminar: 'eliminarAccesorioPorComponente',
    storeFetch: 'fetchAccesoriosPorComponente',
    componenteId,
    mostrarMensaje,
});

const busquedaEstructuraDebounced = createDebouncedRef(busquedaEstructura);
const busquedaCubreCantoDebounced = createDebouncedRef(busquedaCubreCanto);
const busquedaAcabadoTableroDebounced = createDebouncedRef(busquedaAcabadoTablero);
const busquedaPuertaDebounced = createDebouncedRef(busquedaPuerta);
const busquedaAccesorioDebounced = createDebouncedRef(busquedaAccesorio);

// Cargar componente (placeholder - actualizar con API real)
const cargarComponente = async () => {
    try {
        cargando.value = true;
        const response = await getComponenteById(componenteId.value || route.params.id);
        const data = response.data || response;
        
        formData.value = {
            nombre: data.nombre || '',
            codigo: data.codigo || '',
            descripcion: data.descripcion || '',
            precio_unitario: data.precio_unitario || data.costo_total || '',
        };
        
        // Cargar catálogos relacionados en paralelo
        await Promise.all([
            cargarEstructurasPorComponente(async () => {
                if (!estructurasDisponibles.value.length) {
                    await storeEstructuras.fetchEstructuras();
                    estructurasDisponibles.value = storeEstructuras.estructuras || [];
                }
            }),
            cargarCubreCantosPorComponente(async () => {
                if (!cubreCantosDisponibles.value.length) {
                    await storeAcabadoCubreCantos.fetchAcabadoCubreCantos();
                    cubreCantosDisponibles.value = storeAcabadoCubreCantos.acabadoCubreCantos || [];
                }
            }),
            cargarAcabadoTablerosPorComponente(async () => {
                if (!acabadoTablerosDisponibles.value.length) {
                    await storeAcabadoTableros.fetchAcabadoTableros();
                    acabadoTablerosDisponibles.value = storeAcabadoTableros.acabadoTableros || [];
                }
            }),
            cargarPuertasPorComponente(async () => {
                if (!puertasDisponibles.value.length) {
                    await storePuertas.fetchPuertas();
                    puertasDisponibles.value = storePuertas.puertas || [];
                }
            }),
            cargarAccesoriosPorComponente(async () => {
                if (!accesoriosDisponibles.value.length) {
                    await storeAccesorios.fetchAccesorios();
                    accesoriosDisponibles.value = storeAccesorios.accesorios || [];
                }
            }),
        ]);
    } catch (err) {
        error.value = 'Error al cargar el componente';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Formatear moneda
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// === Factory helpers para DRY ===
const crearAbrirSelector = (catalogStore, fetchMethod, catalogProp, disponiblesRef, mostrarRef) => async () => {
    await catalogStore[fetchMethod]();
    disponiblesRef.value = catalogStore[catalogProp] || [];
    mostrarRef.value = true;
};

const crearFiltro = (itemsRef, obtenerId, disponiblesRef, busquedaRef) => computed(() => {
    const agregados = itemsRef.value.map(i => obtenerId(i));
    return filtrarCatalogo(disponiblesRef.value, busquedaRef.value, agregados);
});

const abrirSelectorEstructuras = crearAbrirSelector(storeEstructuras, 'fetchEstructuras', 'estructuras', estructurasDisponibles, mostrarSelectorEstructuras);
const abrirSelectorCubreCantos = crearAbrirSelector(storeAcabadoCubreCantos, 'fetchAcabadoCubreCantos', 'acabadoCubreCantos', cubreCantosDisponibles, mostrarSelectorCubreCantos);
const abrirSelectorAcabadoTableros = crearAbrirSelector(storeAcabadoTableros, 'fetchAcabadoTableros', 'acabadoTableros', acabadoTablerosDisponibles, mostrarSelectorAcabadoTableros);
const abrirSelectorPuertas = crearAbrirSelector(storePuertas, 'fetchPuertas', 'puertas', puertasDisponibles, mostrarSelectorPuertas);
const abrirSelectorAccesorios = crearAbrirSelector(storeAccesorios, 'fetchAccesorios', 'accesorios', accesoriosDisponibles, mostrarSelectorAccesorios);

// Helper para filtrar por búsqueda y por items existentes
const filtrarCatalogo = (catalog, busqueda, itemsExistentes) => {
    // itemsExistentes puede ser un array de objetos o un array de IDs
    const existentesIds = new Set(Array.isArray(itemsExistentes) 
        ? itemsExistentes.filter(Boolean).map(item => typeof item === 'object' ? item?.id : item)
        : []);
    
    const filtrados = (catalog || []).filter(item => item && !existentesIds.has(item.id));
    
    if (!busqueda || !busqueda.trim()) return filtrados;
    
    const busquedaLower = busqueda.toLowerCase();
    return filtrados.filter(item => 
        (item.nombre || '').toLowerCase().includes(busquedaLower) ||
        (item.codigo || '').toLowerCase().includes(busquedaLower)
    );
};

// Filtros de catálogo (usando factory)
const estructurasFiltradas = crearFiltro(estructurasDelComponente, obtenerIdEstructuraRelacion, estructurasDisponibles, busquedaEstructuraDebounced);
const cubreCantosFiltrados = crearFiltro(acabadoCubreCantosDelComponente, obtenerIdCubreCantoRelacion, cubreCantosDisponibles, busquedaCubreCantoDebounced);
const acabadoTablerosFiltrados = crearFiltro(acabadoTablerosDelComponente, obtenerIdAcabadoTableroRelacion, acabadoTablerosDisponibles, busquedaAcabadoTableroDebounced);
const puertasFiltradas = crearFiltro(puertasDelComponente, obtenerIdPuertaRelacion, puertasDisponibles, busquedaPuertaDebounced);
const accesoriosFiltrados = crearFiltro(accesoriosDelComponente, obtenerIdAccesorioRelacion, accesoriosDisponibles, busquedaAccesorioDebounced);

// === Configuración data-driven de entidades ===
const obtenerPrecio = (item) => item.precio_final || item.costo_unitario || item.costo || item.precio || 0;

const entidades = computed(() => [
    {
        key: 'estructuras',
        icon: '🏗️',
        titulo: 'Estructuras Asociadas',
        tituloModal: 'Seleccionar Estructuras',
        labelSingular: 'Estructura',
        labelCorto: 'Estructuras',
        emptyTitle: 'Sin estructuras asignadas',
        emptyDesc: 'Asocia estructuras metálicas o de soporte al componente',
        addLabel: 'Agregar Estructura',
        keyPrefix: 'estructura-inline',
        items: estructurasDelComponente.value,
        itemsOrdenados: estructurasOrdenadasParaVista.value,
        totalCantidad: totalCantidadEstructuras.value,
        totalCosto: totalCostoEstructuras.value,
        obtenerNombre: obtenerNombreEstructura,
        obtenerCodigo: obtenerCodigoEstructura,
        obtenerCostoUnitario: obtenerCostoUnitarioEstructura,
        obtenerSubtotal: obtenerSubtotalEstructura,
        incrementar: incrementarCantidadEstructura,
        decrementar: decrementarCantidadEstructura,
        guardarCantidad: guardarCantidadEstructura,
        remover: removerEstructura,
        agregar: agregarEstructura,
        abrirSelector: abrirSelectorEstructuras,
        selectorVisible: mostrarSelectorEstructuras.value,
        busqueda: busquedaEstructura.value,
        itemsFiltrados: estructurasFiltradas.value,
        cerrarSelector: () => { mostrarSelectorEstructuras.value = false; },
        actualizarBusqueda: (val) => { busquedaEstructura.value = val; },
    },
    {
        key: 'cubreCantos',
        icon: '🎨',
        titulo: 'Cubre Cantos Asociados',
        tituloModal: 'Seleccionar Cubre Cantos',
        labelSingular: 'Cubre Canto',
        labelCorto: 'Cubre Cantos',
        emptyTitle: 'Sin cubre cantos asignados',
        emptyDesc: 'Agrega acabados de cubre cantos para los bordes del componente',
        addLabel: 'Agregar Cubre Canto',
        keyPrefix: 'cc-inline',
        items: acabadoCubreCantosDelComponente.value,
        itemsOrdenados: cubreCantosOrdenadosParaVista.value,
        totalCantidad: totalCantidadCubreCantos.value,
        totalCosto: totalCostoCubreCantos.value,
        obtenerNombre: obtenerNombreCubreCanto,
        obtenerCodigo: obtenerCodigoCubreCanto,
        obtenerCostoUnitario: obtenerCostoUnitarioCubreCanto,
        obtenerSubtotal: obtenerSubtotalCubreCanto,
        incrementar: incrementarCantidadCubreCanto,
        decrementar: decrementarCantidadCubreCanto,
        guardarCantidad: guardarCantidadCubreCanto,
        remover: removerCubreCanto,
        agregar: agregarCubreCanto,
        abrirSelector: abrirSelectorCubreCantos,
        selectorVisible: mostrarSelectorCubreCantos.value,
        busqueda: busquedaCubreCanto.value,
        itemsFiltrados: cubreCantosFiltrados.value,
        cerrarSelector: () => { mostrarSelectorCubreCantos.value = false; },
        actualizarBusqueda: (val) => { busquedaCubreCanto.value = val; },
    },
    {
        key: 'acabadoTableros',
        icon: '🪵',
        titulo: 'Acabado Tableros Asociados',
        tituloModal: 'Seleccionar Acabado Tableros',
        labelSingular: 'Acabado Tablero',
        labelCorto: 'Acabado Tableros',
        emptyTitle: 'Sin acabado tableros asignados',
        emptyDesc: 'Agrega acabados de tablero para las superficies del componente',
        addLabel: 'Agregar Acabado Tablero',
        keyPrefix: 'at-inline',
        items: acabadoTablerosDelComponente.value,
        itemsOrdenados: acabadoTablerosOrdenadosParaVista.value,
        totalCantidad: totalCantidadAcabadoTableros.value,
        totalCosto: totalCostoAcabadoTableros.value,
        obtenerNombre: obtenerNombreAcabadoTablero,
        obtenerCodigo: obtenerCodigoAcabadoTablero,
        obtenerCostoUnitario: obtenerCostoUnitarioAcabadoTablero,
        obtenerSubtotal: obtenerSubtotalAcabadoTablero,
        incrementar: incrementarCantidadAcabadoTablero,
        decrementar: decrementarCantidadAcabadoTablero,
        guardarCantidad: guardarCantidadAcabadoTablero,
        remover: removerAcabadoTablero,
        agregar: agregarAcabadoTablero,
        abrirSelector: abrirSelectorAcabadoTableros,
        selectorVisible: mostrarSelectorAcabadoTableros.value,
        busqueda: busquedaAcabadoTablero.value,
        itemsFiltrados: acabadoTablerosFiltrados.value,
        cerrarSelector: () => { mostrarSelectorAcabadoTableros.value = false; },
        actualizarBusqueda: (val) => { busquedaAcabadoTablero.value = val; },
    },
    {
        key: 'puertas',
        icon: '🚪',
        titulo: 'Puertas Asociadas',
        tituloModal: 'Seleccionar Puertas',
        labelSingular: 'Puerta',
        labelCorto: 'Puertas',
        emptyTitle: 'Sin puertas asignadas',
        emptyDesc: 'Agrega puertas al componente para completar su configuración',
        addLabel: 'Agregar Puerta',
        keyPrefix: 'puerta-inline',
        items: puertasDelComponente.value,
        itemsOrdenados: puertasOrdenadasParaVista.value,
        totalCantidad: totalCantidadPuertas.value,
        totalCosto: totalCostoPuertas.value,
        obtenerNombre: obtenerNombrePuerta,
        obtenerCodigo: obtenerCodigoPuerta,
        obtenerCostoUnitario: obtenerCostoUnitarioPuerta,
        obtenerSubtotal: obtenerSubtotalPuerta,
        incrementar: incrementarCantidadPuerta,
        decrementar: decrementarCantidadPuerta,
        guardarCantidad: guardarCantidadPuerta,
        remover: removerPuerta,
        agregar: agregarPuerta,
        abrirSelector: abrirSelectorPuertas,
        selectorVisible: mostrarSelectorPuertas.value,
        busqueda: busquedaPuerta.value,
        itemsFiltrados: puertasFiltradas.value,
        cerrarSelector: () => { mostrarSelectorPuertas.value = false; },
        actualizarBusqueda: (val) => { busquedaPuerta.value = val; },
    },
    {
        key: 'accesorios',
        icon: '🔩',
        titulo: 'Accesorios Asociados',
        tituloModal: 'Seleccionar Accesorios',
        labelSingular: 'Accesorio',
        labelCorto: 'Accesorios',
        emptyTitle: 'Sin accesorios asignados',
        emptyDesc: 'Agrega accesorios como complementos del componente',
        addLabel: 'Agregar Accesorio',
        keyPrefix: 'acc-inline',
        items: accesoriosDelComponente.value,
        itemsOrdenados: accesoriosOrdenadosParaVista.value,
        totalCantidad: totalCantidadAccesorios.value,
        totalCosto: totalCostoAccesorios.value,
        obtenerNombre: obtenerNombreAccesorio,
        obtenerCodigo: obtenerCodigoAccesorio,
        obtenerCostoUnitario: obtenerCostoUnitarioAccesorio,
        obtenerSubtotal: obtenerSubtotalAccesorio,
        incrementar: incrementarCantidadAccesorio,
        decrementar: decrementarCantidadAccesorio,
        guardarCantidad: guardarCantidadAccesorio,
        remover: removerAccesorio,
        agregar: agregarAccesorio,
        abrirSelector: abrirSelectorAccesorios,
        selectorVisible: mostrarSelectorAccesorios.value,
        busqueda: busquedaAccesorio.value,
        itemsFiltrados: accesoriosFiltrados.value,
        cerrarSelector: () => { mostrarSelectorAccesorios.value = false; },
        actualizarBusqueda: (val) => { busquedaAccesorio.value = val; },
    },
]);

const costoTotalGeneral = computed(() =>
    entidades.value.reduce((sum, e) => sum + e.totalCosto, 0)
);

// Validar formulario
const validar = () => {
    errors.value = {};
    
    if (!formData.value.nombre.trim()) {
        errors.value.nombre = 'El nombre es requerido';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Guardar cambios
const guardarComponente = async () => {
    if (!validar()) return;
    
    try {
        guardando.value = true;
        error.value = null;
        
        const datos = {
            nombre: formData.value.nombre.trim(),
            codigo: formData.value.codigo.trim(),
            descripcion: formData.value.descripcion.trim(),
        };
        
        await api.put(`/componentes/${componenteId.value || route.params.id}`, datos);
        router.push('/componentes');
    } catch (err) {
        error.value = 'Error al guardar los cambios';
        console.error(err);
        console.error('Detalles:', err.response?.data);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(async () => {
    await cargarComponente();
});
</script>

<style scoped>
/* ========== Page Entrance ========== */
@keyframes pageEntrance {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ========== Container ========== */
.editar-componente-container {
    max-width: 920px;
    margin: 0 auto;
    padding: 24px 20px 40px;
    min-height: 100vh;
    animation: pageEntrance 0.4s ease-out;
}

/* ========== Breadcrumb ========== */
.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 500;
}

.breadcrumb-link {
    color: #8b7355;
    text-decoration: none;
    transition: color 0.2s;
}

.breadcrumb-link:hover {
    color: #d4a574;
}

.breadcrumb-sep {
    color: #ccc;
    user-select: none;
}

.breadcrumb-current {
    color: #5a4037;
    font-weight: 600;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ========== Header ========== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    background: white;
    padding: 20px 24px;
    border-radius: 14px;
    border: 1px solid #e8e3dd;
    box-shadow: 0 1px 4px rgba(90, 64, 55, 0.06), 0 4px 16px rgba(90, 64, 55, 0.03);
    gap: 16px;
    flex-wrap: wrap;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.btn-back {
    width: 40px;
    height: 40px;
    background: #f5f1ed;
    color: #8b7355;
    border: 1px solid #e8e3dd;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    flex-shrink: 0;
}

.btn-back:hover {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border-color: transparent;
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.back-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.page-title {
    font-size: 22px;
    font-weight: 800;
    color: #2c2c2c;
    margin: 0;
    letter-spacing: -0.4px;
    line-height: 1.2;
}

.header-subtitle {
    font-size: 13px;
    color: #999;
    margin: 0;
    font-weight: 500;
}

.header-right {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
}

.badge-saving {
    background: #fffbeb;
    color: #92400e;
    border: 1px solid #fcd34d;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.saving-dot {
    width: 8px;
    height: 8px;
    background: #f59e0b;
    border-radius: 50%;
    animation: pulse-dot 1s ease-in-out infinite;
}

@keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
}

.badge-status {
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #6ee7b7;
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.badge-code {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.25);
}

/* ========== Alerts ========== */
.alert {
    padding: 14px 18px;
    border-radius: 10px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    font-size: 14px;
    animation: slideDown 0.3s ease-out;
}

.alert-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.alert-text {
    flex: 1;
}

.alert-close {
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    color: inherit;
    padding: 0;
    opacity: 0.6;
    transition: opacity 0.2s;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.alert-close:hover {
    opacity: 1;
}

.alert-error {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #feb2b2;
    border-left: 4px solid #e53e3e;
}

/* ========== Toast Messages ========== */
.custom-message {
    padding: 14px 20px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    animation: slideDown 0.3s ease-out;
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 480px;
    z-index: 2000;
    margin: 0;
    backdrop-filter: blur(8px);
}

.message-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
}

.message-text {
    flex: 1;
    font-size: 0.95rem;
}

.message-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.4rem;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
    flex-shrink: 0;
}

.message-close:hover {
    opacity: 0.7;
    transform: scale(1.1);
}

.message-warning {
    background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
    color: #f57f17;
    border-left: 4px solid #fbc02d;
}

.message-success {
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
    color: #2e7d32;
    border-left: 4px solid #4caf50;
}

.message-error {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    color: #c62828;
    border-left: 4px solid #f44336;
}

.message-info {
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    color: #1565c0;
    border-left: 4px solid #2196f3;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
}

.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* ========== Loading ========== */
.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
}

.loading-card {
    text-align: center;
    background: white;
    border-radius: 16px;
    padding: 48px 40px;
    box-shadow: 0 2px 12px rgba(90, 64, 55, 0.06);
    border: 1px solid #ede7e0;
    max-width: 320px;
    width: 100%;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f0ebe5;
    border-top-color: #d4a574;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 18px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-text {
    font-size: 15px;
    margin: 0 0 4px;
    color: #5a4037;
    font-weight: 600;
}

.loading-subtext {
    font-size: 13px;
    margin: 0;
    color: #a89480;
}

/* ========== Stats Bar ========== */
.stats-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
}

.stat-card {
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 12px;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(90, 64, 55, 0.04);
    transition: all 0.25s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
}

.stat-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #d4a574, #c89564);
    opacity: 0;
    transition: opacity 0.25s;
}

.stat-card:hover {
    box-shadow: 0 4px 14px rgba(90, 64, 55, 0.08);
    transform: translateY(-2px);
}

.stat-card:hover::after {
    opacity: 1;
}

.stat-card--highlight {
    background: linear-gradient(135deg, #fffbf5 0%, #fff8ee 100%);
    border-color: #e8d5c0;
}

.stat-card--highlight::after {
    opacity: 1;
    height: 3px;
    background: linear-gradient(90deg, #d4a574, #e8b888);
}

.stat-icon {
    font-size: 22px;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f3ef;
    border-radius: 10px;
    flex-shrink: 0;
}

.stat-icon--total {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-content {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    flex: 1;
}

.stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 700;
    color: #a89480;
}

.stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #5a4037;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stat-value--total {
    font-size: 17px;
    color: #2e7d32;
}

.stat-value small {
    font-size: 11px;
    font-weight: 600;
    color: #a89480;
}

.stat-detail {
    font-size: 11px;
    color: #a89480;
    font-weight: 500;
}

.stat-amount {
    font-size: 13px;
    font-weight: 700;
    color: #2e7d32;
    white-space: nowrap;
    flex-shrink: 0;
}

/* ========== Info Card ========== */
.info-card {
    background: white;
    border-radius: 14px;
    padding: 24px 26px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(90, 64, 55, 0.05);
    border: 1px solid #ede7e0;
    transition: box-shadow 0.25s ease;
}

.info-card:hover {
    box-shadow: 0 2px 12px rgba(90, 64, 55, 0.08);
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 20px 0;
    padding-bottom: 14px;
    border-bottom: 2px solid #f5f1ed;
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.section-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    font-size: 11px;
    font-weight: 800;
    border-radius: 12px;
    margin-left: 4px;
}

.required {
    color: #e53e3e;
    font-weight: 700;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-label {
    font-weight: 600;
    color: #5a4037;
    font-size: 13px;
    letter-spacing: 0.2px;
}

.input-with-prefix {
    display: flex;
    align-items: stretch;
    border-radius: 8px;
    border: 2px solid #e0d5c7;
    overflow: hidden;
    transition: all 0.25s;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
}

.input-with-prefix:hover {
    border-color: #d4a574;
}

.input-with-prefix:focus-within {
    border-color: #c89564;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.12);
    background: white;
}

.input-prefix {
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: #f5f1ed;
    color: #8b7355;
    font-weight: 700;
    font-size: 14px;
    border-right: 1px solid #e0d5c7;
    user-select: none;
}

.form-input--prefixed {
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
}

.form-input--prefixed:focus {
    box-shadow: none !important;
}

.input-readonly {
    background: #f5f1ed;
    cursor: default;
}

.input-readonly:hover {
    border-color: #e0d5c7;
}

.readonly-value {
    display: flex;
    align-items: center;
    color: #5a4037;
    font-weight: 600;
    user-select: text;
    cursor: default;
}

.form-input {
    width: 100%;
    padding: 11px 14px;
    border: 2px solid #e0d5c7;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
    transition: all 0.25s;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    color: #5a4037;
}

.form-input::placeholder {
    color: #c4a882;
    opacity: 0.6;
}

.form-input:hover {
    border-color: #d4a574;
}

.form-input:focus {
    outline: none;
    background: white;
    border-color: #c89564;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.12);
}

.textarea-input {
    resize: vertical;
    min-height: 70px;
}

.error-text {
    display: block;
    color: #dc2626;
    font-size: 12px;
    font-weight: 500;
}

/* ========== Form Actions ========== */
.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 8px;
}

.form-actions--sticky {
    position: sticky;
    bottom: 0;
    background: linear-gradient(to top, #ffffff 50%, rgba(255,255,255,0.97) 75%, rgba(255,255,255,0) 100%);
    padding: 24px 0 12px;
    z-index: 10;
    margin-top: 8px;
}

.btn-loading {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.spinner-sm {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

.btn-primary,
.btn-secondary {
    padding: 12px 24px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.25s;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-primary {
    background: linear-gradient(135deg, #4CAF50 0%, #43a047 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
}

.btn-primary:active:not(:disabled) {
    transform: translateY(0);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    background: white;
    color: #777;
    border: 1.5px solid #e0d5c7;
    box-shadow: none;
}

.btn-secondary:hover {
    background: #f9f6f2;
    border-color: #d4a574;
    color: #5a4037;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-12px);
}

/* ========== Accesorios Section ========== */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 2px solid #f5f1ed;
}

.section-header .section-title {
    margin: 0;
    padding: 0;
    border: none;
}

.btn-action-header {
    padding: 8px 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.2);
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.btn-action-header:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(212, 165, 116, 0.35);
}

.btn-action-header:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.accesorio-add {
    display: flex;
    gap: 10px;
    align-items: stretch;
}

.accesorio-add .form-input {
    flex: 1;
}

.entity-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
}

.entity-list-enter-active {
    transition: all 0.35s ease;
}
.entity-list-leave-active {
    transition: all 0.25s ease;
}
.entity-list-enter-from {
    opacity: 0;
    transform: translateX(-12px);
}
.entity-list-leave-to {
    opacity: 0;
    transform: translateX(16px);
}
.entity-list-move {
    transition: transform 0.3s ease;
}

.entity-row {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    background: #fefefe;
    border: 1px solid #eee9e3;
    border-radius: 10px;
    gap: 14px;
    transition: all 0.2s ease;
}

.entity-row:hover {
    border-color: #ddd4c8;
    background: #fffdf9;
    box-shadow: 0 2px 8px rgba(90, 64, 55, 0.06);
}

.entity-row-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
}

.entity-avatar {
    width: 36px;
    height: 36px;
    background: #f7f3ef;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.entity-info {
    min-width: 0;
}

.entity-name {
    font-weight: 600;
    color: #2c2c2c;
    font-size: 13.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.entity-row-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.btn-delete-sm {
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: #bbb;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.btn-delete-sm:hover {
    background: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
}

.btn-delete-sm:active {
    transform: scale(0.9);
}

.empty-state-inline {
    text-align: center;
    padding: 36px 20px;
}

.empty-illustration {
    position: relative;
    display: inline-block;
    margin-bottom: 12px;
}

.empty-illustration .empty-icon {
    font-size: 36px;
    position: relative;
    z-index: 1;
}

.empty-rings {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px dashed #e8e3dd;
    animation: ring-rotate 12s linear infinite;
}

@keyframes ring-rotate {
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

.empty-title {
    margin: 0 0 4px;
    font-size: 14px;
    color: #5a4037;
    font-weight: 600;
}

.empty-desc {
    margin: 0 0 18px;
    font-size: 13px;
    color: #a89480;
    font-weight: 400;
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
}

/* ========== Responsive ========== */
@media (max-width: 768px) {
    .editar-componente-container {
        padding: 16px 12px 32px;
    }

    .breadcrumb {
        font-size: 12px;
        margin-bottom: 12px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        padding: 16px;
    }

    .header-left {
        gap: 10px;
    }

    .header-right {
        margin-top: 8px;
    }

    .page-title {
        font-size: 19px;
    }

    .stats-bar {
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .stat-card {
        padding: 12px;
    }

    .stat-amount {
        display: none;
    }

    .info-card {
        padding: 16px 14px;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .accesorio-add {
        flex-direction: column;
    }

    .section-header {
        flex-wrap: wrap;
        gap: 8px;
    }

    .entity-row {
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px;
    }

    .form-actions {
        flex-direction: column-reverse;
    }

    .form-actions--sticky {
        padding: 16px 0 8px;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .stats-bar {
        grid-template-columns: 1fr;
    }
}
</style>
