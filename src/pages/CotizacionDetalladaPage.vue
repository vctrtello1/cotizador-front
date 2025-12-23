<template>
    <div v-if="cotizacion" class="cotizacion-detallada-container">
        <h1 class="cotizacion-title">Cotización Detallada </h1>
        <div class="cotizacion-details">
            <p><strong>ID:</strong> {{ cotizacion.id }}</p>
            <p><strong>Fecha:</strong> {{ new Date(cotizacion.fecha).toLocaleDateString() }}</p>
            <p><strong>Cliente:</strong> {{ cotizacion.cliente ? cotizacion.cliente.nombre : 'Sin Cliente' }}</p>
            <p><strong>Detalles:</strong> </p>

            <div v-if="detalles.length" class="modulos-container">
                
                <div v-for="(modulo, index) in detalles" :key="index" class="modulo-section">
                    <!-- Encabezado del módulo -->
                    <div class="modulo-header">
                        <h2 class="modulo-nombre">{{ modulo.nombre }}</h2>
                        <p class="modulo-descripcion">{{ modulo.descripcion }}</p>
                    </div>
                    
                    <!-- Artículos del módulo -->
                    <div class="articulos-grid">
                        <div v-for="articulo in modulo.detalles" :key="articulo.id" class="articulo-card">
                            <div class="card-body">
                                <p class="articulo-label"><strong>Artículo:</strong></p>
                                <p class="description">{{ articulo.descripcion || 'Sin descripción' }}</p>
                            </div>
                            <div class="card-footer">
                                <div class="footer-item">
                                    <span class="label">Precio Unitario:</span>
                                    <span class="amount">${{ typeof articulo.precio_unitario === 'number' ? articulo.precio_unitario.toFixed(2) : articulo.precio_unitario }}</span>
                                </div>
                                <div class="footer-item">
                                    <span class="label">Cantidad:</span>
                                    <span class="amount">{{ articulo.cantidad }}</span>
                                </div>
                                <div class="footer-item">
                                    <span class="label">Subtotal:</span>
                                    <span class="amount">${{ typeof articulo.subtotal === 'number' ? articulo.subtotal : articulo.subtotal }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p><strong>Total:</strong> ${{ typeof cotizacion.total === 'number' ? cotizacion.total.toFixed(2) : cotizacion.total }}</p>
        </div>
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

const goToCotizacionDetallada = (id) => {
    router.push({ name: 'CotizacionDetallada', params: { id } });
};

onMounted(async () => {
    const id = route.params.id;
    cotizacion.value = await fecthCotizacionById(id);
});
</script>