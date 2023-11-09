const mongoose = require('mongoose');

const CalendarEventSchema = mongoose.Schema({
    slotNo: {type: Number,required: true},
    studioNo: {type: Number, required: true},
    type: {type: String, required: true},
    date: {type: Date, required: true},
    timingNo: {type:Number, required: true},
    eventId: {type: String, required: true},
    userEmail: {type: String},
    refreshToken: {type: String},
}, { timestamps: true })

module.exports = mongoose.model("CalendarEvent", CalendarEventSchema);