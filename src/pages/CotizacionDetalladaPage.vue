<template>
    <div v-if="cotizacion" class="cotizacion-detallada-container">
        <h1 class="cotizacion-title">Cotización Detallada </h1>
        <div class="cotizacion-details">
            <p><strong>ID:</strong> {{ cotizacion.id }}</p>
            <p><strong>Fecha:</strong> {{ new Date(cotizacion.fecha).toLocaleDateString() }}</p>
            <p><strong>Cliente:</strong> {{ cotizacion.cliente ? cotizacion.cliente.nombre : 'Sin Cliente' }}</p>
            <p><strong>Descripción:</strong> {{ cotizacion.description }}</p>
            <p><strong>Total:</strong> ${{ typeof cotizacion.total === 'number' ? cotizacion.total.toFixed(2) : cotizacion.total }}</p>
            <!-- Agrega más detalles según la estructura de tu cotización -->
        </div>
    </div>
    <div v-else class="loading-state">
        <p>Cargando cotización...</p>
    </div>
</template>


<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCotizacionesStore } from '@/stores/cotizaciones';

const route = useRoute();
const store = useCotizacionesStore();
const { fecthCotizacionById } = store;

const cotizacion = ref(null);

onMounted(async () => {
    const id = route.params.id;
    cotizacion.value = await fecthCotizacionById(id);
});
</script>