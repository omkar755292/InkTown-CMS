const mongoose = require( 'mongoose' );


const userSchema = new mongoose.Schema( {
    name: { type: String, required: false, default: "InkTown User" },
    email: { type: String, required: false, unique: false },
    phoneNumber: { type: String, required: false, unique: true },
    whatsappNumber: { type: String },
    address: { type: String },
    pincode: { type: String },
    balance: { type: Number, required: true, default: 0 },
    state: { type: String },
    mpin: { type: String, default: '0', required: false, minlength: 4, maxlength: 4 },
    status: { type: String, default: 'active' } // active/de-active/reset-mpin
} );



const User = mongoose.model( 'User', userSchema );


module.exports = User;
