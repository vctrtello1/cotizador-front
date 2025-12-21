<template>
    <div class="cotizaciones-container">
        <header class="page-header">
            <h1>Cotizaciones Activas</h1>
            <button class="btn-primary">Nueva Cotización</button>
        </header>
        
        <div v-if="usingMockData" class="warning-banner">
            <span class="icon">⚠️</span> Backend no disponible. Mostrando datos de prueba.
        </div>

        <div v-if="cotizaciones.length" class="cotizaciones-grid">
            <div v-for="cotizacion in cotizaciones" :key="cotizacion.id" class="cotizacion-card">
                <div class="card-header">
                    <span class="cotizacion-id">#{{ cotizacion.id }}</span>
                    <span class="cotizacion-date">{{ new Date(cotizacion.fecha).toLocaleDateString() }}</span>
                </div>
                <div class="card-body">
                    <h3 class="client-name">{{ cotizacion.cliente?.nombre || 'Cliente Desconocido' }}</h3>
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
    import { useCotizacionesStore } from '@/stores/cotizaciones';

    const store = useCotizacionesStore();
    const { cotizaciones, usingMockData } = storeToRefs(store);
    const { fetchCotizaciones } = store;

    onMounted(() => {
        fetchCotizaciones();
    });
</script>

<style scoped>
.cotizaciones-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: 'Georgia', 'Garamond', serif;
    color: var(--color-text);
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    border-bottom: 3px solid var(--color-border);
    padding-bottom: 20px;
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
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    box-shadow: 0 4px 8px var(--shadow-light);
}

/* Galería responsiva */
.cotizaciones-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 32px;
    padding: 20px 0;
}

@media (min-width: 768px) {
    .cotizaciones-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1200px) {
    .cotizaciones-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 1600px) {
    .cotizaciones-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.cotizacion-card {
    background: var(--color-background-soft);
    border: 2px solid var(--color-border);
    border-radius: 12px;
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
    background: var(--warm-white);
}

.client-name {
    margin: 0 0 12px 0;
    font-size: 1.5rem;
    color: var(--color-heading);
    font-weight: 700;
    line-height: 1.3;
}

.description {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.95rem;
    line-height: 1.6;
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