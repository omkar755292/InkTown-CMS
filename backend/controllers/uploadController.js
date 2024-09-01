// uploadController.js

const multer = require( 'multer' );
const fs = require( 'fs' );
const path = require( 'path' );
// const logData = require( '../controllers/LogFileController' );
// const { SendNotification } = require( './../global/FCM.js' );


// Set up multer storage for image uploads
const storage1 = multer.diskStorage( {
    destination: function ( req, file, cb )
    {
        cb( null, '/uploads' );
    },
    filename: function ( req, file, cb )
    {
        if ( !fs.existsSync( '/uploads' ) )
        {
            fs.mkdirSync( '/uploads' );
        }
        cb( null, 'TopImage' );
    }
} );

const storage2 = multer.diskStorage( {
    destination: function ( req, file, cb )
    {
        cb( null, '/uploads' );
    },
    filename: function ( req, file, cb )
    {
        if ( !fs.existsSync( '/uploads' ) )
        {
            fs.mkdirSync( '/uploads' );
        }
        cb( null, 'BottomImage' );
    }
} );

const upload1 = multer( { storage: storage1 } );
const upload2 = multer( { storage: storage2 } );

// Function to handle uploading top image
exports.uploadTopImage = upload1.single( 'topImage' ), async ( req, res ) =>
{
    try
    {
        const imageUrl = req.file.path;
        //const upload1 = new Upload({ imageUrl });
        //await upload1.save();
        // res.send({ imageUrl });
        return res.status( 200 ).send( { status: 1 } );
    } catch ( error )
    {
        res.status( 500 ).send( { error: error.message } );
    }
};

// Function to handle uploading bottom image
exports.uploadBottomImage = upload2.single( 'bottomImage' ), async ( req, res ) =>
{
    try
    {
        const imageUrl = req.file.path;
        //const upload2 = new Upload({ imageUrl });
        //await upload2.save();
        // res.send({ imageUrl });
        return res.status( 200 ).send( { status: 1 } );
    } catch ( error )
    {
        res.status( 500 ).send( { error: error.message } );
    }
};

exports.getTopImage = ( req, res ) =>
{
    //const TopImage = req.params.TopImage;
    const imagePath = path.join( __dirname, '..', 'uploads', 'TopImage' );

    // Check if the file exists
    fs.access( imagePath, fs.constants.F_OK, ( err ) =>
    {
        if ( err )
        {
            // File does not exist
            return res.status( 404 ).send( 'Image not found' );
        }

        // Read the file and send it as a response
        const readStream = fs.createReadStream( imagePath );
        readStream.pipe( res );
    } );
};

exports.getBottomImage = ( req, res ) =>
{
    const imagePath = path.join( __dirname, '..', 'uploads', 'BottomImage' );

    // Check if the file exists
    fs.access( imagePath, fs.constants.F_OK, ( err ) =>
    {
        if ( err )
        {
            // File does not exist
            return res.status( 404 ).send( 'Image not found' );
        }

        // Read the file and send it as a response
        const readStream = fs.createReadStream( imagePath );
        readStream.pipe( res );
    } );
};