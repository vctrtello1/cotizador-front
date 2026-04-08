<template>
    <div class="acabados-container">
        <div class="subcategorias-grid">
            <router-link
                v-for="sub in subcategorias"
                :key="sub.path"
                :to="sub.path"
                class="subcategoria-card"
            >
                <span class="subcategoria-icon">{{ sub.icon }}</span>
                <span class="subcategoria-label">{{ sub.label }}</span>
            </router-link>
        </div>
    </div>
</template>

<script setup>
const subcategorias = [
    { path: '/estructuras', icon: '🏗️', label: 'Estructuras' },
    { path: '/acabado-tablero', icon: '🎨', label: 'Acabado Tablero' },
    { path: '/acabado-cubre-canto', icon: '🧵', label: 'Acabado Cubre Canto' },
    { path: '/correderas', icon: '🎚️', label: 'Correderas' },
    { path: '/compases-abatibles', icon: '🔀', label: 'Compases Abatibles' },
    { path: '/puertas', icon: '🚪', label: 'Puertas' },
    { path: '/tiras-led', icon: '💡', label: 'Tiras LED' },
];
</script>

<style scoped>
.acabados-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
    min-height: 100vh;
}

.subcategorias-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
}

.subcategoria-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1rem;
    background: white;
    border: 1px solid #ede6dd;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    text-decoration: none;
    transition: all 0.3s;
    cursor: pointer;
}

.subcategoria-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    border-color: #d4a574;
}

.subcategoria-icon {
    font-size: 2rem;
}

.subcategoria-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #5a4037;
    text-align: center;
}

@media (max-width: 768px) {
    .acabados-container {
        padding: 1rem;
    }

    .subcategorias-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
}
</style>
