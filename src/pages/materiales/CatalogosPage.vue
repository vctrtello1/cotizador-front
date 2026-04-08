<template>
    <div class="catalogos-container">
        <div class="page-header">
            <h1 class="page-title">🎨 Catálogos</h1>
            <p class="page-subtitle">Gestión de materiales y componentes del sistema</p>
        </div>

        <div class="catalogos-grid">
            <router-link
                v-for="cat in visibleCatalogos"
                :key="cat.path"
                :to="cat.path"
                class="catalogo-card"
            >
                <span class="catalogo-icon">{{ cat.icon }}</span>
                <span class="catalogo-label">{{ cat.label }}</span>
                <span class="catalogo-desc">{{ cat.desc }}</span>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const catalogos = [
    { path: '/estructuras', icon: '🏗️', label: 'Estructuras', desc: 'Gestión de estructuras' },
    { path: '/acabados', icon: '🎨', label: 'Acabados', desc: 'Tipos de acabados' },
    { path: '/acabado-tablero', icon: '🪵', label: 'Acabado Tablero', desc: 'Acabados de tablero' },
    { path: '/acabado-cubre-canto', icon: '📏', label: 'Acabado Cubre Canto', desc: 'Acabados cubre cantos' },
    { path: '/puertas', icon: '🚪', label: 'Puertas', desc: 'Tipos de puertas' },
    { path: '/correderas', icon: '🔄', label: 'Correderas', desc: 'Sistemas de correderas' },
    { path: '/compases-abatibles', icon: '📐', label: 'Compases Abatibles', desc: 'Compases abatibles' },
    { path: '/electricidad', icon: '⚡', label: 'Electricidad', desc: 'Componentes eléctricos e iluminación' },
    { path: '/accesorios', icon: '🔩', label: 'Accesorios', desc: 'Accesorios varios' },
];

const visibleCatalogos = computed(() => {
    const canWrite = authStore.hasPermission('catalogs.write');
    if (canWrite) return catalogos;
    return catalogos;
});
</script>

<style scoped>
.catalogos-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
}

.page-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
}

.page-title {
    font-size: 2.5rem;
    color: #5a4037;
    margin: 0;
    font-weight: 700;
}

.page-subtitle {
    color: #8b7355;
    margin: 0.5rem 0 0;
    font-size: 1rem;
}

.catalogos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
}

.catalogo-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 1.5rem;
    background: white;
    border: 2px solid #e8ddd0;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.25s ease;
    cursor: pointer;
}

.catalogo-card:hover {
    border-color: #d4a574;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(90, 64, 55, 0.12);
}

.catalogo-icon {
    font-size: 2.5rem;
}

.catalogo-label {
    font-size: 1.1rem;
    font-weight: 700;
    color: #5a4037;
}

.catalogo-desc {
    font-size: 0.85rem;
    color: #8b7355;
    text-align: center;
}

@media (max-width: 640px) {
    .catalogos-container {
        padding: 1rem;
    }

    .catalogos-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .catalogo-card {
        padding: 1.25rem 1rem;
    }
}
</style>
