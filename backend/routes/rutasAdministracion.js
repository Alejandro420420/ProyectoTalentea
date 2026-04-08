const express = require("express")
const {
    obtenerPanelAdministracion,
    listarUsuarios,
    actualizarUsuarioAdministracion,
    actualizarVerificacionUsuario,
    obtenerRegistrosAuditoria,
    eliminarUsuarioAdministracion
} = require("../controllers/controladorAdministracion")
const { autenticacionRequerida, permitirRoles } = require("../middleware/middlewareAutenticacion")

const enrutador = express.Router()

enrutador.use(autenticacionRequerida, permitirRoles("admin"))
enrutador.get("/panel", obtenerPanelAdministracion)
enrutador.get("/usuarios", listarUsuarios)
enrutador.put("/usuarios/:id", actualizarUsuarioAdministracion)
enrutador.delete("/usuarios/:id", eliminarUsuarioAdministracion)
enrutador.patch("/usuarios/:id/verificacion", actualizarVerificacionUsuario)
enrutador.get("/auditoria", obtenerRegistrosAuditoria)

module.exports = enrutador
