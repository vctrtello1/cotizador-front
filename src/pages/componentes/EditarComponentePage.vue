<template>
    <div class="form-container">
        <!-- Header -->
        <div class="form-header">
            <div class="header-content">
                <h1 class="form-title">✏️ Editar Componente</h1>
                <p class="form-subtitle">Actualiza los detalles de este componente</p>
            </div>
        </div>

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

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando componente...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarComponente" class="form-content">
            <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    v-model="formData.nombre"
                    type="text"
                    id="nombre"
                    placeholder="Ej: Tablero MDF"
                    required
                />
                <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
            </div>

            <div class="form-group">
                <label for="codigo">Código</label>
                <input
                    v-model="formData.codigo"
                    type="text"
                    id="codigo"
                    placeholder="Ej: TAB_MDF_001"
                />
            </div>

            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea
                    v-model="formData.descripcion"
                    id="descripcion"
                    placeholder="Descripción detallada del componente"
                    rows="4"
                ></textarea>
            </div>


            <div class="form-actions">
                <button type="button" class="btn-secondary" @click="$router.back()">
                    <span>✕ Cancelar</span>
                </button>
                <button type="submit" class="btn-primary" :disabled="guardando">
                    <span v-if="guardando">⏳ Guardando...</span>
                    <span v-else>✓ Guardar Cambios</span>
                </button>
            </div>
        </form>

        <!-- Modal Materiales -->
        <div v-if="mostrarModalMateriales" class="modal-overlay" @click.self="mostrarModalMateriales = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">📋 Editar Materiales</h3>
                </div>
                <div class="modal-body">
                    <!-- Sección para agregar nuevo material -->
                    <div class="add-section">
                        <button 
                            type="button" 
                            class="btn-add-material"
                            @click="abrirSelectorMateriales()"
                        >+ Agregar Material</button>
                    </div>

                    <!-- Sección de materiales seleccionados -->
                    <div v-if="materialesDelComponente && materialesDelComponente.length > 0" class="selected-items">
                        <h4 class="items-subtitle">Materiales Seleccionados</h4>
                        <div class="items-grid">
                            <div v-for="material in materialesDelComponente" :key="material.id" class="selected-item-edit">
                                <div class="item-info">
                                    <div class="item-name">{{ material.material?.nombre }}</div>
                                    <div class="item-code">{{ material.material?.codigo }}</div>
                                    <div class="item-price">${{ formatCurrency(material.material?.costo_unitario) }}</div>
                                </div>
                                <div class="quantity-input-group">
                                    <label :for="`qty-material-${material.id}`">Cantidad (unidades)</label>
                                    <div class="quantity-controls">
                                        <button 
                                            type="button"
                                            class="btn-qty-control btn-qty-minus"
                                            @click="decrementarCantidad(material)"
                                            title="Disminuir"
                                        >−</button>
                                        <input 
                                            :id="`qty-material-${material.id}`"
                                            v-model.number="material.cantidad"
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="1"
                                            @blur="guardarCantidadMaterial(material)"
                                            @keyup.enter="guardarCantidadMaterial(material)"
                                            class="quantity-input"
                                        />
                                        <button 
                                            type="button"
                                            class="btn-qty-control btn-qty-plus"
                                            @click="incrementarCantidad(material)"
                                            title="Aumentar"
                                        >+</button>
                                    </div>
                                </div>
                                <button class="btn-remove" @click="removerMaterial(material.id)" title="Remover">×</button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-list">
                        <p>📭 No hay materiales seleccionados</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalMateriales = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Mano de Obra -->
        <div v-if="mostrarModalManoDeObra" class="modal-overlay" @click.self="mostrarModalManoDeObra = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">👷 Editar Mano de Obra</h3>
                </div>
                <div class="modal-body">
                    <div v-if="formData.mano_de_obra" class="selected-items">
                        <div class="selected-item-full">
                            <div class="item-info-full">
                                <div class="item-name">{{ formData.mano_de_obra.nombre }}</div>
                                <div class="item-code">{{ formData.mano_de_obra.descripcion }}</div>
                                <div class="info-row">
                                    <span class="info-label">Costo/hora:</span>
                                    <span class="info-value">${{ formatCurrency(formData.mano_de_obra.costo_hora) }}</span>
                                </div>
                            </div>
                            <div class="button-group-vertical">
                                <button class="btn-change-item" @click="abrirSelectorManoDeObra" title="Cambiar">🔄 Cambiar</button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="add-section">
                        <button type="button" class="btn-add-material" @click="abrirSelectorManoDeObra">
                            + Agregar Mano de Obra
                        </button>
                    </div>

                    <!-- Sección de Horas -->
                    <div v-if="formData.mano_de_obra && horaActual" class="selected-items">
                        <h4 class="items-subtitle">⏱️ Horas Asignadas</h4>
                        
                        <!-- Input de horas editable - solo el registro actual -->
                        <div class="quantity-input-group" style="margin: 15px 0;">
                            <label for="horas-input">Horas de Mano de Obra</label>
                            <div class="quantity-controls">
                                <button 
                                    type="button"
                                    class="btn-qty-control btn-qty-minus"
                                    @click="decrementarHora(0)"
                                    :disabled="guardandoHoras"
                                    title="Disminuir"
                                >−</button>
                                <input 
                                    id="horas-input"
                                    v-model.number="horaActual.horas"
                                    type="number"
                                    min="1"
                                    max="24"
                                    step="1"
                                    placeholder="1"
                                    @blur="guardarCambiosHoras"
                                    @keyup.enter="guardarCambiosHoras"
                                    class="quantity-input"
                                    :disabled="guardandoHoras"
                                />
                                <button 
                                    type="button"
                                    class="btn-qty-control btn-qty-plus"
                                    @click="incrementarHora(0)"
                                    :disabled="guardandoHoras"
                                    title="Aumentar"
                                >+</button>
                            </div>
                        </div>
                        
                        <!-- Resumen de horas -->
                        <div class="horas-summary">
                            <p class="horas-cost">
                                Total: <strong>{{ totalHoras }} horas</strong>
                            </p>
                            <p class="horas-cost">
                                Costo: <strong style="color: #059669;">${{ formatCurrency(calcularCostoManoDeObra()) }}</strong>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalManoDeObra = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Acabado -->
        <div v-if="mostrarModalAcabado" class="modal-overlay" @click.self="mostrarModalAcabado = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">🎨 Editar Acabado</h3>
                </div>
                <div class="modal-body">
                    <div v-if="formData.acabado" class="selected-items">
                        <div class="selected-item-full">
                            <div class="item-info-full">
                                <div class="item-name">{{ formData.acabado.nombre }}</div>
                                <div class="item-code">{{ formData.acabado.descripcion }}</div>
                                <div class="info-row">
                                    <span class="info-label">Costo:</span>
                                    <span class="info-value">${{ formatCurrency(formData.acabado.costo) }}</span>
                                </div>
                            </div>
                            <div class="button-group-vertical">
                                <button class="btn-change-item" @click="abrirSelectorAcabados" title="Cambiar">🔄 Cambiar</button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="add-section">
                        <button 
                            type="button" 
                            class="btn-add-material"
                            @click="abrirSelectorAcabados()"
                        >+ Agregar Acabado</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalAcabado = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Selector de Materiales -->
        <div v-if="mostrarSelectorMateriales" class="modal-overlay" @click.self="mostrarSelectorMateriales = false">
            <div class="modal-content modal-content-large">
                <div class="modal-header">
                    <h3 class="modal-title">📋 Seleccionar Materiales</h3>
                </div>
                <div class="modal-body">
                    <div class="search-section">
                        <input 
                            v-model="busquedaMaterial"
                            type="text"
                            class="search-input"
                            placeholder="🔍 Buscar material..."
                        />
                    </div>
                    <div class="materiales-grid">
                        <div 
                            v-for="material in materialesFiltrados"
                            :key="material.id"
                            class="material-card"
                            @click="agregarMaterial(material)"
                        >
                            <div class="card-header">
                                <div class="card-name">{{ material.nombre }}</div>
                                <div class="card-badge">{{ material.codigo }}</div>
                            </div>
                            <div class="card-body">
                                <p class="card-label">Precio Unitario</p>
                                <p class="card-price">${{ formatCurrency(material.costo_unitario || material.precio_unitario) }}</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn-select">+ Seleccionar</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="materialesFiltrados.length === 0" class="empty-list">
                        <p>📭 No hay materiales disponibles</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarSelectorMateriales = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Selector de Mano de Obra -->
        <div v-if="mostrarSelectorManoDeObra" class="modal-overlay" @click.self="mostrarSelectorManoDeObra = false">
            <div class="modal-content modal-content-large">
                <div class="modal-header">
                    <h3 class="modal-title">👷 Seleccionar Mano de Obra</h3>
                </div>
                <div class="modal-body">
                    <div class="search-section">
                        <input 
                            v-model="busquedaManoDeObra"
                            type="text"
                            class="search-input"
                            placeholder="🔍 Buscar mano de obra..."
                        />
                    </div>
                    <div class="materiales-grid">
                        <div 
                            v-for="manoDeObra in manoDeObraFiltrada"
                            :key="manoDeObra.id"
                            class="material-card"
                            :class="{ 'selected': formData.mano_de_obra?.id === manoDeObra.id }"
                            @click="agregarManoDeObra(manoDeObra)"
                        >
                            <div class="card-header">
                                <div class="card-name">{{ manoDeObra.nombre }}</div>
                                <div class="card-badge">{{ manoDeObra.codigo }}</div>
                            </div>
                            <div class="card-body">
                                <p class="card-label">Costo/Hora</p>
                                <p class="card-price">${{ formatCurrency(manoDeObra.costo_hora) }}</p>
                            </div>
                            <div class="card-footer">
                                <button v-if="formData.mano_de_obra?.id === manoDeObra.id" class="btn-select btn-select-active" disabled>✓ Seleccionado</button>
                                <button v-else class="btn-select">+ Seleccionar</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="manoDeObraFiltrada.length === 0" class="empty-list">
                        <p>📭 No hay mano de obra disponible</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarSelectorManoDeObra = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Selector de Acabados -->
        <div v-if="mostrarSelectorAcabados" class="modal-overlay" @click.self="mostrarSelectorAcabados = false">
            <div class="modal-content modal-content-large">
                <div class="modal-header">
                    <h3 class="modal-title">🎨 Seleccionar Acabados</h3>
                </div>
                <div class="modal-body">
                    <div class="search-section">
                        <input 
                            v-model="busquedaAcabado"
                            type="text"
                            class="search-input"
                            placeholder="🔍 Buscar acabado..."
                        />
                    </div>
                    <div class="materiales-grid">
                        <div 
                            v-for="acabado in acabadosFiltrados"
                            :key="acabado.id"
                            class="material-card"
                            :class="{ 'selected': formData.acabado?.id === acabado.id }"
                            @click="agregarAcabado(acabado)"
                        >
                            <div class="card-header">
                                <div class="card-name">{{ acabado.nombre }}</div>
                                <div class="card-badge">{{ acabado.codigo }}</div>
                            </div>
                            <div class="card-body">
                                <p class="card-label">Costo</p>
                                <p class="card-price">${{ formatCurrency(acabado.costo) }}</p>
                            </div>
                            <div class="card-footer">
                                <button v-if="formData.acabado?.id === acabado.id" class="btn-select btn-select-active" disabled>✓ Seleccionado</button>
                                <button v-else class="btn-select">+ Seleccionar</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="acabadosFiltrados.length === 0" class="empty-list">
                        <p>📭 No hay acabados disponibles</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarSelectorAcabados = false">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/http/apl';
