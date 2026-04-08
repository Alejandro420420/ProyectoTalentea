(() => {
const App = window.Talentea

App.abrirPerfil = async (idUsuario, contextoProyecto = "") => {
    const [datosPerfil, datosValoraciones, opcionesValoracion] = await Promise.all([
        App.llamarApi(`/api/usuarios/${idUsuario}`),
        App.llamarApi(`/api/valoraciones/usuario/${idUsuario}`),
        App.estado.usuario ? App.obtenerOpcionesValorablesPorPersona(idUsuario).catch(() => []) : Promise.resolve([])
    ])

    const usuario = datosPerfil.usuario
    const valoraciones = datosValoraciones.elementos || []
    const portafolio = usuario.portafolio || []
    const proyectosValorables = Array.isArray(opcionesValoracion) ? opcionesValoracion : []
    const proyectoCoincidente = contextoProyecto
        ? proyectosValorables.find((proyecto) => proyecto.id === contextoProyecto)
        : null
    const puedeValorarPerfil = proyectosValorables.length > 0 && (!contextoProyecto || Boolean(proyectoCoincidente))

    App.elementos.detallePerfil.innerHTML = `
        <div class="encabezado-detalle">
            ${App.renderizarAvatar(usuario, usuario.nombre)}
            <div>
                <h2>${usuario.nombre}</h2>
                <p class="meta">${usuario.titular || "Sin titular"} - ${App.obtenerTextoRol(usuario.rol)}</p>
                ${usuario.verificado ? `<span class="insignia-verificada">${App.textoInsigniaVerificada}</span>` : ""}
            </div>
        </div>
        <p class="top-gap">${usuario.biografia || "Sin biografia todavia."}</p>
        <div>${(usuario.categorias || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
        <div>${(usuario.habilidades || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
        <div class="top-gap">
            <h3>Muestras destacadas</h3>
            <div class="detalle-valoraciones">
                ${
                    portafolio.length
                        ? portafolio
                              .map(
                                  (elemento) => `
                                    <div class="tarjeta">
                                        ${App.renderizarVistaMedia(elemento)}
                                        <h3 class="top-gap">${elemento.titulo || "Muestra"}</h3>
                                        <p class="meta">${elemento.categoria || "Sin categoria"}</p>
                                        <p>${elemento.descripcion || "Sin descripcion."}</p>
                                    </div>
                                  `
                              )
                              .join("")
                        : "<p class='meta'>Este perfil todavia no ha subido muestras.</p>"
                }
            </div>
        </div>
        <div class="acciones top-gap">
            ${
                puedeValorarPerfil
                    ? `<button type="button" class="boton-secundario" data-accion="abrir-valoracion" data-id-usuario="${usuario._id}" data-id-proyecto="${proyectoCoincidente?.id || contextoProyecto || ""}">&#9733; Valorar a esta persona</button>`
                    : `<p class="meta">Podras valorar a esta persona cuando tenga una colaboracion aceptada y completada contigo.</p>`
            }
        </div>
        <div class="top-gap">
            <h3>Valoraciones</h3>
            <div class="detalle-valoraciones">
                ${
                    valoraciones.length
                        ? valoraciones
                              .map(
                                  (valoracion) => `
                                    <div class="tarjeta">
                                        <p><strong>${valoracion.puntuacion}/5</strong> - ${valoracion.proyecto?.titulo || "Proyecto"}</p>
                                        <p class="meta">Por ${valoracion.autor?.nombre || "Usuario"}</p>
                                        <p>${valoracion.comentario || "Sin comentario."}</p>
                                    </div>
                                  `
                              )
                              .join("")
                        : "<p class='meta'>Todavia no hay valoraciones visibles.</p>"
                }
            </div>
        </div>
    `

    App.elementos.modalPerfil.classList.remove("hidden")
}

App.abrirProyecto = async (idProyecto) => {
    const datos = await App.llamarApi(`/api/proyectos/${idProyecto}`)
    const proyecto = datos.proyecto
    const puedePostularse = App.esRolUsuario(App.estado.usuario) && proyecto.estado === "abierto"
    const puedeValorarEmpresa = Boolean(App.estado.usuario && App.esRolUsuario(App.estado.usuario) && proyecto.estado === "completado")

    App.elementos.detalleProyecto.innerHTML = `
        <div class="cabecera-perfil">
            ${App.renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
            <div>
                <h2>${proyecto.titulo}</h2>
                <p class="meta">${proyecto.categoria} - ${proyecto.remoto ? "Remoto" : proyecto.ubicacion || "Presencial"}</p>
                ${proyecto.empresa?.verificado ? `<span class="insignia-verificada">${App.textoInsigniaVerificada}</span>` : ""}
            </div>
        </div>
        <p class="top-gap">${proyecto.descripcion}</p>
        <p class="meta">Salario: ${proyecto.salario || 0} EUR / ${proyecto.frecuenciaSalario || "mes"}</p>
        <div>${(proyecto.palabrasClave || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
        <div class="tarjeta top-gap">
            <div class="empresa-detalle">
                ${App.renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
                <div>
                    <h3>${proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || "Empresa"}</h3>
                    <p class="meta">${proyecto.empresa?.titular || "Empresa en Talentea"}</p>
                    ${proyecto.empresa?.verificado ? `<span class="insignia-verificada">${App.textoInsigniaVerificada}</span>` : ""}
                </div>
            </div>
            <p class="top-gap">${proyecto.empresa?.biografia || "Sin descripcion de empresa por ahora."}</p>
            <p class="meta">Ubicacion: ${proyecto.empresa?.ubicacion || "No especificada"}</p>
            <p class="meta">Web: ${proyecto.empresa?.web || "No especificada"}</p>
            <div class="acciones">
                <button type="button" class="boton-secundario" data-accion="ver-perfil" data-id-usuario="${proyecto.empresa?._id}" data-id-proyecto="${proyecto._id}">Ver perfil de empresa</button>
                ${puedeValorarEmpresa ? `<button type="button" class="boton-estrella" data-accion="abrir-valoracion" data-id-usuario="${proyecto.empresa?._id}" data-id-proyecto="${proyecto._id}">&#9733; Valorar empresa</button>` : ""}
            </div>
        </div>
        ${puedePostularse ? `<div class="acciones top-gap"><button type="button" data-accion="postularse" data-id="${proyecto._id}">Postularme a este proyecto</button></div>` : ""}
    `

    App.elementos.modalProyecto.classList.remove("hidden")
}
})()
