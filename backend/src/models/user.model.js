const mongoose = require('mongoose');

const mongooseSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true 
    },
    fullName: {
        firstName: { 
            type: String, 
            required: true 
        },
        lastName: { 
            type: String 
        }
    },
    password: {
        type: String,
        required: true,
        select: false 
    },
    status: {
        type: String,
        default: 'System Online'
    },
    image: {
        type: String,
        default: '' 
    },
    otp: {
        type: Number
    },
    otpExpires: {
        type: Date
    }
}, {
    timestamps: true
});

mongooseSchema.methods.getFullName = function() {
    return `${this.fullName.firstName} ${this.fullName.lastName || ''}`.trim();
};

const mongooseModel = mongoose.model('users', mongooseSchema);

module.exports = mongooseModel;