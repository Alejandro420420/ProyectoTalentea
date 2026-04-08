const Valoracion = require("../models/Valoracion")
const Proyecto = require("../models/Proyecto")
const Usuario = require("../models/Usuario")
const Candidatura = require("../models/Candidatura")
const manejarAsincrono = require("../utils/manejadorAsincrono")
const { crearRegistroAuditoria } = require("../utils/auditoria")

const recalcularValoracionMedia = async (idUsuario) => {
    const valoraciones = await Valoracion.find({ destinatario: idUsuario })
    const totalValoraciones = valoraciones.length
    const valoracionMedia =
        totalValoraciones === 0
            ? 0
            : valoraciones.reduce((suma, elemento) => suma + elemento.puntuacion, 0) / totalValoraciones

    await Usuario.findByIdAndUpdate(idUsuario, {
        valoracionMedia: Number(valoracionMedia.toFixed(2)),
        totalValoraciones
    })
}

const obtenerIdsParticipantesProyecto = async (proyecto) => {
    const idsParticipantes = new Set([proyecto.empresa?.toString(), proyecto.creativoSeleccionado?.toString()].filter(Boolean))

    const candidaturasAceptadas = await Candidatura.find({
        proyecto: proyecto._id,
        estado: "aceptada"
    }).select("creativo")

    candidaturasAceptadas.forEach((candidatura) => {
        if (candidatura.creativo) {
            idsParticipantes.add(candidatura.creativo.toString())
        }
    })

    return Array.from(idsParticipantes)
}

const crearValoracion = manejarAsincrono(async (solicitud, respuesta) => {
    const { idProyecto, idDestinatario, puntuacion, comentario } = solicitud.body
    const proyecto = await Proyecto.findById(idProyecto)

    if (!proyecto) {
        return respuesta.status(404).json({ mensaje: "Proyecto no encontrado" })
    }

    const autorEsEmpresa = proyecto.empresa.toString() === solicitud.usuario._id.toString()
    const idsParticipantes = await obtenerIdsParticipantesProyecto(proyecto)
    const autorEsCreativo = idsParticipantes.includes(solicitud.usuario._id.toString()) && !autorEsEmpresa

    if (!autorEsEmpresa && !autorEsCreativo && solicitud.usuario.rol !== "admin") {
        return respuesta.status(403).json({ mensaje: "No participaste en este proyecto" })
    }

    if (proyecto.estado !== "completado" && solicitud.usuario.rol !== "admin") {
        return respuesta.status(400).json({ mensaje: "Solo puedes valorar proyectos completados" })
    }

    if (solicitud.usuario._id.toString() === idDestinatario) {
        return respuesta.status(400).json({ mensaje: "No puedes valorarte a ti mismo" })
    }

    if (!idsParticipantes.includes(idDestinatario) && solicitud.usuario.rol !== "admin") {
        return respuesta.status(400).json({ mensaje: "La persona valorada no pertenece al proyecto" })
    }

    const valoracion = await Valoracion.create({
        proyecto: proyecto._id,
        autor: solicitud.usuario._id,
        destinatario: idDestinatario,
        puntuacion,
        comentario: comentario || ""
    })

    await recalcularValoracionMedia(idDestinatario)

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "valoracion_creada",
        tipoEntidad: "valoracion",
        idEntidad: valoracion._id.toString(),
        metadatos: { idProyecto: proyecto._id.toString(), idDestinatario }
    })

    respuesta.status(201).json({ valoracion })
})

const obtenerOpcionesValoracion = manejarAsincrono(async (solicitud, respuesta) => {
    const rolNormalizado = solicitud.usuario.rol === "creativo" ? "usuario" : solicitud.usuario.rol
    const idDestinatarioFiltrado = solicitud.query.idDestinatario || ""
    const consulta = rolNormalizado === "empresa" ? { empresa: solicitud.usuario._id, estado: "completado" } : { estado: "completado" }

    const proyectos = await Proyecto.find(consulta)
        .populate("empresa", "nombre nombreEmpresa fotoPerfil verificado")
        .populate("creativoSeleccionado", "nombre fotoPerfil verificado")
        .sort({ updatedAt: -1 })

    const opciones = []

    for (const proyecto of proyectos) {
        const destinatarios = []

        if (proyecto.empresa && proyecto.empresa._id.toString() !== solicitud.usuario._id.toString()) {
            destinatarios.push({
                id: proyecto.empresa._id.toString(),
                nombre: proyecto.empresa.nombreEmpresa || proyecto.empresa.nombre,
                rol: "empresa"
            })
        }

        const candidaturasAceptadas = await Candidatura.find({
            proyecto: proyecto._id,
            estado: "aceptada"
        }).populate("creativo", "nombre fotoPerfil verificado")

        candidaturasAceptadas.forEach((candidatura) => {
            if (!candidatura.creativo) {
                return
            }

            const idCreativo = candidatura.creativo._id.toString()
            if (idCreativo === solicitud.usuario._id.toString()) {
                return
            }

            if (destinatarios.some((destinatario) => destinatario.id === idCreativo)) {
                return
            }

            destinatarios.push({
                id: idCreativo,
                nombre: candidatura.creativo.nombre,
                rol: "usuario"
            })
        })

        const destinatariosFiltrados = idDestinatarioFiltrado
            ? destinatarios.filter((destinatario) => destinatario.id === idDestinatarioFiltrado)
            : destinatarios

        if (rolNormalizado === "usuario" && !destinatariosFiltrados.some((destinatario) => destinatario.rol === "empresa")) {
            continue
        }

        if (rolNormalizado === "empresa" && destinatariosFiltrados.length === 0) {
            continue
        }

        opciones.push({
            id: proyecto._id,
            titulo: proyecto.titulo,
            categoria: proyecto.categoria,
            destinatarios: destinatariosFiltrados
        })
    }

    respuesta.json({ elementos: opciones.filter((opcion) => opcion.destinatarios.length > 0) })
})

const listarValoracionesDeUsuario = manejarAsincrono(async (solicitud, respuesta) => {
    const valoraciones = await Valoracion.find({ destinatario: solicitud.params.idUsuario })
        .populate("autor", "nombre rol nombreEmpresa")
        .populate("proyecto", "titulo categoria")
        .sort({ createdAt: -1 })

    respuesta.json({ elementos: valoraciones })
})

module.exports = {
    crearValoracion,
    listarValoracionesDeUsuario,
    obtenerOpcionesValoracion
}
