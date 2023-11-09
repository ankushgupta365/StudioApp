const mongoose = require('mongoose')

const ProgramSchema = mongoose.Schema({
    courseName: {type: String},
    semester: {type: Number},
    programName: {type: String},
    recorders: [{
    _id: {type: mongoose.Types.ObjectId, unique: true},
    name: {type: String}, 
    lastname: {type: String}, 
    email: {type: String},
    img: {type: String},
    googleId: {type: String}, 
    refreshTokenGoogle: {type: String}
    }]
})

module.exports = mongoose.model("Program", ProgramSchema)