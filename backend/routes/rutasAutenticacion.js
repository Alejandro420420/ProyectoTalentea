const express = require("express")
const {
    registrar,
    iniciarSesion,
    obtenerMiPerfil
} = require("../controllers/controladorAutenticacion")
const { autenticacionRequerida } = require("../middleware/middlewareAutenticacion")

const enrutador = express.Router()

enrutador.post("/registro", registrar)
enrutador.post("/login", iniciarSesion)
enrutador.get("/mi-perfil", autenticacionRequerida, obtenerMiPerfil)

module.exports = enrutador
