const router = require('express').Router();
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken")
const bcrypt = require("bcryptjs");
const User = require('../models/User');

//in all the routes below we have used verifyTokenAnd... middleware which are imported from a file, which basically calls next fxn after getting jsonwebtoken from the headers and verifying it. if next fxn within them is called then the async fxn get it's turn to run


//get all users


//delete user
router.delete("/:userId", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json("User deleted sucessfully!")
    } catch (error) {
        res.status(500).json(error);
    }
})

//find a single user, only admin can do that
router.get("/find/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json(error);
    }
})

//finding all users, only admin can do that
router.get("/", async (req, res) => {
    try {
        //if there is query then sort in descending order of id
        let users = User.find().sort({email: 1})

        //sort
        // let sortQuery = { role: 1 }
        // if (req.query.sort) {
        //     switch (req.query.sort) {
        //         case "firstName":
        //             if (req.query.order) {
        //                 if (req.query.order == 'Asc') {
        //                     sortQuery = { name: 1 }
        //                 } else if (req.query.order == 'Desc') {
        //                     sortQuery = { name: -1 }
        //                 } else {
        //                     sortQuery = { name: 1 }
        //                 }
        //             } else {
        //                 sortQuery = { name: 1 }
        //             }
        //             break;
        //         case "lastName":
        //             if (req.query.order) {
        //                 if (req.query.order == 'Asc') {
        //                     sortQuery = { lastName: 1 }
        //                 } else if (req.query.order == 'Desc') {
        //                     sortQuery = { lastName: -1 }
        //                 } else {
        //                     sortQuery = { lastName: 1 }
        //                 }
        //             } else {
        //                 sortQuery = { lastName: 1 }
        //             }
        //             break;
        //         case "email":
        //             if (req.query.order) {
        //                 if (req.query.order == 'Asc') {
        //                     sortQuery = { email: 1 }
        //                 } else if (req.query.order == 'Desc') {
        //                     sortQuery = { email: -1 }
        //                 } else {
        //                     sortQuery = { email: 1 }
        //                 }
        //             } else {
        //                 sortQuery = { email: 1 }
        //             }
        //             break;
        //         case "role":
        //             if (req.query.order) {
        //                 if (req.query.order == 'Asc') {
        //                     sortQuery = { role: 1 }
        //                 } else if (req.query.order == 'Desc') {
        //                     sortQuery = { role: -1 }
        //                 } else {
        //                     sortQuery = { role: 1 }
        //                 }
        //             } else {
        //                 sortQuery = { role: 1 }
        //             }
        //             break;
        //         case "status":
        //             if (req.query.order) {
        //                 if (req.query.order == 'Asc') {
        //                     sortQuery = { status: 1 }
        //                 } else if (req.query.order == 'Desc') {
        //                     sortQuery = { status: -1 }
        //                 } else {
        //                     sortQuery = { status: 1 }
        //                 }
        //             } else {
        //                 sortQuery = { status: 1 }
        //             }
        //             break;
        //     }
        // }
        // users = users.sort(sortQuery)

        // pagination and limit
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10  //by default 10 is the limit of objects to fetch
        const skip = (page - 1) * limit       // if limit is 10 and page is 2 then, skip will be 10, so it will show the objects after skipping 10 objects from the results

        
        const finalUsers = await users.skip(skip).limit(limit)

        const totalDocuments = await User.countDocuments()
        const totalPages = Math.ceil(totalDocuments / limit)

        res.status(200).json({ count: totalPages, users: finalUsers });
    } catch (error) {
        res.status(500).json(error);
    }
})

// set user status
router.post("/:userId", async (req, res) => {
    try {
        await User.findOneAndUpdate({ _id: req.params.userId }, {
            status: req.body.status
        })
        res.status(201).json({ msg: "user status updated" })
    } catch (error) {

    }
})

router.post("/role/:userId", async(req,res)=>{
    try {
        let additionalQuery = {}
        if(req.body.role === 'admin' || req.body.role === 'manager' || req.body.role === 'provc' || req.body.role == "recorder"){
            additionalQuery.isAdmin = true
        }
        await User.findOneAndUpdate({_id: req.params.userId},{
            role: req.body.role,
            ...additionalQuery
        })
        res.status(201).json({msg: "role changed successfully"})
    } catch (error) {
        res.status(400).json({msg: error.message})
    }   
})

router.post("/role/list/:userType", async(req,res)=>{
    try {
        const usersOfParticularType = await User.find({role: req.params.userType, status: "approved", _id: {$nin: req.body.recordersIDs}}).select({name: 1, lastname: 1, username: 1, email: 1, img: 1,googleId: 1, refreshTokenGoogle: 1})
        res.status(200).json({users: usersOfParticularType})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

module.exports = router