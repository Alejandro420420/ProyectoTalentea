(() => {
const App = window.Talentea

App.poblarDestinatariosValoracion = (idProyecto, idDestinatarioPreseleccionado = "") => {
    const proyectoSeleccionado = App.opcionesValoracion.find((opcion) => opcion.id === idProyecto)
    const destinatarios = proyectoSeleccionado?.destinatarios || []
    const idFijado = App.estado.valoracionFijada.idDestinatario || idDestinatarioPreseleccionado
    const destinatariosVisibles = App.estado.valoracionFijada.bloqueada
        ? destinatarios.filter((destinatario) => destinatario.id === idFijado)
        : destinatarios

    App.elementos.selectorDestinatarioValoracion.innerHTML = `
        <option value="">Selecciona una persona</option>
        ${destinatariosVisibles
            .map(
                (destinatario) =>
                    `<option value="${destinatario.id}" ${
                        (idFijado || idDestinatarioPreseleccionado) === destinatario.id ? "selected" : ""
                    }>${destinatario.nombre} - ${destinatario.rol}</option>`
            )
            .join("")}
    `

    App.elementos.selectorDestinatarioValoracion.disabled = App.estado.valoracionFijada.bloqueada
}

App.cargarOpcionesValoracion = async (idProyectoPreseleccionado = "", idDestinatarioPreseleccionado = "") => {
    if (!App.estado.usuario) {
        return
    }

    const idDestinatarioActivo = App.estado.valoracionFijada.idDestinatario || idDestinatarioPreseleccionado
    const parametros = new URLSearchParams()
    if (idDestinatarioActivo) {
        parametros.set("idDestinatario", idDestinatarioActivo)
    }

    const sufijo = parametros.toString() ? `?${parametros.toString()}` : ""
    const datos = await App.llamarApi(`/api/valoraciones/opciones${sufijo}`)
    App.opcionesValoracion = datos.elementos || []

    const proyectoInicial =
        idProyectoPreseleccionado ||
        App.opcionesValoracion.find((opcion) =>
            idDestinatarioActivo ? opcion.destinatarios.some((destinatario) => destinatario.id === idDestinatarioActivo) : true
        )?.id ||
        ""

    App.elementos.selectorProyectoValoracion.innerHTML = `
        <option value="">Selecciona un proyecto</option>
        ${App.opcionesValoracion
            .map(
                (opcion) =>
                    `<option value="${opcion.id}" ${
                        proyectoInicial === opcion.id ? "selected" : ""
                    }>${opcion.titulo} - ${opcion.categoria}</option>`
            )
            .join("")}
    `

    App.poblarDestinatariosValoracion(proyectoInicial || App.elementos.selectorProyectoValoracion.value, idDestinatarioActivo)
}

App.restablecerValoracionFijada = () => {
    App.estado.valoracionFijada = { idDestinatario: "", bloqueada: false }
    App.elementos.selectorDestinatarioValoracion.disabled = false
}

App.obtenerOpcionesValorablesPorPersona = async (idDestinatario) => {
    if (!App.estado.usuario || !idDestinatario) {
        return []
    }

    const parametros = new URLSearchParams({ idDestinatario })
    const datos = await App.llamarApi(`/api/valoraciones/opciones?${parametros.toString()}`)
    return datos.elementos || []
}

App.abrirSeccionValoraciones = async (idProyecto = "", idDestinatario = "") => {
    App.estado.valoracionFijada = {
        idDestinatario: idDestinatario || "",
        bloqueada: Boolean(idDestinatario)
    }

    await App.cargarOpcionesValoracion(idProyecto, idDestinatario)

    if (idDestinatario && App.opcionesValoracion.length === 0) {
        App.restablecerValoracionFijada()
        throw new Error("Solo puedes valorar a personas aceptadas en proyectos completados")
    }

    App.mostrarSeccion("valoraciones")
    App.elementos.modalProyecto.classList.add("hidden")
    App.elementos.modalPerfil.classList.add("hidden")
}
})()
