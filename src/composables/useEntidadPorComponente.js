import { ref, computed } from 'vue';

/**
 * Composable genérico para gestionar entidades relacionadas con un componente.
 * Elimina la duplicación entre tableros, estructuras, cubre cantos, etc.
 *
 * @param {Object} config
 * @param {string} config.label - Nombre singular (e.g. "Tablero")
 * @param {string} config.primaryIdField - Campo ID principal (e.g. "tablero_id")
 * @param {string} config.alternateIdField - Campo ID alternativo (e.g. "acabado_tablero_id")
 * @param {string[]} config.nestedKeys - Claves anidadas para buscar el objeto (e.g. ["tablero", "acabado_tablero"])
 * @param {string[]} config.idAccessors - Claves para extraer ID del registro (e.g. ["tablero_id", "tableroId"])
 * @param {string[]} config.costFields - Campos de costo en orden de prioridad (e.g. ["costo_unitario", "costo"])
 * @param {import('vue').Ref} config.disponiblesMap - Map reactivo id → objeto del catálogo
 * @param {Object} config.store - Store Pinia con métodos CRUD
 * @param {string} config.storeCrear - Nombre del método crear en el store
 * @param {string} config.storeActualizar - Nombre del método actualizar en el store
 * @param {string} config.storeEliminar - Nombre del método eliminar en el store
 * @param {string} config.storeFetch - Nombre del método fetch en el store
 * @param {import('vue').Ref} config.componenteId - ID del componente (computed)
 * @param {Function} config.mostrarMensaje - Función para mostrar mensajes
 */
