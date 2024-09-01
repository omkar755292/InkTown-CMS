const mongoose = require('mongoose');

const UserwalletCSchema = new mongoose.Schema({
    phoneNumber: { type: String},
    orderId: { type: String },
    txnId: {type: String},
    amount: { type: Number },
    cashback: { type: Number },
    redeem: { type: Number },
    fullPayment: { type: String },
    type: {type:String},
    date: { type: Date, default: Date.now },
    note: { type: String }
});

const Wallet = mongoose.model('Wallet', UserwalletCSchema); // cashback/credit/invoice

module.exports = Wallet;
