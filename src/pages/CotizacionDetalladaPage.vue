<template>
    Cotixacion Detallada Page
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