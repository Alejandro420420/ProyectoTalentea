const Usuario = require("../models/Usuario")
const Valoracion = require("../models/Valoracion")
const manejarAsincrono = require("../utils/manejadorAsincrono")
const { sanitizarUsuario } = require("../utils/formateadores")
const { crearRegistroAuditoria } = require("../utils/auditoria")
const fs = require("fs")
const path = require("path")

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

const tiposPermitidos = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "audio/mpeg": ".mp3",
    "video/mp4": ".mp4"
}

const listarCreativosPublicos = manejarAsincrono(async (solicitud, respuesta) => {
    const { categoria, palabraClave, rol, limite } = solicitud.query
    const consulta =
        rol === "empresa"
            ? { rol: "empresa" }
            : { rol: { $in: ["usuario", "creativo"] } }

    if (categoria) {
        consulta.categorias = categoria
    }

    if (palabraClave) {
        consulta.$or =
            rol === "empresa"
                ? [
                      { nombre: new RegExp(palabraClave, "i") },
                      { nombreEmpresa: new RegExp(palabraClave, "i") },
                      { estudios: new RegExp(palabraClave, "i") },
                      { titular: new RegExp(palabraClave, "i") },
                      { biografia: new RegExp(palabraClave, "i") }
                  ]
                : [
                      { nombre: new RegExp(palabraClave, "i") },
                      { estudios: new RegExp(palabraClave, "i") },
                      { titular: new RegExp(palabraClave, "i") },
                      { biografia: new RegExp(palabraClave, "i") },
                      { habilidades: new RegExp(palabraClave, "i") }
                  ]
    }

    const consultaMongoose = Usuario.find(consulta).sort({
        verificado: -1,
        valoracionMedia: -1,
        createdAt: -1
    })

    if (limite) {
        consultaMongoose.limit(Number(limite))
    }

    const creativos = await consultaMongoose

    respuesta.json({ elementos: creativos.map(sanitizarUsuario) })
})

const obtenerUsuarioPorId = manejarAsincrono(async (solicitud, respuesta) => {
    const usuario = await Usuario.findById(solicitud.params.id)
    if (!usuario) {
        return respuesta.status(404).json({ mensaje: "Perfil no encontrado" })
    }

    const valoraciones = await Valoracion.find({ destinatario: usuario._id })
        .populate("autor", "nombre rol nombreEmpresa")
        .populate("proyecto", "titulo categoria")
        .sort({ createdAt: -1 })

    respuesta.json({
        usuario: sanitizarUsuario(usuario),
        valoraciones
    })
})

const actualizarPerfil = manejarAsincrono(async (solicitud, respuesta) => {
    const camposPermitidos = ["nombre", "estudios", "biografia", "ubicacion", "web", "nombreEmpresa", "fotoPerfil"]

    camposPermitidos.forEach((campo) => {
        if (typeof solicitud.body[campo] !== "undefined") {
            solicitud.usuario[campo] = solicitud.body[campo]
        }
    })

    if (typeof solicitud.body.estudios !== "undefined") {
        solicitud.usuario.titular = solicitud.body.estudios
    }

    if (typeof solicitud.body.categorias !== "undefined") {
        solicitud.usuario.categorias = parsearLista(solicitud.body.categorias)
    }

    if (typeof solicitud.body.habilidades !== "undefined") {
        solicitud.usuario.habilidades = parsearLista(solicitud.body.habilidades)
    }

    if (typeof solicitud.body.intereses !== "undefined") {
        solicitud.usuario.intereses = parsearLista(solicitud.body.intereses)
    }

    if (Array.isArray(solicitud.body.portafolio)) {
        solicitud.usuario.portafolio = solicitud.body.portafolio
    }

    await solicitud.usuario.save()

    await crearRegistroAuditoria({
        actor: solicitud.usuario._id,
        accion: "perfil_actualizado",
        tipoEntidad: "usuario",
        idEntidad: solicitud.usuario._id.toString()
    })

    respuesta.json({ usuario: sanitizarUsuario(solicitud.usuario) })
})

const subirArchivoPortafolio = manejarAsincrono(async (solicitud, respuesta) => {
    const { nombreArchivo, tipoMime, contenidoBase64 } = solicitud.body

    if (!tiposPermitidos[tipoMime]) {
        return respuesta.status(400).json({ mensaje: "Formato no permitido. Usa imagen, mp3 o mp4" })
    }

    if (!contenidoBase64) {
        return respuesta.status(400).json({ mensaje: "No se ha recibido ningun archivo" })
    }

    const extension = tiposPermitidos[tipoMime]
    const nombreSeguro = (path.parse(nombreArchivo || "archivo").name || "archivo")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .slice(0, 60)
    const nombreFinal = `${Date.now()}-${solicitud.usuario._id}-${nombreSeguro}${extension}`
    const rutaCarpeta = path.join(__dirname, "..", "uploads")
    const rutaArchivo = path.join(rutaCarpeta, nombreFinal)
    const buffer = Buffer.from(contenidoBase64, "base64")

    fs.writeFileSync(rutaArchivo, buffer)

    respuesta.status(201).json({
        archivo: {
            nombre: nombreFinal,
            url: `/uploads/${nombreFinal}`,
            tipoMime
        }
    })
})

module.exports = {
    listarCreativosPublicos,
    obtenerUsuarioPorId,
    actualizarPerfil,
    subirArchivoPortafolio
}
