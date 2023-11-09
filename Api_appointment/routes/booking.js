const router = require('express').Router();
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken")
const User = require('../models/User');
const Slot = require('../models/Slot');
const sendEmail = require('./email');
const sendTemplatedEmailSES = require('./emailSES')
const mongoose = require('mongoose');
const { oAuth2Client } = require('../middleware/verifyGoogle');
const { google } = require('googleapis');
const CalendarEvent = require('../models/CalendarEvent');
const excelJs = require('exceljs')
const bookingDoneTemplateId = process.env.BOOKINGDONEEMAILTEMPLATE
const deleteDoneTemplateId = process.env.DELETEDONEEMAILTEMPLATE
const waitingDoneTemplateId = process.env.WAITINGDONEEMAILTEMPLATE
const getTimingNoString = (timingNO) => {
  let time = ""
  switch (timingNO) {
    case 1:
      time = "10:00-10:45"
      break;
    case 2:
      time = "11:00-11:45"
      break;
    case 3:
      time = "12:00-12:45"
      break;
    case 4:
      time = "02:00-02:45"
      break;
    case 5:
      time = "03:00-3:45"
      break;
    default:
      return ""
      break;
  }
  return time
}

//in all the routes below we have used verifyTokenAnd... middleware which are imported from a file, which basically calls next fxn after getting jsonwebtoken from the headers and verifying it. if next fxn within them is called then the async fxn get it's turn to run
// program to get a random item from an array

function getRandomItem(arr) {

  // get random index value
  const randomIndex = Math.floor(Math.random() * arr.length);

  // get random item
  const item = arr[randomIndex];

  return item;
}

// random slot number from type, used in reserve booking
const getRandomSlotNumberFromType = (type, timingNo) => {
  let slotNos = []
  if (type == 'numerical') {

    switch (timingNo) {
      case 1:
        slotNos = [41]
        break;
      case 2:
        slotNos = [42]
        break;

      case 3:
        slotNos = [43]
        break;

      case 4:
        slotNos = [44]
        break;
      case 5:
        slotNos = [45]
        break;
      default:
        slotNos = [41]
        break;
    }

  } else if (type == 'theory') {

    switch (timingNo) {
      case 1:
        slotNos = [11, 21, 31]
        break;
      case 2:
        slotNos = [12, 22, 32]
        break;
      case 3:
        slotNos = [13, 23, 33]
        break;

      case 4:
        slotNos = [14, 24, 34]
        break;
      case 5:
        slotNos = [15, 25, 35]
        break;
      default:
        slotNos = [11, 21, 31]
        break;
    }
  }
  const randomSlotNo = getRandomItem(slotNos)
  return randomSlotNo;
}
const getStudioTypeFromStudioNo = (studioNo) => {
  if (studioNo == '4') {
    return 'numerical'
  } else {
    return 'theory'
  }
}
function localDateStringToDDMMYYYY(localDateString) {
  // Convert the local date string to a Date object.
  const localDate = new Date(localDateString)

  // Get the day, month, and year from the Date object.
  let day = localDate.getDate();
  let month = localDate.getMonth() + 1;
  let year = localDate.getFullYear();

  // Add leading zeros to the day and month digits if they are less than 10.
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }

  // Return the date in DD/MM/YYYY format.
  return day + "/" + month + "/" + year;
}

const createEvent = async (refreshToken, dateString, startTimeString, endTimeString, email, description, slotNo, studioNo, type) => {
  try {
    oAuth2Client.setCredentials({ refresh_token: refreshToken })
    const calendar = google.calendar('v3')
    const response = await calendar.events.insert({
      auth: oAuth2Client,
      calendarId: 'primary',
      requestBody: {
        summary: 'Studio Slot Booking',
        description: description,
        location: 'Chandigarh University',
        colorId: '7',
        start: {
          dateTime: new Date(`${dateString} ${startTimeString}`),
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: new Date(`${dateString} ${endTimeString}`),
          timeZone: 'Asia/Kolkata'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 10 },
          ]
        }
      }
    })
    const event = new CalendarEvent({
      slotNo: slotNo,
      studioNo: studioNo,
      type: type,
      timingNo: slotNo % 10,
      date: new Date(dateString),
      eventId: response.data.id,
      userEmail: email,
      refreshToken: refreshToken
    })
    await event.save()
  } catch (error) {
    console.log(error)
  }
}
const deleteEvent = async (refreshToken, eventId) => {
  try {
    oAuth2Client.setCredentials({ refresh_token: refreshToken })
    const calendar = google.calendar('v3')
    const response = await calendar.events.delete({
      auth: oAuth2Client,
      calendarId: 'primary',
      eventId: eventId
    })
  } catch (error) {
    console.log(error)
  }
}

