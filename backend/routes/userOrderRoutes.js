// routes/orderRoutes.js
const express = require( 'express' );
const Order = require( '../models/Order' );
const Settings = require( '../models/Settings' );
const multer = require( 'multer' );
const fs = require( 'fs' );
const path = require( 'path' );
const authMiddleware = require( '../middlewares/authMiddleware' );
const short = require( 'short-uuid' );
const archiver = require( 'archiver' );
const timeCalculate = require( './../time-calculate' ); // Import the fetchData function from dataFunctions.js
const Wallet = require( '../models/Wallet' );
const logData = require( '../controllers/LogFileController' );
const { SendNotification } = require( './../global/FCM.js' );
const userOrderRoutes = express.Router();
const Chat = require( '../models/Chat.js' );

// Multer storage configuration

userOrderRoutes.use( authMiddleware );

// All attributes are here
userOrderRoutes.post( '/create', async ( req, res ) =>   //Todo: Complete this
{
    try
    {
        const { items } = req.body;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != 'user' ) return res.status( 401 ).send();

        logData( phoneNumber, 'New Order Create' ); //Log file
        // SendNotification( topic, title, body );
        SendNotification( "super-admin", "New Order", phoneNumber.toString() + " has been created" );
        SendNotification( "admin", "New Order", phoneNumber.toString() + " has been created" );









        const orderDate = new Date().getTime();
        const txnId = short.generate();
        var amount = 0;

        for ( var i = 0; i < items.length; i++ )
        {
            amount += items[ i ].totalPrice;
        }

        const appId = "InkTown";

        const settingsDetails = await Settings.findOne( { appId } );

        const settingsLoadTime = parseInt( settingsDetails.loadTime );
        const settingsSpeedLimit = settingsDetails.speedLimit;
        const settingsCashBack = settingsDetails.cashBack;
        var settingsLastOrderYear = settingsDetails.lastOrderYear;
        var settingsLastOrderNo = settingsDetails.lastOrderNo;

        const d = new Date();
        let year = d.getFullYear();

        if ( settingsLastOrderYear != year )
        {
            settingsLastOrderYear = year;
            settingsLastOrderNo = 1;
        } else
        {
            settingsLastOrderNo += Math.floor( Math.random() * 15 + 1 );
        }

        const orderId = "ink-town_" + settingsLastOrderYear.toString() + "_" + settingsLastOrderNo.toString();

        amount = Math.round( amount );

        // set cashback 1% of amount and as round amount
        const cashback = Math.round( amount * parseInt( settingsCashBack ) / 100 );

        // add itemId to every item in the list of items
        // Todo: Time slot start
        var expTime = 0;
        // Todo: Time slot end
        for ( var i = 0; i < items.length; i++ )
        {
            items[ i ].itemId = short.generate();

            // Todo: Time slot start
            var expItemTime = parseInt( items[ i ].width ) * parseInt( items[ i ].height ) * parseInt( items[ i ].quantity );
            expTime += ( 5 * 60 ) + Math.round( 3600 * expItemTime / parseInt( settingsSpeedLimit ) );
            // Todo: Time slot end


            // Todo: file rename Start
            const fileName = items[ i ].file;
            console.log( items[ i ] );
            const fileNameList = fileName.split( "/" );

            const fileFolderName = fileNameList[ 0 ] + "/" + fileNameList[ 1 ] + "/" + fileNameList[ 2 ] + "/" + fileNameList[ 3 ] + "/" + fileNameList[ 4 ] + "/";
            const fileExList = fileNameList[ 5 ].toString().split( "." );
            const fileEx = fileExList[ 1 ].toString();
            const needSpaceForBindingneedSpaceForBinding = items[ i ].needSpaceForBinding ? "yes" : "no"
            const newFileName = fileFolderName + "width-" + items[ i ].width + "_height-" + items[ i ].height + "_quality-" + items[ i ].quality + "_quantity-" + items[ i ].quantity + "_ringQuantity-" + items[ i ].ringQuantity + "_needSpaceForBinding-" + needSpaceForBindingneedSpaceForBinding + "_uniqueId-" + items[ i ].itemId + "." + fileEx;

            console.log( fileName );
            console.log( newFileName );

            fs.rename( fileName, newFileName, ( err ) =>
            {
                if ( err )
                {
                    console.log( err );
                }
            } );

            items[ i ].file = newFileName;


            // Todo: file rename end
        }

        var expTimeMillis = timeCalculate( expTime, settingsLoadTime );

        const updateSettingsDetails = await Settings.updateOne( { appId }, { loadTime: expTimeMillis, lastOrderYear: settingsLastOrderYear, lastOrderNo: settingsLastOrderNo } );

        const newOrder = new Order( { expTime: expTimeMillis, phoneNumber, orderDate, orderId, amount, cashback, items } );
        await newOrder.save();

        // Create invoice
        const WalletData = {
            //txnId: short.generate(),
            orderId,
            txnId,
            phoneNumber,
            date: orderDate,
            amount,
            cashback,
            redeem: false, // Assuming no redemption at the time of order creation
            fullPayment: false,
            type: 'invoice'// invoice/cashBack/creadit
        };

        // Format amount and cashback to two decimal places

        const NewWallet = new Wallet( WalletData );
        await NewWallet.save();

        const UserChatId = short.generate();
        const AdminChatId = short.generate();
        const userChat = new Chat( {
            chatId: UserChatId,
            type: 'userType',
            lastMsgTime: 0,
            orderId,
            msgBox: []
        } );
        await userChat.save();

        const adminChat = new Chat( {
            chatId: AdminChatId,
            type: 'adminType',
            lastMsgTime: 0,
            orderId,
            msgBox: []
        } );
        await adminChat.save();

        const walletTransactions = await Wallet.find( { phoneNumber } );

        if ( walletTransactions )
        {
            // Calculate Wallet
            let walletBalance = 0;
            for ( let i = 0; i < walletTransactions.length; i++ )
            {
                const transaction = walletTransactions[ i ];
                if ( transaction.type === 'invoice' )
                {
                    walletBalance -= transaction.amount;
                } else if ( transaction.type === 'cashBack' || transaction.type === 'credit' )
                {
                    walletBalance += transaction.amount;
                }
            }

            walletBalance = walletBalance + amount;

            if ( walletBalance > 0 )
            {

                const orders = await Order.find( {
                    phoneNumber,
                    'status': { $nin: [ "delete", "Delete", "cancel", "Cancel" ] },
                    'fullPaid': { $eq: false }
                } );

                // use loop for order:
                var unReleaseAmount = parseFloat( walletBalance );
                const paidDate = new Date().getTime();

                for ( var i = 0; i < orders.length; i++ )
                {

                    const oneOrder = orders[ i ];
                    const ordersamount = oneOrder.amount;
                    const ordersorderId = oneOrder.orderId;
                    const orderspaid = oneOrder.paid;
                    const ordersfullPaid = oneOrder.fullPaid;

                    const unpaidAmount = parseFloat( ordersamount ) - parseFloat( orderspaid );

                    if ( unpaidAmount == unReleaseAmount )
                    {

                        const finalData =
                            await Order.updateOne(
                                { orderId: ordersorderId },
                                {
                                    $set: {
                                        paid: ordersamount,
                                        fullPaid: true,
                                        paidDate: paidDate
                                    }
                                }
                            );

                        unReleaseAmount = 0
                        break;
                    }

                    if ( unpaidAmount > unReleaseAmount )
                    {
                        var newPaidAmount = parseFloat( unReleaseAmount ) + parseFloat( orderspaid );

                        const finalData =
                            await Order.updateOne(
                                { orderId: ordersorderId },
                                {
                                    $set: {
                                        paid: newPaidAmount,
                                        paidDate: paidDate
                                    }
                                }
                            );

                        unReleaseAmount = 0
                        break;
                    }

                    if ( unpaidAmount < unReleaseAmount )
                    {

                        const finalData =
                            await Order.updateOne(
                                { orderId: ordersorderId },
                                {
                                    $set: {
                                        paid: ordersamount,
                                        fullPaid: true,
                                        paidDate: paidDate
                                    }
                                }
                            );

                        unReleaseAmount = parseFloat( unReleaseAmount ) - parseFloat( unpaidAmount );

                    }

                }

            }

        }























        return res.status( 200 ).send( { status: 1, message: "Successful" } );
    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error creating order' );
    }
} );

