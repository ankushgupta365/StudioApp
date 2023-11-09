const DatesMap = require("../models/DatesMap")

// add single holiday
const addDates = async (req, res) => {
    try {
       const result =  new DatesMap(req.body)
        await result.save()
        res.status(201).json({ msg: "holiday added successfully" })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

// get all holidays
const getDates = async (req, res) => {
    try {
        const dates = await DatesMap.find().select('date')
        const dateArray = dates.map(dateObj => dateObj.date);
        res.status(201).json({ dateArray,msg: "all dates fetched" })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

//delete the holiday
const deleteDate = async(req,res)=>{
    try {
        await DatesMap.findOneAndDelete({date: req.body.date})
        res.status(201).json({msg: "holiday deleted successfully"})
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}


module.exports = {
    addDates,
    getDates,
    deleteDate
}