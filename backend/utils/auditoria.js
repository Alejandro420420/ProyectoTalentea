const RegistroAuditoria = require("../models/RegistroAuditoria")

const crearRegistroAuditoria = async ({
    actor,
    accion,
    tipoEntidad,
    idEntidad,
    metadatos = {}
}) => {
    await RegistroAuditoria.create({
        actor: actor || null,
        accion,
        tipoEntidad,
        idEntidad: idEntidad || null,
        metadatos
    })
}

module.exports = {
    crearRegistroAuditoria
}
