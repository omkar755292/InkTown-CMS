const mongoose = require( 'mongoose' );

const productQualitySchema = new mongoose.Schema( {
    name: { type: String, required: true },
    id: { type: String, required: true },
    price: { type: Number, required: true },
} );



const ProductQuality = mongoose.model( 'Product-Quality', productQualitySchema );

module.exports = ProductQuality;
