// models/chat.js
const mongoose = require( 'mongoose' );

const chatSchema = new mongoose.Schema( {
    chatId: { type: String, required: true },
    type: { type: String, enum: [ 'userType', 'adminType' ], required: true },
    lastMsgTime: { type: String, required: true },
    orderId: { type: String, required: true },
    msgBox: [ {
        msgText: String,
        msgTime: { type: String, required: true },
        msgSenderName: String,
        phoneNumber: String
    } ]
} );

const Chat = mongoose.model( 'Chat', chatSchema );

module.exports = Chat;
