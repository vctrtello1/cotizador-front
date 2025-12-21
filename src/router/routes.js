import CotizacionesPage from "@/pages/CotizacionesPage.vue";
import CotizacionDetalladaPage from "@/pages/CotizacionDetalladaPage.vue";

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
        path: "/cotizacion-detallada/:id",
        name: "CotizacionDetallada",
        component: CotizacionDetalladaPage,
    }

];

export default routes;