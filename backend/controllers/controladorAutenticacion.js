const jwt = require("jsonwebtoken")
const Usuario = require("../models/Usuario")
const manejarAsincrono = require("../utils/manejadorAsincrono")
const { sanitizarUsuario } = require("../utils/formateadores")
const { crearRegistroAuditoria } = require("../utils/auditoria")

const crearToken = (usuario) =>
    jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: "7d" })

const registrar = manejarAsincrono(async (solicitud, respuesta) => {
    const { nombre, email, password, rol, nombreEmpresa } = solicitud.body
    const rolSeguro = ["usuario", "empresa"].includes(rol) ? rol : "usuario"

    const usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
        return respuesta.status(409).json({ mensaje: "Ya existe una cuenta con este email" })
    }

    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        rol: rolSeguro,
        nombreEmpresa: nombreEmpresa || ""
    })

    await crearRegistroAuditoria({
        actor: usuario._id,
        accion: "registro",
        tipoEntidad: "usuario",
        idEntidad: usuario._id.toString(),
        metadatos: { rol: usuario.rol }
    })

    return respuesta.status(201).json({
        token: crearToken(usuario),
        usuario: sanitizarUsuario(usuario)
    })
})

const iniciarSesion = manejarAsincrono(async (solicitud, respuesta) => {
    const { email, password } = solicitud.body

    const usuario = await Usuario.findOne({ email }).select("+password")
    if (!usuario || !(await usuario.compararPassword(password))) {
        return respuesta.status(401).json({ mensaje: "Credenciales invalidas" })
    }

    await crearRegistroAuditoria({
        actor: usuario._id,
        accion: "inicio_sesion",
        tipoEntidad: "usuario",
        idEntidad: usuario._id.toString()
    })

    usuario.password = undefined

    return respuesta.json({
        token: crearToken(usuario),
        usuario: sanitizarUsuario(usuario)
    })
})

const obtenerMiPerfil = manejarAsincrono(async (solicitud, respuesta) => {
    respuesta.json({ usuario: sanitizarUsuario(solicitud.usuario) })
})

module.exports = {
    registrar,
    iniciarSesion,
    obtenerMiPerfil
}