userOrderRoutes.get( '/fetch', async ( req, res ) =>
{
    try
    {
        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != 'user' ) return res.status( 401 ).send();

        const orders = await Order.find( { phoneNumber } );


        // Todo: Time now in milliseconds
        var timeNow = new Date().getTime();

        var newList = [];
        // Todo: Time slot start
        // use loop
        for ( var i = 0; i < orders.length; i++ )
        {
            if ( orders[ i ].expTime > timeNow )
            {

                const _id = orders[ i ]._id;
                const orderDate = orders[ i ].orderDate;
                const paidDate = orders[ i ].paidDate;
                const expTime = orders[ i ].expTime;
                const orderId = orders[ i ].orderId;
                const amount = orders[ i ].amount;
                const cashback = orders[ i ].cashback;
                const cashbackStatus = orders[ i ].cashbackStatus;
                const status = orders[ i ].status;
                const notes = orders[ i ].notes;
                const phoneNumber = orders[ i ].phoneNumber;
                const paid = orders[ i ].paid;
                const fullPaid = orders[ i ].fullPaid;
                const approvedBy = orders[ i ].approvedBy;
                const items = orders[ i ].items;

                // order = orders[ i ];
                var countdownTime = Math.round( ( parseInt( expTime ) - timeNow ) / 1000 );


                const order = {
                    orderDate,
                    paidDate,
                    expTime,
                    orderId,
                    amount,
                    cashback,
                    cashbackStatus,
                    status,
                    notes,
                    phoneNumber,
                    paid,
                    fullPaid,
                    approvedBy,
                    countdownTime,
                    items,
                    _id
                };
                newList.push( order );

            } else
            {
                newList.push( orders[ i ] );
            }
        }
        // Todo: Time slot end



        return res.status( 200 ).send( { status: 1, data: newList } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
} );



userOrderRoutes.get( '/fetch/today', async ( req, res ) =>
{
    try
    {
        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type !== 'user' ) return res.status( 401 ).send();

        // Calculate Epoch time range for today
        const today = new Date();
        today.setHours( 0, 0, 0, 0 ); // Set time to 00:00:00
        const todayStart = today.getTime(); // Epoch time for the start of today
        const todayEnd = todayStart + ( 24 * 60 * 60 * 1000 ); // Epoch time for the end of today

        const orders = await Order.find( {
            phoneNumber,
            orderDate: { $gte: todayStart, $lte: todayEnd }
        } );






        // Todo: Time now in milliseconds
        var timeNow = new Date().getTime();

        var newList = [];
        // Todo: Time slot start
        // use loop
        for ( var i = 0; i < orders.length; i++ )
        {
            if ( orders[ i ].expTime > timeNow )
            {

                const _id = orders[ i ]._id;
                const orderDate = orders[ i ].orderDate;
                const paidDate = orders[ i ].paidDate;
                const expTime = orders[ i ].expTime;
                const orderId = orders[ i ].orderId;
                const amount = orders[ i ].amount;
                const cashback = orders[ i ].cashback;
                const cashbackStatus = orders[ i ].cashbackStatus;
                const status = orders[ i ].status;
                const notes = orders[ i ].notes;
                const phoneNumber = orders[ i ].phoneNumber;
                const paid = orders[ i ].paid;
                const fullPaid = orders[ i ].fullPaid;
                const approvedBy = orders[ i ].approvedBy;
                const items = orders[ i ].items;

                // order = orders[ i ];
                var countdownTime = Math.round( ( parseInt( expTime ) - timeNow ) / 1000 );


                const order = {
                    orderDate,
                    paidDate,
                    expTime,
                    orderId,
                    amount,
                    cashback,
                    cashbackStatus,
                    status,
                    notes,
                    phoneNumber,
                    paid,
                    fullPaid,
                    approvedBy,
                    countdownTime,
                    items,
                    _id
                };
                newList.push( order );

            } else
            {
                newList.push( orders[ i ] );
            }
        }
        // Todo: Time slot end

        return res.status( 200 ).send( { status: 1, data: newList } );
    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching today\'s orders' );
    }
} );



