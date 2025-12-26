const mongoose = require('mongoose')

function connectToDB(){
    mongoose.connect(process.env.MONGO_DB_URI).then(()=>{
            console.log('Connected db successfully!');
        }).catch(err =>{
            console.log(err);
        })
}

module.exports = connectToDB