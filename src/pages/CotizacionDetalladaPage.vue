<template>
    <div v-if="cotizacion" class="cotizacion-detallada-container">
        <!-- Header de la cotización -->
        <div class="page-header">
            <button class="btn-back" @click="$router.push('/cotizaciones')">← Volver</button>
            <h1 class="page-title">Cotización #{{ cotizacion.id }}</h1>
        </div>

        <!-- Información del cliente -->
        <div class="info-card cliente-card">
            <h2 class="section-title">Información del Cliente</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">{{ cotizacion.cliente?.nombre || 'Sin Cliente' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Empresa:</span>
                    <span class="info-value">{{ cotizacion.cliente?.empresa || 'N/A' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">{{ new Date(cotizacion.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ cotizacion.cliente?.email || 'N/A' }}</span>
                </div>
            </div>
        </div>

        <!-- Módulos y detalles -->
        <div v-if="detalles.length" class="modulos-section">
            <h2 class="section-title">Detalles de la Cotización</h2>
            
            <div v-for="(modulo, index) in detalles" :key="index" class="modulo-card">
                <div class="modulo-header">
                    <div class="modulo-info">
                        <h3 class="modulo-nombre">{{ modulo.nombre }}</h3>
                        <p class="modulo-codigo">Código: {{ modulo.codigo }}</p>
                    </div>
                    <p class="modulo-descripcion">{{ modulo.descripcion }}</p>
                </div>
                
                <div class="articulos-table">
                    <div class="table-header">
                        
                        <div class="col-nombre">Nombre</div>
                        <div class="col-cantidad">Cantidad</div>
                        <div class="col-precio">Precio Unit.</div>
                        <div class="col-subtotal">Subtotal</div>
                
                    </div>
                    <div v-for="componente in modulo.componentes" :key="componente.id" class="table-row">
                        <div class="col-nombre">{{ componente.nombre }}</div>                        
                        <div class="col-cantidad">{{ componente.cantidad }}</div>
                        <div class="col-precio">${{ formatCurrency(componente.precio_unitario) }}</div>
                        <div class="col-subtotal">${{ formatCurrency(calcularSubtotal(componente)) }}</div>
                        
                    </div>
                </div>
            </div>
        </div>

        <!-- Total -->
        <div class="total-card">
            <div class="total-content">
                <span class="total-label">Total de la Cotización</span>
                <span class="total-amount">${{ formatCurrency(cotizacion.total) }}</span>
            </div>
        </div>
    </div>
    
    <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Cargando cotización...</p>
    </div>
</template>


<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCotizacionesStore } from '@/stores/cotizaciones';

const route = useRoute();
const router = useRouter();
const store = useCotizacionesStore();
const { fecthCotizacionById } = store;

const cotizacion = ref(null);

const detalles = computed(() => {
    // La estructura correcta es cotizacion.modulos, no cotizacion.detalles
    return cotizacion.value?.modulos || [];
});

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    const num = Number(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const calcularSubtotal = (componente) => {
    // Intentar usar subtotal si existe y no es null/undefined
    if (componente.subtotal !== null && componente.subtotal !== undefined && componente.subtotal !== '') {
        const subtotal = Number(componente.subtotal);
        if (!isNaN(subtotal)) {
            return subtotal;
        }
    }
    // Si no hay subtotal válido, calcular: cantidad * precio_unitario
    const cantidad = Number(componente.cantidad) || 0;
    const precio = Number(componente.precio_unitario) || 0;
    return cantidad * precio;
};

const goToCotizacionDetallada = (id) => {
    router.push({ name: 'CotizacionDetallada', params: { id } });
};

onMounted(async () => {
    const id = route.params.id;
    cotizacion.value = await fecthCotizacionById(id);
});
</script>

<style scoped>
.cotizacion-detallada-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 32px;
    font-family: 'Georgia', 'Garamond', serif;
    background: transparent;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 32px;
    padding: 24px;
    background: var(--cream, #F5F1E8);
    border-radius: 12px;
    border: 2px solid var(--color-border, #E5DFD0);
}

.btn-back {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: #F5F1E8;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.1);
    flex-shrink: 0;
}

.btn-back:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(44, 24, 16, 0.2);
}

.page-title {
    font-size: 2.5rem;
    color: #2C1810;
    margin: 0;
    font-weight: 700;
    line-height: 1.2;
    text-shadow: none;
}

.info-card {
    background: var(--cream, #F5F1E8);
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.08);
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

.info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info-label {
    font-size: 0.9rem;
    color: var(--wood-medium, #6B4423);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 1.1rem;
    color: var(--wood-darkest, #2C1810);
    font-weight: 500;
}

.modulos-section {
    margin-bottom: 32px;
}

.modulos-section > .section-title {
    font-size: 1.75rem;
    color: #2C1810;
    margin: 0 0 24px 0;
    font-weight: 700;
    padding: 20px 24px;
    background: #F5F1E8;
    border-radius: 8px;
    border-left: 4px solid #C9A961;
    line-height: 1.2;
}

.modulo-card {
    background: var(--warm-white, #FAF8F3);
    border: 2px solid var(--color-border, #E5DFD0);
    border-radius: 12px;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.08);
}

.modulo-header {
    background: linear-gradient(135deg, var(--wood-medium, #6B4423), var(--wood-light, #8B5A3C));
    color: var(--cream, #F5F1E8);
    padding: 24px 32px;
}

.modulo-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.modulo-nombre {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
}

.modulo-codigo {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0;
    font-family: 'Courier New', monospace;
}

.modulo-descripcion {
    margin: 0;
    opacity: 0.95;
    line-height: 1.6;
}

.articulos-table {
    padding: 0;
}

.table-header {
    display: grid;
    grid-template-columns: 0.5fr 1.2fr 1.5fr 1.2fr 0.8fr 1.1fr 1.1fr 1fr 1.2fr;
    gap: 12px;
    padding: 20px 32px;
    background: var(--cream-soft, #EDE8DC);
    font-weight: 700;
    color: var(--wood-dark, #4A3020);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    overflow-x: auto;
}

.table-row {
    display: grid;
    grid-template-columns: 0.5fr 1.2fr 1.5fr 1.2fr 0.8fr 1.1fr 1.1fr 1fr 1.2fr;
    gap: 12px;
    padding: 20px 32px;
    border-top: 1px solid var(--color-border, #E5DFD0);
    transition: background 0.2s ease;
    overflow-x: auto;
}

.table-row:hover {
    background: var(--cream, #F5F1E8);
}

.col-descripcion {
    color: var(--wood-darkest, #2C1810);
    font-weight: 500;
}

.col-id,
.col-nombre,
.col-codigo,
.col-cantidad,
.col-precio,
.col-subtotal,
.col-acabado,
.col-mano-obra {
    color: var(--wood-dark, #4A3020);
}

.col-nombre {
    font-weight: 600;
}

.col-cantidad,
.col-precio,
.col-subtotal,
.col-acabado,
.col-mano-obra {
    text-align: right;
}

.col-subtotal {
    font-weight: 700;
    color: var(--accent-gold, #C9A961);
}

@media (max-width: 768px) {
    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .col-id,
    .col-nombre,
    .col-descripcion,
    .col-codigo,
    .col-cantidad,
    .col-precio,
    .col-subtotal,
    .col-acabado,
    .col-mano-obra {
        text-align: left;
    }
}

.total-card {
    background: linear-gradient(135deg, var(--wood-dark, #4A3020), var(--wood-medium, #6B4423));
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 8px 24px rgba(44, 24, 16, 0.2);
}

.total-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total-label {
    font-size: 1.5rem;
    color: var(--cream, #F5F1E8);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.total-amount {
    font-size: 2.5rem;
    color: var(--accent-gold, #C9A961);
    font-weight: 800;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--cream, #F5F1E8);
    border-top-color: var(--accent-gold, #C9A961);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-state p {
    color: var(--wood-medium, #6B4423);
    font-size: 1.1rem;
    font-weight: 600;
}
</style>