const getStartTimeFromTimingNo = (timingNo) => {
  let startTime = ''
  switch (timingNo) {
    case 1:
      startTime = '10:00:00'
      break;
    case 2:
      startTime = "11:00:00"
      break;
    case 3:
      startTime = "12:00:00"
      break;
    case 4:
      startTime = "14:00:00"
      break;
    case 5:
      startTime = "15:00:00"
      break;
    default:
      break;
  }
  return startTime
}
const getEndTimeFromTimingNo = (timingNo) => {
  let endTime = ''
  switch (timingNo) {
    case 1:
      endTime = '10:45:00'
      break;
    case 2:
      endTime = '11:45:00'
      break;
    case 3:
      endTime = '12:45:00'
      break;
    case 4:
      endTime = '14:45:00'
      break;
    case 5:
      endTime = '15:45:00'
      break;
    default:
      break;
  }
  return endTime
}
//create a booking
router.post("/", async (req, res, next) => {
  try {
    const availableSlots = await Slot.find({
      "type": req.body.type,
      "timingNo": req.body.timingNo,
      'slotBookingsData.date': { $ne: new Date(req.body.slotBookingData.date) },
      'active': true
    })
    let slotBookingData = req.body.slotBookingData
    let recorder = ''
    if (req.body?.programObject && req.body.programObject?.recorders?.length > 0) {
      recorder = getRandomItem(req.body.programObject?.recorders)?.email
      slotBookingData.recorder = recorder
    }
    if (!availableSlots.length) {
      // const randomSlotNo = getRandomSlotNumberFromType(req.body.type, req.body.timingNo)
      const availableSlotsWaiting = await Slot.find({
        "type": req.body.type,
        "timingNo": req.body.timingNo,
        'active': true
      })
      const slotNosWaiting = availableSlotsWaiting.map(slot => slot.slotNo)
      const randomSlotNoWaiting = getRandomItem(slotNosWaiting)
      //getting waiting number
      const queueDataNumber = await Slot.aggregate([
        {
          '$match': {
            'slotNo': randomSlotNoWaiting
          }
        }, {
          '$unwind': {
            'path': '$queueData.slotBookingsData'
          }
        }, {
          '$match': {
            'queueData.slotBookingsData.date': new Date(req.body.slotBookingData.date)
          }
        }, {
          '$sort': {
            'queueData.slotBookingsData.bookedAt': 1
          }
        }, {
          $project: {
            'queueData': 1,
            '_id': 0
          }
        }
      ])
      const newWaitingNumber = queueDataNumber.length + 1
      const queueBookingData = { ...slotBookingData, waitingNo: newWaitingNumber }

      //create reserve booking
      await Slot.findOneAndUpdate({
        slotNo: randomSlotNoWaiting
      }, {
        $push: {
          "queueData.slotBookingsData": queueBookingData
        }
      })
      const dynamicTemplateDataForWaiting = {
        email: req.body.email,
        type: req.body.type,
        date: localDateStringToDDMMYYYY(req.body.slotBookingData.date),
        program: req.body.slotBookingData.program,
        timing: getTimingNoString(req.body.timingNo),
        slotNo: Math.trunc(randomSlotNoWaiting / 10),
        waitingNo: newWaitingNumber
      }
      // await sendEmail(req, res, req.body.email, 'Studio Booking in Waiting Queue Successfull', waitingDoneTemplateId, dynamicTemplateDataForWaiting)
      await sendTemplatedEmailSES(req.body.email, 'studio-booking-waiting-idol', dynamicTemplateDataForWaiting)
      return res.status(201).json({ msg: `reserve booking has been made in studio ${Math.trunc(randomSlotNoWaiting / 10)} and slot ${randomSlotNoWaiting % 10}`, waitingNo: newWaitingNumber })
    }
    const slotNos = availableSlots.map(slot => slot.slotNo)
    const randomSlotNo = getRandomItem(slotNos)

    const updatedSlot = await Slot.findOneAndUpdate(
      {
        "slotNo": randomSlotNo,
        'slotBookingsData.date': { $ne: new Date(req.body.slotBookingData.date) }
      },
      {
        $push: {
          "slotBookingsData": slotBookingData
        },
      }, { new: true }
    );


    const dynamicTemplateData = {
      email: req.body.email,
      type: req.body.type,
      date: localDateStringToDDMMYYYY(req.body.slotBookingData.date),
      program: req.body.slotBookingData.program,
      timing: getTimingNoString(req.body.timingNo),
      slotNo: Math.trunc(randomSlotNo / 10),
    }
    let receiversOfEmail = [req.body.email]
    if (recorder != '') {
      receiversOfEmail.push(recorder)
    }
    // await sendEmail(req, res, req.body.email, subject, bookingDoneTemplateId, dynamicTemplateData)
    await sendTemplatedEmailSES(receiversOfEmail, 'studio-booking-confirmed-idol', dynamicTemplateData)
    const user = await User.findOne({ email: req.body.email })
    const refreshToken = user.refreshTokenGoogle

    const description = `You have a booking at Studio Number ${Math.trunc(randomSlotNo / 10)} on date: ${localDateStringToDDMMYYYY(req.body.slotBookingData.date)}, time: ${getTimingNoString(req.body.timingNo)} for the program: ${req.body.slotBookingData.program} and degree: ${req.body.slotBookingData.degree}. Please report 10 minutes before the slot time`
    await createEvent(refreshToken, req.body.slotBookingData.date, getStartTimeFromTimingNo(req.body.timingNo), getEndTimeFromTimingNo(req.body.timingNo), req.body.email, description, randomSlotNo, Math.trunc(randomSlotNo / 10), req.body.type)
    if (recorder != '') {
      const recorderUser = await User.findOne({ email: recorder })
      const refreshTokenRecorder = recorderUser.refreshTokenGoogle
      const descriptionRecorder = `You have a booking at Studio Number ${Math.trunc(randomSlotNo / 10)} on date: ${localDateStringToDDMMYYYY(req.body.slotBookingData.date)}, time: ${getTimingNoString(req.body.timingNo)} for the program: ${req.body.slotBookingData.program} and degree: ${req.body.slotBookingData.degree} from ${req.body.email}. Please report 10 minutes before the slot time`
      await createEvent(refreshTokenRecorder, req.body.slotBookingData.date, getStartTimeFromTimingNo(req.body.timingNo), getEndTimeFromTimingNo(req.body.timingNo), recorder, descriptionRecorder, randomSlotNo, Math.trunc(randomSlotNo / 10), req.body.type)
    }
    res.status(200).json(`booking has been made in studio ${Math.trunc(randomSlotNo / 10)} and slot ${randomSlotNo % 10}`)
  } catch (err) {
    res.status(401).json("there is error in backend code or postman query");
    console.log(err)
  }
})

//bulk booking
router.post("/bulk", async (req, res) => {
  let updateQuery = {
    slotNo: { $in: req.body.slotNos },
    'slotBookingsData.date': { $ne: new Date(req.body.slotBookingData.date) }
  }
  try {
    const bookings = await Slot.updateMany(
      updateQuery
      , {
        $push: {
          slotBookingsData: req.body.slotBookingData
        }
      })
    res.status(200).json(`booking has been made in studio`)
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: error.message })
  }
})

