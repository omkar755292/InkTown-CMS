const mongoose = require( 'mongoose' );



const settingsSchema = new mongoose.Schema( {
    appId: { type: String, required: true, unique: true },
    loadTime: { type: Number, required: true },
    speedLimit: { type: Number, required: true, },
    cashBack: { type: Number, default: '0', required: true },
    lastOrderYear: { type: Number, default: '0', required: true },
    lastOrderNo: { type: Number, default: '0', required: true },
    lastUserId: { type: Number, default: '0', required: true },
} );

// "cashBack": 1.0,
// "speedLimit": 700,
// "loadTime": 1234567890123,
// "appId": "InkTown"

const Settings = mongoose.model( 'Settings', settingsSchema );

module.exports = Settings;
