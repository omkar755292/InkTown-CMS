// logHelper.js

const Logfile = require( '../models/LogFile' );

logData = async ( phoneNumber, notes ) =>
{
    try
    {
        const timeStamp = new Date().getTime();

        // Create a new log entry
        const logEntry = new Logfile( {
            timeStamp,
            phoneNumber,
            notes
        } );

        // Save the log entry to the database
        await logEntry.save();


    } catch ( error )
    {
        console.error( error );

    }
};





module.exports = logData