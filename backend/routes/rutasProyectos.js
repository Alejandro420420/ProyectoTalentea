const express = require("express")
const {
    listarProyectos,
    obtenerProyectoPorId,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto
} = require("../controllers/controladorProyectos")
const { autenticacionRequerida, permitirRoles } = require("../middleware/middlewareAutenticacion")

const enrutador = express.Router()

enrutador.get("/", listarProyectos)
enrutador.get("/:id", obtenerProyectoPorId)
enrutador.post("/", autenticacionRequerida, permitirRoles("empresa", "admin"), crearProyecto)
enrutador.put("/:id", autenticacionRequerida, permitirRoles("empresa", "admin"), actualizarProyecto)
enrutador.delete("/:id", autenticacionRequerida, permitirRoles("empresa", "admin"), eliminarProyecto)

module.exports = enrutador
