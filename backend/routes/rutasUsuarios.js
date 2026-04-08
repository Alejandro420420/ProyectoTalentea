const express = require("express")
const {
    listarCreativosPublicos,
    obtenerUsuarioPorId,
    actualizarPerfil,
    subirArchivoPortafolio
} = require("../controllers/controladorUsuarios")
const { autenticacionRequerida } = require("../middleware/middlewareAutenticacion")

const enrutador = express.Router()

enrutador.put("/mi-perfil", autenticacionRequerida, actualizarPerfil)
enrutador.post("/subidas", autenticacionRequerida, subirArchivoPortafolio)
enrutador.get("/", listarCreativosPublicos)
enrutador.get("/:id", obtenerUsuarioPorId)

module.exports = enrutador