import { getComponenteById } from '@/http/componentes-api';
import { useMaterialesPorComponente } from '@/stores/materiales-por-componente';
import { useMateriales } from '@/stores/materiales';
import { useManosDeObraStore } from '@/stores/mano-de-obra';

const router = useRouter();
const route = useRoute();
const storeMaterialesPorComponente = useMaterialesPorComponente();
const storeMateriales = useMateriales();
const storeManosDeObra = useManosDeObraStore();

// Estado
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    costo_unitario: '',
    materiales: [],
    mano_de_obra: null,
    acabado: null,
});

const errors = ref({});
const error = ref(null);
const mensaje = ref(null);
const tipoMensaje = ref(null); // 'success', 'error', 'warning'
const guardando = ref(false);
const guardandoHoras = ref(false);
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
const materialesDelComponente = ref([]);

// Modales
const mostrarModalMateriales = ref(false);
const mostrarModalManoDeObra = ref(false);
const mostrarModalAcabado = ref(false);
const mostrarSelectorMateriales = ref(false);

// Datos para seleccionar materiales
const materialesDisponibles = ref([]);
const busquedaMaterial = ref('');

// Total de horas calculado dinámicamente
const totalHoras = computed(() => {
    return horasManoDeObra.value.reduce((sum, h) => sum + (h.horas || 0), 0);
});

