<template>
    <div class="cotizaciones-container">
        <header class="page-header">
            <h1>Cotizaciones Activas</h1>
            <button class="btn-primary">Nueva Cotización</button>
        </header>
        

        <div v-if="cotizaciones.length" class="cotizaciones-grid">
            <div 
                v-for="cotizacion in cotizaciones" 
                :key="cotizacion.id" 
                class="cotizacion-card"
                @click="goToCotizacionDetallada(cotizacion.id)"
            >
                <div class="card-header">
                    <span class="cotizacion-id">#{{ cotizacion.id }}</span>
                    <span class="cotizacion-date">{{ new Date(cotizacion.fecha).toLocaleDateString() }}</span>
                </div>
                <div class="card-body">
                    <h3 class="client-name">
                        {{ cotizacion.cliente ? cotizacion.cliente.nombre : 'Sin Cliente' }}
                    </h3>
                    <p class="description">{{ cotizacion.description }}</p>
                </div>
                <div class="card-footer">
                    <span class="label">Total:</span>
                    <span class="amount">${{ typeof cotizacion.total === 'number' ? cotizacion.total.toFixed(2) : cotizacion.total }}</span>
                </div>
            </div>
        </div>
        
        <div v-else class="empty-state">
            <p>No hay cotizaciones disponibles.</p>
        </div>
    </div>
</template>

<script setup>  
    import { onMounted } from 'vue';
    import { storeToRefs } from 'pinia';
    import { useRouter } from 'vue-router';
    import { useCotizacionesStore } from '@/stores/cotizaciones';

    const router = useRouter();
    const store = useCotizacionesStore();
    const { cotizaciones } = storeToRefs(store);
    const { fetchCotizaciones } = store;

    const goToCotizacionDetallada = (id) => {
        router.push({ name: 'CotizacionDetallada', params: { id } });
    };

    onMounted(() => {
        fetchCotizaciones();
    });
</script>

<style scoped>
.cotizaciones-container {
    width: 100%;
    margin: 0;
    padding: 40px 32px;
    font-family: 'Georgia', 'Garamond', serif;
    color: var(--color-text);
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48px;
    border-bottom: 3px solid var(--color-border);
    padding-bottom: 20px;
    max-width: 100%;
}

.page-header h1 {
    font-size: 2.5rem;
    color: var(--color-heading);
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
}

.btn-primary {
    background: linear-gradient(135deg, var(--wood-medium) 0%, var(--wood-light) 100%);
    color: var(--cream);
    border: none;
    padding: 14px 28px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--shadow-light);
}

.btn-primary:hover {
    background: linear-gradient(135deg, var(--wood-light) 0%, var(--wood-lighter) 100%);
    box-shadow: 0 6px 16px var(--shadow-medium);
    transform: translateY(-2px);
}

.warning-banner {
    background-color: var(--cream);
    color: var(--wood-dark);
    padding: 15px 20px;
    border: 2px solid var(--accent-gold);
    border-radius: 8px;
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    box-shadow: 0 4px 8px var(--shadow-light);
}

/* Grid de galería con 3 columnas */
.cotizaciones-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    padding: 0;
    align-items: start;
    width: 100%;
}

/* Mobile - 1 columna */
@media (max-width: 767px) {
    .cotizaciones-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .cotizaciones-container {
        padding: 24px 16px;
    }
}

/* Tablets - 2 columnas */
@media (min-width: 768px) and (max-width: 1023px) {
    .cotizaciones-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
    }
    
    .cotizaciones-container {
        padding: 32px 24px;
    }
}

/* Laptops y Desktops - 3 columnas */
@media (min-width: 1024px) {
    .cotizaciones-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
    }
}

/* Pantallas muy grandes - mantener 3 columnas con mayor gap */
@media (min-width: 1920px) {
    .cotizaciones-grid {
        gap: 40px;
    }
    
    .cotizaciones-container {
        padding: 56px 64px;
    }
}

.cotizacion-card {
    background: var(--color-background-soft);
    border: 2px solid var(--color-border);
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 6px 20px var(--shadow-light);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.cotizacion-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-gold), var(--accent-bronze));
    opacity: 0;
    transition: opacity 0.4s ease;
}

.cotizacion-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px var(--shadow-medium);
    border-color: var(--accent-gold);
}

.cotizacion-card:hover::before {
    opacity: 1;
}

.card-header {
    padding: 16px 20px;
    background: linear-gradient(135deg, var(--wood-medium), var(--wood-light));
    color: var(--cream);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
}

.cotizacion-id {
    font-family: 'Courier New', monospace;
    font-size: 1.1rem;
    font-weight: 700;
}

.cotizacion-date {
    font-size: 0.9rem;
    opacity: 0.95;
}

.card-body {
    padding: 24px;
    flex-grow: 1;
    background: var(--warm-white, #FAF8F3);
    min-height: 120px;
}

.client-name {
    margin: 0 0 12px 0;
    font-size: 1.5rem;
    color: #2C1810 !important;
    font-weight: 700;
    line-height: 1.3;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

.description {
    margin: 0;
    color: #6B4423 !important;
    font-size: 0.95rem;
    line-height: 1.6;
    display: block !important;
}

.card-footer {
    padding: 16px 24px;
    border-top: 2px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--cream-soft);
}

.label {
    color: var(--wood-medium);
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 1px;
}

.amount {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--accent-gold);
    text-shadow: 1px 1px 2px var(--shadow-light);
}

.empty-state {
    text-align: center;
    padding: 60px 40px;
    color: var(--color-text-muted);
    border: 2px dashed var(--color-border);
    border-radius: 12px;
    font-weight: 600;
    background: var(--color-background-soft);
}
</style>