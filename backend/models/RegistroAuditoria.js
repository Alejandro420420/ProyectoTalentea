const mongoose = require("mongoose")

const esquemaRegistroAuditoria = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            default: null
        },
        accion: {
            type: String,
            required: true
        },
        tipoEntidad: {
            type: String,
            required: true
        },
        idEntidad: {
            type: String,
            default: null
        },
        metadatos: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("RegistroAuditoria", esquemaRegistroAuditoria)