router.post("/reserve/find", async (req, res) => {
  try {
    const reserveBookings = await Slot.findOne({ 'slotNo': req.body.slotNo, 'queueData.slotBookingsData.userEmail': req.body.userEmail }, { queueData: 1 })
    res.status(200).json(reserveBookings)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.post("/reserve/history", async (req, res) => {
  try {
    const reservedBookings = await Slot.aggregate([
      {
        '$unwind': {
          'path': '$queueData.slotBookingsData'
        }
      }, {
        '$match': {
          'queueData.slotBookingsData.userEmail': req.body.userEmail,
          'queueData.slotBookingsData.date': {
            '$gte': new Date(req.body.dateString)
          }
        }
      }, {
        '$sort': {
          'queueData.slotBookingsData.date': 1,
          'queueData.slotBookingsData.bookedAt': 1
        }
      }, {
        $project: {
          _id: 0,
          bookings: '$queueData.slotBookingsData',
          slotNo: 1,
          studioNo: 1,
          type: 1,
          timingNo: 1
        }
      }
    ])
    res.status(201).json({ count: reservedBookings.length, bookings: reservedBookings })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
})
router.post("/cancelled/history", async (req, res) => {
  try {
    const cancelledBookings = await Slot.aggregate([
      {
        '$unwind': {
          'path': '$deletedData.slotBookingsData'
        }
      }, {
        '$match': {
          'deletedData.slotBookingsData.userEmail': req.body.userEmail,
        }
      }, {
        '$sort': {
          'deletedData.slotBookingsData.date': 1,
          'deletedData.slotBookingsData.bookedAt': 1
        }
      }, {
        $project: {
          _id: 0,
          bookings: '$deletedData.slotBookingsData',
          slotNo: 1,
          studioNo: 1,
          type: 1,
          timingNo: 1
        }
      }
    ])
    res.status(201).json({ count: cancelledBookings.length, bookings: cancelledBookings })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
})

router.get("/cancelled/history/admin", async (req, res) => {
  // pagination and limit
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10  //by default 10 is the limit of objects to fetch
  const skip = (page - 1) * limit       // if limit is 10 and page is 2 then, skip will be 10, so it will show the objects after skipping 10 objects from the results

  const sort = req.query.sort
  let sortQuery = { "bookings.deletedAt": -1 }   //latest deleted first, we are using bookings bcz deleted bookings are in bookings tab
  if (sort) {
    switch (sort) {
      case "deletedAt":
        if (req.query.order) {
          if (req.query.order == 'Asc') {
            sortQuery = { "bookings.deletedAt": 1 }
          } else if (req.query.order == 'Desc') {
            sortQuery = { "bookings.deletedAt": -1 }
          }
        } else {
          sortQuery = { "deletedData.slotBookingsData.bookedAt": -1 }
        }
        break;
      case "studioNo":
        if (req.query.order) {
          if (req.query.order == 'Asc') {
            sortQuery = { "studioNo": 1 }
          } else if (req.query.order == 'Desc') {
            sortQuery = { "studioNo": -1 }
          }
        } else {
          sortQuery = { "studioNo": 1 }
        }
        break;
      default:
        break;
    }
  }




  const studio = req.query.studio
  let studioQuery = {}
  if (studio) {
    switch (studio) {
      case 'all':
        studioQuery = {}
        break;
      default:
        studioQuery = { 'studioNo': Number(studio) }
        break;
    }
  }

  const { program, email } = req.query
  let searchQuery = {}
  if (program) {
    searchQuery = { 'deletedData.slotBookingsData.program': { $regex: program, $options: 'i' } }
  }
  if (email) {
    searchQuery = { 'deletedData.slotBookingsData.userEmail': { $regex: email, $options: 'i' } }
  }

  try {

    if (req.query.typeOfRequest === 'downloadCsv') {

      let bookingsJi = await Slot.aggregate([
        {
          '$unwind': {
            'path': '$deletedData.slotBookingsData'
          }
        },
        {
          $project: {
            bookings: '$deletedData.slotBookingsData', slotNo: 1, studioNo: 1, type: 1, timingNo: 1, _id: 0, user_doc: 1
          }
        }, {
          '$sort': sortQuery
        },
        {
          $lookup: {
            from: 'users',
            localField: 'bookings.userEmail',
            foreignField: 'email',
            as: 'user_doc',
            pipeline: [{ "$project": { "name": 1, "lastname": 1, "email": 1, "role": 1 } }]
          }
        },
        {
          $unwind: {
            path: '$user_doc'
          }
        }
      ])
      const workbook = new excelJs.Workbook()
      const worksheet = workbook.addWorksheet("Studio Slot Cancelled Data")

      worksheet.columns = [
        { header: "S.no", key: 's_no', width: 10 },
        { header: "Studio No", key: 'studioNo', width: 15 },
        { header: "Slot No", key: 'slotNo', width: 15 },
        { header: "Timing", key: "timing", width: 25 },
        { header: 'Date', key: "date", width: 30 },
        { header: 'Course', key: "program", width: 50 },
        { header: 'Semester', key: "semester", width: 10 },
        { header: 'Program', key: "degree", width: 30 },
        { header: 'Full Name', key: "fullName", width: 40 },
        { header: 'Role', key: 'role', width: 25 },
        { header: 'Email', key: 'email', width: 50 },
        { header: 'Reason for Cancelled', key: 'reasonForCancel', width: 70 }
      ]

      let counter = 1;
      bookingsJi.forEach((item) => {
        let rowItem = {
          s_no: counter,
          studioNo: item.studioNo,
          slotNo: item.slotNo % 10,
          timing: getTimingNoString(item?.timingNo),
          date: localDateStringToDDMMYYYY(item.bookings.date),
          program: item.bookings?.program,
          semester: item.bookings?.semester,
          degree: item.bookings?.degree,
          fullName: `${item?.user_doc?.name} ${item?.user_doc?.lastname}`,
          role: item?.user_doc?.role,
          email: item?.user_doc?.email,
          reasonForCancel: item.bookings?.reasonForCancel
        }
        worksheet.addRow(rowItem)
        counter++
      })

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true }
      })

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader("Content-Disposition", "attachment; filename=" + "StudioSlotReport.xlsx");
      return workbook.xlsx.write(res)
        .then(function (data) {
          res.end();
        });
    }

    const cancelledBookings = await Slot.aggregate([
      {
        '$unwind': {
          'path': '$deletedData.slotBookingsData'
        }
      }, {
        '$match': {
          ...studioQuery,
          ...searchQuery
        }
      }
      , {
        $project: {
          _id: 0,
          bookings: '$deletedData.slotBookingsData',
          slotNo: 1,
          studioNo: 1,
          type: 1,
          timingNo: 1,
          user_doc: 1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'bookings.userEmail',
          foreignField: 'email',
          as: 'user_doc',
          pipeline: [{ "$project": { "name": 1, "lastname": 1, "email": 1, "role": 1 } }]
        }
      },
      {
        $unwind: {
          path: '$user_doc'
        }
      },
      {
        $sort: sortQuery
      },
      {
        $facet: {
          results: [
            {
              $skip: skip
            },
            {
              $limit: limit
            }
          ],
          count: [
            {
              $group: {
                _id: null,
                count: {
                  $sum: 1
                }
              }
            }
          ]
        }
      }
    ])
    res.status(200).json({ totalPages: Math.ceil(cancelledBookings[0].count[0].count / limit), count: cancelledBookings[0].results.length, bookings: cancelledBookings[0].results })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
})

//get waiting bookings data for admin
router.get("/waiting/history/admin", async (req, res) => {
  // pagination and limit
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10  //by default 10 is the limit of objects to fetch
  const skip = (page - 1) * limit       // if limit is 10 and page is 2 then, skip will be 10, so it will show the objects after skipping 10 objects from the results

  const sort = req.query.sort
  let sortQuery = { "bookings.bookedAt": -1 }   //latest added in waiting, we are using bookings bcz queue bookings are in bookings tab
  if (sort) {
    switch (sort) {
      case "bookedAt":
        if (req.query.order) {
          if (req.query.order == 'Asc') {
            sortQuery = { "bookings.bookedAt": 1 }
          } else if (req.query.order == 'Desc') {
            sortQuery = { "bookings.bookedAt": -1 }
          }
        } else {
          sortQuery = { "bookings.bookedAt": -1 }
        }
        break;
      case "studioNo":
        if (req.query.order) {
          if (req.query.order == 'Asc') {
            sortQuery = { "studioNo": 1 }
          } else if (req.query.order == 'Desc') {
            sortQuery = { "studioNo": -1 }
          }
        } else {
          sortQuery = { "studioNo": 1 }
        }
        break;
      default:
        break;
    }
  }




  const studio = req.query.studio
  let studioQuery = {}
  if (studio) {
    switch (studio) {
      case 'all':
        studioQuery = {}
        break;
      default:
        studioQuery = { 'studioNo': Number(studio) }
        break;
    }
  }

  const { program, email } = req.query
  let searchQuery = {}
  if (program) {
    searchQuery = { 'queueData.slotBookingsData.program': { $regex: program, $options: 'i' } }
  }
  if (email) {
    searchQuery = { 'queueData.slotBookingsData.userEmail': { $regex: email, $options: 'i' } }
  }

  try {

    if (req.query.typeOfRequest === 'downloadCsv') {

      let bookingsJi = await Slot.aggregate([
        {
          '$unwind': {
            'path': '$queueData.slotBookingsData'
          }
        },
        {
          $project: {
            bookings: '$queueData.slotBookingsData', slotNo: 1, studioNo: 1, type: 1, timingNo: 1, _id: 0, user_doc: 1
          }
        }, {
          '$sort': sortQuery
        },
        {
          $lookup: {
            from: 'users',
            localField: 'bookings.userEmail',
            foreignField: 'email',
            as: 'user_doc',
            pipeline: [{ "$project": { "name": 1, "lastname": 1, "email": 1, "role": 1 } }]
          }
        },
        {
          $unwind: {
            path: '$user_doc'
          }
        }
      ])
      const workbook = new excelJs.Workbook()
      const worksheet = workbook.addWorksheet("Studio Slot Cancelled Data")

      worksheet.columns = [
        { header: "S.no", key: 's_no', width: 10 },
        { header: "Studio No", key: 'studioNo', width: 15 },
        { header: "Slot No", key: 'slotNo', width: 15 },
        { header: "Timing", key: "timing", width: 25 },
        { header: 'Date', key: "date", width: 30 },
        { header: 'Course', key: "program", width: 50 },
        { header: 'Semester', key: "semester", width: 10 },
        { header: 'Program', key: "degree", width: 30 },
        { header: 'Full Name', key: "fullName", width: 40 },
        { header: 'Role', key: 'role', width: 25 },
        { header: 'Email', key: 'email', width: 50 },
        { header: 'Waiting Number', key: 'waitingNo', width: 15 }
      ]

      let counter = 1;
      bookingsJi.forEach((item) => {
        let rowItem = {
          s_no: counter,
          studioNo: item.studioNo,
          slotNo: item.slotNo % 10,
          timing: getTimingNoString(item?.timingNo),
          date: localDateStringToDDMMYYYY(item.bookings.date),
          program: item.bookings?.program,
          semester: item.bookings?.semester,
          degree: item.bookings?.degree,
          fullName: `${item?.user_doc?.name} ${item?.user_doc?.lastname}`,
          role: item?.user_doc?.role,
          email: item?.user_doc?.email,
          waitingNo: item.bookings?.waitingNo
        }
        worksheet.addRow(rowItem)
        counter++
      })

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true }
      })

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader("Content-Disposition", "attachment; filename=" + "StudioSlotReport.xlsx");
      return workbook.xlsx.write(res)
        .then(function (data) {
          res.end();
        });
    }

    const waitingBookings = await Slot.aggregate([
      {
        '$unwind': {
          'path': '$queueData.slotBookingsData'
        }
      }, {
        '$match': {
          ...studioQuery,
          ...searchQuery
        }
      }
      , {
        $project: {
          _id: 1,
          bookings: '$queueData.slotBookingsData',
          slotNo: 1,
          studioNo: 1,
          type: 1,
          timingNo: 1,
          user_doc: 1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'bookings.userEmail',
          foreignField: 'email',
          as: 'user_doc',
          pipeline: [{ "$project": { "name": 1, "lastname": 1, "email": 1, "role": 1 } }]
        }
      },
      {
        $unwind: {
          path: '$user_doc'
        }
      },
      {
        $sort: sortQuery
      },
      {
        $facet: {
          results: [
            {
              $skip: skip
            },
            {
              $limit: limit
            }
          ],
          count: [
            {
              $group: {
                _id: null,
                count: {
                  $sum: 1
                }
              }
            }
          ]
        }
      }
    ])
    res.status(200).json({ totalPages: Math.ceil(waitingBookings[0].count[0].count / limit), count: waitingBookings[0].results.length, bookings: waitingBookings[0].results })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
})

router.post("/reserve/update", async (req, res) => {
  try {
    const reserveBookings = await Slot.findOneAndUpdate({ slotNo: req.body.slotNo }, {
      $pop: {
        queueData: -1
      }
    }, { new: true }).select({ queueData: 1 })
    res.status(200).json(reserveBookings)
  } catch (error) {
    res.status(500).json(error)
  }
})

//delete reserve booking
router.post("/reserve/delete", async (req, res) => {
  try {
    //remove from queueData
    await Slot.findOneAndUpdate({
      'slotNo': req.body.slotNo,
    }, {
      $pull: {
        "queueData.slotBookingsData": { waitingNo: req.body.waitingNo, date: new Date(req.body.date) }
      }
    })

    //update waiting numbers of every other booking
    await Slot.findOneAndUpdate({
      'slotNo': req.body.slotNo,
    }, {
      $inc: {
        'queueData.slotBookingsData.$[elem].waitingNo': -1
      }
    }, {
      arrayFilters: [{ "elem.date": { $eq: new Date(req.body.date) }, "elem.waitingNo": { $gt: req.body.waitingNo } }]
    }
    )

    res.status(201).json({ msg: "reseve booking deleted" })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
})

//admin create a booking
router.post("/admin", async (req, res, next) => {
  try {
    const updatedSlot = await Slot.findOneAndUpdate(
      {
        "slotNo": req.body.slotNo,
        'slotBookingsData.date': { $ne: new Date(req.body.slotBookingData.date) }
      },
      {
        $push: {
          "slotBookingsData": req.body.slotBookingData
        }
      }, { new: true }
    );


    const dynamicTemplateData = {
      email: req.body.email,
      type: updatedSlot.type,
      date: req.body.slotBookingData.date,
      program: req.body.slotBookingData.program,
      timing: getTimingNoString(updatedSlot.timingNo),
      slotNo: Math.trunc(updatedSlot.slotNo / 10),
    }
    // await sendEmail(req, res, req.body.email, subject, bookingDoneTemplateId, dynamicTemplateData)
    const user = await User.findOne({ email: req.body.email })
    const refreshToken = user.refreshTokenGoogle

    const description = `You have a booking at Studio Number ${Math.trunc(req.body.slotNo / 10)} on date: ${localDateStringToDDMMYYYY(req.body.slotBookingData.date)}, time: ${getTimingNoString(req.body.slotNo % 10)} for the program: ${req.body.slotBookingData.program}. Please report 10 minutes before the slot time`
    await createEvent(refreshToken, req.body.slotBookingData.date, getStartTimeFromTimingNo(req.body.slotNo % 10), getEndTimeFromTimingNo(req.body.slotNo % 10), req.body.email, description, req.body.slotNo, Math.trunc(req.body.slotNo / 10), updatedSlot.type)
    await sendTemplatedEmailSES(req.body.email, 'studio-booking-confirmed-idol', dynamicTemplateData)
    res.status(200).json({ msg: `booking has been made in studio ${Math.trunc(req.body.slotNo / 10)} and slot ${req.body.slotNo % 10}`, studio: Math.trunc(req.body.slotNo / 10), slot: (req.body.slotNo % 10), type: updatedSlot.type })
  } catch (err) {
    res.status(302).json("This slot already booked or there is some error in backend");
    console.log(err)
  }
})


//get booking on a particular date
router.post("/status", async (req, res) => {
  try {
    const slots = await Slot.find({ 'slotBookingsData.date': { $eq: new Date(req.body.date) } });
    const slotNos = slots.map(slot => slot.slotNo)
    const slotData = await Slot.aggregate([
      {
        '$match': {
          'slotBookingsData.date': new Date(req.body.date)
        }
      }, {
        '$unwind': {
          'path': '$slotBookingsData'
        }
      }, {
        '$match': {
          'slotBookingsData.date': new Date(req.body.date)
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'slotBookingsData.userEmail',
          'foreignField': 'email',
          'as': 'user_doc',
          'pipeline': [
            {
              '$project': {
                'name': 1,
                'lastname': 1,
                'email': 1,
                'role': 1
              }
            }
          ]
        }
      }
    ])
    res.status(200).json({ slotNos, slotData })
  } catch (err) {
    console.log(err)
  }
})

//get booking on a particular date and particular type
router.post("/status/:type", async (req, res) => {
  try {
    const slots = await Slot.find({
      'slotBookingsData.date': { $eq: new Date(req.body.date) },
      'type': { $eq: req.params.type }
    });

    const slotNos = slots.map(slot => slot.slotNo)
    res.status(200).json(slotNos)
  } catch (err) {
    console.log(err)
    res.status(401).json({ msg: "there is some error", err: err.message })
  }
})

//deprecated
// router.put("/update", async (req, res) => {
//   try {
//     await Slot.findOneAndUpdate({ slotNo: req.body.slotNo }, { timingNo: req.body.timingNo })
//     res.status(201).json({ msg: "slot updates successully" })
//   } catch (error) {
//     res.status(401).json({ msg: "there is some error", err: error.message })
//   }
// })

router.post("/delete", async (req, res) => {
  try {
    //slot data from queue if it exist
    const slotDataqueue = await Slot.find({
      studioNo: req.body.studioNo, timingNo: req.body.timingNo
    }, {
      "queueData.slotBookingsData": {
        "$filter": {
          "input": "$queueData.slotBookingsData",
          "cond": {
            $and: [
              {
                "$eq": [
                  "$$this.waitingNo",
                  1
                ]
              },
              {
                "$eq": [
                  "$$this.date",
                  new Date(req.body.date)
                ]
              }
            ]
          }
        }
      },
    })

    //slot data that is deleted
    const slotData = await Slot.find({
      studioNo: req.body.studioNo, timingNo: req.body.timingNo
    }, {
      "slotBookingsData": {
        "$filter": {
          "input": "$slotBookingsData",
          "cond": {
            $and: [
              {
                "$eq": [
                  "$$this.date",
                  new Date(req.body.date)
                ]
              }
            ]
          }
        }
      },
    })
    // console.log(slotData[0].slotBookingsData[0])

    //pushing deleted booking to deltedField
    const obj = slotData[0].slotBookingsData[0]._doc
    const dataToPush = { reasonForCancel: req.body.reasonForCancel, ...obj }
    // console.log(dataToPush)
    await Slot.findOneAndUpdate({
      studioNo: req.body.studioNo, timingNo: req.body.timingNo
    }, {
      $push: {
        'deletedData.slotBookingsData': dataToPush
      }
    })

    //delete existing booking
    await Slot.findOneAndUpdate({ studioNo: req.body.studioNo, timingNo: req.body.timingNo }, {
      $pull: {
        slotBookingsData: { date: req.body.date }
      }
    })
    // console.log(slotData[0])


    //if there is queue booking then make that booking
    if (slotDataqueue[0].queueData.slotBookingsData != null && slotDataqueue[0].queueData.slotBookingsData?.length != 0) {

      //push first waiting to bookingsData except waitingNo
      const { waitingNo, ...data } = slotDataqueue[0].queueData.slotBookingsData[0]
      // console.log(data)
      await Slot.findOneAndUpdate({
        studioNo: req.body.studioNo, timingNo: req.body.timingNo
      }, {
        $push: {
          slotBookingsData: data._doc
        }
      })

      //remove from queueData
      await Slot.findOneAndUpdate({
        studioNo: req.body.studioNo, timingNo: req.body.timingNo
      }, {
        $pull: {
          "queueData.slotBookingsData": { waitingNo: 1, date: new Date(req.body.date) }
        }
      })

      //update waiting numbers of every other booking
      await Slot.findOneAndUpdate({
        studioNo: req.body.studioNo, timingNo: req.body.timingNo
      }, {
        $inc: {
          'queueData.slotBookingsData.$[elem].waitingNo': -1
        }
      }, {
        arrayFilters: [{ "elem.date": { $eq: new Date(req.body.date) }, "elem.waitingNo": { $gt: 1 } }]
      }
      )
      // console.log(data)

      // const dynamicTemplateDataTwo = {
      //   email: data._doc.userEmail,
      //   type: getStudioTypeFromStudioNo(req.body.studioNo),
      //   date: localDateStringToDDMMYYYY(req.body.date),
      //   program: data._doc.program,
      //   timing: getTimingNoString(req.body.timingNo),
      //   slotNo: req.body.studioNo,
      //   reasonForCancel: req.body?.reasonForCancel
      // }
      const dynamicTemplateDataTwo = {
        email: data._doc.userEmail,
        type: getStudioTypeFromStudioNo(req.body.studioNo),
        date: localDateStringToDDMMYYYY(data._doc.date),
        program: data._doc.program,
        timing: getTimingNoString(req.body.timingNo),
        slotNo: req.body.studioNo,
      }
      let receiversOfEmail = [data._doc.userEmail]
      if (data._doc?.recorder != '') {
        receiversOfEmail.push(data._doc?.recorder)
        const recorderFromDb = await User.findOne({email: data._doc.recorder})
        const refreshTokenRecorderQueue = recorderFromDb.refreshTokenGoogle
        const descriptionReciever = `You have a booking at Studio Number ${req.body.studioNo} on date: ${localDateStringToDDMMYYYY(data._doc.date)}, time: ${getTimingNoString(req.body.timingNo)} for the program: ${data._doc.program} and degree: ${data._doc.degree} from ${data._doc.userEmail}. Please report 10 minutes before the slot time`
        await createEvent(refreshTokenRecorderQueue, req.body.date, getStartTimeFromTimingNo(req.body.timingNo), getEndTimeFromTimingNo(req.body.timingNo), data._doc.recorder, descriptionReciever, req.body.slotNo, req.body.studioNo, getStudioTypeFromStudioNo(req.body.studioNo))
      }
      // await sendEmail(req, res, data._doc.userEmail, 'Studio Booking Confirmed', bookingDoneTemplateId, dynamicTemplateDataTwo)
      await sendTemplatedEmailSES(receiversOfEmail, 'studio-booking-confirmed-idol', dynamicTemplateDataTwo)
      const userQueue = await User.findOne({ email: data._doc.userEmail })
      const refreshTokenUserQueue = userQueue.refreshTokenGoogle
      const descriptionTwo = `You have a booking at Studio Number ${req.body.studioNo} on date: ${localDateStringToDDMMYYYY(req.body.date)}, time: ${getTimingNoString(req.body.timingNo)} for the program: ${data._doc.program}. Please report 10 minutes before the slot time`
      await createEvent(refreshTokenUserQueue, req.body.date, getStartTimeFromTimingNo(req.body.timingNo), getEndTimeFromTimingNo(req.body.timingNo), data._doc.userEmail, descriptionTwo, req.body.slotNo, req.body.studioNo, getStudioTypeFromStudioNo(req.body.studioNo))
    }

    const refrestToken = await User.findOne({ email: slotData[0].slotBookingsData[0].userEmail }, { _id: 0, refreshTokenGoogle: 1 })
    const eventId = await CalendarEvent.findOneAndDelete({ date: slotData[0].slotBookingsData[0].date, studioNo: req.body.studioNo, timingNo: req.body.timingNo, userEmail: slotData[0].slotBookingsData[0].userEmail })
    // console.log(eventId)
    // console.log(slotDataqueue)

    let receiversOfEmail = [slotData[0].slotBookingsData[0].userEmail]

    //deleting event of deleted booking
    await deleteEvent(refrestToken.refreshTokenGoogle, eventId.eventId)
    //deleting event of recorder if recorder is there
    if(slotData[0].slotBookingsData[0]?.recorder != ""){
      receiversOfEmail.push(slotData[0].slotBookingsData[0]?.recorder)
      const recorderFromDb = await User.findOne({email: slotData[0].slotBookingsData[0]?.recorder})
      const refreshTokenRecorderQueue = recorderFromDb.refreshTokenGoogle
      const eventIdRecorder = await CalendarEvent.findOneAndDelete({date: slotData[0].slotBookingsData[0]?.date, studioNo:req.body.studioNo, timingNo: req.body.timingNo, userEmail: slotData[0].slotBookingsData[0]?.recorder})
      await deleteEvent(refreshTokenRecorderQueue,eventIdRecorder.eventId)
    }


    const dynamicTemplateData = {
      email: slotData[0].slotBookingsData[0].userEmail,
      date: localDateStringToDDMMYYYY(req.body.date),
      program: slotData[0].slotBookingsData[0].program,
      timing: getTimingNoString(req.body.timingNo),
      slotNo: req.body.studioNo,
      reasonForCancel: req.body.reasonForCancel
    }
    //sending deleting mail
    // await sendEmail(req, res, slotData[0].slotBookingsData[0].userEmail, `Studio Booking Cancelled`, deleteDoneTemplateId, dynamicTemplateData)
    await sendTemplatedEmailSES(receiversOfEmail, 'studio-booking-deleted-idol', dynamicTemplateData)
    res.json({ msg: "done" })
  } catch (error) {
    console.log(error)
    res.json({ msg: "there is some error", err: error.message })
  }
})

router.post("/history", async (req, res) => {
  let typeOfHistoryQuery = {}
  if (req.body.bookingsType == "upcoming") {
    typeOfHistoryQuery = { $gt: new Date(req.body.dateString) }
  } else if (req.body.bookingsType == "past") {
    typeOfHistoryQuery = { $lt: new Date(req.body.dateString) }
  } else if (req.body.bookingsType == "today") {
    typeOfHistoryQuery = { $eq: new Date(req.body.dateString) }
  } else {
    const defaultQuery = { $gte: new Date(req.body.dateSring) }
    typeOfHistoryQuery = defaultQuery
  }
  try {
    const bookings = await Slot.aggregate([{
      '$unwind': {
        'path': '$slotBookingsData'
      }
    }, {
      '$match': {
        'slotBookingsData.userEmail': req.body.userEmail,
        'slotBookingsData.date': typeOfHistoryQuery
      }
    }, {
      $project: {
        slotBookingsData: 1, slotNo: 1, studioNo: 1, type: 1, timingNo: 1, _id: 0
      }
    },
    {
      $sort: {
        "slotBookingsData.date": 1,
        "slotBookingsData.bookedAt": 1
      }
    }])
    res.status(201).json({ count: bookings.length, bookings })
  } catch (error) {
    res.status(401).json({ msg: 'there is some error', err: error.message })

  }
})

// all bookings data admin
router.post("/find", async (req, res) => {
  // pagination and limit
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10  //by default 10 is the limit of objects to fetch
  const skip = (page - 1) * limit       // if limit is 10 and page is 2 then, skip will be 10, so it will show the objects after skipping 10 objects from the results

  const sort = req.query.sort
  let sortQuery = { "slotBookingsData.date": 1 }
  if (sort) {
    switch (sort) {
      case "bookedAt":
        if (req.query.order) {
          if (req.query.order == 'Asc') {
            sortQuery = { "slotBookingsData.bookedAt": 1 }
          } else if (req.query.order == 'Desc') {
            sortQuery = { "slotBookingsData.bookedAt": -1 }
          }
        } else {
          sortQuery = { "slotBookingsData.bookedAt": 1 }
        }
        break;
      case "studioNo":
        if (req.query.order) {
          if (req.query.order == 'Asc') {
            sortQuery = { "studioNo": 1 }
          } else if (req.query.order == 'Desc') {
            sortQuery = { "studioNo": -1 }
          }
        } else {
          sortQuery = { "studioNo": 1 }
        }
        break;
      default:
        break;
    }
  }
  const manage = req.query.manage
  let dateQuery = { $gte: new Date(req.body.dateString) }
  if (manage == 'true') {
    dateQuery = { $lte: new Date(req.body.dateString) }
    sortQuery = { "slotBookingsData.date": -1 }
  }

  const studio = req.query.studio
  let studioQuery = {}
  if (studio) {
    switch (studio) {
      case 'all':
        studioQuery = {}
        break;
      default:
        studioQuery = { 'studioNo': Number(studio) }
        break;
    }
  }

  const { program, email, name } = req.query
  let searchQuery = {}
  if (program) {
    searchQuery = { 'slotBookingsData.program': { $regex: program, $options: 'i' } }
  }
  if (email) {
    searchQuery = { 'slotBookingsData.userEmail': { $regex: email, $options: 'i' } }
  }
  if (name) {
    searchQuery = { 'slotBookingsData.userEmail': { $regex: name, $options: 'i' } }
  }


  try {
    if (req.query.typeOfRequest === 'downloadCsv') {

      let bookingsJi = await Slot.aggregate([
        {
          '$unwind': {
            'path': '$slotBookingsData'
          }
        }, {
          '$match': {
            'slotBookingsData.date': dateQuery,
            ...studioQuery,
            ...searchQuery
          }
        },
        {
          $project: {
            slotBookingsData: 1, slotNo: 1, studioNo: 1, type: 1, timingNo: 1, _id: 0, user_docs: 1
          }
        }, {
          '$sort': sortQuery
        },
        {
          $lookup: {
            from: 'users',
            localField: 'slotBookingsData.userEmail',
            foreignField: 'email',
            as: 'user_doc',
            pipeline: [{ "$project": { "name": 1, "lastname": 1, "email": 1, "role": 1 } }]
          }
        },
        {
          $unwind: {
            path: '$user_doc'
          }
        }
      ])

      const workbook = new excelJs.Workbook()
      const worksheet = workbook.addWorksheet("Studio Slot Data")

      worksheet.columns = [
        { header: "S.no", key: 's_no', width: 10 },
        { header: "Studio No", key: 'studioNo', width: 15 },
        { header: "Slot No", key: 'slotNo', width: 15 },
        { header: "Timing", key: "timing", width: 25 },
        { header: 'Date', key: "date", width: 30 },
        { header: 'Course', key: "program", width: 50 },
        { header: 'Semester', key: "semester", width: 10 },
        { header: 'Program', key: "degree", width: 30 },
        { header: 'Full Name', key: "fullName", width: 40 },
        { header: 'Role', key: 'role', width: 25 },
        { header: 'Email', key: 'email', width: 50 },
        { header: 'Defaulted', key: 'defaulted', width: 20 },
        { header: 'Reason for defaulted', key: 'reasonForDefault', width: 70 },
        { header: 'Completed', key: 'completed', width: 20 },
        { header: 'Reason for completed', key: 'reasonForCompleted', width: 70 }
      ]

      let counter = 1;
      bookingsJi.forEach((item) => {
        let rowItem = {
          s_no: counter,
          studioNo: item.studioNo,
          slotNo: item.slotNo % 10,
          timing: getTimingNoString(item?.timingNo),
          date: localDateStringToDDMMYYYY(item.slotBookingsData.date),
          program: item.slotBookingsData?.program,
          semester: item.slotBookingsData?.semester,
          degree: item.slotBookingsData?.degree,
          fullName: `${item?.user_doc?.name} ${item?.user_doc?.lastname}`,
          role: item?.user_doc?.role,
          email: item?.user_doc?.email,
          defaulted: item.slotBookingsData?.defaulted,
          reasonForDefault: item.slotBookingsData?.reasonForDefault,
          completed: item.slotBookingsData?.completed,
          reasonForCompleted: item.slotBookingsData?.reasonForCompleted
        }
        worksheet.addRow(rowItem)
        counter++
      })

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true }
      })

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader("Content-Disposition", "attachment; filename=" + "StudioSlotReport.xlsx");
      return workbook.xlsx.write(res)
        .then(function (data) {
          res.end();
        });
    }

    let bookings = await Slot.aggregate([
      {
        '$unwind': {
          'path': '$slotBookingsData'
        }
      }, {
        '$match': {
          'slotBookingsData.date': dateQuery,
          ...studioQuery,
          ...searchQuery
        }
      },
      {
        $project: {
          slotBookingsData: 1, slotNo: 1, studioNo: 1, type: 1, timingNo: 1, _id: 0, user_docs: 1
        }
      }, {
        '$sort': sortQuery
      },
      {
        $lookup: {
          from: 'users',
          localField: 'slotBookingsData.userEmail',
          foreignField: 'email',
          as: 'user_doc',
          pipeline: [{ "$project": { "name": 1, "lastname": 1, "email": 1, "role": 1 } }]
        }
      },
      {
        $unwind: {
          path: '$user_doc'
        }
      }, {
        $facet: {
          results: [
            {
              $skip: skip
            },
            {
              $limit: limit
            }
          ],
          count: [
            {
              $group: {
                _id: null,
                count: {
                  $sum: 1
                }
              }
            }
          ]
        }
      }
    ])
    res.json({ totalPages: Math.ceil(bookings[0].count[0].count / limit), count: bookings[0].results.length, bookings: bookings[0].results })
  } catch (error) {
    res.json(error.message)
  }
})

