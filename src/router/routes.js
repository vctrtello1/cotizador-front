import CotizacionesPage from "@/pages/cotizaciones/CotizacionesPage.vue";
import CotizacionDetalladaPage from "@/pages/cotizaciones/CotizacionDetalladaPage.vue";
import NuevaCotizacionPage from "@/pages/componentes/NuevaCotizacionPage.vue";
import NuevoModuloPage from "@/pages/modulos/NuevoModuloPage.vue";
import EditarModuloPage from "@/pages/modulos/EditarModuloPage.vue";
import ModulosPage from "@/pages/modulos/ModulosPage.vue";
import ComponentesPage from "@/pages/cotizaciones/ComponentesPage.vue";
import NuevoComponente from "@/pages/componentes/NuevoComponente.vue";

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
    },
    {
        path: "/editar-modulo/:id",
        name: "EditarModulo",
        component: EditarModuloPage,
    },
    {
        path: "/componentes",
        name: "Componentes",
        component: ComponentesPage,
    },
    {
        path: "/nuevo-componente",
        name: "NuevoComponente",
        component: NuevoComponente,
    }

];

export default routes;