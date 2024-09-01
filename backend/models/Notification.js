const mongoose = require( 'mongoose' );

const NotificationSchema = new mongoose.Schema( {
    noticeId: { type: String },
    textBox: { type: String },
    status: { type: String, default: "active" },
    date: { type: String },
    views: [ { type: String } ]
} );

const Notification = mongoose.model( 'notification', NotificationSchema ); // cashback/credit/invoice

module.exports = Notification;