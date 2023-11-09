const mongoose = require('mongoose')

const DatesMapSchema = mongoose.Schema({
    date: {type: String, unique: true},
    name: {type: String}
})

module.exports = mongoose.model("DatesMap", DatesMapSchema)