// Datos para seleccionar mano de obra
const manoDeObraDisponible = ref([]);
const busquedaManoDeObra = ref('');
const mostrarSelectorManoDeObra = ref(false);

// Datos para seleccionar acabados
const acabadosDisponibles = ref([]);
const busquedaAcabado = ref('');
const mostrarSelectorAcabados = ref(false);

const createDebouncedRef = (sourceRef, delay = 180) => {
    const debounced = ref(sourceRef.value);
    let timeoutId;

    watch(sourceRef, (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            debounced.value = value;
        }, delay);
    });

    return debounced;
};

const busquedaMaterialDebounced = createDebouncedRef(busquedaMaterial);
const busquedaManoDeObraDebounced = createDebouncedRef(busquedaManoDeObra);
const busquedaAcabadoDebounced = createDebouncedRef(busquedaAcabado);

// Horas de mano de obra por componente
const horasManoDeObra = ref([]);

// Cargar componente (placeholder - actualizar con API real)
const cargarComponente = async () => {
    try {
        cargando.value = true;
        const response = await getComponenteById(route.params.id);
        const data = response.data || response;
        
        // Mano de obra: puede venir como objeto completo o como ID
        let manoDeObraData = null;
        if (data.mano_de_obra_id) {
            // Si es un objeto, usarlo directamente; si es ID, cargar desde API
            if (typeof data.mano_de_obra_id === 'object' && data.mano_de_obra_id.id) {
                manoDeObraData = data.mano_de_obra_id;
            } else if (typeof data.mano_de_obra_id === 'number' || typeof data.mano_de_obra_id === 'string') {
                manoDeObraData = await storeManosDeObra.getManosDeObraByIdStore(data.mano_de_obra_id);
            }
        }
        
        formData.value = {
            nombre: data.nombre || '',
            codigo: data.codigo || '',
            descripcion: data.descripcion || '',
            costo_unitario: data.costo_unitario || data.costo_total || '',
            materiales: data.materiales || [],
            mano_de_obra: manoDeObraData || null,
            acabado: data.acabado_id || null,
        };
        
        // Cargar catálogos relacionados en paralelo
        await cargarMaterialesPorComponente();
    } catch (err) {
        error.value = 'Error al cargar el componente';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Cargar materiales por componente
const cargarMaterialesPorComponente = async () => {
    try {
        // Cargar todos los materiales y sus relaciones con el componente
        await storeMateriales.fetchMaterialesAction();
        await storeMaterialesPorComponente.fetchMaterialesPorComponenteAction();
        
        // Filtrar y enriquecer con datos del material
        const componenteId = parseInt(route.params.id);
        const materialesRelacion = storeMaterialesPorComponente.getMaterialesPorComponente(componenteId);
        
        materialesDelComponente.value = materialesRelacion.map(rel => ({
            ...rel,
            material: storeMateriales.materiales.find(m => m.id === rel.material_id) || {}
        }));
    } catch (err) {
        console.error('Error cargando materiales por componente:', err);
    }
};

// Cargar horas de mano de obra por componente
const cargarHorasManoDeObra = async () => {
    try {
        if (formData.value.mano_de_obra?.id) {
            horasManoDeObra.value = [{
                componente_id: parseInt(route.params.id),
                mano_de_obra_id: formData.value.mano_de_obra.id,
                horas: Math.max(1, Math.floor(horaActual.value?.horas || 1))
            }];
        } else {
            horasManoDeObra.value = [];
        }
    } catch (err) {
        console.error('Error cargando horas de mano de obra:', err);
        horasManoDeObra.value = [];
    }
};

// Calcular costo total de mano de obra
const calcularCostoManoDeObra = () => {
    if (!formData.value.mano_de_obra || horasManoDeObra.value.length === 0) {
        return 0;
    }
    
    const totalHoras = horasManoDeObra.value.reduce((sum, h) => sum + (h.horas || 0), 0);
    const costoHora = parseFloat(formData.value.mano_de_obra.costo_hora) || 0;
    
    return totalHoras * costoHora;
};

// Formatear moneda
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const removerMaterial = async (materialId) => {
    try {
        // Encontrar el registro de material-por-componente para este material
        const materialComp = materialesDelComponente.value.find(m => m.id === materialId);
        
        if (materialComp && materialComp.id) {
            // Eliminar del backend
            await storeMaterialesPorComponente.eliminarMaterialPorComponenteAction(materialComp.id);
            
            // Actualizar lista local
            materialesDelComponente.value = materialesDelComponente.value.filter(m => m.id !== materialComp.id);
            mostrarMensaje('✅ Material eliminado', 'success', 2000);
        }
    } catch (err) {
        console.error('Error eliminando material:', err);
        mostrarMensaje('❌ Error al eliminar material', 'error', 3000);
    }
};
// Computed para obtener el registro de horas de la mano de obra actual
const horaActual = computed(() => {
    const manoDeObraId = formData.value.mano_de_obra?.id;
    if (!manoDeObraId) return null;
    return horasManoDeObra.value.find(h => h.mano_de_obra_id === manoDeObraId) || null;
});

// Funciones para editar horas de mano de obra
const guardarCambiosHoras = async () => {
    if (guardandoHoras.value) return; // Evitar guardados simultáneos
    
    guardandoHoras.value = true;
    try {
        // Filtrar para obtener el registro de la mano de obra ACTUAL
        const manoDeObraId = formData.value.mano_de_obra?.id;
        console.log('🔍 Buscando registro para mano_de_obra_id:', manoDeObraId);

        // Encontrar el registro que corresponde a la mano de obra actual
        const hora = horasManoDeObra.value.find(h => h.mano_de_obra_id === manoDeObraId);
        console.log('✅ Registro encontrado:', hora);

        if (!hora) {
            console.log('❌ No hay registro para esta mano de obra');
            guardandoHoras.value = false;
            return;
        }

        const horas = Math.floor(hora.horas || 0);
        
        // Validar que no exceda 24 horas
        if (horas > 24) {
            mostrarMensaje('⏰ El máximo permitido es 24 horas por componente', 'warning', 3000);
            hora.horas = 24; // Resetear a 24
            guardandoHoras.value = false;
            return;
        }

        // Si horas es 0, establecer a 1
        const horasFinales = horas === 0 ? 1 : horas;
        hora.horas = horasFinales; // Actualizar el estado local también
        
        const datosHora = {
            componente_id: parseInt(route.params.id),
            mano_de_obra_id: manoDeObraId,
            horas: horasFinales
        };

        console.log('📝 Datos a enviar:', datosHora);

        hora.componente_id = datosHora.componente_id;
        hora.mano_de_obra_id = datosHora.mano_de_obra_id;
        hora.horas = datosHora.horas;
        console.log('✅ Horas guardadas correctamente');
    } catch (err) {
        console.error('Error guardando horas:', err);
    } finally {
        guardandoHoras.value = false;
    }
};

// Incrementar horas de la mano de obra actual
const incrementarHora = async (index) => {
    // Encontrar el registro de la mano de obra actual
    const manoDeObraId = formData.value.mano_de_obra?.id;
    const hora = horasManoDeObra.value.find(h => h.mano_de_obra_id === manoDeObraId);
    
    if (hora) {
        // Verificar si excedería las 24 horas
        const totalActual = totalHoras.value;
        if (totalActual >= 24) {
            mostrarMensaje('⏰ Ya has asignado el máximo de 24 horas permitidas', 'warning', 3000);
            return;
        }
        
        hora.horas = Math.floor((hora.horas || 0)) + 1;
        console.log(`✅ Horas incrementadas:`, hora.horas);
        await guardarCambiosHoras();
    }
};

// Decrementar horas de la mano de obra actual
const decrementarHora = async (index) => {
    // Encontrar el registro de la mano de obra actual
    const manoDeObraId = formData.value.mano_de_obra?.id;
    const hora = horasManoDeObra.value.find(h => h.mano_de_obra_id === manoDeObraId);
    
    if (hora) {
        const nuevasHoras = Math.max(0, (hora.horas || 0) - 1);
        hora.horas = nuevasHoras;
        console.log(`✅ Horas decrementadas:`, hora.horas);
        await guardarCambiosHoras();
    }
};

// Incrementar cantidad de material
const incrementarCantidad = (item) => {
    if (item && typeof item.cantidad === 'number') {
        item.cantidad = Math.floor(item.cantidad) + 1;
    } else if (item) {
        item.cantidad = 2;
    }
    if (item && item.material_id) {
        guardarCantidadMaterial(item);
    }
};

// Decrementar cantidad de material
const decrementarCantidad = (item) => {
    if (item && typeof item.cantidad === 'number' && item.cantidad > 1) {
        item.cantidad = Math.max(1, Math.floor(item.cantidad) - 1);
    }
    if (item && item.material_id) {
        guardarCantidadMaterial(item);
    }
};

const guardarCantidadMaterial = async (item) => {
    if (!item || !item.id) return;
    
    const cantidadFinal = Math.round(item.cantidad || 1);
    const maxCantidad = 50;
    
    if (cantidadFinal > maxCantidad) {
        mostrarMensaje(`📦 La cantidad máxima permitida es ${maxCantidad} unidades`, 'warning', 3000);
        item.cantidad = maxCantidad;
        return;
    }
    
    item.cantidad = cantidadFinal;
    
    try {
        const itemComp = materialesDelComponente.value.find(i => i.id === item.id);
        if (!itemComp?.id) return;

        await storeMaterialesPorComponente.actualizarMaterialPorComponenteAction(itemComp.id, { cantidad: cantidadFinal });
    } catch (err) {
        console.error('Error guardando cantidad de material:', err);
        mostrarMensaje('❌ Error al actualizar cantidad de material', 'error', 3000);
    }
};

// Cargar catálogos de forma genérica
const cargarCatalogo = async (endpoint, targetRef) => {
    try {
        const response = await api.get(endpoint);
        const data = response.data.data || response.data || [];
        targetRef.value = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error(`Error cargando ${endpoint}:`, err);
        targetRef.value = [];
    }
};

// Abrir selectores genérico
const abrirSelector = async (endpoint, catalogRef, showRef) => {
    await cargarCatalogo(endpoint, catalogRef);
    showRef.value = true;
};

const abrirSelectorMateriales = () => abrirSelector('/materiales', materialesDisponibles, mostrarSelectorMateriales);

// Helper para filtrar por búsqueda y por items existentes
const filtrarCatalogo = (catalog, busqueda, itemsExistentes) => {
    // itemsExistentes puede ser un array de objetos o un array de IDs
    const existentesIds = new Set(Array.isArray(itemsExistentes) 
        ? itemsExistentes.map(item => typeof item === 'object' ? item.id : item)
        : []);
    
    const filtrados = catalog.filter(item => !existentesIds.has(item.id));
    
    if (!busqueda.trim()) return filtrados;
    
    const busquedaLower = busqueda.toLowerCase();
    return filtrados.filter(item => 
        item.nombre.toLowerCase().includes(busquedaLower) ||
        item.codigo.toLowerCase().includes(busquedaLower)
    );
};

// Computed properties para filtros
const materialesFiltrados = computed(() => {
    const materialesAgregados = materialesDelComponente.value.map(m => m.material_id);
    return filtrarCatalogo(materialesDisponibles.value, busquedaMaterialDebounced.value, materialesAgregados);
});

// Métodos simplificados
const agregarMaterial = async (material) => {
    try {
        if (!material || !material.id) return;
        
        const yaExiste = materialesDelComponente.value.some(m => m.material_id === material.id);
        if (yaExiste) {
            mostrarMensaje('⚠️ Este material ya está agregado', 'warning', 2000);
            return;
        }
        
        const resultado = await storeMaterialesPorComponente.crearMaterialPorComponenteAction({
            componente_id: parseInt(route.params.id),
            material_id: material.id,
            cantidad: 1
        });
        
        const datosResultado = resultado.data || resultado;
        materialesDelComponente.value.push({
            id: datosResultado.id,
            componente_id: datosResultado.componente_id,
            material_id: datosResultado.material_id,
            cantidad: datosResultado.cantidad,
            created_at: datosResultado.created_at,
            material: { ...material }
        });
        
        mostrarMensaje('✅ Material agregado', 'success', 2000);
        mostrarSelectorMateriales.value = false;
        busquedaMaterial.value = '';
    } catch (err) {
        console.error('Error agregando material:', err);
        mostrarMensaje('❌ Error al agregar material', 'error', 3000);
    }
};

// Cargar acabados disponibles
const cargarAcabados = async () => {
    try {
        const response = await api.get('/acabados');
        const data = response.data.data || response.data || [];
        acabadosDisponibles.value = Array.isArray(data) ? data : [];
        console.log('Acabados disponibles:', acabadosDisponibles.value);
    } catch (err) {
        console.error('Error al cargar acabados:', err);
        acabadosDisponibles.value = [];
    }
};

// Cargar mano de obra disponible
const cargarManoDeObraDisponible = async () => {
    try {
        const response = await api.get('/mano-de-obras');
        const data = response.data.data || response.data || [];
        manoDeObraDisponible.value = Array.isArray(data) ? data : [];
        console.log('Mano de obra disponible:', manoDeObraDisponible.value);
    } catch (err) {
        console.error('Error al cargar mano de obra:', err);
        manoDeObraDisponible.value = [];
    }
};

// Abrir selector de mano de obra
const abrirSelectorManoDeObra = async () => {
    await cargarManoDeObraDisponible();
    mostrarSelectorManoDeObra.value = true;
};

// Agregar mano de obra seleccionada
// Limpiar horas de la mano de obra anterior antes de cambiar
const limpiarHorasManoDeObraAnterior = () => {
    // Solo limpiar el array local, sin intentar guardar en la API
    // (El backend no acepta horas = 0)
    horasManoDeObra.value = [];
};

const agregarManoDeObra = async (manoDeObra) => {
    if (!manoDeObra) return;
    
    try {
        console.log('📝 Seleccionando mano de obra:', manoDeObra.nombre);
        
        // Preparar datos para enviar al servidor
        const datos = {
            nombre: formData.value.nombre.trim(),
            codigo: formData.value.codigo.trim(),
            descripcion: formData.value.descripcion.trim(),
            costo_unitario: parseFloat(formData.value.costo_unitario),
            mano_de_obra_id: manoDeObra.id,
        };
        
        // Agregar acabado_id si existe
        if (formData.value.acabado && formData.value.acabado.id) {
            datos.acabado_id = formData.value.acabado.id;
        }
        
        console.log('📤 1️⃣ Guardando cambio de mano de obra en el servidor...');
        console.log('   Datos:', datos);

        const response = await api.put(`/componentes/${route.params.id}`, datos);
        console.log('✅ 1️⃣ Respuesta del servidor - cambio guardado:', response);
        
        // Solo si el servidor confirmó, actualizar el estado local
        console.log('📝 2️⃣ Actualizando mano de obra en el estado local...');
        
        // Limpiar horas de la mano de obra anterior
        if (formData.value.mano_de_obra && formData.value.mano_de_obra.id !== manoDeObra.id) {
            console.log('   Limpiando horas de mano de obra anterior');
            limpiarHorasManoDeObraAnterior();
        }
        
        // Actualizar mano de obra en el estado local
        formData.value.mano_de_obra = {
            ...manoDeObra
        };
        console.log('✅ 2️⃣ Mano de obra actualizada en estado local');
        
        console.log('📋 3️⃣ Reiniciando horas en estado local...');
        await cargarHorasManoDeObra();
        console.log('✅ 3️⃣ Horas reiniciadas:', horasManoDeObra.value.length);
        
        // Cerrar modal y limpiar búsqueda
        console.log('🚪 5️⃣ Cerrando modal...');
        mostrarSelectorManoDeObra.value = false;
        busquedaManoDeObra.value = '';
        console.log('✅ 5️⃣ Modal cerrado');
        
        console.log('🎉 Mano de obra actualizada exitosamente');
    } catch (err) {
        console.error('❌ Error al guardar cambio de mano de obra:', err);
        console.error('   Status:', err.response?.status);
        console.error('   Data:', err.response?.data);
        error.value = 'Error al cambiar la mano de obra: ' + (err.response?.data?.message || err.message);
        console.log('📌 Modal se mantiene abierto para que puedas reintentar');
    }
};

// Filtrar mano de obra disponible
const manoDeObraFiltrada = computed(() => {
    if (busquedaManoDeObraDebounced.value.trim()) {
        const busqueda = busquedaManoDeObraDebounced.value.toLowerCase();
        return manoDeObraDisponible.value.filter(m => 
            m.nombre.toLowerCase().includes(busqueda) ||
            (m.codigo && m.codigo.toLowerCase().includes(busqueda))
        );
    }
    return manoDeObraDisponible.value;
});

// Abrir selector de acabados
const abrirSelectorAcabados = async () => {
    await cargarAcabados();
    mostrarSelectorAcabados.value = true;
};

// Agregar acabado seleccionado
const agregarAcabado = (acabado) => {
    if (acabado) {
        formData.value.acabado = {
            ...acabado
        };
        mostrarSelectorAcabados.value = false;
        busquedaAcabado.value = '';
    }
};

// Filtrar acabados disponibles
const acabadosFiltrados = computed(() => {
    if (busquedaAcabadoDebounced.value.trim()) {
        const busqueda = busquedaAcabadoDebounced.value.toLowerCase();
        return acabadosDisponibles.value.filter(a => 
            a.nombre.toLowerCase().includes(busqueda) ||
            a.codigo.toLowerCase().includes(busqueda)
        );
    }
    
    return acabadosDisponibles.value;
});

// Validar formulario
const validar = () => {
    errors.value = {};
    
    if (!formData.value.nombre.trim()) {
        errors.value.nombre = 'El nombre es requerido';
    }
    
    if (formData.value.costo_unitario === '' || formData.value.costo_unitario <= 0) {
        errors.value.costo_unitario = 'El costo unitario debe ser mayor a 0';
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
            costo_unitario: parseFloat(formData.value.costo_unitario),
        };
        
        // Agregar mano_de_obra_id si existe
        if (formData.value.mano_de_obra && formData.value.mano_de_obra.id) {
            datos.mano_de_obra_id = formData.value.mano_de_obra.id;
        }
        
        // Agregar acabado_id si existe
        if (formData.value.acabado && formData.value.acabado.id) {
            datos.acabado_id = formData.value.acabado.id;
        }
        
        console.log('Guardando cambios del componente:', datos);

        await api.put(`/componentes/${route.params.id}`, datos);
        
        console.log('✅ Componente actualizado correctamente');
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
    await cargarHorasManoDeObra();
});
</script>

<style scoped>
.form-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    min-height: 100vh;
}

