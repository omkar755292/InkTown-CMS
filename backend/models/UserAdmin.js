const mongoose = require( 'mongoose' );



const adminuserSchema = new mongoose.Schema( {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    mpin: { type: String, default: '1234', required: true, minlength: 4, maxlength: 4 },
} );



const UserAdmin = mongoose.model( 'User-Admins', adminuserSchema );


module.exports = UserAdmin;
