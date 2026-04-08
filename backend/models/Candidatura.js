const mongoose = require("mongoose")

const esquemaHistorialEstado = new mongoose.Schema(
    {
        estado: {
            type: String,
            enum: ["enviada", "en revision", "aceptada", "rechazada"],
            required: true
        },
        fechaCambio: {
            type: Date,
            default: Date.now
        },
        cambiadoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            default: null
        }
    },
    { _id: false }
)

const esquemaCandidatura = new mongoose.Schema(
    {
        proyecto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Proyecto",
            required: true
        },
        creativo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        cartaPresentacion: {
            type: String,
            trim: true,
            default: ""
        },
        enlacesPortafolio: {
            type: [String],
            default: []
        },
        estado: {
            type: String,
            enum: ["enviada", "en revision", "aceptada", "rechazada"],
            default: "enviada"
        },
        notasEmpresa: {
            type: String,
            trim: true,
            default: ""
        },
        historialEstados: {
            type: [esquemaHistorialEstado],
            default: [{ estado: "enviada" }]
        }
    },
    {
        timestamps: true
    }
)

esquemaCandidatura.index({ proyecto: 1, creativo: 1 }, { unique: true })

module.exports = mongoose.model("Candidatura", esquemaCandidatura)
