<template>
    <div v-if="cotizacion" class="cotizacion-detallada-container">
        <h1 class="cotizacion-title">Cotización Detallada </h1>
        <div class="cotizacion-details">
            <p><strong>ID:</strong> {{ cotizacion.id }}</p>
            <p><strong>Fecha:</strong> {{ new Date(cotizacion.fecha).toLocaleDateString() }}</p>
            <p><strong>Cliente:</strong> {{ cotizacion.cliente ? cotizacion.cliente.nombre : 'Sin Cliente' }}</p>
            <p><strong>Detalles:</strong> </p>


            <div v-if="detalles.length" class="cotizaciones-grid">
                <div v-for="detalle in detalles" :key="detalle.id" class="cotizacion-card"
                    @click="goToCotizacionDetallada(detalle.id)">
                    <div class="card-header">
                        
                    </div>
                    <div class="card-body">
                        
                        <p class="articulo-label"><strong>Artículo:</strong></p>
                        <p class="description">{{ detalle.descripcion || detalle.description || 'Sin descripción' }}</p>
                    </div>
                    <div class="card-footer">
                        <div class="footer-item">
                            <span class="label">Precio Unitario:</span>
                            <span class="amount">${{ typeof detalle.precio_unitario === 'number' ? detalle.precio_unitario.toFixed(2) : detalle.precio_unitario }}</span>
                        </div>
                        <div class="footer-item">
                            <span class="label">Cantidad:</span>
                            <span class="amount">{{ detalle.cantidad }}</span>
                        </div>
                    </div>
                </div>
            </div>
  

            <p><strong>Total:</strong> ${{ typeof cotizacion.total === 'number' ? cotizacion.total.toFixed(2) : cotizacion.total }}</p>
            <!-- Agrega más detalles según la estructura de tu cotización -->
        </div>
    </div>
    <div v-else class="loading-state">
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
    return cotizacion.value?.detalles || [];
});

const goToCotizacionDetallada = (id) => {
    router.push({ name: 'CotizacionDetallada', params: { id } });
};

onMounted(async () => {
    const id = route.params.id;
    cotizacion.value = await fecthCotizacionById(id);
});
</script>