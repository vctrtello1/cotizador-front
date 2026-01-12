import CotizacionesPage from "@/pages/CotizacionesPage.vue";
import CotizacionDetalladaPage from "@/pages/CotizacionDetalladaPage.vue";
import NuevaCotizacionPage from "@/pages/NuevaCotizacionPage.vue";

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
    }

];

export default routes;