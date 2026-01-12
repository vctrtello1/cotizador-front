import CotizacionesPage from "@/pages/CotizacionesPage.vue";
import CotizacionDetalladaPage from "@/pages/CotizacionDetalladaPage.vue";
import NuevaCotizacionPage from "@/pages/NuevaCotizacionPage.vue";
import NuevoModuloPage from "@/pages/NuevoModuloPage.vue";
import ModulosPage from "@/pages/ModulosPage.vue";

export const routes = [
    {
        path: "/",
        redirect: "/cotizaciones",
    },
    {
        path: "/cotizaciones",
        name: "Cotizaciones",
        component: CotizacionesPage,
    },
    {
        path: "/nueva-cotizacion",
        name: "NuevaCotizacion",
        component: NuevaCotizacionPage,
    },
    {
        path: "/cotizacion-detallada/:id",
        name: "CotizacionDetallada",
        component: CotizacionDetalladaPage,
    },
    {
        path: "/modulos",
        name: "Modulos",
        component: ModulosPage,
    },
    {
        path: "/nuevo-modulo",
        name: "NuevoModulo",
        component: NuevoModuloPage,
    }

];

export default routes;