const Test = require("../models/Test")

exports.createTest = async (req, res) => {
    const data = await Test.create({ name: "test funcionando" })
    res.json(data)
}