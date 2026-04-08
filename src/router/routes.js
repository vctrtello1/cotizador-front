export const routes = [
    {
        path: "/",
        redirect: "/login",
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/pages/login/LoginPage.vue"),
        meta: { public: true },
    },
    {
        path: "/cotizaciones",
        name: "Cotizaciones",
        component: () => import("@/pages/cotizaciones/CotizacionesPage.vue"),
    },
    {
        path: "/nueva-cotizacion",
        name: "NuevaCotizacion",
        component: () => import("@/pages/cotizaciones/NuevaCotizacionPage.vue"),
    },
    {
        path: "/cotizacion-detallada/:id",
        name: "CotizacionDetallada",
        component: () => import("@/pages/cotizaciones/CotizacionDetalladaPage.vue"),
    },
    {
        path: "/editar-cotizacion/:id",
        name: "EditarCotizacion",
        component: () => import("@/pages/cotizaciones/EditarCotizacionPage.vue"),
    },
    {
        path: "/modulos",
        name: "Modulos",
        component: () => import("@/pages/modulos/ModulosPage.vue"),
    },
    {
        path: "/nuevo-modulo",
        name: "NuevoModulo",
        component: () => import("@/pages/modulos/NuevoModuloPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-modulo/:id",
        name: "EditarModulo",
        component: () => import("@/pages/modulos/EditarModuloPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/componentes",
        name: "Componentes",
        component: () => import("@/pages/componentes/ComponentesPage.vue"),
    },
    {
        path: "/nuevo-componente",
        name: "NuevoComponente",
        component: () => import("@/pages/componentes/NuevoComponentePage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-componente/:id",
        name: "EditarComponente",
        component: () => import("@/pages/componentes/EditarComponentePage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/estructuras",
        name: "Estructuras",
        component: () => import("@/pages/estructuras/EstructurasPage.vue"),
    },
    {
        path: "/nueva-estructura",
        name: "NuevaEstructura",
        component: () => import("@/pages/estructuras/NuevaEstructuraPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-estructura/:id",
        name: "EditarEstructura",
        component: () => import("@/pages/estructuras/EditarEstructuraPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/acabado-tablero",
        name: "AcabadoTablero",
        component: () => import("@/pages/acabadoTabllero/AcabadoTableroPage.vue"),
    },
    {
        path: "/nuevo-acabado-tablero",
        name: "NuevoAcabadoTablero",
        component: () => import("@/pages/acabadoTabllero/NuevoAcabadoTableroPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-acabado-tablero/:id",
        name: "EditarAcabadoTablero",
        component: () => import("@/pages/acabadoTabllero/EditarAcabadoTableroPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/acabado-cubre-canto",
        name: "AcabadoCubreCanto",
        component: () => import("@/pages/acabadoCubreCanto/AcabadoCubreCantoPage.vue"),
    },
    {
        path: "/correderas",
        name: "Correderas",
        component: () => import("@/pages/correderas/CorrederasPage.vue"),
    },
    {
        path: "/nueva-corredera",
        name: "NuevaCorredera",
        component: () => import("@/pages/correderas/NuevaCorrederaPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-corredera/:id",
        name: "EditarCorredera",
        component: () => import("@/pages/correderas/EditarCorrederaPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/compases-abatibles",
        name: "CompasesAbatibles",
        component: () => import("@/pages/compases-abatibles/CompasesAbatiblesPage.vue"),
    },
    {
        path: "/nuevo-compas-abatible",
        name: "NuevoCompasAbatible",
        component: () => import("@/pages/compases-abatibles/NuevoCompasAbatiblePage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-compas-abatible/:id",
        name: "EditarCompasAbatible",
        component: () => import("@/pages/compases-abatibles/EditarCompasAbatiblePage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/puertas",
        name: "Puertas",
        component: () => import("@/pages/puertas/PuertasPage.vue"),
    },
    {
        path: "/nueva-puerta",
        name: "NuevaPuerta",
        component: () => import("@/pages/puertas/NuevaPuertaPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-puerta/:id",
        name: "EditarPuerta",
        component: () => import("@/pages/puertas/EditarPuertaPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/acabados",
        name: "Acabados",
        component: () => import("@/pages/acabados/AcabadosPage.vue"),
    },
    {
        path: "/nuevo-acabado",
        name: "NuevoAcabado",
        component: () => import("@/pages/acabados/NuevoAcabadoPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-acabado/:id",
        name: "EditarAcabado",
        component: () => import("@/pages/acabados/EditarAcabadoPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/catalogos",
        name: "Catalogos",
        component: () => import("@/pages/materiales/CatalogosPage.vue"),
    },
    {
        path: "/electricidad",
        name: "Electricidad",
        component: () => import("@/pages/materiales/ElectricidadPage.vue"),
    },
    {
        path: "/tiras-led",
        name: "TirasLed",
        component: () => import("@/pages/tiras-led/TirasLedPage.vue"),
    },
    {
        path: "/nueva-tira-led",
        name: "NuevaTiraLed",
        component: () => import("@/pages/tiras-led/NuevaTiraLedPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-tira-led/:id",
        name: "EditarTiraLed",
        component: () => import("@/pages/tiras-led/EditarTiraLedPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/accesorios",
        name: "Accesorios",
        component: () => import("@/pages/accesorios/AccesoriosPage.vue"),
    },
    {
        path: "/nuevo-accesorio",
        name: "NuevoAccesorio",
        component: () => import("@/pages/accesorios/NuevoAccesorioPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-accesorio/:id",
        name: "EditarAccesorio",
        component: () => import("@/pages/accesorios/EditarAccesorioPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/apagadores",
        name: "Apagadores",
        component: () => import("@/pages/apagadores/ApagadoresPage.vue"),
    },
    {
        path: "/nuevo-apagador",
        name: "NuevoApagador",
        component: () => import("@/pages/apagadores/NuevoApagadorPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-apagador/:id",
        name: "EditarApagador",
        component: () => import("@/pages/apagadores/EditarApagadorPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/perfil-aluminio",
        name: "PerfilAluminio",
        component: () => import("@/pages/perfil-aluminio/PerfilAluminioPage.vue"),
    },
    {
        path: "/nuevo-perfil-aluminio",
        name: "NuevoPerfilAluminio",
        component: () => import("@/pages/perfil-aluminio/NuevoPerfilAluminioPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/editar-perfil-aluminio/:id",
        name: "EditarPerfilAluminio",
        component: () => import("@/pages/perfil-aluminio/EditarPerfilAluminioPage.vue"),
        meta: { permission: "catalogs.write" },
    },
    {
        path: "/admin",
        name: "Admin",
        component: () => import("@/pages/admin/AdminPage.vue"),
        meta: { permission: "users.read" },
    }

];

export default routes;