const mongoose = require('mongoose');

const SlotSchema = mongoose.Schema({
    slotNo: {type: Number,required: true,unique: true},
    studioNo: {type: Number, required: true},
    type: {type: String, required: true},
    timingNo: {type:Number, required: true},
    slotBookingsData: [{
        user: {type: mongoose.Types.ObjectId, ref: "User"},
        userEmail: {type: String, required: true},
        date: {type:Date},
        program: {type: String},
        semester: {type: Number},
        degree: {type:String},
        bookedAt: {type: Date, default: Date.now},
        completed: {type: Boolean, default: false},
        approvedBy: {type: String},
        defaulted: {type: Boolean, default: false},
        reasonForDefault: {type: String},
        reasonForCompleted: {type: String},
        reasonForCancel: {type: String},
        recorder: {type: String}
    }],
    queueData:{
        slotBookingsData: [
            {
                user: {type: mongoose.Types.ObjectId, ref: "User"},
                userEmail: {type: String, required: true},
                date: {type:Date},
                program: {type: String},
                semester: {type: Number},
                degree: {type: String},
                bookedAt: {type: Date, default: Date.now},
                completed: {type: Boolean, default: false},
                approvedBy: {type: String},
                defaulted: {type: Boolean, default: false},
                waitingNo: {type: Number},
                reasonForDefault: {type:String},
                reasonForCompleted: {type: String},
                reasonForCancel: {type: String},
                recorder: {type: String}
            }
        ],
    },
    deletedData: {
        slotBookingsData: [{
            user: {type: mongoose.Types.ObjectId, ref: "User"},
            userEmail: {type: String, required: true},
            date: {type:Date},
            program: {type: String},
            semester: {type: Number},
            degree: {type: String},
            bookedAt: {type: Date, default: Date.now},
            completed: {type: Boolean, default: false},
            approvedBy: {type: String},
            defaulted: {type: Boolean, default: false},
            deletedAt: {type: Date, default: Date.now},
            reasonForDefault: {type: String},
            reasonForCompleted: {type: String},
            reasonForCancel: {type: String},
            recorder: {type: String}
        }]
    },
    active: {type: Boolean, default: true},
    startTimeString: {type: String},
    endTimeString: {type: String},
    managerEmail: {type: String},
    managerId: {type: mongoose.Types.ObjectId, ref: "User"} 
}, { timestamps: true })

module.exports = mongoose.model("Slot", SlotSchema);