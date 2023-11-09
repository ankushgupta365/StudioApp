const router = require('express').Router()
const Slot = require('../models/Slot')

router.post("/", async (req, res) => {
    try {
        if (req.body) {
            const slot = new Slot(req.body)
            await slot.save()
            return res.status(201).json({ msg: "slot created" })
        } else {
            return res.status(401).json({ msg: "bad request" })
        }
    } catch (error) {
        res.status(401).json({ msg: "there is some error", err: error.message })
    }
})

router.post("/update", async (req, res) => {
    try {
        if (req.body) {
            const slot = await Slot.findOneAndUpdate({
                slotNo: req.body.slotNo
            }, {
                active: true,
                startTimeString: req.body.startTimeString,
                endTimeString: req.body.endTimeString
            })
        }
        res.status(201).json({ msg: "slot updated successfully" })
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
})

router.post("/active", async (req, res) => {
    try {
        await Slot.updateMany({
            studioNo: req.body.studioNo
        }, {
            active: req.body.active
        })
        res.status(201).json({ msg: "status of studio updated" })
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
})
router.get("/active",async(req,res)=>{
    try {
        const slotStatus = await Slot.aggregate([
            {
                '$group': {
                  '_id': '$studioNo', 
                  'activeStatus': {
                    '$push': '$active'
                  }
                }
              }, {
                '$project': {
                  'activeStatus': {
                    '$cond': [
                      {
                        '$anyElementTrue': {
                          '$map': {
                            'input': '$activeStatus', 
                            'in': {
                              '$eq': [
                                '$$this', false
                              ]
                            }
                          }
                        }
                      }, false, true
                    ]
                  }
                }
              },
              {
                $sort: {
                    _id: 1
                }
              }
        ])

        res.status(200).json(slotStatus)
    } catch (error) {
        res.status(400).json({msg: error.message})
    }
})

router.post('/data', async (req, res) => {
    try {

    } catch (error) {

    }
})

module.exports = router