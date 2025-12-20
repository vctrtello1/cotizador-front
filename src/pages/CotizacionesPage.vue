<template>
    <div class="cotizaciones-container">
        <h1>Cotizaciones</h1>
        
        <div v-if="usingMockData" class="warning-banner">
            ⚠️ Backend no disponible. Mostrando datos de prueba.
        </div>

        <div v-if="cotizaciones.length" class="cotizaciones-list">
            <div v-for="cotizacion in cotizaciones" :key="cotizacion.id" class="cotizacion-card">
                <h3>{{ cotizacion.description }}</h3>
                <p><strong>Fecha:</strong> {{ cotizacion.date }}</p>
                <p><strong>Monto:</strong> ${{ typeof cotizacion.amount === 'number' ? cotizacion.amount.toFixed(2) : cotizacion.amount }}</p>
            </div>
        </div>
        <p v-else>No hay cotizaciones disponibles.</p>
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
    padding: 20px;
}

.warning-banner {
    background-color: #fff3cd;
    color: #856404;
    padding: 10px;
    border: 1px solid #ffeeba;
    border-radius: 4px;
    margin-bottom: 20px;
}

.cotizaciones-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.cotizacion-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cotizacion-card h3 {
    margin-top: 0;
    color: #2c3e50;
}

.cotizacion-card p {
    margin: 5px 0;
    color: #666;
}
</style>