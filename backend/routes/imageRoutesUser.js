const express = require( 'express' );
const multer = require( 'multer' );

const router = express.Router();
// const routerAdmin = express.Router();
const dashboardController = require( '../controllers/dashboardController' );
const authMiddleware = require( '../middlewares/authMiddleware' );
const path = require( "path" );
const fs = require( "fs" );
const short = require( 'short-uuid' );

// const logData = require( '../controllers/LogFileController' );
// const { SendNotification } = require( './../global/FCM.js' );

const storageUser = multer.diskStorage( {
    destination: '',
    filename: ( req, file, cb ) =>
    {

        const authUser = req.user;
        const type = authUser.type;
        const phoneNumber = authUser.phoneNumber;

        if ( type != "user" ) return res.status( 401 ).send();


        // get year and month
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const path1 = "./uploads";
        const path2 = path1 + "/profile";

        // create folder if not exist
        if ( !fs.existsSync( path1 ) )
        {
            fs.mkdirSync( path1 );
        }
        if ( !fs.existsSync( path2 ) )
        {
            fs.mkdirSync( path2 );
        }


        // return cb( null, `${ path2 }/${ fileName }${ path.extname( file.originalname ) }` )
        return cb( null, `${ path2 }/${ phoneNumber }_${ req.params.fileName }` );


    }
} );


// File Upload
const uploadUser = multer( {
    storage: storageUser
} );



// Fetch File data Dynamic
router.post( '/upload/:fileName', authMiddleware, uploadUser.single( 'fileData' ), async ( req, res ) => 
{
    return res.status( 200 ).send( { status: 1, message: 'Upload successful', data: req.file } );
} );

router.get( '/view/:name', async ( req, res ) =>
{
    const { name } = req.params;
    try
    {
        const filePath = path.join( __dirname, '../uploads/profile', name );

        res.sendFile( filePath, ( err ) =>
        {
            if ( err )
            {
                res.status( 404 ).send( 'Image not found' );
            }
        } );
    } catch ( error )
    {
        res.status( 500 ).send( { status: 0, message: "Failed to retrieve image", error: error.message } );
    }
} );





// module.exports = { routerUser };
module.exports = router;