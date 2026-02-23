<template>
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content modal-content-large">
            <div class="modal-header">
                <h3 class="modal-title">{{ icon }} {{ titulo }}</h3>
            </div>
            <div class="modal-body">
                <div class="search-section">
                    <input
                        :value="busqueda"
                        @input="$emit('update:busqueda', $event.target.value)"
                        type="text"
                        class="search-input"
                        :placeholder="`🔍 Buscar ${labelSingular.toLowerCase()}...`"
                    />
                </div>
                <div class="materiales-grid">
                    <div
                        v-for="item in itemsFiltrados"
                        :key="item.id"
                        class="material-card"
                        @click="$emit('seleccionar', item)"
                    >
                        <div class="card-header">
                            <div class="card-name">{{ item.nombre }}</div>
                            <div class="card-badge">{{ item.codigo }}</div>
                        </div>
                        <div class="card-body">
                            <p class="card-label">Costo Unitario</p>
                            <p class="card-price">${{ formatCurrency(obtenerPrecio(item)) }}</p>
                        </div>
                        <div class="card-footer">
                            <button class="btn-select">+ Seleccionar</button>
                        </div>
                    </div>
                </div>
                <div v-if="itemsFiltrados.length === 0" class="empty-list">
                    <p>📭 No hay {{ labelSingular.toLowerCase() }}s disponibles</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" @click="$emit('close')">Cerrar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    visible: { type: Boolean, default: false },
    icon: { type: String, required: true },
    titulo: { type: String, required: true },
    labelSingular: { type: String, required: true },
    busqueda: { type: String, default: '' },
    itemsFiltrados: { type: Array, default: () => [] },
    formatCurrency: { type: Function, required: true },
    obtenerPrecio: {
        type: Function,
        default: (item) => item.costo_unitario || item.costo || item.precio || 0,
    },
});

defineEmits(['close', 'seleccionar', 'update:busqueda']);
</script>
