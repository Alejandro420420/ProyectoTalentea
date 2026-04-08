const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const esquemaElementoPortafolio = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            trim: true
        },
        categoria: {
            type: String,
            trim: true
        },
        urlMedia: {
            type: String,
            trim: true
        },
        urlProyecto: {
            type: String,
            trim: true
        }
    },
    { _id: true }
)

const esquemaUsuario = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },
        rol: {
            type: String,
            enum: ["usuario", "creativo", "empresa", "admin"],
            default: "usuario"
        },
        fotoPerfil: {
            type: String,
            trim: true,
            default: ""
        },
        estudios: {
            type: String,
            trim: true,
            default: ""
        },
        titular: {
            type: String,
            trim: true,
            default: ""
        },
        biografia: {
            type: String,
            trim: true,
            default: ""
        },
        ubicacion: {
            type: String,
            trim: true,
            default: ""
        },
        web: {
            type: String,
            trim: true,
            default: ""
        },
        nombreEmpresa: {
            type: String,
            trim: true,
            default: ""
        },
        categorias: {
            type: [String],
            default: []
        },
        habilidades: {
            type: [String],
            default: []
        },
        intereses: {
            type: [String],
            default: []
        },
        portafolio: {
            type: [esquemaElementoPortafolio],
            default: []
        },
        verificado: {
            type: Boolean,
            default: false
        },
        valoracionMedia: {
            type: Number,
            default: 0
        },
        totalValoraciones: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

esquemaUsuario.pre("save", async function guardarPassword() {
    if (!this.isModified("password")) {
        return
    }

    const sal = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, sal)
})

esquemaUsuario.methods.compararPassword = function compararPassword(passwordCandidata) {
    return bcrypt.compare(passwordCandidata, this.password)
}

module.exports = mongoose.model("Usuario", esquemaUsuario)
