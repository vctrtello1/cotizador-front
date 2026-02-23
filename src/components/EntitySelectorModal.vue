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

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(30, 20, 15, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 520px;
    width: 92%;
    box-shadow: 0 20px 60px rgba(30, 20, 15, 0.25);
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-content-large {
    max-width: 680px;
    max-height: 85vh;
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f0ebe5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #faf8f6;
    border-radius: 16px 16px 0 0;
}

.modal-title {
    font-size: 16px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
}

.modal-footer {
    padding: 14px 24px;
    border-top: 1px solid #f0ebe5;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: #faf8f6;
    border-radius: 0 0 16px 16px;
}

/* Search */
.search-section {
    margin-bottom: 20px;
}

.search-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #e0d5c7;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.25s;
    background: #faf8f6;
    box-sizing: border-box;
}

.search-input::placeholder {
    color: #baa894;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.12);
    background: white;
}

/* Selector Grid */
.materiales-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
}

.material-card {
    background: white;
    border: 1.5px solid #eee9e3;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
}

.material-card:hover {
    border-color: #d4a574;
    box-shadow: 0 6px 18px rgba(212, 165, 116, 0.18);
    transform: translateY(-3px);
}

.material-card.selected {
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.card-header {
    padding: 14px 16px;
    background: #faf8f6;
    border-bottom: 1px solid #eee9e3;
}

.card-name {
    font-weight: 700;
    color: #5a4037;
    font-size: 14px;
    margin-bottom: 6px;
    line-height: 1.3;
}

.card-badge {
    display: inline-block;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.4px;
}

.card-body {
    padding: 14px 16px;
    flex: 1;
}

.card-label {
    font-size: 10px;
    color: #a89480;
    margin: 0 0 4px 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.card-price {
    font-size: 20px;
    font-weight: 700;
    color: #d4a574;
    margin: 0;
}

.card-footer {
    padding: 12px 16px;
    background: #faf8f6;
    border-top: 1px solid #eee9e3;
}

.btn-select {
    width: 100%;
    padding: 10px 14px;
    background: linear-gradient(135deg, #4CAF50 0%, #43a047 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-select:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
}

.empty-list {
    text-align: center;
    padding: 28px 20px;
    color: #a89480;
}

.empty-list p {
    margin: 0;
    font-size: 14px;
}

/* Button inherited from parent */
.btn-secondary {
    padding: 10px 20px;
    background: white;
    color: #8b7355;
    border: 1.5px solid #e0d5c7;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}

.btn-secondary:hover {
    background: #faf8f6;
    border-color: #d4a574;
    color: #5a4037;
}

@media (max-width: 768px) {
    .materiales-grid {
        grid-template-columns: 1fr;
    }

    .modal-content-large {
        width: 96%;
        max-height: 90vh;
    }
}
</style>