.form-header {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid #d4a574;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.form-subtitle {
    font-size: 0.95rem;
    color: #8b7355;
    margin: 0;
    font-weight: 500;
}

.error-message {
    padding: 1.2rem 1.5rem;
    margin-bottom: 1.5rem;
    background-color: #ffebee;
    color: #c62828;
    border: 2px solid #ef5350;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
}

.error-close {
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
}

.error-close:hover {
    opacity: 0.7;
}

/* Mensaje personalizado */
.custom-message {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    animation: slideDown 0.3s ease-out;
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 500px;
    z-index: 2000;
    margin: 0;
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

.loading-state {
    text-align: center;
    padding: 4rem 2rem;
    background-color: white;
    border-radius: 12px;
    color: #999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-state p {
    font-size: 1.1rem;
    margin: 0;
    color: #8b7355;
}

.form-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede6dd;
}

.form-group {
    margin-bottom: 1.8rem;
}

.form-group:last-of-type {
    margin-bottom: 2.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: #5a4037;
    font-size: 0.95rem;
    letter-spacing: 0.4px;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #d4a574;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
    transition: all 0.3s;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    color: #5a4037;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
    color: #d4a574;
    opacity: 0.6;
}

.form-group input:hover,
.form-group textarea:hover {
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
    border-color: #c89564;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    background: white;
    border-color: #c89564;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
}

