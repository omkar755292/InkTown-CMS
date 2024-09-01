const jwt = require( 'jsonwebtoken' );
const bcrypt = require( 'bcryptjs' );
const User = require( '../models/User' );
// const UserAdmin = require( '../models/UserAdmin' );
// const UserSuperAdmin = require( '../models/UserSuperAdmin' );
// const logData = require( '../controllers/LogFileController' );
// const { SendNotification } = require( './../global/FCM.js' ); 



async function viewAllUsers ( req, res )
{
    try
    {
        const authUser = req.user;
        const type = authUser.type;
        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();

        const users = await User.find();
        res.status( 200 ).json( { status: 1, data: users } );
    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).json( { error: 'Error fetching users' } );
    }
}


async function UserEdit ( req, res )
{
    try
    {
        const _id = req.params._id;
        const { email, name, phoneNumber, status, address, whatsappNumber } = req.body;



        const authUser = req.user;
        const type = authUser.type;

        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();

        const user = await User.findOne( { _id } );

        if ( !user )
        {
            return res.status( 200 ).send( { status: 2, message: "Not available" } );
        }



        const finalData = await User.updateOne(
            { _id, phoneNumber }
            ,
            {
                $set: {
                    email, name, phoneNumber, status, address, whatsappNumber
                }
            }
            ,
            { upsert: true }
        );


        const allUsers = await User.find();
        return res.status( 200 ).send( { status: 1, message: "User update successful.", data: allUsers } );
    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).json( { error: 'Error fetching users' } );
    }
}



module.exports = { viewAllUsers, UserEdit };