userOrderRoutes.post( '/fetch-one', async ( req, res ) =>
{
    try
    {
        const { orderId } = req.body;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != 'user' ) return res.status( 401 ).send();


        const orders = await Order.findOne( { orderId, phoneNumber } );

        return res.status( 200 ).send( { status: 1, data: orders } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
} );

userOrderRoutes.delete( '/cancel/:id', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.id;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != 'user' ) return res.status( 401 ).send();

        logData( phoneNumber, 'Order Canceled by User...' ); //Log file
        // SendNotification( topic, title, body );
        SendNotification( "super-admin", "New Order", phoneNumber.toString() + " canceled order. Id: " + orderId );
        SendNotification( "admin", "New Order", phoneNumber.toString() + " canceled order. Id: " + orderId )

            ;
        const orders = await Order.findOne( { orderId, phoneNumber } );


        if ( orders.status == "active" && orders.paid <= 0 ) 
        {
            const status = "cancel";    // Todo: active, cancel, cancel-by-team, approved, under-processing

            const finalData = await Order.updateOne(
                { orderId, phoneNumber }
                ,
                {
                    $set: {
                        status
                    }
                }
                ,
                { upsert: true }
            );

            return res.status( 200 ).send( { status: 1, message: "Order cancelled" } );
        }

        return res.status( 200 ).send( { status: 2, message: "Not available. Please contact with customer support." } );


    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error updating order' );
    }
} );