router.get("/find", async (req, res) => {
  let dateQuery = { $lte: new Date(req.query.dateString) }
  let sortQuery = { "slotBookingsData.date": -1 }
  if (req.query.typeOfRequest === 'downloadCsv') {

    let bookingsJi = await Slot.aggregate([
      {
        '$unwind': {
          'path': '$slotBookingsData'
        }
      }, {
        '$match': {
          'slotBookingsData.date': dateQuery,
        }
      },
      {
        $project: {
          slotBookingsData: 1, slotNo: 1, studioNo: 1, type: 1, timingNo: 1, _id: 0, user_docs: 1
        }
      }, {
        '$sort': sortQuery
      },
      {
        $lookup: {
          from: 'users',
          localField: 'slotBookingsData.userEmail',
          foreignField: 'email',
          as: 'user_doc',
          pipeline: [{ "$project": { "name": 1, "lastname": 1, "email": 1, "role": 1 } }]
        }
      },
      {
        $unwind: {
          path: '$user_doc'
        }
      }
    ])

    const workbook = new excelJs.Workbook()
    const worksheet = workbook.addWorksheet("Studio Slot Data")

    worksheet.columns = [
      { header: "S.no", key: 's_no', width: 10 },
      { header: "Studio No", key: 'studioNo', width: 15 },
      { header: "Slot No", key: 'slotNo', width: 15 },
      { header: "Timing", key: "timing", width: 25 },
      { header: 'Date', key: "date", width: 30 },
      { header: 'Course', key: "program", width: 50 },
      { header: 'Semester', key: "semester", width: 10 },
      { header: 'Program', key: "degree", width: 30 },
      { header: 'Full Name', key: "fullName", width: 40 },
      { header: 'Role', key: 'role', width: 25 },
      { header: 'Email', key: 'email', width: 50 },
      { header: 'Defaulted', key: 'defaulted', width: 20 },
      { header: 'Reason for defaulted', key: 'reasonForDefault', width: 70 },
      { header: 'Completed', key: 'completed', width: 20 },
      { header: 'Reason for completed', key: 'reasonForCompleted', width: 70 }
    ]

    let counter = 1;
    bookingsJi.forEach((item) => {
      let rowItem = {
        s_no: counter,
        studioNo: item.studioNo,
        slotNo: item.slotNo,
        timing: getTimingNoString(item?.timingNo),
        date: localDateStringToDDMMYYYY(item.slotBookingsData.date),
        program: item.slotBookingsData?.program,
        semester: item.slotBookingsData?.semester,
        degree: item.slotBookingsData?.degree,
        fullName: `${item?.user_doc?.name} ${item?.user_doc?.lastname}`,
        role: item?.user_doc?.role,
        email: item?.user_doc?.email,
        defaulted: item.slotBookingsData?.defaulted,
        reasonForDefault: item.slotBookingsData?.reasonForDefault,
        completed: item.slotBookingsData?.completed,
        reasonForCompleted: item.slotBookingsData?.reasonForCompleted
      }
      worksheet.addRow(rowItem)
      counter++
    })

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + "StudioSlotReport.xlsx");
    return workbook.xlsx.write(res)
      .then(function (data) {
        res.end();
      });
  }
})

