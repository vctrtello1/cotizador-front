<template>
    <div class="componentes-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">📦 Componentes</h1>
                <p class="header-subtitle">{{ componentes.length }} componentes disponibles</p>
            </div>
            <button v-if="canWrite" class="btn-primary" @click="$router.push('/nuevo-componente')">➕ Nuevo Componente</button>
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

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando componentes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="componentes.length === 0" class="empty-state">
            <p>No hay componentes registrados.</p>
            <button v-if="canWrite" class="btn-primary" @click="$router.push('/nuevo-componente')">Crear Primer Componente</button>
        </div>

        <!-- Componentes Grid -->
        <div v-else class="componentes-grid">
            <div v-for="componente in componentes" :key="componente.id" class="componente-card">
                <div class="componente-header">
                    <h3 class="componente-nombre">{{ componente.nombre }}</h3>
                    <span class="componente-codigo">{{ componente.codigo }}</span>
                </div>

                <p class="componente-descripcion">{{ componente.descripcion || 'Sin descripción' }}</p>

                <div class="componente-stats">
                    <div class="stat-item">
                        <div class="stat-icon">🔗</div>
                        <div class="stat-content">
                            <label>Total Entidades</label>
                            <span>{{ getTotalEntidades(componente.id) }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="getTotalEntidades(componente.id) > 0" class="entidades-list">
                    <div class="list-header">
                        <label>📋 Entidades incluidas:</label>
                    </div>
                    <ul>
                        <li v-for="entidad in getTodasEntidades(componente.id).slice(0, 4)" :key="entidad.tipo + '-' + entidad.nombre" class="entidad-item">
                            <span class="entidad-bullet">•</span>
                            <span class="entidad-info">
                                <span class="entidad-icon">{{ entidad.icono }}</span>
                                <span class="entidad-quantity">{{ entidad.cantidad }}×</span>
                                <span class="entidad-name">{{ entidad.nombre }}</span>
                            </span>
                        </li>
                        <li v-if="getTodasEntidades(componente.id).length > 4" class="mas-items">
                            <span class="more-badge">+{{ getTodasEntidades(componente.id).length - 4 }}</span> más
                        </li>
                    </ul>
                </div>

                <div class="card-actions">
                    <button class="btn-detail" @click="abrirDetalle(componente)" title="Ver detalles">🔍 Ver Detalles</button>
                    <template v-if="canWrite">
                        <button class="btn-edit" @click="editarComponente(componente.id)" title="Editar componente">✏️ Editar</button>
                        <button class="btn-delete" @click="confirmarEliminar(componente.id)" title="Eliminar componente">🗑️ Eliminar</button>
                    </template>
                </div>
            </div>
        </div>

        <!-- Modal de detalle del componente -->
        <div v-if="modalDetalle && componenteSeleccionado" class="modal-overlay" @click.self="modalDetalle = false">
            <div class="modal-detalle-content">
                <div class="modal-detalle-header">
                    <div class="modal-detalle-title-group">
                        <h3 class="modal-detalle-nombre">{{ componenteSeleccionado.nombre }}</h3>
                        <span class="componente-codigo">{{ componenteSeleccionado.codigo }}</span>
                    </div>
                    <button class="btn-close-modal" @click="modalDetalle = false">✕</button>
                </div>

                <p v-if="componenteSeleccionado.descripcion" class="modal-detalle-desc">{{ componenteSeleccionado.descripcion }}</p>

                <div v-if="getTotalEntidades(componenteSeleccionado.id) === 0" class="modal-detalle-empty">
                    <p>Este componente no tiene entidades asociadas.</p>
                </div>

                <div v-else class="modal-detalle-body">
                    <!-- Estructuras -->
                    <div v-if="getEstructuras(componenteSeleccionado.id).length > 0" class="modal-entidad-grupo">
                        <h4 class="grupo-titulo"><span>🏗️</span> Estructuras</h4>
                        <div class="grupo-items">
                            <div v-for="e in getEstructuras(componenteSeleccionado.id)" :key="e.nombre" class="entidad-row">
                                <span class="entidad-row-nombre">{{ e.nombre }}</span>
                                <span class="entidad-row-costo">{{ formatCosto(e.costo) }}</span>
                                <span class="entidad-row-cantidad">{{ Number(e.cantidad) || 1 }} pza</span>
                                <span class="entidad-row-subtotal">{{ formatCosto(e.subtotal) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Acabado Tableros -->
                    <div v-if="getAcabadoTableros(componenteSeleccionado.id).length > 0" class="modal-entidad-grupo">
                        <h4 class="grupo-titulo"><span>🪵</span> Acabado Tableros</h4>
                        <div class="grupo-items">
                            <div v-for="e in getAcabadoTableros(componenteSeleccionado.id)" :key="e.nombre" class="entidad-row">
                                <span class="entidad-row-nombre">{{ e.nombre }}</span>
                                <span class="entidad-row-costo">{{ formatCosto(e.costo) }}</span>
                                <span class="entidad-row-cantidad">{{ Number(e.cantidad) || 1 }} pza</span>
                                <span class="entidad-row-subtotal">{{ formatCosto(e.subtotal) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cubre Cantos -->
                    <div v-if="getCubreCantos(componenteSeleccionado.id).length > 0" class="modal-entidad-grupo">
                        <h4 class="grupo-titulo"><span>📏</span> Cubre Cantos</h4>
                        <div class="grupo-items">
                            <div v-for="e in getCubreCantos(componenteSeleccionado.id)" :key="e.nombre" class="entidad-row">
                                <span class="entidad-row-nombre">{{ e.nombre }}</span>
                                <span class="entidad-row-costo">{{ formatCosto(e.costo) }}</span>
                                <span class="entidad-row-cantidad">{{ Number(e.cantidad) || 1 }} pza</span>
                                <span class="entidad-row-subtotal">{{ formatCosto(e.subtotal) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Puertas -->
                    <div v-if="getPuertas(componenteSeleccionado.id).length > 0" class="modal-entidad-grupo">
                        <h4 class="grupo-titulo"><span>🚪</span> Puertas</h4>
                        <div class="grupo-items">
                            <div v-for="e in getPuertas(componenteSeleccionado.id)" :key="e.nombre" class="entidad-row">
                                <span class="entidad-row-nombre">{{ e.nombre }}</span>
                                <span class="entidad-row-costo">{{ formatCosto(e.costo) }}</span>
                                <span class="entidad-row-cantidad">{{ Number(e.cantidad) || 1 }} pza</span>
                                <span class="entidad-row-subtotal">{{ formatCosto(e.subtotal) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Accesorios -->
                    <div v-if="getAccesorios(componenteSeleccionado.id).length > 0" class="modal-entidad-grupo">
                        <h4 class="grupo-titulo"><span>🔩</span> Accesorios</h4>
                        <div class="grupo-items">
                            <div v-for="e in getAccesorios(componenteSeleccionado.id)" :key="e.nombre" class="entidad-row">
                                <span class="entidad-row-nombre">{{ e.nombre }}</span>
                                <span class="entidad-row-costo">{{ formatCosto(e.costo) }}</span>
                                <span class="entidad-row-cantidad">{{ Number(e.cantidad) || 1 }} pza</span>
                                <span class="entidad-row-subtotal">{{ formatCosto(e.subtotal) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-detalle-footer">
                    <span class="modal-total-badge">{{ getTotalEntidades(componenteSeleccionado.id) }} entidades · {{ formatCosto(getCostoTotal(componenteSeleccionado.id)) }}</span>
                    <button v-if="canWrite" class="btn-edit" @click="editarComponente(componenteSeleccionado.id); modalDetalle = false">✏️ Editar</button>
                    <button class="btn-secondary" @click="modalDetalle = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="canWrite && modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este componente?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-delete" @click="eliminarComponenteFunc">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchComponentes, eliminarComponente, getComponenteById, crearComponente } from '@/http/componentes-api';
import { crearEstructuraPorComponente, eliminarEstructuraPorComponente } from '@/http/estructuras-por-componente-api';
import { crearAcabadoTableroPorComponente, eliminarAcabadoTableroPorComponente } from '@/http/acabado-tablero-por-componente-api';
import { crearAcabadoCubreCantoPorComponente, eliminarAcabadoCubreCantoPorComponente } from '@/http/acabado-cubre-cantos-por-componente-api';
import { crearPuertaPorComponente, eliminarPuertaPorComponente } from '@/http/puertas-por-componente-api';
import { crearAccesorioPorComponente, eliminarAccesorioPorComponente } from '@/http/accesorios-por-componente-api';
import { useAuthStore } from '@/stores/auth';
import { useEstructurasPorComponenteStore } from '@/stores/estructuras-por-componente';
import { useAcabadoTableroPorComponenteStore } from '@/stores/acabado-tablero-por-componente';
import { useAcabadoCubreCantosPorComponenteStore } from '@/stores/acabado-cubre-cantos-por-componente';
import { usePuertasPorComponenteStore } from '@/stores/puertas-por-componente';
import { useAccesoriosPorComponenteStore } from '@/stores/accesorios-por-componente';
import { useEstructuraStore } from '@/stores/estructura';
import { useAcabadoTableroStore } from '@/stores/acabado-tablero';
import { useAcabadoCubreCantosStore } from '@/stores/acabado-cubre-cantos';
import { usePuertasStore } from '@/stores/puertas';
import { useAccesoriosStore } from '@/stores/accesorios';

const router = useRouter();
const authStore = useAuthStore();
const estructurasPorCompStore = useEstructurasPorComponenteStore();
const acabadoTableroPorCompStore = useAcabadoTableroPorComponenteStore();
const acabadoCubreCantosPorCompStore = useAcabadoCubreCantosPorComponenteStore();
const puertasPorCompStore = usePuertasPorComponenteStore();
const accesoriosPorCompStore = useAccesoriosPorComponenteStore();
const estructuraStore = useEstructuraStore();
const acabadoTableroStore = useAcabadoTableroStore();
const acabadoCubreCantosStore = useAcabadoCubreCantosStore();
const puertasStore = usePuertasStore();
const accesoriosStore = useAccesoriosStore();

// Estado
const componentes = ref([]);
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const componenteAEliminar = ref(null);
const modalDetalle = ref(false);
const componenteSeleccionado = ref(null);
const canWrite = computed(() => authStore.hasPermission('catalogs.write'));

// Cargar componentes
const cargarComponentes = async () => {
    cargando.value = true;
    error.value = null;
    try {
        const response = await fetchComponentes();
        componentes.value = Array.isArray(response) ? response : (response.data || []);
    } catch (err) {
        console.error('Error cargando componentes:', err);
        error.value = 'Error al cargar los componentes';
    } finally {
        cargando.value = false;
    }
};

// Abrir modal de detalle
const abrirDetalle = (componente) => {
    componenteSeleccionado.value = componente;
    modalDetalle.value = true;
};

// Editar componente
const editarComponente = (id) => {
    router.push(`/editar-componente/${id}`);
};

// Duplicar componente con todas sus entidades relacionadas
const duplicarComponente = async (id) => {
    try {
        cargando.value = true;
        error.value = null;
        
        // Obtener el componente original
        const response = await getComponenteById(id);
        const componenteOriginal = response.data || response;
        
        // Generar nombre y código únicos para la copia
        let nombreCopia = `${componenteOriginal.nombre} (Copia)`;
        let codigoCopia = `${componenteOriginal.codigo}_COPIA`;
        
        let contador = 1;
        while (componentes.value.some(c => c.codigo === codigoCopia)) {
            contador++;
            nombreCopia = `${componenteOriginal.nombre} (Copia ${contador})`;
            codigoCopia = `${componenteOriginal.codigo}_COPIA${contador}`;
        }
        
        // Crear el nuevo componente (copia)
        const nuevoComponente = {
            nombre: nombreCopia,
            codigo: codigoCopia,
            descripcion: componenteOriginal.descripcion || '',
            unidad_medida: componenteOriginal.unidad_medida || '',
            cantidad_disponible: componenteOriginal.cantidad_disponible || 0,
            costo_unitario: componenteOriginal.costo_unitario || 0
        };
        
        const nuevoResp = await crearComponente(nuevoComponente);
        const nuevoId = nuevoResp.data?.id || nuevoResp.id;
        
        // Duplicar estructuras por componente
        const estructuras = estructurasPorCompStore.estructurasPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of estructuras) {
            await crearEstructuraPorComponente({
                componente_id: nuevoId,
                estructura_id: rel.estructura_id,
                cantidad: rel.cantidad || 1,
            });
        }
        
        // Duplicar acabado tablero por componente
        const acabadoTableros = acabadoTableroPorCompStore.acabadoTablerosPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of acabadoTableros) {
            await crearAcabadoTableroPorComponente({
                componente_id: nuevoId,
                acabado_tablero_id: rel.acabado_tablero_id,
                cantidad: rel.cantidad || 1,
            });
        }
        
        // Duplicar acabado cubre cantos por componente
        const cubreCantos = acabadoCubreCantosPorCompStore.acabadoCubreCantosPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of cubreCantos) {
            await crearAcabadoCubreCantoPorComponente({
                componente_id: nuevoId,
                acabado_cubre_canto_id: rel.acabado_cubre_canto_id || rel.acabado_cubre_cantos_id,
                cantidad: rel.cantidad || 1,
            });
        }
        
        // Duplicar puertas por componente
        const puertas = puertasPorCompStore.puertasPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of puertas) {
            await crearPuertaPorComponente({
                componente_id: nuevoId,
                puerta_id: rel.puerta_id,
                cantidad: rel.cantidad || 1,
            });
        }
        
        // Duplicar accesorios por componente
        const accesorios = accesoriosPorCompStore.accesoriosPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of accesorios) {
            const payload = {
                componente_id: nuevoId,
                cantidad: rel.cantidad || 1,
            };
            // El API acepta 'accesorio' (nombre) o 'accesorio_id'
            if (rel.accesorio_id) {
                payload.accesorio_id = rel.accesorio_id;
            } else if (rel.accesorio && typeof rel.accesorio === 'object') {
                payload.accesorio_id = rel.accesorio.id;
            } else if (rel.accesorio) {
                payload.accesorio = rel.accesorio;
            }
            await crearAccesorioPorComponente(payload);
        }
        
        exito.value = '✓ Componente duplicado con todas sus entidades relacionadas';
        
        // Recargar componentes y entidades relacionadas
        await Promise.all([
            cargarComponentes(),
            estructurasPorCompStore.fetchEstructurasPorComponente(),
            acabadoTableroPorCompStore.fetchAcabadoTablerosPorComponente(),
            acabadoCubreCantosPorCompStore.fetchAcabadoCubreCantosPorComponente(),
            puertasPorCompStore.fetchPuertasPorComponente(),
            accesoriosPorCompStore.fetchAccesoriosPorComponente(),
        ]);
        
        setTimeout(() => {
            exito.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error duplicando componente:', err);
        error.value = err.response?.data?.message || 'Error al duplicar el componente';
    } finally {
        cargando.value = false;
    }
};

// Confirmar eliminación
const confirmarEliminar = (id) => {
    componenteAEliminar.value = id;
    modalEliminar.value = true;
};

// Eliminar componente (primero elimina entidades relacionadas)
const eliminarComponenteFunc = async () => {
    try {
        error.value = null;
        const id = componenteAEliminar.value;

        // Eliminar estructuras relacionadas
        const estructuras = estructurasPorCompStore.estructurasPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of estructuras) {
            await eliminarEstructuraPorComponente(rel.id);
        }

        // Eliminar acabados tablero relacionados
        const acabadoTableros = acabadoTableroPorCompStore.acabadoTablerosPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of acabadoTableros) {
            await eliminarAcabadoTableroPorComponente(rel.id);
        }

        // Eliminar acabados cubre cantos relacionados
        const cubreCantos = acabadoCubreCantosPorCompStore.acabadoCubreCantosPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of cubreCantos) {
            await eliminarAcabadoCubreCantoPorComponente(rel.id);
        }

        // Eliminar puertas relacionadas
        const puertas = puertasPorCompStore.puertasPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of puertas) {
            await eliminarPuertaPorComponente(rel.id);
        }

        // Eliminar accesorios relacionados
        const accesorios = accesoriosPorCompStore.accesoriosPorComponente.filter(
            r => Number(r.componente_id) === Number(id)
        );
        for (const rel of accesorios) {
            await eliminarAccesorioPorComponente(rel.id);
        }

        // Ahora eliminar el componente
        await eliminarComponente(id);
        exito.value = '✓ Componente eliminado exitosamente';
        modalEliminar.value = false;
        componenteAEliminar.value = null;

        // Recargar componentes y entidades relacionadas
        await Promise.all([
            cargarComponentes(),
            estructurasPorCompStore.fetchEstructurasPorComponente(),
            acabadoTableroPorCompStore.fetchAcabadoTablerosPorComponente(),
            acabadoCubreCantosPorCompStore.fetchAcabadoCubreCantosPorComponente(),
            puertasPorCompStore.fetchPuertasPorComponente(),
            accesoriosPorCompStore.fetchAccesoriosPorComponente(),
        ]);

        setTimeout(() => {
            exito.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error eliminando componente:', err);
        error.value = err.response?.data?.message || 'Error al eliminar el componente';
        modalEliminar.value = false;
    }
};

// Lifecycle
onMounted(async () => {
    await cargarComponentes();
    // Cargar entidades relacionadas en paralelo
    await Promise.all([
        estructurasPorCompStore.fetchEstructurasPorComponente(),
        acabadoTableroPorCompStore.fetchAcabadoTablerosPorComponente(),
        acabadoCubreCantosPorCompStore.fetchAcabadoCubreCantosPorComponente(),
        puertasPorCompStore.fetchPuertasPorComponente(),
        accesoriosPorCompStore.fetchAccesoriosPorComponente(),
        estructuraStore.fetchEstructuras(),
        acabadoTableroStore.fetchAcabadoTableros(),
        acabadoCubreCantosStore.fetchAcabadoCubreCantos(),
        puertasStore.fetchPuertas(),
        accesoriosStore.fetchAccesorios(),
    ]);
});

// Obtener entidades relacionadas a un componente
const getEstructuras = (componenteId) => {
    const relaciones = estructurasPorCompStore.estructurasPorComponente.filter(
        r => Number(r.componente_id) === Number(componenteId)
    );
    return relaciones.map(r => {
        const entidad = estructuraStore.estructuras.find(e => Number(e.id) === Number(r.estructura_id));
        if (!entidad) return null;
        const cantidad = Number(r.cantidad) || 1;
        const costo = Number(entidad.costo_unitario ?? entidad.costo ?? entidad.precio ?? 0);
        return { nombre: entidad.nombre, cantidad, costo, subtotal: costo * cantidad };
    }).filter(Boolean);
};

const getAcabadoTableros = (componenteId) => {
    const relaciones = acabadoTableroPorCompStore.acabadoTablerosPorComponente.filter(
        r => Number(r.componente_id) === Number(componenteId)
    );
    return relaciones.map(r => {
        const entidad = acabadoTableroStore.acabadoTableros.find(e => Number(e.id) === Number(r.acabado_tablero_id));
        if (!entidad) return null;
        const cantidad = Number(r.cantidad) || 1;
        const costo = Number(entidad.costo_unitario ?? entidad.costo ?? entidad.precio ?? 0);
        return { nombre: entidad.nombre, cantidad, costo, subtotal: costo * cantidad };
    }).filter(Boolean);
};

const getCubreCantos = (componenteId) => {
    const relaciones = acabadoCubreCantosPorCompStore.acabadoCubreCantosPorComponente.filter(
        r => Number(r.componente_id) === Number(componenteId)
    );
    return relaciones.map(r => {
        const id = r.acabado_cubre_canto_id || r.acabado_cubre_cantos_id;
        const entidad = acabadoCubreCantosStore.acabadoCubreCantos.find(e => Number(e.id) === Number(id));
        if (!entidad) return null;
        const cantidad = Number(r.cantidad) || 1;
        const costo = Number(entidad.costo_unitario ?? entidad.costo ?? entidad.precio ?? 0);
        return { nombre: entidad.nombre, cantidad, costo, subtotal: costo * cantidad };
    }).filter(Boolean);
};

const getPuertas = (componenteId) => {
    const relaciones = puertasPorCompStore.puertasPorComponente.filter(
        r => Number(r.componente_id) === Number(componenteId)
    );
    return relaciones.map(r => {
        const entidad = puertasStore.puertas.find(e => Number(e.id) === Number(r.puerta_id));
        if (!entidad) return null;
        const cantidad = Number(r.cantidad) || 1;
        const costo = Number(entidad.precio_final ?? entidad.costo_unitario ?? entidad.costo ?? entidad.precio ?? 0);
        return { nombre: entidad.nombre, cantidad, costo, subtotal: costo * cantidad };
    }).filter(Boolean);
};

const getAccesorios = (componenteId) => {
    const relaciones = accesoriosPorCompStore.accesoriosPorComponente.filter(
        r => Number(r.componente_id) === Number(componenteId)
    );
    return relaciones.map(r => {
        const id = r.accesorio_id || r.accesorio;
        const entidad = accesoriosStore.accesorios.find(e => 
            Number(e.id) === Number(id) || e.nombre === id
        );
        if (!entidad) return null;
        const cantidad = Number(r.cantidad) || 1;
        const costo = Number(entidad.precio ?? entidad.costo_unitario ?? entidad.costo ?? 0);
        return { nombre: entidad.nombre, cantidad, costo, subtotal: costo * cantidad };
    }).filter(Boolean);
};

// NEW FUNCTION: Get total count of all entities for a component
const getTotalEntidades = (componenteId) => {
    return getEstructuras(componenteId).length
        + getAcabadoTableros(componenteId).length
        + getCubreCantos(componenteId).length
        + getPuertas(componenteId).length
        + getAccesorios(componenteId).length;
};

const getCostoTotal = (componenteId) => [
    ...getEstructuras(componenteId),
    ...getAcabadoTableros(componenteId),
    ...getCubreCantos(componenteId),
    ...getPuertas(componenteId),
    ...getAccesorios(componenteId),
].reduce((acc, e) => acc + (e.subtotal || 0), 0);

const formatCosto = (val) => {
    if (!val) return '—';
    return '$' + Number(val).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// NEW FUNCTION: Get unified array of all entities with type, icon, name, and quantity
const getTodasEntidades = (componenteId) => {
    const entidades = [];
    
    // Estructuras
    getEstructuras(componenteId).forEach(e => {
        entidades.push({
            tipo: 'estructura',
            icono: '🏗️',
            nombre: e.nombre,
            cantidad: e.cantidad
        });
    });
    
    // Acabado Tableros
    getAcabadoTableros(componenteId).forEach(e => {
        entidades.push({
            tipo: 'acabado-tablero',
            icono: '🪵',
            nombre: e.nombre,
            cantidad: e.cantidad
        });
    });
    
    // Cubre Cantos
    getCubreCantos(componenteId).forEach(e => {
        entidades.push({
            tipo: 'cubre-canto',
            icono: '📏',
            nombre: e.nombre,
            cantidad: e.cantidad
        });
    });
    
    // Puertas
    getPuertas(componenteId).forEach(e => {
        entidades.push({
            tipo: 'puerta',
            icono: '🚪',
            nombre: e.nombre,
            cantidad: e.cantidad
        });
    });
    
    // Accesorios
    getAccesorios(componenteId).forEach(e => {
        entidades.push({
            tipo: 'accesorio',
            icono: '🔩',
            nombre: e.nombre,
            cantidad: e.cantidad
        });
    });
    
    return entidades;
};
</script>

<style scoped>
.componentes-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    gap: 20px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(212, 165, 116, 0.05) 100%);
    border-radius: 12px;
    border: 1px solid rgba(212, 165, 116, 0.2);
}

.header-content {
    flex: 1;
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
    letter-spacing: -0.5px;
}

.header-subtitle {
    color: #999;
    font-size: 14px;
    margin: 8px 0 0 0;
    font-weight: 500;
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

.loading-state,
.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    color: #999;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.empty-state p {
    margin: 0;
    font-size: 16px;
}

.componentes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.componente-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede7e0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    transition: all 0.3s;
}

.componente-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.componente-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.componente-nombre {
    font-size: 18px;
    font-weight: 600;
    color: #5a4037;
    margin: 0;
    flex: 1;
}

.componente-codigo {
    padding: 4px 10px;
    background: #f5f1ed;
    color: #5a4037;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
}

.componente-descripcion {
    color: #666;
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
}

.componente-stats {
    display: flex;
    gap: 15px;
    padding: 15px 0;
    border-top: 1px solid #ede7e0;
    border-bottom: 1px solid #ede7e0;
}

.stat-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: #faf7f2;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.stat-item:hover {
    background: #f5f1ed;
    transform: translateX(2px);
}

.stat-icon {
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-content {
    flex: 1;
}

.stat-content label {
    display: block;
    font-size: 11px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
    font-weight: 600;
}

.stat-content span {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #5a4037;
}

.entidades-list {
    background: linear-gradient(135deg, #faf7f2 0%, #f5f1ed 100%);
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #ede7e0;
    transition: all 0.3s ease;
}

.entidades-list:hover {
    border-color: #d4a574;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.1);
}

.list-header {
    margin-bottom: 8px;
}

.list-header label {
    font-size: 12px;
    font-weight: 700;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
}

.entidades-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.entidades-list li {
    font-size: 13px;
    color: #666;
    padding: 6px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.entidades-list li:hover {
    color: #5a4037;
    padding-left: 4px;
}

.entidad-item {
    gap: 10px;
}

.entidad-bullet {
    color: #d4a574;
    font-weight: bold;
    font-size: 16px;
    line-height: 1;
    flex-shrink: 0;
}

.entidad-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.entidad-icon {
    font-size: 14px;
    flex-shrink: 0;
}

.entidad-quantity {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 12px;
    flex-shrink: 0;
    min-width: 35px;
    text-align: center;
}

.entidad-name {
    color: #666;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.entidad-item:hover .entidad-name {
    color: #5a4037;
}

.mas-items {
    color: #999;
    justify-content: flex-start;
}

.more-badge {
    background: #d4a574;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    margin-right: 4px;
}

.card-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 15px;
    border-top: 1px solid #ede7e0;
    flex-wrap: wrap;
}

.btn-detail {
    flex: 1;
    padding: 10px 14px;
    border: 1.5px solid #d4a574;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: white;
    color: #5a4037;
}

.btn-detail:hover {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.btn-primary,
.btn-edit,
.btn-secondary {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: none;
    letter-spacing: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.4);
}

.btn-primary:active {
    transform: translateY(0px);
}

.btn-edit {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 1px 4px rgba(212, 165, 116, 0.2);
}

.btn-edit:hover {
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
    transform: translateY(-1px);
}

.btn-delete {
    background: #fee;
    color: #c33;
    border: 1.5px solid #c33;
}

.btn-delete:hover {
    background: #c33;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(204, 51, 51, 0.2);
}

.btn-secondary {
    background: #f5f1ed;
    color: #5a4037;
    border: 1px solid #d4a574;
}

.btn-secondary:hover {
    background: #ede7e0;
}

/* Modal */
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
    padding: 30px;
    max-width: 400px;
    width: 90%;
}

.modal-content h3 {
    font-size: 18px;
    font-weight: 600;
    color: #5a4037;
    margin: 0 0 15px 0;
}

.modal-content p {
    color: #666;
    margin: 0 0 20px 0;
    line-height: 1.5;
}

.modal-actions {
    display: flex;
    gap: 10px;
}

.modal-actions button {
    flex: 1;
}

/* Modal de detalles */
.modal-detalle-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.modal-detalle-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 28px 20px;
    border-bottom: 2px solid #f5f1ed;
    gap: 16px;
    flex-shrink: 0;
}

.modal-detalle-title-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.modal-detalle-nombre {
    font-size: 20px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
    line-height: 1.2;
}

.btn-close-modal {
    background: #f5f1ed;
    border: none;
    color: #5a4037;
    font-size: 18px;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 6px;
    line-height: 1;
    transition: all 0.2s;
    flex-shrink: 0;
}

.btn-close-modal:hover {
    background: #ede7e0;
    transform: scale(1.1);
}

.modal-detalle-desc {
    padding: 0 28px;
    margin: 16px 0 0;
    color: #888;
    font-size: 14px;
    line-height: 1.6;
    flex-shrink: 0;
}

.modal-detalle-empty {
    padding: 40px 28px;
    text-align: center;
    color: #aaa;
    font-size: 15px;
}

.modal-detalle-body {
    padding: 16px 28px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.modal-entidad-grupo {
    background: #faf7f2;
    border-radius: 10px;
    border: 1px solid #ede7e0;
    overflow: visible;
}

.grupo-titulo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 700;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #f5f1ed 0%, #ede7e0 100%);
    border-bottom: 1px solid #ede7e0;
    border-radius: 10px 10px 0 0;
}

.grupo-items {
    display: flex;
    flex-direction: column;
}

.entidad-row {
    display: grid;
    grid-template-columns: 1fr 90px 70px 90px;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid #f0ece6;
    transition: background 0.2s;
    gap: 8px;
}

.entidad-row:last-child {
    border-bottom: none;
}

.entidad-row:hover {
    background: #f5f1ed;
}

.entidad-row-nombre {
    font-size: 14px;
    color: #444;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.entidad-row-costo {
    font-size: 12px;
    color: #999;
    white-space: nowrap;
    text-align: right;
}

.entidad-row-cantidad {
    background: #f5f1ed;
    color: #5a4037;
    border: 1.5px solid #d4a574;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    text-align: center;
    justify-self: center;
}

.entidad-row-subtotal {
    font-size: 13px;
    font-weight: 700;
    color: #5a4037;
    white-space: nowrap;
    text-align: right;
}

.modal-detalle-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 28px;
    border-top: 2px solid #f5f1ed;
    flex-shrink: 0;
}

.modal-total-badge {
    flex: 1;
    font-size: 13px;
    color: #999;
    font-weight: 600;
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
        align-items: stretch;
    }

    .btn-primary {
        width: 100%;
    }

    .componentes-grid {
        grid-template-columns: 1fr;
    }
}
</style>
