export const routes = [
    {
        path: "/",
        redirect: "/cotizaciones",
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
    },
    {
        path: "/editar-modulo/:id",
        name: "EditarModulo",
        component: () => import("@/pages/modulos/EditarModuloPage.vue"),
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
    },
    {
        path: "/editar-componente/:id",
        name: "EditarComponente",
        component: () => import("@/pages/componentes/EditarComponentePage.vue"),
    },
    {
        path: "/materiales",
        name: "Materiales",
        component: () => import("@/pages/materiales/MaterialesPage.vue"),
    },
    {
        path: "/nuevo-material",
        name: "NuevoMaterial",
        component: () => import("@/pages/materiales/NuevoMaterial.vue"),
    },
    {
        path: "/editar-material/:id",
        name: "EditarMaterial",
        component: () => import("@/pages/materiales/EditarMaterial.vue"),
    },
    {
        path: "/mano-de-obra",
        name: "ManoDeObra",
        component: () => import("@/pages/mano-de-obra/ManoDeObraPage.vue"),
    },
    {
        path: "/nuevo-mano-de-obra",
        name: "NuevoManoDeObra",
        component: () => import("@/pages/mano-de-obra/NuevoManoDeObraPage.vue"),
    },
    {
        path: "/editar-mano-de-obra/:id",
        name: "EditarManoDeObra",
        component: () => import("@/pages/mano-de-obra/EditarManoDeObraPage.vue"),
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
    },
    {
        path: "/editar-estructura/:id",
        name: "EditarEstructura",
        component: () => import("@/pages/estructuras/EditarEstructuraPage.vue"),
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
    },
    {
        path: "/editar-acabado-tablero/:id",
        name: "EditarAcabadoTablero",
        component: () => import("@/pages/acabadoTabllero/EditarAcabadoTableroPage.vue"),
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
    },
    {
        path: "/editar-corredera/:id",
        name: "EditarCorredera",
        component: () => import("@/pages/correderas/EditarCorrederaPage.vue"),
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
    },
    {
        path: "/editar-compas-abatible/:id",
        name: "EditarCompasAbatible",
        component: () => import("@/pages/compases-abatibles/EditarCompasAbatiblePage.vue"),
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
    },
    {
        path: "/editar-puerta/:id",
        name: "EditarPuerta",
        component: () => import("@/pages/puertas/EditarPuertaPage.vue"),
    }

];

export default routes;