const manejarErrores = (error, solicitud, respuesta, siguiente) => {
    if (respuesta.headersSent) {
        return siguiente(error)
    }

    console.error(error)

    if (error.code === 11000) {
        return respuesta.status(409).json({
            mensaje: "Ya existe un registro con esos datos"
        })
    }

    respuesta.status(error.statusCode || 500).json({
        mensaje: error.message || "Error interno del servidor"
    })
}

module.exports = {
    manejarErrores
}
