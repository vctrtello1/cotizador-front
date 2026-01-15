import CotizacionesPage from "@/pages/cotizaciones/CotizacionesPage.vue";
import CotizacionDetalladaPage from "@/pages/cotizaciones/CotizacionDetalladaPage.vue";
import NuevaCotizacionPage from "@/pages/cotizaciones/NuevaCotizacionPage.vue";
import NuevoModuloPage from "@/pages/modulos/NuevoModuloPage.vue";
import EditarModuloPage from "@/pages/modulos/EditarModuloPage.vue";
import ModulosPage from "@/pages/modulos/ModulosPage.vue";
import ComponentesPage from "@/pages/componentes/ComponentesPage.vue";
import NuevoComponentePage from "@/pages/componentes/NuevoComponentePage.vue";
import EditarComponentePage from "@/pages/componentes/EditarComponentePage.vue";
import MaterialesPage from "@/pages/materiales/MaterialesPage.vue";
import NuevoMaterial from "@/pages/materiales/NuevoMaterial.vue";
import EditarMaterial from "@/pages/materiales/EditarMaterial.vue";
import AcabadosPage from "@/pages/acabados/AcabadosPage.vue";
import NuevoAcabadoPage from "@/pages/acabados/NuevoAcabadoPage.vue";
import EditarAcabadoPage from "@/pages/acabados/EditarAcabadoPage.vue";
import TiposDeMateriales from "@/pages/tiipoDeMaterial/TiposDeMateriales.vue";
import ManoDeObraPage from "@/pages/mano-de-obra/ManoDeObraPage.vue";

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
        component: NuevoComponentePage,
    },
    {
        path: "/editar-componente/:id",
        name: "EditarComponente",
        component: EditarComponentePage,
    },
    {
        path: "/materiales",
        name: "Materiales",
        component: MaterialesPage,
    },
    {
        path: "/nuevo-material",
        name: "NuevoMaterial",
        component: NuevoMaterial,
    },
    {
        path: "/editar-material/:id",
        name: "EditarMaterial",
        component: EditarMaterial,
    },
    {
        path: "/acabados",
        name: "Acabados",
        component: AcabadosPage,
    },
    {
        path: "/nuevo-acabado",
        name: "NuevoAcabado",
        component: NuevoAcabadoPage,
    },
    {
        path: "/editar-acabado/:id",
        name: "EditarAcabado",
        component: EditarAcabadoPage,
    },
    {
        path: "/tipo-de-material",
        name: "TiposDeMateriales",
        component: TiposDeMateriales,
    },
    {
        path: "/mano-de-obra",
        name: "ManoDeObra",
        component: ManoDeObraPage,
    }

];

export default routes;