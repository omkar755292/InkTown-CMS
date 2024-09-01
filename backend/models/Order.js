const mongoose = require( 'mongoose' );


const orderSchema = new mongoose.Schema( {
    orderDate: { type: Number },
    paidDate: { type: Number },
    expTime: { type: Number },
    orderId: { type: String, required: false, unique: true },
    amount: { type: Number, required: false },
    cashback: { type: Number, default: '0' },
    cashbackStatus: { type: String, default: 'upcoming' },
    status: { type: String, default: 'Active' }, // active/delete/cancel/approve/ongoing/complete
    notes: { type: String },
    phoneNumber: { type: String, required: true, unique: false },
    paid: { type: Number, default: 0.00 },
    fullPaid: { type: Boolean, default: false },
    approvedBy: { type: String, default: '' },
    items: [ {
        itemId: { type: mongoose.Schema.Types.String, ref: 'Item' },
        width: { type: Number },
        height: { type: Number },
        quantity: { type: Number },
        quality: { type: String },
        ring: { type: Boolean, default: false },
        ringQuantity: { type: Number, default: 0 },
        needSpaceForBinding: { type: Boolean, default: false },
        file: { type: String },
        note: { type: String },
        totalPrice: { type: Number },
        extraPrice: [
            {
                name: { type: String, default: "Extra" },
                price: { type: Number, default: 0 },
                txnId: { type: String }
            }
        ]
    } ]
} );


const Order = mongoose.model( 'Order', orderSchema );

module.exports = Order;
