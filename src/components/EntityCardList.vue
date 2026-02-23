<template>
    <div class="info-card">
        <div class="section-header">
            <h2 class="section-title">{{ icon }} {{ titulo }}</h2>
            <button type="button" class="btn-action-header" @click="$emit('gestionar')">
                + Gestionar
            </button>
        </div>

        <transition-group name="list" tag="div" v-if="items.length">
            <div :key="`resumen-${keyPrefix}`" class="tableros-metrics">
                <div class="metric-pill">
                    <span class="metric-number">{{ items.length }}</span>
                    <span class="metric-label">Tipos</span>
                </div>
                <div class="metric-pill">
                    <span class="metric-number">{{ totalCantidad }}</span>
                    <span class="metric-label">Unidades</span>
                </div>
                <div class="metric-pill metric-pill--accent">
                    <span class="metric-number">${{ formatCurrency(totalCosto) }}</span>
                    <span class="metric-label">Costo total</span>
                </div>
            </div>

            <div
                v-for="item in itemsOrdenados"
                :key="`vista-${keyPrefix}-${item.id}`"
                class="tablero-card"
            >
                <div class="tablero-card-left">
                    <div class="tablero-avatar">{{ icon }}</div>
                    <div class="tablero-info">
                        <div class="tablero-name">{{ obtenerNombre(item) }}</div>
                        <div class="tablero-code">{{ obtenerCodigo(item) }}</div>
                    </div>
                </div>
                <div class="tablero-card-center">
                    <div class="tablero-pricing">
                        <span class="tablero-unit-price">${{ formatCurrency(obtenerCostoUnitario(item)) }} <small>c/u</small></span>
                        <span class="tablero-subtotal">${{ formatCurrency(obtenerSubtotal(item)) }}</span>
                    </div>
                </div>
                <div class="tablero-card-right">
                    <div class="quantity-controls-compact">
                        <button
                            type="button"
                            class="btn-qty btn-qty--minus"
                            @click="$emit('decrementar', item)"
                            title="Disminuir"
                        >−</button>
                        <input
                            :id="`qty-${keyPrefix}-vista-${item.id}`"
                            v-model.number="item.cantidad"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="1"
                            @blur="$emit('guardar-cantidad', item)"
                            @keyup.enter="$emit('guardar-cantidad', item)"
                            class="qty-input"
                        />
                        <button
                            type="button"
                            class="btn-qty btn-qty--plus"
                            @click="$emit('incrementar', item)"
                            title="Aumentar"
                        >+</button>
                    </div>
                    <button
                        type="button"
                        class="btn-delete-sm"
                        @click="$emit('remover', item.id)"
                        title="Eliminar"
                    >🗑</button>
                </div>
            </div>
        </transition-group>

        <div v-else class="empty-state-inline">
            <div class="empty-icon">📭</div>
            <p>No hay {{ titulo.toLowerCase() }} asignados</p>
            <button type="button" class="btn-empty-action" @click="$emit('gestionar')">+ Agregar {{ labelSingular }}</button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    icon: { type: String, required: true },
    titulo: { type: String, required: true },
    labelSingular: { type: String, required: true },
    keyPrefix: { type: String, required: true },
    items: { type: Array, default: () => [] },
    itemsOrdenados: { type: Array, default: () => [] },
    totalCantidad: { type: Number, default: 0 },
    totalCosto: { type: Number, default: 0 },
    obtenerNombre: { type: Function, required: true },
    obtenerCodigo: { type: Function, required: true },
    obtenerCostoUnitario: { type: Function, required: true },
    obtenerSubtotal: { type: Function, required: true },
    formatCurrency: { type: Function, required: true },
});

defineEmits(['gestionar', 'incrementar', 'decrementar', 'guardar-cantidad', 'remover']);
</script>
