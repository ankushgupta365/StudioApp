const router = require('express').Router()
const { getDates, addDates, deleteDate } = require('../controllers/datesMapController')


router.route("/").get(getDates).post(addDates)
router.route("/remove").post(deleteDate)

module.exports = router