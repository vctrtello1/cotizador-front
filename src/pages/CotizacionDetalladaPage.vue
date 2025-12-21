<template>
    <div v-if="cotizacion" class="cotizacion-detallada-container">
        <h1 class="cotizacion-title">Cotización Detallada </h1>
        <div class="cotizacion-details">
            <p><strong>ID:</strong> {{ cotizacion.id }}</p>
            <p><strong>Fecha:</strong> {{ new Date(cotizacion.fecha).toLocaleDateString() }}</p>
            <p><strong>Cliente:</strong> {{ cotizacion.cliente ? cotizacion.cliente.nombre : 'Sin Cliente' }}</p>
            <p><strong>Detalles:</strong> </p>

            <div v-if="detalles.length" class="modulos-container">
                <div v-for="(grupo, index) in detalles" :key="index" class="modulo-section">
                    <!-- Encabezado del módulo -->
                    <div v-if="grupo.modulo" class="modulo-header">
                        <h2 class="modulo-nombre">{{ grupo.modulo.nombre }}</h2>
                        <p class="modulo-descripcion">{{ grupo.modulo.descripcion }}</p>
                    </div>
                    
                    <!-- Artículos del módulo -->
                    <div class="articulos-grid">
                        <div v-for="articulo in grupo.articulos" :key="articulo.id" class="articulo-card">
                            <div class="card-body">
                                <p class="articulo-label"><strong>Artículo:</strong></p>
                                <p class="description">{{ articulo.descripcion || articulo.description || 'Sin descripción' }}</p>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <p><strong>Total:</strong> ${{ typeof cotizacion.total === 'number' ? cotizacion.total.toFixed(2) :
                cotizacion.total }}</p>
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
    const allDetalles = cotizacion.value?.detalles || [];
    
    // Agrupar detalles por módulo para evitar duplicados
    const modulosMap = new Map();
    
    allDetalles.forEach(detalle => {
        const moduloId = detalle.modulo?.id;
        
        if (!moduloId) {
            // Si no tiene módulo, agregar directamente
            modulosMap.set(`sin-modulo-${detalle.id}`, {
                modulo: null,
                articulos: [detalle]
            });
        } else {
            // Si el módulo ya existe, agregar artículo
            if (modulosMap.has(moduloId)) {
                modulosMap.get(moduloId).articulos.push(detalle);
            } else {
                // Si es nuevo módulo, crear entrada
                modulosMap.set(moduloId, {
                    modulo: detalle.modulo,
                    articulos: [detalle]
                });
            }
        }
    });
    
    return Array.from(modulosMap.values());
});

const goToCotizacionDetallada = (id) => {
    router.push({ name: 'CotizacionDetallada', params: { id } });
};

onMounted(async () => {
    const id = route.params.id;
    cotizacion.value = await fecthCotizacionById(id);
});
</script>