const Usuario = require("../models/Usuario")
const Proyecto = require("../models/Proyecto")
const RegistroAuditoria = require("../models/RegistroAuditoria")
const Candidatura = require("../models/Candidatura")
const Valoracion = require("../models/Valoracion")
const manejarAsincrono = require("../utils/manejadorAsincrono")
const { sanitizarUsuario } = require("../utils/formateadores")
const { crearRegistroAuditoria } = require("../utils/auditoria")

const obtenerPanelAdministracion = manejarAsincrono(async (solicitud, respuesta) => {
    const [usuarios, proyectos, proyectosAbiertos, verificacionesPendientes, registrosAuditoria] =
        await Promise.all([
            Usuario.countDocuments(),
            Proyecto.countDocuments(),
            Proyecto.countDocuments({ estado: "abierto" }),
            Usuario.countDocuments({ verificado: false, rol: { $ne: "admin" } }),
            RegistroAuditoria.countDocuments()
        ])

    respuesta.json({
        metricas: {
            usuarios,
            proyectos,
            proyectosAbiertos,
            verificacionesPendientes,
            registrosAuditoria
        }
    })
})

const listarUsuarios = manejarAsincrono(async (solicitud, respuesta) => {
    const usuarios = await Usuario.find().sort({ createdAt: -1 })
    respuesta.json({ elementos: usuarios.map(sanitizarUsuario) })
})

const actualizarUsuarioAdministracion = manejarAsincrono(async (solicitud, respuesta) => {
    const usuario = await Usuario.findById(solicitud.params.id)
    if (!usuario) {
        return respuesta.status(404).json({ mensaje: "Usuario no encontrado" })
    }

    const camposPermitidos = ["nombre", "email", "rol", "estudios", "biografia", "ubicacion", "web", "nombreEmpresa", "verificado"]
    camposPermitidos.forEach((campo) => {
        if (typeof solicitud.body[campo] !== "undefined") {
            usuario[campo] = solicitud.body[campo]
        }
    })

    if (typeof solicitud.body.estudios !== "undefined") {
        usuario.titular = solicitud.body.estudios
    }

    if (Array.isArray(solicitud.body.portafolio)) {
        usuario.portafolio = solicitud.body.portafolio
    }

    await usuario.save()

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "usuario_actualizado_por_admin",
        tipoEntidad: "usuario",
        idEntidad: usuario._id.toString(),
        metadatos: { rol: usuario.rol, verificado: usuario.verificado }
    })

    respuesta.json({ usuario: sanitizarUsuario(usuario) })
})

const actualizarVerificacionUsuario = manejarAsincrono(async (solicitud, respuesta) => {
    const usuario = await Usuario.findById(solicitud.params.id)
    if (!usuario) {
        return respuesta.status(404).json({ mensaje: "Usuario no encontrado" })
    }

    usuario.verificado = Boolean(solicitud.body.verificado)
    await usuario.save()

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "verificacion_usuario_actualizada",
        tipoEntidad: "usuario",
        idEntidad: usuario._id.toString(),
        metadatos: { verificado: usuario.verificado }
    })

    respuesta.json({ usuario: sanitizarUsuario(usuario) })
})

const obtenerRegistrosAuditoria = manejarAsincrono(async (solicitud, respuesta) => {
    const registros = await RegistroAuditoria.find()
        .populate("actor", "nombre rol nombreEmpresa")
        .sort({ createdAt: -1 })
        .limit(100)

    respuesta.json({ elementos: registros })
})

const eliminarUsuarioAdministracion = manejarAsincrono(async (solicitud, respuesta) => {
    const usuario = await Usuario.findById(solicitud.params.id)
    if (!usuario) {
        return respuesta.status(404).json({ mensaje: "Usuario no encontrado" })
    }

    if (usuario.rol === "admin" && usuario._id.toString() === solicitud.usuario._id.toString()) {
        return respuesta.status(400).json({ mensaje: "No puedes eliminar tu propio usuario administrador" })
    }

    const proyectos = await Proyecto.find({ empresa: usuario._id }).select("_id")
    const idsProyectos = proyectos.map((proyecto) => proyecto._id)

    await Candidatura.deleteMany({
        $or: [{ creativo: usuario._id }, { proyecto: { $in: idsProyectos } }]
    })
    await Valoracion.deleteMany({
        $or: [{ autor: usuario._id }, { destinatario: usuario._id }, { proyecto: { $in: idsProyectos } }]
    })
    await Proyecto.deleteMany({ empresa: usuario._id })
    await Proyecto.updateMany({ creativoSeleccionado: usuario._id }, { $set: { creativoSeleccionado: null, estado: "abierto" } })
    await RegistroAuditoria.updateMany({ actor: usuario._id }, { $set: { actor: null } })
    await usuario.deleteOne()

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "usuario_eliminado_por_admin",
        tipoEntidad: "usuario",
        idEntidad: solicitud.params.id,
        metadatos: { rol: usuario.rol, email: usuario.email }
    })

    respuesta.json({ mensaje: "Usuario eliminado" })
})

module.exports = {
    obtenerPanelAdministracion,
    listarUsuarios,
    actualizarUsuarioAdministracion,
    actualizarVerificacionUsuario,
    obtenerRegistrosAuditoria,
    eliminarUsuarioAdministracion
}
