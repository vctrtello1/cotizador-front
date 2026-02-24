<template>
    <div class="section-header">
        <h2 class="section-title">
            <span class="section-icon">{{ icon }}</span>
            {{ titulo }}
            <span v-if="items.length" class="section-count">{{ items.length }}</span>
        </h2>
        <button type="button" class="btn-action-header" @click="$emit('abrir-selector')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar
        </button>
    </div>

    <div v-if="items.length > 0">
        <div class="tableros-metrics">
            <div class="metric-pill">
                <span class="metric-number">{{ items.length }}</span>
                <span class="metric-label">Tipos</span>
            </div>
            <div class="metric-pill">
                <span class="metric-number">{{ totalCantidad }}</span>
                <span class="metric-label">Unidades</span>
            </div>
            <div class="metric-pill metric-pill--accent" v-if="!ocultarPrecios">
                <span class="metric-number">${{ formatCurrency(totalCosto) }}</span>
                <span class="metric-label">Costo total</span>
            </div>
        </div>

        <TransitionGroup name="entity-list" tag="div" class="entity-list">
            <div
                v-for="item in itemsOrdenados"
                :key="`${keyPrefix}-${item.id}`"
                class="entity-row"
            >
                <div class="entity-row-left">
                    <div class="entity-avatar">{{ icon }}</div>
                    <div class="entity-info">
                        <div class="entity-name">{{ obtenerNombre(item) }}</div>
                        <div class="entity-code">{{ obtenerCodigo(item) }}</div>
                    </div>
                </div>
                <div class="entity-row-center" v-if="!ocultarPrecios">
                    <div class="entity-pricing">
                        <span class="entity-unit-price">${{ formatCurrency(obtenerCostoUnitario(item)) }} <small>c/u</small></span>
                        <span class="entity-subtotal">${{ formatCurrency(obtenerSubtotal(item)) }}</span>
                    </div>
                </div>
                <div class="entity-row-right">
                    <div class="quantity-controls-compact">
                        <button type="button" class="btn-qty btn-qty--minus" @click="$emit('decrementar', item)" title="Disminuir">−</button>
                        <input
                            v-model.number="item.cantidad"
                            type="number" min="1" step="1" placeholder="1"
                            @blur="$emit('guardar-cantidad', item)"
                            @keyup.enter="$emit('guardar-cantidad', item)"
                            class="qty-input"
                        />
                        <button type="button" class="btn-qty btn-qty--plus" @click="$emit('incrementar', item)" title="Aumentar">+</button>
                    </div>
                    <button type="button" class="btn-delete-sm" @click="$emit('remover', item)" title="Eliminar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            </div>
        </TransitionGroup>
    </div>

    <div v-else class="empty-state-inline">
        <div class="empty-illustration">
            <span class="empty-icon">{{ icon }}</span>
            <div class="empty-rings"></div>
        </div>
        <p class="empty-title">{{ emptyTitle }}</p>
        <p class="empty-desc">{{ emptyDesc }}</p>
        <button type="button" class="btn-empty-action" @click="$emit('abrir-selector')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {{ addLabel }}
        </button>
    </div>
</template>

<script setup>
defineProps({
    icon: { type: String, required: true },
    titulo: { type: String, required: true },
    keyPrefix: { type: String, required: true },
    items: { type: Array, required: true },
    itemsOrdenados: { type: Array, required: true },
    totalCantidad: { type: Number, default: 0 },
    totalCosto: { type: Number, default: 0 },
    emptyTitle: { type: String, required: true },
    emptyDesc: { type: String, required: true },
    addLabel: { type: String, required: true },
    formatCurrency: { type: Function, required: true },
    obtenerNombre: { type: Function, required: true },
    obtenerCodigo: { type: Function, required: true },
    obtenerCostoUnitario: { type: Function, required: true },
    obtenerSubtotal: { type: Function, required: true },
    ocultarPrecios: { type: Boolean, default: false },
});

defineEmits(['abrir-selector', 'incrementar', 'decrementar', 'guardar-cantidad', 'remover']);
</script>

<style scoped>
/* Section Header */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 2px solid #f5f1ed;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
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

/* Metrics */
.tableros-metrics {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.metric-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f7f3ef;
    border-radius: 20px;
    border: 1px solid #ede7e0;
}

.metric-pill--accent {
    background: #fffbf5;
    border-color: #e8d5c0;
}

.metric-number {
    font-size: 13px;
    font-weight: 800;
    color: #5a4037;
}

.metric-label {
    font-size: 10px;
    font-weight: 700;
    color: #a89480;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

/* Entity List & Transitions */
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

/* Entity Row */
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

.entity-code {
    font-size: 11px;
    color: #a89480;
    margin-top: 1px;
    font-weight: 500;
}

.entity-row-center {
    flex-shrink: 0;
}

.entity-pricing {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
}

.entity-unit-price {
    font-size: 11px;
    color: #a89480;
    font-weight: 500;
}

.entity-unit-price small {
    font-size: 10px;
}

.entity-subtotal {
    font-size: 14px;
    font-weight: 800;
    color: #2e7d32;
}

.entity-row-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

/* Quantity Controls */
.quantity-controls-compact {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1.5px solid #e8e3dd;
    border-radius: 8px;
    overflow: hidden;
    background: #faf8f6;
}

.btn-qty {
    width: 30px;
    height: 32px;
    border: none;
    background: transparent;
    color: #5a4037;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.btn-qty:hover {
    background: #eee9e3;
}

.btn-qty:active {
    transform: scale(0.92);
}

.btn-qty--minus:hover {
    background: #fef2f2;
    color: #dc2626;
}

.btn-qty--plus:hover {
    background: #f0fdf4;
    color: #16a34a;
}

.qty-input {
    width: 42px;
    height: 32px;
    border: none;
    border-left: 1px solid #e8e3dd;
    border-right: 1px solid #e8e3dd;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    color: #5a4037;
    background: white;
    -moz-appearance: textfield;
    appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.qty-input:focus {
    outline: none;
    background: #fffdf9;
}

/* Delete Button */
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

/* Empty State */
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

.btn-empty-action {
    padding: 10px 22px;
    background: white;
    color: #8b7355;
    border: 1.5px dashed #d4a574;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.btn-empty-action:hover {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(212, 165, 116, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
    .entity-row {
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px;
    }

    .entity-row-left {
        flex: 1 1 100%;
    }

    .entity-row-center {
        flex: 1;
    }

    .entity-row-right {
        flex: 0 0 auto;
    }

    .tableros-metrics {
        flex-direction: column;
    }

    .section-header {
        flex-wrap: wrap;
        gap: 8px;
    }
}

@media (max-width: 480px) {
    .entity-pricing {
        align-items: flex-start;
    }

    .quantity-controls-compact {
        order: 1;
    }
}
</style>
