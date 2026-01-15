<template>
    <div v-if="cotizacion" class="cotizacion-detallada-container">
        <!-- Header con acciones -->
        <div class="page-header">
            <div class="header-content">
                <button class="btn-back" @click="$router.push('/cotizaciones')">← Volver</button>
                <div class="header-title">
                    <h1 class="page-title">Cotización #{{ cotizacion.id }}</h1>
                    <span class="estado-badge">Activa</span>
                </div>
            </div>
            <div class="header-actions">
                <button class="btn-action" title="Descargar PDF">📥</button>
                <button class="btn-action" title="Imprimir">🖨️</button>
                <button class="btn-action" title="Editar">✏️</button>
            </div>
        </div>

        <!-- Información del cliente -->
        <div class="info-card cliente-card">
            <h2 class="section-title">📋 Información del Cliente</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">{{ cotizacion.cliente?.nombre || 'Sin Cliente' }}</span>
                </div>
                <div v-if="cotizacion.cliente?.nombre !== 'Publico En Geneal' && cotizacion.cliente?.empresa" class="info-item">
                    <span class="info-label">Empresa:</span>
                    <span class="info-value">{{ cotizacion.cliente?.empresa }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">{{ new Date(cotizacion.fecha).toLocaleDateString('es-ES', {
                        year:
                            'numeric', month: 'long', day: 'numeric' }) }}</span>
                </div>
                <div v-if="cotizacion.cliente?.nombre !== 'Publico En Geneal' && cotizacion.cliente?.email" class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ cotizacion.cliente?.email }}</span>
                </div>
            </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="stats-container">
            <div class="stat-card">
                <span class="stat-icon">📦</span>
                <span class="stat-label">Módulos</span>
                <span class="stat-value">{{ totalModulosOrdenados }}</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">🔧</span>
                <span class="stat-label">Componentes</span>
                <span class="stat-value">{{ totalComponentes }}</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">💰</span>
                <span class="stat-label">Total</span>
                <span class="stat-value">${{ formatCurrency(totalCotizacion) }}</span>
            </div>
        </div>

        <!-- Módulos y detalles -->
        <div v-if="detalles.length" class="modulos-section">
            <div class="modulos-header">
                <h2 class="section-title">🧩 Detalles de la Cotización</h2>
            </div>

            <div v-for="(modulo, index) in detalles" :key="index" class="modulo-card">
                <div class="modulo-header">
                    <div class="modulo-info">
                        <h3 class="modulo-nombre">{{ modulo.nombre }}</h3>
                        <span class="modulo-cantidad-badge">{{ modulo.cantidad }} unidad{{ modulo.cantidad !== 1 ? 'es' : '' }}</span>
                    </div>
                    <p class="modulo-codigo">{{ modulo.codigo }}</p>
                    <p class="modulo-descripcion">{{ modulo.descripcion }}</p>
                </div>

                <div class="articulos-table">
                    <div class="table-header">
                        <div class="col-nombre">Componente</div>
                        <div class="col-cantidad">Cantidad</div>
                        <div class="col-precio">Precio Unit.</div>
                        <div class="col-subtotal">Subtotal</div>
                    </div>
                    <div v-for="componente in modulo.componentes" :key="componente.id" class="table-row">
                        <div class="col-nombre"><strong>{{ componente.nombre }}</strong></div>
                        <div class="col-cantidad">{{ componente.cantidad }}</div>
                        <div class="col-precio">${{ formatCurrency(componente.precio_unitario) }}</div>
                        <div class="col-subtotal"><strong>${{ formatCurrency(calcularSubtotal(componente)) }}</strong></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total -->
        <div class="total-card">
            <div class="total-content">
                <span class="total-label">Total de la Cotización</span>
                <span class="total-amount">${{ formatCurrency(totalCotizacion) }}</span>
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
    return cotizacion.value?.modulos || [];
});

const totalModulosOrdenados = computed(() => {
    return detalles.value.reduce((total, modulo) => {
        return total + (Number(modulo.cantidad) || 1);
    }, 0);
});

const totalComponentes = computed(() => {
    return detalles.value.reduce((total, modulo) => {
        return total + (Array.isArray(modulo.componentes) ? modulo.componentes.length : 0);
    }, 0);
});