function getFileNameFromPath ( filePath )
{
    // Split the path by the directory separator
    const parts = filePath.split( '/' );
    // Get the last part (which should be the filename)
    const fileName = parts.pop();
    return fileName;
}

userOrderRoutes.get( '/download-one/:orderId/:itemId', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.orderId;
        const itemId = req.params.itemId;
        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;
        if ( type != 'user' ) return res.status( 401 ).send();

        // Todo: get the data of one  orderId 
        const orderItem = await Order.findOne( { orderId } );

        const myItems = orderItem.items;
        // Todo: get the data of one item, where itemId is equal to itemId from myItems
        const myItem = myItems.find( ( item ) => item.itemId == itemId );



        const filePath = myItem.file;
        if ( !filePath )
        {
            return res.status( 404 ).send( 'File not found for this order' );
        }


        // Check if the file exists
        if ( fs.existsSync( filePath ) )
        {

            const fileName = getFileNameFromPath( filePath );
            // return res.download( filePath, fileName, ( err ) =>
            // {
            //     if ( err )
            //     {
            //         console.error( 'Error downloading file:', err );
            //         res.status( 500 ).send( 'Internal Server Error' );
            //     }
            // } );

            // // Set appropriate headers for file download
            res.setHeader( 'Content-Disposition', `attachment; filename=${ path.basename( filePath ) }` );
            res.setHeader( 'Content-Type', 'application/octet-stream' );

            // // Create a read stream from the file path and pipe it to the response
            const fileStream = fs.createReadStream( filePath );
            return fileStream.pipe( res );
        } else
        {
            return res.status( 404 ).send( 'File not found' );
        }


    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error updating order' );
    }
} );


userOrderRoutes.get( '/download-one-file-name/:orderId/:itemId', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.orderId;
        const itemId = req.params.itemId;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;
        if ( type != 'user' ) return res.status( 401 ).send();



        // Todo: get the data of one  orderId 
        const orderItem = await Order.findOne( { orderId } );

        const myItems = orderItem.items;
        // Todo: get the data of one item, where itemId is equal to itemId from myItems
        const myItem = myItems.find( ( item ) => item.itemId == itemId );


        const filePath = myItem.file;
        if ( !filePath )
        {
            return res.status( 404 ).send( 'File not found for this order' );
        }


        // Check if the file exists
        if ( fs.existsSync( filePath ) )
        {
            const fileName = getFileNameFromPath( filePath );
            return res.status( 200 ).send( { status: 1, name: fileName } );

        } else
        {
            return res.status( 404 ).send( 'File not found' );
        }


    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error updating order' );
    }
} );

userOrderRoutes.get( '/download/:orderId/', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.orderId;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != 'user' ) return res.status( 401 ).send();


        // Todo: get the data of one  orderId 
        const orderItem = await Order.findOne( { orderId } );

        const myItems = orderItem.items;
        // Todo: get the all file as list from myItems  using loop
        const files = [];
        for ( let i = 0; i < myItems.length; i++ )
        {
            const myItem = myItems[ i ];
            const filePath = myItem.file;
            if ( fs.existsSync( filePath ) )
            {
                files.push( filePath );
            }
        }

        // Create a writable stream to store the ZIP
        const output = fs.createWriteStream( orderId + '.zip' );

        // Create an archiver object
        const archive = archiver( 'zip', {
            zlib: { level: 9 } // Set compression level
        } );

        // Pipe the output stream to the archiver
        archive.pipe( output );

        // Add files to the ZIP
        files.forEach( filePath =>
        {
            archive.file( filePath, { name: filePath.split( '/' ).pop() } ); // Use only the filename
        } );

        // Finalize the ZIP
        archive.finalize();

        // Send the ZIP file as a response
        output.on( 'close', () =>
        {
            return res.download( orderId + '.zip', orderId + '.zip', ( err ) =>
            {
                if ( err )
                {
                    console.error( 'Error sending ZIP file:', err );
                    res.status( 500 ).send( 'Internal Server Error' );
                }
            } );
        } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error updating order' );
    }
} );

module.exports = userOrderRoutes;
