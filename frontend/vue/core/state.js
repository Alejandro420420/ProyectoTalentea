window.TalenteaState = {
    crearEstadoInicial() {
        return {
            token: localStorage.getItem("talentea_token") || "",
            usuario: JSON.parse(localStorage.getItem("talentea_usuario") || "null"),
            tema: localStorage.getItem("talentea_tema") || "claro",
            vistaAcceso: "login",
            seccionActiva: "inicio",
            aviso: { mensaje: "", visible: false, error: false },
            registro: { nombre: "", email: "", password: "", rol: "usuario", nombreEmpresa: "" },
            login: { email: "", password: "" },
            perfil: {
                nombre: "",
                fotoPerfil: "",
                estudios: "",
                ubicacion: "",
                web: "",
                nombreEmpresa: "",
                categorias: "",
                habilidades: "",
                intereses: "",
                biografia: ""
            },
            proyectoFormulario: {
                titulo: "",
                categoria: "",
                palabrasClave: "",
                salario: "",
                frecuenciaSalario: "mes",
                ubicacion: "",
                remoto: true,
                descripcion: ""
            },
            valoracionFormulario: { idProyecto: "", idDestinatario: "", puntuacion: "", comentario: "" },
            candidaturaFormulario: { idProyecto: "", cartaPresentacion: "" },
            filtros: { busquedaProyecto: "", categoriaProyecto: "", busquedaTalento: "", categoriaTalento: "" },
            proyectos: [],
            talento: [],
            empresasInicio: [],
            misCandidaturas: [],
            proyectosEmpresa: [],
            portafolioEdicion: [],
            opcionesValoracion: [],
            valoracionFijada: { idDestinatario: "", bloqueada: false },
            modalProyecto: null,
            modalPerfil: null,
            modalCandidatura: false,
            enviandoProyecto: false
        }
    }
}
