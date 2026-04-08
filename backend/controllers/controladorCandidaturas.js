const Candidatura = require("../models/Candidatura")
const Proyecto = require("../models/Proyecto")
const manejarAsincrono = require("../utils/manejadorAsincrono")
const { crearRegistroAuditoria } = require("../utils/auditoria")

const parsearListaEnlaces = (valor) => {
    if (Array.isArray(valor)) {
        return valor.filter(Boolean)
    }

    if (typeof valor !== "string") {
        return []
    }

    return valor
        .split(",")
        .map((elemento) => elemento.trim())
        .filter(Boolean)
}

const postularseAProyecto = manejarAsincrono(async (solicitud, respuesta) => {
    const proyecto = await Proyecto.findById(solicitud.body.idProyecto)
    if (!proyecto) {
        return respuesta.status(404).json({ mensaje: "Proyecto no encontrado" })
    }

    if (proyecto.estado !== "abierto") {
        return respuesta.status(400).json({ mensaje: "El proyecto ya no acepta candidaturas" })
    }

    const candidatura = await Candidatura.create({
        proyecto: proyecto._id,
        creativo: solicitud.usuario._id,
        cartaPresentacion: solicitud.body.cartaPresentacion || "",
        enlacesPortafolio: parsearListaEnlaces(solicitud.body.enlacesPortafolio)
    })

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "candidatura_creada",
        tipoEntidad: "candidatura",
        idEntidad: candidatura._id.toString(),
        metadatos: { idProyecto: proyecto._id.toString() }
    })

    respuesta.status(201).json({ candidatura })
})

const listarMisCandidaturas = manejarAsincrono(async (solicitud, respuesta) => {
    const candidaturas = await Candidatura.find({ creativo: solicitud.usuario._id })
        .populate({
            path: "proyecto",
            populate: { path: "empresa", select: "nombre nombreEmpresa verificado" }
        })
        .sort({ createdAt: -1 })

    respuesta.json({ elementos: candidaturas })
})

const listarCandidaturasDeProyecto = manejarAsincrono(async (solicitud, respuesta) => {
    const proyecto = await Proyecto.findById(solicitud.params.idProyecto)
    if (!proyecto) {
        return respuesta.status(404).json({ mensaje: "Proyecto no encontrado" })
    }

    if (proyecto.empresa.toString() !== solicitud.usuario._id.toString() && solicitud.usuario.rol !== "admin") {
        return respuesta.status(403).json({ mensaje: "No puedes ver estas candidaturas" })
    }

    const candidaturas = await Candidatura.find({ proyecto: proyecto._id })
        .populate("creativo", "nombre estudios titular verificado categorias habilidades valoracionMedia")
        .sort({ createdAt: -1 })

    respuesta.json({ elementos: candidaturas })
})

const actualizarEstadoCandidatura = manejarAsincrono(async (solicitud, respuesta) => {
    const { estado, notasEmpresa } = solicitud.body
    const candidatura = await Candidatura.findById(solicitud.params.id).populate("proyecto")

    if (!candidatura) {
        return respuesta.status(404).json({ mensaje: "Candidatura no encontrada" })
    }

    const proyecto = await Proyecto.findById(candidatura.proyecto._id)
    if (proyecto.empresa.toString() !== solicitud.usuario._id.toString() && solicitud.usuario.rol !== "admin") {
        return respuesta.status(403).json({ mensaje: "No puedes gestionar esta candidatura" })
    }

    candidatura.estado = estado
    if (typeof notasEmpresa !== "undefined") {
        candidatura.notasEmpresa = notasEmpresa
    }
    candidatura.historialEstados.push({
        estado,
        fechaCambio: new Date(),
        cambiadoPor: solicitud.usuario._id
    })
    await candidatura.save()

    if (estado === "aceptada") {
        proyecto.creativoSeleccionado = candidatura.creativo
        proyecto.estado = "cerrado"
        await proyecto.save()

        await Candidatura.updateMany(
            { proyecto: proyecto._id, _id: { $ne: candidatura._id }, estado: { $ne: "rechazada" } },
            {
                estado: "rechazada",
                $push: {
                    historialEstados: {
                        estado: "rechazada",
                        fechaCambio: new Date(),
                        cambiadoPor: solicitud.usuario._id
                    }
                }
            }
        )
    }

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "estado_candidatura_actualizado",
        tipoEntidad: "candidatura",
        idEntidad: candidatura._id.toString(),
        metadatos: { estado }
    })

    respuesta.json({ candidatura })
})

module.exports = {
    postularseAProyecto,
    listarMisCandidaturas,
    listarCandidaturasDeProyecto,
    actualizarEstadoCandidatura
}
