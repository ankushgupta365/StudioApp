const router = require('express').Router()
const { addProgram, getPrograms, deleteProgram, addRecorderToProgram, removeRecorderFromProgram } = require('../controllers/programController')


router.route("/").get(getPrograms).post(addProgram)
router.route("/:programId").delete(deleteProgram)
router.route("/recorder").post(addRecorderToProgram)
router.route("/recorder/:programId/:recorderId").put(removeRecorderFromProgram)

module.exports = router