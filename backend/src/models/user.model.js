const mongoose = require('mongoose')

const mongooseSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        firstName: {type: String, required: true},
        lastName: {type: String, required:true}
    },
    password:{
        type:String
    }
},{
    timestamps:true
}
)

const mongooseModel = mongoose.model('users',mongooseSchema)

module.exports = mongooseModel