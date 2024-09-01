const express = require( 'express' );
const mongoose = require( 'mongoose' );
const authMiddleware = require( '../middlewares/authMiddleware' );
const Logfile = require( '../models/LogFile' );
// const logData = require( '../controllers/LogFileController' );
// const { SendNotification } = require( './../global/FCM.js' );


const logfileData = express.Router();

logfileData.use( authMiddleware );



// Get all logfiles
logfileData.get( '/alldata', async ( req, res ) =>
{
    try
    {
        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        const logfiles = await Logfile.find( { phoneNumber } );

        res.status( 200 ).json( { status: 1, data: logfiles } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: error.message } );
    }
} );



// Get a single logfile by ID
logfileData.get( '/oneData/:phoneNumber', async ( req, res ) =>
{
    try
    {

        const authUser = req.user;
        const phoneNumberAdmin = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != "super-admin" ) return res.status( 401 ).send();

        const phoneNumber = req.params.phoneNumber;


        const logFile = await Logfile.find( { phoneNumber } );
        res.status( 200 ).json( { status: 1, data: logFile } );

    } catch ( error )
    {
        res.status( 500 ).json( { message: error.message } );
    }
} );

// // Update a logfile by ID
// logfileData.patch('/api/logfiles/:id', async (req, res) => {
//     try {
//         const { phoneNumber, notes } = req.body;
//         const updatedLogfile = await Logfile.findByIdAndUpdate(req.params.id, { phoneNumber, notes }, { new: true });
//         if (updatedLogfile === null) {
//             return res.status(404).json({ message: 'Logfile not found' });
//         }
//         res.json(updatedLogfile);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // Delete a logfile by ID
// logfileData.delete('/api/logfiles/:id', async (req, res) => {
//     try {
//         const deletedLogfile = await Logfile.findByIdAndDelete(req.params.id);
//         if (deletedLogfile === null) {
//             return res.status(404).json({ message: 'Logfile not found' });
//         }
//         res.json(deletedLogfile);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

module.exports = logfileData;