.error-text {
    display: block;
    color: #c62828;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
}

.btn-primary,
.btn-secondary {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.btn-primary {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(158, 158, 158, 0.2);
}

.btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(158, 158, 158, 0.3);
}

/* Modal Styles */
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
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
    from {
        background: rgba(0, 0, 0, 0);
    }
    to {
        background: rgba(0, 0, 0, 0.6);
    }
}

.modal-content {
    background: white;
    border-radius: 14px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-content-large {
    max-width: 650px;
}

.modal-header {
    padding: 24px 28px;
    border-bottom: 2px solid #e8ddd7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-radius: 14px 14px 0 0;
}

.modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
    letter-spacing: 0.3px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 6px;
}

.modal-close:hover {
    background: #f5f1ed;
    color: #5a4037;
    transform: rotate(90deg);
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
}

.selected-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.items-subtitle {
    font-size: 14px;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.items-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

.selected-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 6px;
    gap: 12px;
}

.selected-item-edit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 18px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 8px;
    gap: 16px;
    flex-wrap: wrap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.08);
}

.selected-item-edit:hover {
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.15);
    transform: translateY(-2px);
    border-left-color: #c89564;
}

.quantity-input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    position: relative;
}

.quantity-input-group label {
    font-size: 11px;
    font-weight: 700;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.quantity-input {
    width: 70px;
    padding: 10px 12px;
    border: 2px solid #d4a574;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    color: #5a4037;
    text-align: center;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.1);
}

