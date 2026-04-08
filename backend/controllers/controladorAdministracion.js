const Usuario = require("../models/Usuario")
const Proyecto = require("../models/Proyecto")
const RegistroAuditoria = require("../models/RegistroAuditoria")
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

module.exports = {
    obtenerPanelAdministracion,
    listarUsuarios,
    actualizarVerificacionUsuario,
    obtenerRegistrosAuditoria
}
