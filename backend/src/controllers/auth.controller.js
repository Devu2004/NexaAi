const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')

async function registeruser(req,res){
    const {fullName :{firstName , lastName}, email , password} = req.body

    const isUserAlreadyExist = await userModel.findOne({email})

    if(isUserAlreadyExist){
        res.status(400).json({
            message:"User already exist!"
        })
    }
    const hashPassword = await bcrypt.hash(password,10)
    const user  = await userModel.create({
        fullName:{
            firstName,lastName
        },
        email,
        password:hashPassword
    })

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie('token',token)

    res.json({
        message:'User created successfully!',
        user:{
            email:user.email,
            _id:user._id,
            fullName:user.fullName
        }
    })
}

async function loginuser(req,res){
    const {email,password} = req.body

    const user = await userModel.findOne({
        email
    })
    if(!user){
        return res.status(400).json({
            message : "Invailid username or password"
        })
    }

    const isPasswordVailid = await bcrypt.compare(password,user.password)
    if(!isPasswordVailid){
        return res.status(400).json({
            message : "enter vailid password"
        })
    }
    const token = jwt.sign({id: user._id},process.env.JWT_SECRET)

    res.cookie('token',token)

    res.status(200).json({
        message: `User logged in successfully`,
        user :{
            email : user.email,
            name : user.fullName,
            _id : user._id
        }
    })
}
module.exports = {
    registeruser,
    loginuser
}