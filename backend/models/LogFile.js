const mongoose = require( 'mongoose' );

const logfileSchema = new mongoose.Schema( {
    phoneNumber: { type: String, required: true },
    timeStamp: { type: String, required: true },
    notes: { type: String, required: true }
} );

const Logfile = mongoose.model( 'Logfile', logfileSchema );

module.exports = Logfile;