// routes/orderRoutes.js
const express = require( 'express' );
// const Order = require( '../models/Order' );
const UserAdmin = require( '../models/UserAdmin' );

const ProductQuality = require( '../models/ProductQuality' );
const multer = require( 'multer' );
const fs = require( 'fs' );
const path = require( 'path' );
const authMiddleware = require( '../middlewares/authMiddleware' );
const short = require( 'short-uuid' );
// const logData = require( '../controllers/LogFileController' );
// const { SendNotification } = require( './../global/FCM.js' );

const SuperAdmin_Admin = express.Router();

// Multer storage configuration

SuperAdmin_Admin.use( authMiddleware );

// All attributes are here mpin, name, phoneNumber
SuperAdmin_Admin.post( '/create', async ( req, res ) =>   //Todo: Complete this
{
    try
    {
        const { mpin, name, phoneNumber } = req.body;

        const authUser = req.user;
        const type = authUser.type;
        const phoneNumberAdmin = authUser.phoneNumber;

        if ( type != "super-admin" ) return res.status( 401 ).send();



        const user = await UserAdmin.findOne( { phoneNumber } );
        var myRes = {}

        if ( user )
        {
            return res.status( 200 ).send( { status: 2, message: "Already available" } );
        }

        const newUser = new UserAdmin( { mpin, name, phoneNumber } );
        await newUser.save();

        return res.status( 200 ).send( { status: 1, message: "Successful" } );
    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error creating order' );
    }
} );

SuperAdmin_Admin.get( '/fetch', async ( req, res ) =>
{
    try
    {
        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;
        if ( type != "super-admin" ) return res.status( 401 ).send();


        const adminUsers = await UserAdmin.find();
        return res.status( 200 ).send( { status: 1, data: adminUsers } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
} );

SuperAdmin_Admin.delete( '/delete/:id', async ( req, res ) =>
{
    try
    {
        const _id = req.params.id;
        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;
        if ( type != "super-admin" ) return res.status( 401 ).send();


        const admin = await UserAdmin.findOne( { _id } );

        if ( admin )
        {
            const status = "cancel";

            const finalData = await UserAdmin.deleteOne( { _id } )

            return res.status( 200 ).send( { status: 1, message: "Admin data deleted," } );
        }

        return res.status( 200 ).send( { status: 2, message: "Not available." } );


    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error updating order' );
    }
} );


// SuperAdmin_Admin.post( '/fetch-one-user', async ( req, res ) =>
// {
//     try
//     {
//         const { phoneNumber } = req.body;

//         const authUser = req.user;
//         const type = authUser.type;
//         // console.log( authUser );
//         if ( type != "super-admin" ) return res.status( 401 ).send();

//         const orders = await Order.find( { phoneNumber } );

//         return res.status( 200 ).send( { status: 1, data: orders } );

//     } catch ( error )
//     {
//         console.error( error );
//         res.status( 500 ).send( 'Error fetching orders' );
//     }
// } );



// SuperAdmin_Admin.post( '/fetch-one', async ( req, res ) =>
// {
//     try
//     {
//         const { orderId } = req.body;

//         const authUser = req.user;
//         // const phoneNumber = authUser.phoneNumber;
//         const type = authUser.type;
//         // console.log( authUser );
//         if ( type != "super-admin" ) return res.status( 401 ).send();

//         const orders = await Order.findOne( { orderId } );

//         return res.status( 200 ).send( { status: 1, data: orders } );

//     } catch ( error )
//     {
//         console.error( error );
//         res.status( 500 ).send( 'Error fetching orders' );
//     }
// } );



// SuperAdmin_Admin.post( '/product-quality', async ( req, res ) =>   //Todo: Complete this
// {
//     try
//     {
//         const { price, name } = req.body;

//         const authUser = req.user;
//         const type = authUser.type;

//         if ( type != "super-admin" ) return res.status( 401 ).send();

//         const id = short.generate();


//         const newProductQuality = new ProductQuality( { price, name, id } );
//         await newProductQuality.save();

//         return res.status( 200 ).send( { status: 1, message: "Successful" } );
//     } catch ( error )
//     {
//         console.error( error );
//         res.status( 500 ).send( 'Error creating order' );
//     }
// } );

// SuperAdmin_Admin.get( '/fetch-product-quality', async ( req, res ) =>
// {
//     try
//     {
//         const authUser = req.user;
//         const type = authUser.type;
//         // console.log( authUser );
//         if ( type != "super-admin" ) return res.status( 401 ).send();

//         const orders = await ProductQuality.find();
//         return res.status( 200 ).send( { status: 1, data: orders } );

//     } catch ( error )
//     {
//         console.error( error );
//         res.status( 500 ).send( 'Error fetching orders' );
//     }
// } );


SuperAdmin_Admin.post( '/edit/:id', async ( req, res ) =>
{
    try
    {
        const _id = req.params.id;
        const { mpin, name, phoneNumber } = req.body;



        const authUser = req.user;
        const type = authUser.type;

        const phoneNumberAdmin = authUser.phoneNumber;
        if ( type != "super-admin" ) return res.status( 401 ).send();


        const user = await UserAdmin.findOne( { _id } );

        if ( !user )
        {
            return res.status( 200 ).send( { status: 2, message: "Not available" } );
        }



        const finalData = await UserAdmin.updateOne(
            { _id }
            ,
            {
                $set: {
                    mpin, name, phoneNumber
                }
            }
            ,
            { upsert: true }
        );


        const adminUsers = await UserAdmin.find();
        return res.status( 200 ).send( { status: 1, message: "User update successful.", data: adminUsers } );


    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error updating order' );
    }
} );



module.exports = SuperAdmin_Admin;
