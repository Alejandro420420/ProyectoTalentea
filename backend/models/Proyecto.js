const mongoose = require("mongoose")

const esquemaProyecto = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            required: true,
            trim: true
        },
        categoria: {
            type: String,
            required: true,
            trim: true
        },
        palabrasClave: {
            type: [String],
            default: []
        },
        salario: {
            type: Number,
            default: 0
        },
        frecuenciaSalario: {
            type: String,
            enum: ["dia", "mes"],
            default: "mes"
        },
        ubicacion: {
            type: String,
            trim: true,
            default: ""
        },
        remoto: {
            type: Boolean,
            default: true
        },
        estado: {
            type: String,
            enum: ["abierto", "cerrado", "completado"],
            default: "abierto"
        },
        empresa: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        creativoSeleccionado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            default: null
        }
    },
    {
        timestamps: true
    }
)

esquemaProyecto.index({
    titulo: "text",
    descripcion: "text",
    palabrasClave: "text",
    categoria: "text"
})

module.exports = mongoose.model("Proyecto", esquemaProyecto)
