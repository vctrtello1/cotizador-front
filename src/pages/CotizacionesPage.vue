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
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: 'Inter', sans-serif;
    color: #000;
    background-color: #fff; /* Force white background */
    min-height: 100vh; /* Ensure it covers the screen height */
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    border-bottom: 4px solid #000;
    padding-bottom: 20px;
}

.page-header h1 {
    font-size: 2.5rem;
    color: #000;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -1px;
}

.btn-primary {
    background-color: #000;
    color: #fff;
    border: 2px solid #000;
    padding: 12px 24px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn-primary:hover {
    background-color: #fff;
    color: #000;
}

.warning-banner {
    background-color: #fff;
    color: #000;
    padding: 15px;
    border: 2px solid #000;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    box-shadow: 4px 4px 0px #000;
}

.cotizaciones-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.cotizacion-card {
    background: white;
    border: 3px solid #000;
    box-shadow: 6px 6px 0px #000;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
}

.cotizacion-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 10px 10px 0px #000;
}

.card-header {
    padding: 15px;
    background-color: #000;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    border-bottom: 3px solid #000;
}

.cotizacion-id {
    font-family: monospace;
    font-size: 1.1rem;
}

.card-body {
    padding: 20px;
    flex-grow: 1;
}

.client-name {
    margin: 0 0 10px 0;
    font-size: 1.4rem;
    color: #000;
    font-weight: 800;
}

.description {
    margin: 0;
    color: #000;
    font-size: 1rem;
    line-height: 1.5;
}

.card-footer {
    padding: 15px 20px;
    border-top: 3px solid #000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
}

.label {
    color: #000;
    text-transform: uppercase;
    font-weight: 800;
    font-size: 0.9rem;
}

.amount {
    font-size: 1.5rem;
    font-weight: 900;
    color: #000;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: #000;
    border: 3px dashed #000;
    font-weight: 600;
}
</style>