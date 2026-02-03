import CotizacionesPage from "@/pages/cotizaciones/CotizacionesPage.vue";
import CotizacionDetalladaPage from "@/pages/cotizaciones/CotizacionDetalladaPage.vue";
import NuevaCotizacionPage from "@/pages/cotizaciones/NuevaCotizacionPage.vue";
import EditarCotizacionPage from "@/pages/cotizaciones/EditarCotizacionPage.vue";
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
import NuevoTipoMaterialPage from "@/pages/tiipoDeMaterial/NuevoTipoMaterialPage.vue";
import EditarTipoMaterialPage from "@/pages/tiipoDeMaterial/EditarTipoMaterialPage.vue";
import ManoDeObraPage from "@/pages/mano-de-obra/ManoDeObraPage.vue";
import NuevoManoDeObraPage from "@/pages/mano-de-obra/NuevoManoDeObraPage.vue";
import EditarManoDeObraPage from "@/pages/mano-de-obra/EditarManoDeObraPage.vue";
import EstructurasPage from "@/pages/estructuras/EstructurasPage.vue";
import NuevaEstructuraPage from "@/pages/estructuras/NuevaEstructuraPage.vue";
import EditarEstructuraPage from "@/pages/estructuras/EditarEstructuraPage.vue";
import AcabadoTableroPage from "@/pages/acabadoTabllero/AcabadoTableroPage.vue";
import NuevoAcabadoTableroPage from "@/pages/acabadoTabllero/NuevoAcabadoTableroPage.vue";
import EditarAcabadoTableroPage from "@/pages/acabadoTabllero/EditarAcabadoTableroPage.vue";

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
        path: "/editar-cotizacion/:id",
        name: "EditarCotizacion",
        component: EditarCotizacionPage,
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
        path: "/nuevo-tipo-material",
        name: "NuevoTipoMaterial",
        component: NuevoTipoMaterialPage,
    },
    {
        path: "/editar-tipo-material/:id",
        name: "EditarTipoMaterial",
        component: EditarTipoMaterialPage,
    },
    {
        path: "/mano-de-obra",
        name: "ManoDeObra",
        component: ManoDeObraPage,
    },
    {
        path: "/nuevo-mano-de-obra",
        name: "NuevoManoDeObra",
        component: NuevoManoDeObraPage,
    },
    {
        path: "/editar-mano-de-obra/:id",
        name: "EditarManoDeObra",
        component: EditarManoDeObraPage,
    },
    {
        path: "/estructuras",
        name: "Estructuras",
        component: EstructurasPage,
    },
    {
        path: "/nueva-estructura",
        name: "NuevaEstructura",
        component: NuevaEstructuraPage,
    },
    {
        path: "/editar-estructura/:id",
        name: "EditarEstructura",
        component: EditarEstructuraPage,
    },
    {
        path: "/acabado-tablero",
        name: "AcabadoTablero",
        component: AcabadoTableroPage,
    },
    {
        path: "/nuevo-acabado-tablero",
        name: "NuevoAcabadoTablero",
        component: NuevoAcabadoTableroPage,
    },
    {
        path: "/editar-acabado-tablero/:id",
        name: "EditarAcabadoTablero",
        component: EditarAcabadoTableroPage,
    }

];

export default routes;