//end the booking
router.post("/end", async (req, res) => {
  const type = req.query.type
  let actionQuery = {}
  if (type == 'markDefault') {
    actionQuery = {
      'slotBookingsData.$[elem].defaulted': true,
      'slotBookingsData.$[elem].reasonForDefault': req.body.reasonForDefault,
      'slotBookingsData.$[elem].completed': false
    }
  } else if (type == 'markComplete') {
    actionQuery = {
      'slotBookingsData.$[elem].completed': true,
      'slotBookingsData.$[elem].reasonForCompleted': req.body.reasonForCompleted,
      'slotBookingsData.$[elem].defaulted': false
    }
  }
  try {
    await Slot.findOneAndUpdate({
      studioNo: req.body.studioNo, timingNo: req.body.timingNo
    }, {
      ...actionQuery
    }, {
      arrayFilters: [{ "elem.date": { $eq: new Date(req.body.date) }, "elem.userEmail": { $eq: req.body.userEmail } }]
    }
    )
    res.status(201).json({ msg: 'done' })
  } catch (error) {
    console.log(error.message)
  }
})

//quick stats homepage for user
router.post("/quick-stats", async (req, res) => {
  let typeOfHistoryQuery = {}
  if (req.body.bookingsType == "upcoming") {
    typeOfHistoryQuery = { $gt: new Date(req.body.dateString) }
  } else if (req.body.bookingsType == "past") {
    typeOfHistoryQuery = { $lt: new Date(req.body.dateString) }
  } else if (req.body.bookingsType == "today") {
    typeOfHistoryQuery = { $eq: new Date(req.body.dateString) }
  } else {
    const defaultQuery = { $gte: new Date(req.body.dateSring) }
    typeOfHistoryQuery = defaultQuery
  }
  try {
    const bookings = await Slot.aggregate([{
      '$unwind': {
        'path': '$slotBookingsData'
      }
    }, {
      '$match': {
        'slotBookingsData.userEmail': req.body.userEmail,
        'slotBookingsData.date': typeOfHistoryQuery
      }
    }, {
      $project: {
        slotBookingsData: 1, slotNo: 1, studioNo: 1, type: 1, timingNo: 1, _id: 0
      }
    },
    {
      $sort: {
        "slotBookingsData.date": 1,
        "slotBookingsData.bookedAt": 1
      }
    }])
    res.status(201).json({ count: bookings.length, bookings })
  } catch (error) {
    res.status(401).json({ msg: 'there is some error', err: error.message })

  }
})

module.exports = router