const Usuario = require("../models/Usuario")
const Proyecto = require("../models/Proyecto")
const Candidatura = require("../models/Candidatura")
const Valoracion = require("../models/Valoracion")
const RegistroAuditoria = require("../models/RegistroAuditoria")

module.exports = [
    {
        nombre: "usuarios",
        modelo: Usuario,
        consulta: () => Usuario.find().select("+password").lean()
    },
    {
        nombre: "proyectos",
        modelo: Proyecto,
        consulta: () => Proyecto.find().lean()
    },
    {
        nombre: "candidaturas",
        modelo: Candidatura,
        consulta: () => Candidatura.find().lean()
    },
    {
        nombre: "valoraciones",
        modelo: Valoracion,
        consulta: () => Valoracion.find().lean()
    },
    {
        nombre: "registrosAuditoria",
        modelo: RegistroAuditoria,
        consulta: () => RegistroAuditoria.find().lean()
    }
]
