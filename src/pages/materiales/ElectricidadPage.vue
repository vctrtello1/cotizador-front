<template>
    <div class="electricidad-container">
        <div class="page-header">
            <button class="btn-back" @click="$router.push('/catalogos')" title="Regresar a Catálogos">
                ← Regresar
            </button>
            <div class="header-content">
                <h1 class="page-title">⚡ Electricidad</h1>
                <p class="page-subtitle">Componentes eléctricos y sistemas de iluminación</p>
            </div>
        </div>

        <div class="electricidad-grid">
            <router-link
                v-for="item in visibleItems"
                :key="item.path"
                :to="item.path"
                class="electricidad-card"
            >
                <span class="item-icon">{{ item.icon }}</span>
                <span class="item-label">{{ item.label }}</span>
                <span class="item-desc">{{ item.desc }}</span>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const items = [
    { path: '/apagadores', icon: '🔘', label: 'Apagadores', desc: 'Interruptores y apagadores eléctricos' },
    { path: '/tiras-led', icon: '💡', label: 'Tiras LED', desc: 'Sistemas de iluminación LED' },
    { path: '/perfil-aluminio', icon: '🔲', label: 'Perfil Aluminio', desc: 'Perfiles de aluminio para LED' },
];

const visibleItems = computed(() => {
    const canWrite = authStore.hasPermission('catalogs.write');
    if (canWrite) return items;
    return items;
});
</script>

<style scoped>
.electricidad-container {
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

.btn-back {
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    background: white;
    border: 2px solid #e8ddd0;
    border-radius: 8px;
    color: #5a4037;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-back:hover {
    border-color: #d4a574;
    background: #fafbfc;
    transform: translateX(-4px);
}

.header-content {
    margin-top: 0.5rem;
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

.electricidad-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
}

.electricidad-card {
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

.electricidad-card:hover {
    border-color: #d4a574;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(90, 64, 55, 0.12);
}

.item-icon {
    font-size: 2.5rem;
}

.item-label {
    font-size: 1.1rem;
    font-weight: 700;
    color: #5a4037;
}

.item-desc {
    font-size: 0.85rem;
    color: #8b7355;
    text-align: center;
}

@media (max-width: 640px) {
    .electricidad-container {
        padding: 1rem;
    }

    .electricidad-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .electricidad-card {
        padding: 1.25rem 1rem;
    }
}
</style>
