const jwt = require("jsonwebtoken")
const Usuario = require("../models/Usuario")

const autenticacionRequerida = async (solicitud, respuesta, siguiente) => {
    const encabezadoAutorizacion = solicitud.headers.authorization

    if (!encabezadoAutorizacion || !encabezadoAutorizacion.startsWith("Bearer ")) {
        return respuesta.status(401).json({ mensaje: "Token no proporcionado" })
    }

    try {
        const token = encabezadoAutorizacion.split(" ")[1]
        const decodificado = jwt.verify(token, process.env.JWT_SECRET)
        const usuario = await Usuario.findById(decodificado.id)

        if (!usuario) {
            return respuesta.status(401).json({ mensaje: "Usuario no valido" })
        }

        solicitud.usuario = usuario
        siguiente()
    } catch (error) {
        return respuesta.status(401).json({ mensaje: "Token invalido" })
    }
}

const permitirRoles = (...roles) => (solicitud, respuesta, siguiente) => {
    const rolUsuario = solicitud.usuario?.rol === "creativo" ? "usuario" : solicitud.usuario?.rol

    if (!solicitud.usuario || !roles.includes(rolUsuario)) {
        return respuesta.status(403).json({ mensaje: "No tienes permisos para esta accion" })
    }

    siguiente()
}

module.exports = {
    autenticacionRequerida,
    permitirRoles
}