.quantity-input:hover {
    border-color: #c89564;
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
    box-shadow: 0 4px 8px rgba(212, 165, 116, 0.15);
    transform: translateY(-1px);
}

.quantity-input:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.3);
    background: white;
    transform: translateY(-2px);
}

.quantity-input::placeholder {
    color: #d4a574;
    opacity: 0.5;
}

/* Controles de cantidad con botones +/- */
.quantity-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-radius: 8px;
    padding: 4px;
    border: 2px solid #e8ddd7;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quantity-controls:hover {
    border-color: #d4a574;
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
    box-shadow: 0 4px 8px rgba(212, 165, 116, 0.1);
}

.btn-qty-control {
    width: 32px;
    height: 32px;
    border: 2px solid #d4a574;
    border-radius: 6px;
    background: white;
    color: #5a4037;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.08);
}

.btn-qty-control:hover {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border-color: #c89564;
    transform: scale(1.08);
    box-shadow: 0 4px 8px rgba(212, 165, 116, 0.2);
}

.btn-qty-control:active {
    transform: scale(0.95);
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.1);
}

.btn-qty-minus:hover {
    background: linear-gradient(135deg, #ff9999 0%, #ff8888 100%);
    border-color: #c62828;
}

.btn-qty-plus:hover {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    border-color: #2e7d32;
}

.item-info {
    flex: 1;
}

.item-name {
    font-weight: 700;
    color: #5a4037;
    font-size: 14px;
    margin-bottom: 4px;
}

.item-code {
    font-size: 12px;
    color: #8b7355;
    margin-bottom: 4px;
}

.item-price {
    font-size: 13px;
    color: #d4a574;
    font-weight: 600;
}

.btn-remove {
    background: linear-gradient(135deg, #ffebee 0%, #ffdddd 100%);
    color: #c62828;
    border: 2px solid #c62828;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(198, 40, 40, 0.1);
}

.btn-remove:hover {
    background: linear-gradient(135deg, #ff9999 0%, #ff8888 100%);
    color: white;
    border-color: #a01010;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(198, 40, 40, 0.25);
}

.btn-remove:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(198, 40, 40, 0.15);
}

.horas-summary {
    margin-top: 16px;
    padding: 14px 16px;
    background: linear-gradient(135deg, #f0f4f8 0%, #f8fafc 100%);
    border-left: 4px solid #059669;
    border-radius: 6px;
}

.horas-counter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 18px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 8px;
    gap: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.08);
}

.horas-counter:hover {
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.15);
    transform: translateY(-2px);
    border-left-color: #c89564;
}

