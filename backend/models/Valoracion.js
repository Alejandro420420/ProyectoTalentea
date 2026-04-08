const mongoose = require("mongoose")

const esquemaValoracion = new mongoose.Schema(
    {
        proyecto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Proyecto",
            required: true
        },
        autor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        destinatario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        puntuacion: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comentario: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
)

esquemaValoracion.index({ proyecto: 1, autor: 1, destinatario: 1 }, { unique: true })

module.exports = mongoose.model("Valoracion", esquemaValoracion)