const totalCotizacion = computed(() => {
    const total = cotizacion.value?.total;
    
    if (total !== null && total !== undefined && total !== '') {
        // Si viene como string con formato "3,220.00", limpiar comas
        const numTotal = Number(String(total).replace(/,/g, ''));
        if (!isNaN(numTotal)) return numTotal;
    }
    
    // Fallback: calcular sumando subtotales de componentes
    return detalles.value.reduce((sum, modulo) => {
        if (!Array.isArray(modulo.componentes)) return sum;
        return sum + modulo.componentes.reduce((subtotal, comp) => 
            subtotal + calcularSubtotal(comp), 0
        );
    }, 0);
});

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    const num = Number(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('es-MX', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
};

const calcularSubtotal = (componente) => {
    // Si existe subtotal válido, usarlo
    if (componente.subtotal !== null && componente.subtotal !== undefined && componente.subtotal !== '') {
        const subtotal = Number(componente.subtotal);
        if (!isNaN(subtotal)) return subtotal;
    }
    // Si no, calcular: cantidad × precio_unitario
    return (Number(componente.cantidad) || 0) * (Number(componente.precio_unitario) || 0);
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
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    min-width: 0;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-back {
    padding: 8px 16px;
    background: #e8ddd7;
    color: #5a4037;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-back:hover {
    background: #d4a574;
    color: white;
    transform: translateY(-2px);
}

.page-title {
    font-size: 2.5rem;
    color: #2C1810;
    margin: 0;
    font-weight: 700;
    line-height: 1.2;
}

.estado-badge {
    background: #d4f1d4;
    color: #2d7a2d;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    padding: 10px 12px;
    background: white;
    border: 2px solid #d4a574;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-action:hover {
    background: #d4a574;
    transform: translateY(-2px);
}

.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border: 2px solid #d4a574;
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.1);
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(212, 165, 116, 0.2);
}

.stat-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 0.5rem;
}

.stat-label {
    color: #999;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 0.5rem;
}

.stat-value {
    color: #d4a574;
    font-size: 1.5rem;
    font-weight: 700;
    display: block;
}

.info-card {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.08);
}

.section-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 2px solid #d4a574;
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

.modulos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 24px 32px;
    background: linear-gradient(135deg, #F5F1E8 0%, #FAF8F3 100%);
    border-radius: 12px;
    border-left: 4px solid #C9A961;
    box-shadow: 0 2px 8px rgba(44, 24, 16, 0.08);
}

.modulos-header .section-title {
    margin: 0;
    flex: 1;
    font-size: 1.75rem;
    color: #2C1810;
}

.modulos-stats {
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-badge {
    background: linear-gradient(135deg, #C9A961 0%, #B8995C 100%);
    color: white;
    padding: 10px 18px;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
    white-space: nowrap;
}

.stat-separator {
    color: #C9A961;
    font-size: 1.5rem;
    font-weight: 300;
}

.modulos-section>.section-title {
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
    gap: 16px;
}

.modulo-nombre {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
    flex: 1;
}

.modulo-cantidad-badge {
    background: rgba(245, 241, 232, 0.2);
    border: 1px solid rgba(245, 241, 232, 0.4);
    color: #F5F1E8;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
    backdrop-filter: blur(10px);
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
    overflow-x: auto;
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 0.8fr 1fr 1fr;
    gap: 16px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #8B6F47 0%, #A88860 100%);
    color: #F5F1E8;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
    border-radius: 8px 8px 0 0;
    word-wrap: break-word;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 0.8fr 1fr 1fr;
    gap: 16px;
    padding: 18px 24px;
    border-bottom: 1px solid var(--color-border, #E5DFD0);
    transition: all 0.2s ease;
    align-items: center;
    background: var(--warm-white, #FAF8F3);
    word-wrap: break-word;
}

.table-row:hover {
    background: #F5F1E8;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.col-descripcion {
    color: var(--wood-darkest, #2C1810);
    font-size: 0.9rem;
    line-height: 1.4;
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
    font-weight: 700;
    font-size: 1rem;
    color: var(--wood-darkest, #2C1810);
}

.col-codigo {
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    color: #6B4423;
}

.col-cantidad {
    text-align: center;
    font-weight: 600;
}

.col-precio,
.col-subtotal {
    text-align: right;
}

.col-subtotal {
    font-weight: 700;
    color: var(--accent-gold, #C9A961);
    font-size: 1.05rem;
}

@media (max-width: 1024px) {

    .table-header,
    .table-row {
        grid-template-columns: 1.5fr 0.7fr 0.9fr 0.9fr;
        gap: 12px;
        padding: 16px 20px;
    }

    .table-header {
        font-size: 0.75rem;
    }
}

@media (max-width: 768px) {
    .table-header {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 16px 16px;
    }

    .table-row {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 16px 16px;
    }

    .col-nombre {
        grid-column: 1 / -1;
        font-size: 0.95rem;
    }

    .col-cantidad,
    .col-precio,
    .col-subtotal {
        text-align: left !important;
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
    to {
        transform: rotate(360deg);
    }
}

.loading-state p {
    color: var(--wood-medium, #6B4423);
    font-size: 1.1rem;
    font-weight: 600;
}
</style>