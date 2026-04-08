(() => {
window.Talentea = window.Talentea || {}

const App = window.Talentea

App.estado = {
    token: localStorage.getItem("talentea_token") || "",
    usuario: JSON.parse(localStorage.getItem("talentea_usuario") || "null"),
    tema: localStorage.getItem("talentea_tema") || "oscuro",
    seccionActiva: "inicio",
    enviandoProyecto: false,
    valoracionFijada: {
        idDestinatario: "",
        bloqueada: false
    }
}

App.seleccionar = (selector) => document.querySelector(selector)

App.elementos = {
    cuerpo: document.body,
    vistaAcceso: App.seleccionar("#vistaAcceso"),
    vistaPanel: App.seleccionar("#vistaPanel"),
    estadoSesion: App.seleccionar("#estadoSesion"),
    botonTema: App.seleccionar("#botonTema"),
    botonCerrarSesion: App.seleccionar("#botonCerrarSesion"),
    mostrarLogin: App.seleccionar("#mostrarLogin"),
    mostrarRegistro: App.seleccionar("#mostrarRegistro"),
    formularioLogin: App.seleccionar("#formularioLogin"),
    formularioRegistro: App.seleccionar("#formularioRegistro"),
    formularioPerfil: App.seleccionar("#formularioPerfil"),
    formularioProyecto: App.seleccionar("#formularioProyecto"),
    formularioValoracion: App.seleccionar("#formularioValoracion"),
    botonActualizarProyectos: App.seleccionar("#botonActualizarProyectos"),
    botonActualizarCreativos: App.seleccionar("#botonActualizarCreativos"),
    busquedaProyecto: App.seleccionar("#busquedaProyecto"),
    categoriaProyecto: App.seleccionar("#categoriaProyecto"),
    busquedaCreativo: App.seleccionar("#busquedaCreativo"),
    categoriaCreativo: App.seleccionar("#categoriaCreativo"),
    listaProyectos: App.seleccionar("#listaProyectos"),
    listaCreativos: App.seleccionar("#listaCreativos"),
    listaMisCandidaturas: App.seleccionar("#listaMisCandidaturas"),
    listaProyectosEmpresa: App.seleccionar("#listaProyectosEmpresa"),
    metricasAdministracion: App.seleccionar("#metricasAdministracion"),
    listaUsuariosAdmin: App.seleccionar("#listaUsuariosAdmin"),
    listaAuditoria: App.seleccionar("#listaAuditoria"),
    modalProyecto: App.seleccionar("#modalProyecto"),
    cerrarModalProyecto: App.seleccionar("#cerrarModalProyecto"),
    detalleProyecto: App.seleccionar("#detalleProyecto"),
    modalPerfil: App.seleccionar("#modalPerfil"),
    cerrarModalPerfil: App.seleccionar("#cerrarModalPerfil"),
    detallePerfil: App.seleccionar("#detallePerfil"),
    navegacionPanel: App.seleccionar("#navegacionPanel"),
    selectorProyectoValoracion: App.seleccionar("#selectorProyectoValoracion"),
    selectorDestinatarioValoracion: App.seleccionar("#selectorDestinatarioValoracion"),
    archivoPortafolio: App.seleccionar("#archivoPortafolio"),
    botonSubirArchivoPortafolio: App.seleccionar("#botonSubirArchivoPortafolio"),
    tituloArchivoPortafolio: App.seleccionar("#tituloArchivoPortafolio"),
    categoriaArchivoPortafolio: App.seleccionar("#categoriaArchivoPortafolio"),
    descripcionArchivoPortafolio: App.seleccionar("#descripcionArchivoPortafolio"),
    listaPortafolioEditable: App.seleccionar("#listaPortafolioEditable"),
    aviso: App.seleccionar("#aviso")
}

App.opcionesValoracion = []
App.textoInsigniaVerificada = "Certificada por Talentea"

App.esRolUsuario = (usuario) => usuario?.rol === "usuario" || usuario?.rol === "creativo"

App.obtenerTextoRol = (rol) => {
    if (rol === "creativo") return "usuario"
    return rol || ""
}

App.obtenerIniciales = (texto = "") =>
    texto
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() || "")
        .join("")

App.renderizarAvatar = (entidad, nombreAlternativo) => {
    const foto = entidad?.fotoPerfil
    const nombre = entidad?.nombreEmpresa || entidad?.nombre || nombreAlternativo || "Perfil"

    if (foto) {
        return `<img class="foto-perfil" src="${foto}" alt="${nombre}" />`
    }

    return `<div class="foto-placeholder">${App.obtenerIniciales(nombre)}</div>`
}

App.seccionesBase = [
    { id: "inicio", etiqueta: "Inicio" },
    { id: "perfil", etiqueta: "Perfil" },
    { id: "proyectos", etiqueta: "Proyectos" },
    { id: "talento", etiqueta: "Talento" }
]

App.tarjeta = (contenido) => `<article class="tarjeta">${contenido}</article>`

App.obtenerTipoMedia = (url = "") => {
    const urlNormalizada = url.toLowerCase()
    if (urlNormalizada.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "imagen"
    if (urlNormalizada.endsWith(".mp3")) return "audio"
    if (urlNormalizada.endsWith(".mp4")) return "video"
    return "enlace"
}

App.renderizarVistaMedia = (elementoPortafolio) => {
    const url = elementoPortafolio.urlMedia || elementoPortafolio.urlProyecto || ""
    const tipo = App.obtenerTipoMedia(url)

    if (tipo === "imagen") {
        return `<img class="preview-portafolio" src="${url}" alt="${elementoPortafolio.titulo || "Muestra"}" />`
    }

    if (tipo === "audio") {
        return `<audio class="preview-audio" controls src="${url}"></audio>`
    }

    if (tipo === "video") {
        return `<video class="preview-video" controls src="${url}"></video>`
    }

    return `<a class="enlace-portafolio" href="${url}" target="_blank" rel="noreferrer">Abrir muestra</a>`
}

App.renderizarPortafolioEditable = () => {
    const portafolio = App.estado.portafolioEdicion || []
    App.elementos.formularioPerfil.portafolio.value = JSON.stringify(portafolio)
    App.elementos.listaPortafolioEditable.innerHTML =
        portafolio.length === 0
            ? App.tarjeta("<p class='meta'>Todavia no has subido muestras. Puedes anadir imagenes, audio o video.</p>")
            : portafolio
                  .map(
                      (elemento, indice) => `
                        <article class="tarjeta">
                            ${App.renderizarVistaMedia(elemento)}
                            <h3 class="top-gap">${elemento.titulo || "Muestra sin titulo"}</h3>
                            <p class="meta">${elemento.categoria || "Sin categoria"}</p>
                            <p>${elemento.descripcion || "Sin descripcion"}</p>
                            <div class="acciones">
                                <a class="boton-secundario enlace-boton" href="${elemento.urlMedia || elemento.urlProyecto}" target="_blank" rel="noreferrer">Abrir archivo</a>
                                <button type="button" class="boton-secundario" data-accion="eliminar-muestra" data-indice-muestra="${indice}">Eliminar</button>
                            </div>
                        </article>
                      `
                  )
                  .join("")
}

App.mostrarAviso = (mensaje, esError = false) => {
    App.elementos.aviso.textContent = mensaje
    App.elementos.aviso.style.background = esError ? "rgba(173, 60, 44, 0.94)" : "rgba(20, 14, 32, 0.94)"
    App.elementos.aviso.classList.add("show")
    clearTimeout(App.mostrarAviso.temporizador)
    App.mostrarAviso.temporizador = setTimeout(() => App.elementos.aviso.classList.remove("show"), 2600)
}

App.aplicarTema = () => {
    App.elementos.cuerpo.dataset.tema = App.estado.tema
    App.elementos.botonTema.textContent = App.estado.tema === "oscuro" ? "\u263D" : "\u2600"
    localStorage.setItem("talentea_tema", App.estado.tema)
}

App.cambiarTema = () => {
    App.estado.tema = App.estado.tema === "oscuro" ? "claro" : "oscuro"
    App.aplicarTema()
}

App.guardarSesion = (datosSesion) => {
    App.estado.token = datosSesion?.token || ""
    App.estado.usuario = datosSesion?.usuario || null

    if (App.estado.token && App.estado.usuario) {
        localStorage.setItem("talentea_token", App.estado.token)
        localStorage.setItem("talentea_usuario", JSON.stringify(App.estado.usuario))
    } else {
        localStorage.removeItem("talentea_token")
        localStorage.removeItem("talentea_usuario")
    }

    App.actualizarInterfazGeneral()
}

App.llamarApi = async (url, opciones = {}) => {
    const encabezados = {
        "Content-Type": "application/json",
        ...(opciones.headers || {})
    }

    if (App.estado.token) {
        encabezados.Authorization = `Bearer ${App.estado.token}`
    }

    const respuesta = await fetch(url, { ...opciones, headers: encabezados })
    const datos = await respuesta.json().catch(() => ({}))

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo completar la operacion")
    }

    return datos
}

App.construirNavegacion = () => {
    const iconosGrupo = {
        Base: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
        Usuario: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        Empresa: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 7V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7m-9 0h10.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-8A2.5 2.5 0 0 1 6.5 7H7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 12h16" stroke="currentColor" stroke-width="1.8"/></svg>',
        Admin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    }

    const grupos = [{ titulo: "Base", secciones: [...App.seccionesBase] }]

    if (App.esRolUsuario(App.estado.usuario)) {
        grupos.push({
            titulo: "Usuario",
            secciones: [
                { id: "mis-candidaturas", etiqueta: "Mis candidaturas" },
                { id: "valoraciones", etiqueta: "Valorar trabajo" }
            ]
        })
    }

    if (App.estado.usuario?.rol === "empresa") {
        grupos.push({
            titulo: "Empresa",
            secciones: [
                { id: "empresa", etiqueta: "Publicar proyecto" },
                { id: "gestion-empresa", etiqueta: "Gestionar candidaturas" },
                { id: "valoraciones", etiqueta: "Valorar trabajo" }
            ]
        })
    }

    if (App.estado.usuario?.rol === "admin") {
        grupos.push({
            titulo: "Admin",
            secciones: [{ id: "administracion", etiqueta: "Administracion" }]
        })
    }

    App.elementos.navegacionPanel.innerHTML = grupos
        .map(
            (grupo) => `
                <div class="grupo-navegacion">
                    <span class="titulo-grupo" title="${grupo.titulo}">${iconosGrupo[grupo.titulo] || grupo.titulo}</span>
                    ${grupo.secciones
                        .map(
                            (seccion) =>
                                `<button type="button" class="${App.estado.seccionActiva === seccion.id ? "activa" : ""}" data-seccion="${seccion.id}">${seccion.etiqueta}</button>`
                        )
                        .join("")}
                </div>
            `
        )
        .join("")
}

App.mostrarSeccion = (idSeccion) => {
    App.estado.seccionActiva = idSeccion
    document.querySelectorAll("[data-seccion]").forEach((bloque) => {
        bloque.classList.toggle("hidden", bloque.dataset.seccion !== idSeccion)
    })
    App.construirNavegacion()
}

App.rellenarFormularioPerfil = () => {
    const usuario = App.estado.usuario
    if (!usuario || !App.elementos.formularioPerfil) {
        return
    }

    App.elementos.formularioPerfil.nombre.value = usuario.nombre || ""
    App.elementos.formularioPerfil.fotoPerfil.value = usuario.fotoPerfil || ""
    App.elementos.formularioPerfil.titular.value = usuario.titular || ""
    App.elementos.formularioPerfil.ubicacion.value = usuario.ubicacion || ""
    App.elementos.formularioPerfil.web.value = usuario.web || ""
    App.elementos.formularioPerfil.nombreEmpresa.value = usuario.nombreEmpresa || ""
    App.elementos.formularioPerfil.categorias.value = (usuario.categorias || []).join(", ")
    App.elementos.formularioPerfil.habilidades.value = (usuario.habilidades || []).join(", ")
    App.elementos.formularioPerfil.intereses.value = (usuario.intereses || []).join(", ")
    App.elementos.formularioPerfil.biografia.value = usuario.biografia || ""
    App.estado.portafolioEdicion = [...(usuario.portafolio || [])]
    App.renderizarPortafolioEditable()
}

App.actualizarInterfazGeneral = () => {
    const usuario = App.estado.usuario
    App.elementos.botonCerrarSesion.classList.toggle("hidden", !usuario)
    App.elementos.navegacionPanel.classList.toggle("hidden", !usuario)
    App.elementos.vistaAcceso.classList.toggle("hidden", Boolean(usuario))
    App.elementos.vistaPanel.classList.toggle("hidden", !usuario)

    if (!usuario) {
        App.elementos.estadoSesion.textContent = "No has iniciado sesion"
        return
    }

    App.elementos.estadoSesion.textContent = `${usuario.nombre} - ${App.obtenerTextoRol(usuario.rol)} - ${usuario.verificado ? "verificado" : "sin verificar"}`
    App.construirNavegacion()
    App.mostrarSeccion(App.estado.seccionActiva)
    App.rellenarFormularioPerfil()
}
})()
