const chatmodel = require('../models/chat.model')
const jwt = require('jsonwebtoken')

async function createchat(req,res) {
    const {title} = req.body;
    const user = req.user;

    const chat = await chatmodel.create({
        user : user._id,
        title
    })
    res.status(201).json({
        message:"chat created Successfully!",

        chat:{
            _id : chat._id,
            user:chat.user,
            title:chat.title,
            lastActivity : chat.lastActivity
        }
    })
}


module.exports = {
    createchat
}