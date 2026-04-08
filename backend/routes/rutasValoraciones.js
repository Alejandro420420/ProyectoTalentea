const express = require("express")
const {
    crearValoracion,
    listarValoracionesDeUsuario,
    obtenerOpcionesValoracion
} = require("../controllers/controladorValoraciones")
const { autenticacionRequerida } = require("../middleware/middlewareAutenticacion")

const enrutador = express.Router()

enrutador.get("/opciones", autenticacionRequerida, obtenerOpcionesValoracion)
enrutador.post("/", autenticacionRequerida, crearValoracion)
enrutador.get("/usuario/:idUsuario", listarValoracionesDeUsuario)

module.exports = enrutador
