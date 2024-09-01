// controllers/chatController.js
const Chat = require( '../models/Chat' );
const { SendNotification } = require( './../global/FCM.js' );
const Order = require( '../models/Order' );


const sendMessage = async ( req, res ) =>
{
    try
    {
        const { msgText, msgSenderName, type, chatId, orderId } = req.body;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const userType = authUser.type;

        if ( type == 'adminType' && userType == 'user' )
        {
            return res.status( 401 ).send();
        }

        if ( type == 'adminType' )
        {

            SendNotification( "super-admin", "New Message for " + orderId, msgSenderName + " send new message in Admin Private Message Box" );
            SendNotification( "admin", "New Message for " + orderId, msgSenderName + " send new message in Admin Private Message Box" );
        } else
        {
            const oldOrdersData = await Order.findOne( { orderId } );
            const phoneNumberUser = oldOrdersData.phoneNumber;
            SendNotification( "super-admin", "New Message for " + orderId, msgSenderName + " send new message in User Message Box" );
            SendNotification( "admin", "New Message for " + orderId, msgSenderName + " send new message in User Message Box" );
            SendNotification( phoneNumberUser, "New Message for " + orderId, msgSenderName + " send new message in User Message Box" );

        }



        const time = new Date().getTime();


        await Chat.updateOne( { type, chatId, orderId }, {
            $push:
            {
                "msgBox": {
                    msgText,
                    msgTime: time,
                    msgSenderName,
                    phoneNumber
                }
            },
            $set: {
                lastMsgTime: time,
            },
        } );

        const orders = await Chat.findOne( { type, chatId, orderId } );

        return res.status( 200 ).send( { status: 1, data: orders } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
};


const getMessage = async ( req, res ) =>
{
    try
    {
        const { type, orderId } = req.body;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const userType = authUser.type;

        if ( type == 'adminType' && userType == 'user' )
        {
            return res.status( 401 ).send();
        }


        const orders = await Chat.findOne( { type, orderId } );

        return res.status( 200 ).send( { status: 1, data: orders } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
};



module.exports = { sendMessage, getMessage };