export function useEntidadPorComponente(config) {
    const {
        label,
        primaryIdField,
        alternateIdField,
        nestedKeys = [],
        idAccessors = [],
        costFields = ['costo_unitario', 'costo'],
        disponiblesMap,
        store,
        storeCrear,
        storeActualizar,
        storeEliminar,
        storeFetch,
        componenteId,
        mostrarMensaje,
    } = config;

    // State
    const items = ref([]);
    const campoIdRelacion = ref(primaryIdField);
    const mostrarModal = ref(false);
    const mostrarSelector = ref(false);
    const busqueda = ref('');

    // --- Helpers ---
    const obtenerId = (registro) => {
        for (const key of idAccessors) {
            if (key.includes('.')) {
                const [obj, prop] = key.split('.');
                if (registro?.[obj]?.[prop] != null) return registro[obj][prop];
            } else {
                if (registro?.[key] != null) return registro[key];
            }
        }
        return null;
    };

    const obtenerEntidadAnidada = (registro, id) => {
        for (const key of nestedKeys) {
            if (registro?.[key]) return registro[key];
        }
        return disponiblesMap.value?.get(id) || null;
    };

    const normalizar = (registro) => {
        const id = obtenerId(registro);
        const entidad = obtenerEntidadAnidada(registro, id) || {};
        return {
            ...registro,
            [primaryIdField]: id,
            cantidad: Number(registro?.cantidad || 1),
            [nestedKeys[0]]: entidad,
        };
    };

    const obtenerNombre = (registro) => {
        const id = obtenerId(registro);
        const entidad = obtenerEntidadAnidada(registro, id);
        return entidad?.nombre || `${label} #${id || 'N/A'}`;
    };

    const obtenerCodigo = (registro) => {
        const id = obtenerId(registro);
        const entidad = obtenerEntidadAnidada(registro, id);
        return entidad?.codigo || '—';
    };

    const obtenerCostoUnitario = (registro) => {
        const id = obtenerId(registro);
        const entidad = obtenerEntidadAnidada(registro, id);
        if (!entidad) return 0;
        for (const field of costFields) {
            if (entidad[field] != null) {
                const val = Number(entidad[field]);
                if (!isNaN(val)) return val;
            }
        }
        return 0;
    };

    const obtenerSubtotal = (registro) => {
        const cantidad = Number(registro?.cantidad || 0) || 0;
        return obtenerCostoUnitario(registro) * cantidad;
    };

    // --- Computed ---
    const itemsOrdenados = computed(() => {
        return [...items.value].sort((a, b) =>
            obtenerNombre(a).localeCompare(obtenerNombre(b), 'es', { sensitivity: 'base' })
        );
    });

    const totalCantidad = computed(() => {
        return items.value.reduce((sum, item) => sum + (Number(item?.cantidad || 0) || 0), 0);
    });

    const totalCosto = computed(() => {
        return items.value.reduce((sum, item) => sum + obtenerSubtotal(item), 0);
    });

    // --- Carga ---
    const cargar = async (precargarCatalogo) => {
        try {
            if (precargarCatalogo) await precargarCatalogo();

            const response = await store[storeFetch]();
            const data = Array.isArray(response) ? response : [];

            // Auto-detectar campo ID si hay datos
            if (alternateIdField) {
                const primerRegistro = data[0] || null;
                if (primerRegistro?.[alternateIdField] !== undefined) {
                    campoIdRelacion.value = alternateIdField;
                }
            }

            items.value = data
                .filter(item => Number(item?.componente_id) === componenteId.value)
                .map(normalizar);
        } catch (err) {
            console.error(`Error cargando ${label.toLowerCase()}s por componente:`, err);
            items.value = [];
        }
    };

    // --- CRUD ---
    const agregar = async (entidad) => {
        try {
            if (!entidad?.id) return;

            const yaExiste = items.value.some(i => obtenerId(i) === entidad.id);
            if (yaExiste) {
                mostrarMensaje(`⚠️ Este ${label.toLowerCase()} ya está agregado`, 'warning', 2000);
                return;
            }

            const payload = {
                componente_id: componenteId.value,
                [campoIdRelacion.value]: entidad.id,
                cantidad: 1,
            };

            let resultado;
            try {
                resultado = await store[storeCrear](payload);
            } catch (err) {
                // Intentar con campo alternativo si falla
                if (alternateIdField && campoIdRelacion.value === primaryIdField) {
                    campoIdRelacion.value = alternateIdField;
                    payload[alternateIdField] = entidad.id;
                    delete payload[primaryIdField];
                    resultado = await store[storeCrear](payload);
                } else {
                    throw err;
                }
            }

            const datosResultado = normalizar(resultado?.data || resultado || {});
            items.value.push({
                ...datosResultado,
                [primaryIdField]: entidad.id,
                cantidad: Number(datosResultado.cantidad || 1),
                [nestedKeys[0]]: { ...entidad },
            });

            mostrarMensaje(`✅ ${label} agregado`, 'success', 2000);
            mostrarSelector.value = false;
            busqueda.value = '';
        } catch (err) {
            console.error(`Error agregando ${label.toLowerCase()}:`, err);
            mostrarMensaje(`❌ Error al agregar ${label.toLowerCase()}`, 'error', 3000);
        }
    };

    const guardarCantidad = async (item) => {
        if (!item?.id) return;
        const cantidadFinal = Math.round(item.cantidad || 1);
        if (cantidadFinal < 1) { item.cantidad = 1; return; }
        item.cantidad = cantidadFinal;

        try {
            await store[storeActualizar](item.id, { cantidad: cantidadFinal });
        } catch (err) {
            console.error(`Error guardando cantidad de ${label.toLowerCase()}:`, err);
            mostrarMensaje(`❌ Error al actualizar cantidad`, 'error', 3000);
        }
    };

    const incrementarCantidad = (item) => {
        if (!item) return;
        item.cantidad = Math.floor(item.cantidad || 1) + 1;
        guardarCantidad(item);
    };

    const decrementarCantidad = (item) => {
        if (!item?.cantidad || item.cantidad <= 1) return;
        item.cantidad = Math.max(1, Math.floor(item.cantidad) - 1);
        guardarCantidad(item);
    };

    const remover = async (relacionId) => {
        try {
            const rel = items.value.find(i => i.id === relacionId);
            if (!rel?.id) return;

            await store[storeEliminar](rel.id);
            items.value = items.value.filter(i => i.id !== rel.id);
            mostrarMensaje(`✅ ${label} eliminado`, 'success', 2000);
        } catch (err) {
            console.error(`Error eliminando ${label.toLowerCase()}:`, err);
            mostrarMensaje(`❌ Error al eliminar ${label.toLowerCase()}`, 'error', 3000);
        }
    };

    return {
        // State
        items,
        campoIdRelacion,
        mostrarModal,
        mostrarSelector,
        busqueda,
        // Helpers
        obtenerId,
        normalizar,
        obtenerNombre,
        obtenerCodigo,
        obtenerCostoUnitario,
        obtenerSubtotal,
        // Computed
        itemsOrdenados,
        totalCantidad,
        totalCosto,
        // Actions
        cargar,
        agregar,
        guardarCantidad,
        incrementarCantidad,
        decrementarCantidad,
        remover,
    };
}
