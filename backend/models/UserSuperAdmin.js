const mongoose = require('mongoose');



const superadminuserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: false, unique: true },
    status: { type: String },
    mpin: { type: String, required: true },
    type: { type: String }
});

const UserSuperAdmin = mongoose.model('User-Super-Admins', superadminuserSchema);


module.exports = UserSuperAdmin;