.counter-info {
    flex: 1;
}

.counter-label {
    font-size: 11px;
    font-weight: 700;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 6px;
}

.counter-value {
    font-size: 24px;
    font-weight: 700;
    color: #5a4037;
}

.horas-total {
    font-size: 13px;
    font-weight: 600;
    color: #5a4037;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.horas-cost {
    font-size: 13px;
    font-weight: 600;
    color: #5a4037;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.add-section {
    margin-bottom: 28px;
    padding: 18px 0;
    border-bottom: 2px solid #e8ddd7;
}

.btn-add-material {
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.3px;
}

.btn-add-material:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
}

.btn-add-material:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(212, 165, 116, 0.3);
}

.select-bar {
    display: flex;
    gap: 12px;
    align-items: center;
}

.material-select {
    flex: 1;
    padding: 12px;
    border: 2px solid #e0d5c7;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    color: #5a4037;
    background: white;
    cursor: pointer;
    transition: all 0.3s;
    appearance: none;
    padding-right: 32px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23d4a574' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
}

.material-select:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
    background-color: #fff9f0;
}

.material-select:disabled {
    background-color: #f0f0f0;
    color: #8b7355;
    cursor: not-allowed;
}

.btn-add {
    background: #d4a574;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-add:hover:not(:disabled) {
    background: #c89564;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.3);
}

