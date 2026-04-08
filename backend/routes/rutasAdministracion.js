const express = require("express")
const {
    obtenerPanelAdministracion,
    listarUsuarios,
    actualizarVerificacionUsuario,
    obtenerRegistrosAuditoria
} = require("../controllers/controladorAdministracion")
const { autenticacionRequerida, permitirRoles } = require("../middleware/middlewareAutenticacion")

const enrutador = express.Router()

enrutador.use(autenticacionRequerida, permitirRoles("admin"))
enrutador.get("/panel", obtenerPanelAdministracion)
enrutador.get("/usuarios", listarUsuarios)
enrutador.patch("/usuarios/:id/verificacion", actualizarVerificacionUsuario)
enrutador.get("/auditoria", obtenerRegistrosAuditoria)

module.exports = enrutador
