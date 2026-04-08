const Proyecto = require("../models/Proyecto")
const Candidatura = require("../models/Candidatura")
const manejarAsincrono = require("../utils/manejadorAsincrono")
const { crearRegistroAuditoria } = require("../utils/auditoria")

const parsearLista = (valor) => {
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

const listarProyectos = manejarAsincrono(async (solicitud, respuesta) => {
    const { categoria, palabraClave, estado, idEmpresa } = solicitud.query
    const consulta = {}

    if (categoria) {
        consulta.categoria = categoria
    }

    if (estado) {
        consulta.estado = estado
    }

    if (idEmpresa) {
        consulta.empresa = idEmpresa
    }

    if (palabraClave) {
        consulta.$text = { $search: palabraClave }
    }

    const proyectos = await Proyecto.find(consulta)
        .populate("empresa", "nombre nombreEmpresa verificado fotoPerfil titular biografia ubicacion web")
        .populate("creativoSeleccionado", "nombre titular")
        .sort({ createdAt: -1 })

    respuesta.json({ elementos: proyectos })
})

const obtenerProyectoPorId = manejarAsincrono(async (solicitud, respuesta) => {
    const proyecto = await Proyecto.findById(solicitud.params.id)
        .populate("empresa", "nombre nombreEmpresa verificado fotoPerfil titular biografia ubicacion web")
        .populate("creativoSeleccionado", "nombre titular")

    if (!proyecto) {
        return respuesta.status(404).json({ mensaje: "Proyecto no encontrado" })
    }

    respuesta.json({ proyecto })
})

const crearProyecto = manejarAsincrono(async (solicitud, respuesta) => {
    const proyecto = await Proyecto.create({
        titulo: solicitud.body.titulo,
        descripcion: solicitud.body.descripcion,
        categoria: solicitud.body.categoria,
        palabrasClave: parsearLista(solicitud.body.palabrasClave),
        salario: solicitud.body.salario || 0,
        frecuenciaSalario: solicitud.body.frecuenciaSalario || "mes",
        ubicacion: solicitud.body.ubicacion || "",
        remoto: typeof solicitud.body.remoto === "boolean" ? solicitud.body.remoto : true,
        empresa: solicitud.usuario._id
    })

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "proyecto_creado",
        tipoEntidad: "proyecto",
        idEntidad: proyecto._id.toString()
    })

    respuesta.status(201).json({ proyecto })
})

const actualizarProyecto = manejarAsincrono(async (solicitud, respuesta) => {
    const proyecto = await Proyecto.findById(solicitud.params.id)
    if (!proyecto) {
        return respuesta.status(404).json({ mensaje: "Proyecto no encontrado" })
    }

    if (proyecto.empresa.toString() !== solicitud.usuario._id.toString() && solicitud.usuario.rol !== "admin") {
        return respuesta.status(403).json({ mensaje: "No puedes editar este proyecto" })
    }

    ;["titulo", "descripcion", "categoria", "ubicacion", "estado"].forEach((campo) => {
        if (typeof solicitud.body[campo] !== "undefined") {
            proyecto[campo] = solicitud.body[campo]
        }
    })

    if (solicitud.body.estado === "completado" && !proyecto.creativoSeleccionado && solicitud.usuario.rol !== "admin") {
        return respuesta.status(400).json({
            mensaje: "No puedes completar un proyecto sin una candidatura aceptada"
        })
    }

    if (typeof solicitud.body.remoto !== "undefined") {
        proyecto.remoto = Boolean(solicitud.body.remoto)
    }

    if (typeof solicitud.body.salario !== "undefined") {
        proyecto.salario = solicitud.body.salario
    }

    if (typeof solicitud.body.frecuenciaSalario !== "undefined") {
        proyecto.frecuenciaSalario = solicitud.body.frecuenciaSalario
    }

    if (typeof solicitud.body.palabrasClave !== "undefined") {
        proyecto.palabrasClave = parsearLista(solicitud.body.palabrasClave)
    }

    await proyecto.save()

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "proyecto_actualizado",
        tipoEntidad: "proyecto",
        idEntidad: proyecto._id.toString()
    })

    respuesta.json({ proyecto })
})

const eliminarProyecto = manejarAsincrono(async (solicitud, respuesta) => {
    const proyecto = await Proyecto.findById(solicitud.params.id)
    if (!proyecto) {
        return respuesta.status(404).json({ mensaje: "Proyecto no encontrado" })
    }

    if (proyecto.empresa.toString() !== solicitud.usuario._id.toString() && solicitud.usuario.rol !== "admin") {
        return respuesta.status(403).json({ mensaje: "No puedes eliminar este proyecto" })
    }

    await Candidatura.deleteMany({ proyecto: proyecto._id })
    await proyecto.deleteOne()

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "proyecto_eliminado",
        tipoEntidad: "proyecto",
        idEntidad: solicitud.params.id
    })

    respuesta.json({ mensaje: "Proyecto eliminado" })
})

module.exports = {
    listarProyectos,
    obtenerProyectoPorId,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto
}