.btn-add:active:not(:disabled) {
    transform: translateY(0);
}

.btn-add:disabled {
    background: #c0a589;
    cursor: not-allowed;
    opacity: 0.6;
}

.search-bar {
    margin-bottom: 16px;
}

.search-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0d5c7;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.3s;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
    background: #fff9f0;
}

.available-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 8px;
    background: #f5f1ed;
    border-radius: 6px;
}

.available-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: white;
    border: 1px solid #e0d5c7;
    border-radius: 4px;
    transition: all 0.3s;
    gap: 12px;
}

.available-item:hover {
    background: #fff9f0;
    border-color: #d4a574;
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.2);
}

.empty-search {
    padding: 24px;
    text-align: center;
    color: #8b7355;
    font-size: 14px;
    background: #f5f1ed;
    border-radius: 6px;
}

.selected-item-full {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 6px;
    gap: 16px;
}

.item-info-full {
    flex: 1;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e8ddd7;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-weight: 600;
    color: #8b7355;
    font-size: 13px;
}

.info-value {
    font-weight: 700;
    color: #d4a574;
    font-size: 14px;
}

.btn-remove-large {
    padding: 8px 12px;
    background: #ffebee;
    color: #c62828;
    border: 1px solid #c62828;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    white-space: nowrap;
}

.btn-remove-large:hover {
    background: #ff9999;
    color: white;
}

.btn-change-item {
    padding: 8px 12px;
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #1976d2;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    white-space: nowrap;
    width: 100%;
}

.btn-change-item:hover {
    background: #90caf9;
    color: white;
}

.empty-list {
    text-align: center;
    padding: 32px 24px;
    color: #999;
}

.empty-list p {
    margin: 0;
    font-size: 16px;
}

/* Estilos para edición de mano de obra */
.edit-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group-small {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group-small label {
    font-size: 12px;
    font-weight: 700;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.form-input-small {
    padding: 10px 12px;
    border: 2px solid #d4a574;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    color: #5a4037;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
}

.form-input-small:hover {
    border-color: #c89564;
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
}

.form-input-small:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.2);
    background: white;
}

.form-input-small::placeholder {
    color: #d4a574;
    opacity: 0.5;
}

.button-group-vertical {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.button-group-horizontal {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.btn-edit-item {
    padding: 10px 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.15);
}

.btn-edit-item:hover {
    background: linear-gradient(135deg, #c89564 0%, #b88454 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.25);
}

.btn-save {
    flex: 1;
    padding: 12px 16px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.15);
}

.btn-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
}

.btn-cancel {
    flex: 1;
    padding: 12px 16px;
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(158, 158, 158, 0.15);
}

.btn-cancel:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(158, 158, 158, 0.25);
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e8ddd7;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background: #faf7f2;
}

/* Estilos para el modal de selección de materiales */
.modal-content-large {
    max-width: 700px;
    max-height: 85vh;
}

.search-section {
    margin-bottom: 24px;
}

.search-input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e0d5c7;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.3s;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
}

.search-input::placeholder {
    color: #d4a574;
    opacity: 0.6;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
    background: white;
}

.materiales-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
}

.material-card {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.08);
}

.material-card.selected {
    border: 3px solid #4CAF50;
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2), 0 12px 30px rgba(76, 175, 80, 0.35);
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.04) 100%);
    transform: scale(1.02);
    position: relative;
}

.material-card.selected::before {
    content: '✓';
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    z-index: 10;
}

.material-card:hover {
    border-color: #d4a574;
    box-shadow: 0 8px 20px rgba(212, 165, 116, 0.25);
    transform: translateY(-4px);
}

.material-card.selected:hover {
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15), 0 8px 20px rgba(76, 175, 80, 0.3);
}

.card-header {
    padding: 18px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    border-bottom: 2px solid #e8ddd7;
}

.card-name {
    font-weight: 700;
    color: #5a4037;
    font-size: 15px;
    margin-bottom: 8px;
    line-height: 1.4;
}

.card-badge {
    display: inline-block;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 5px 12px;
    border-radius: 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.2);
}

.card-body {
    padding: 18px;
    flex: 1;
}

.card-label {
    font-size: 12px;
    color: #8b7355;
    margin: 0 0 6px 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.card-price {
    font-size: 24px;
    font-weight: 700;
    color: #d4a574;
    margin: 0;
}

.card-footer {
    padding: 14px 18px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    border-top: 2px solid #e8ddd7;
}

.btn-select {
    width: 100%;
    padding: 12px 16px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.15);
    letter-spacing: 0.3px;
}

.btn-select:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-select:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.15);
}

.btn-select-active {
    background: linear-gradient(135deg, #388E3C 0%, #2E7D32 100%);
    cursor: default;
}

.btn-select-active:disabled {
    opacity: 1;
}

.btn-add-material {
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 0;
}

.btn-add-material:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-add-material:active {
    transform: translateY(0);
}
</style>
