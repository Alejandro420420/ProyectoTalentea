const express = require("express")
const {
    postularseAProyecto,
    listarMisCandidaturas,
    listarCandidaturasDeProyecto,
    actualizarEstadoCandidatura
} = require("../controllers/controladorCandidaturas")
const { autenticacionRequerida, permitirRoles } = require("../middleware/middlewareAutenticacion")

const enrutador = express.Router()

enrutador.post("/", autenticacionRequerida, permitirRoles("usuario", "admin"), postularseAProyecto)
enrutador.get("/mias", autenticacionRequerida, permitirRoles("usuario", "admin"), listarMisCandidaturas)
enrutador.get(
    "/proyecto/:idProyecto",
    autenticacionRequerida,
    permitirRoles("empresa", "admin"),
    listarCandidaturasDeProyecto
)
enrutador.patch(
    "/:id/estado",
    autenticacionRequerida,
    permitirRoles("empresa", "admin"),
    actualizarEstadoCandidatura
)

module.exports = enrutador
