// routes/orderRoutes.js
const express = require( 'express' );
const Order = require( '../models/Order' );
const ProductQuality = require( '../models/ProductQuality' );
const multer = require( 'multer' );
const fs = require( 'fs' );
const path = require( 'path' );
const authMiddleware = require( '../middlewares/authMiddleware' );
const short = require( 'short-uuid' );
const archiver = require( 'archiver' );
const timeCalculate = require( './../time-calculate' ); // Import the fetchData function from dataFunctions.js
const Settings = require( '../models/Settings' );
const SuperAdminViewOrders = express.Router();
const Wallet = require( '../models/Wallet' );
const logData = require( '../controllers/LogFileController' );
const { SendNotification } = require( './../global/FCM.js' );
const Chat = require( '../models/Chat.js' );

// Multer storage configuration

SuperAdminViewOrders.use( authMiddleware );

// All attributes are here
SuperAdminViewOrders.post( '/create', async ( req, res ) =>   //Todo: Complete this
{
    try
    {
        const { items, phoneNumber } = req.body;

        const authUser = req.user;
        const type = authUser.type;
        const phoneNumberAdmin = authUser.phoneNumber;

        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();



        logData( phoneNumber, "New order created for " + phoneNumber.toString() + " by Administrator" ); //Log file
        logData( phoneNumberAdmin, "New order created for " + phoneNumber.toString() + " by Administrator" ); //Log file
        // SendNotification( topic, title, body );
        SendNotification( "super-admin", "New Order", "New order created for " + phoneNumber.toString() + " by Administrator" );
        SendNotification( "admin", "New Order", "New order created for " + phoneNumber.toString() + " by Administrator" );








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

SuperAdminViewOrders.get( '/fetch', async ( req, res ) =>
{
    try
    {
        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();

        const orders = await Order.find();


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


SuperAdminViewOrders.post( '/fetch-one-user', async ( req, res ) =>
{
    try
    {
        const { phoneNumber } = req.body;

        const authUser = req.user;
        const type = authUser.type;

        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();

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



SuperAdminViewOrders.post( '/fetch-one', async ( req, res ) =>
{
    try
    {
        const { orderId } = req.body;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;
        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();


        const orders = await Order.findOne( { orderId } );

        return res.status( 200 ).send( { status: 1, data: orders } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
} );



SuperAdminViewOrders.post( '/fetch-one-add-extra-amount', async ( req, res ) =>
{
    try
    {
        const { orderId, itemId, name, price } = req.body;
        const appId = "InkTown";
        const txnId = short.generate();

        const authUser = req.user;
        const phoneNumberAdmin = authUser.phoneNumber;
        const type = authUser.type;
        if ( type != "super-admin" ) return res.status( 401 ).send();




        const oldOrdersData = await Order.findOne( { orderId } );
        const phoneNumber = oldOrdersData.phoneNumber;

        logData( phoneNumber, 'Amount update for order: ' + orderId ); //Log file
        logData( phoneNumberAdmin, 'Amount update for order: ' + orderId + " by admin: " + phoneNumberAdmin ); //Log file
        // SendNotification( topic, title, body );
        SendNotification( "super-admin", "Update Amount", 'Amount update for order: ' + orderId );
        SendNotification( "admin", "Update Amount", 'Amount update for order: ' + orderId );
        SendNotification( phoneNumber, "Update Amount", 'Amount update for order: ' + orderId + " by admin: Administrator" );




        const ordersUpdate = await Order.updateOne( { orderId, "items.itemId": itemId },
            // { "items.itemId": itemId },
            {
                $push:
                {
                    "items.$[x].extraPrice": {
                        name, price, txnId
                    }
                }
            },
            {
                arrayFilters: [
                    { "x.itemId": itemId }
                ]
            }
        )
        const settingsDetails = await Settings.findOne( { appId } );


        const settingsCashBack = settingsDetails.cashBack;


        const ordersP = await Order.findOne( { orderId } );
        const date = new Date().getTime();

        const amountN = parseFloat( ordersP.amount ) + parseFloat( price );

        const WalletData = {
            orderId,
            txnId,
            phoneNumber,
            date,
            amount: parseFloat( price ),
            cashback: Math.round( amountN * parseInt( price ) / 100 ),
            redeem: false, // Assuming no redemption at the time of order creation
            fullPayment: false,
            type: 'invoice'// invoice/cashBack/creadit
        };

        const NewWallet = new Wallet( WalletData );
        await NewWallet.save();



        const cashback = Math.round( amountN * parseInt( settingsCashBack ) / 100 );



        const finalData =
            await Order.updateOne(
                { orderId },
                {
                    $set: {
                        amount: amountN,
                        cashback,
                        fullPaid: false,
                    }
                }
            );


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

            walletBalance = walletBalance + parseFloat( price );

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




        const orders = await Order.findOne( { orderId } );
        return res.status( 200 ).send( { status: 1, data: orders } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
} );



SuperAdminViewOrders.post( '/fetch-one-delete-extra-amount/:_id', async ( req, res ) =>
{
    try
    {
        const { orderId, itemId } = req.body;
        const _id = req.params._id;
        const appId = "InkTown";

        const authUser = req.user;
        const phoneNumberAdmin = authUser.phoneNumber;
        const type = authUser.type;
        if ( type != "super-admin" ) return res.status( 401 ).send();





        const oldOrdersData = await Order.findOne( { orderId } );
        const phoneNumber = oldOrdersData.phoneNumber;

        logData( phoneNumber, 'Amount update for order: ' + orderId ); //Log file
        logData( phoneNumberAdmin, 'Amount update for order: ' + orderId + " by admin: " + phoneNumberAdmin ); //Log file
        // SendNotification( topic, title, body );
        SendNotification( "super-admin", "Update Amount", 'Amount update for order: ' + orderId );
        SendNotification( "admin", "Update Amount", 'Amount update for order: ' + orderId );
        SendNotification( phoneNumber, "Update Amount", 'Amount update for order: ' + orderId + " by admin: Administrator" );



        const date = new Date().getTime();

        const ordersF = await Order.findOne( { orderId } );
        const paid = parseFloat( ordersF[ "paid" ] );

        const itemIdT = ordersF[ "items" ].filter( row => row.itemId == itemId ).pop();
        const extraPriceT = itemIdT[ "extraPrice" ].filter( row => row._id == _id ).pop();

        const txnId = extraPriceT[ "txnId" ];
        const price = 0 - parseFloat( extraPriceT[ "price" ] );

        const ordersUpdate = await Order.updateOne( { orderId, "items.itemId": itemId },
            {
                $pull:
                {
                    "items.$[x].extraPrice": {
                        _id
                    }
                }
            },
            {
                arrayFilters: [
                    { "x.itemId": itemId }
                ]
            }
        )


        const amountN = parseFloat( ordersF.amount ) + parseFloat( price );

        const WalletData = {
            orderId,
            txnId: txnId + "_R",
            phoneNumber,
            date,
            amount: parseFloat( price ),
            cashback: ( 0 - parseFloat( Math.round( amountN * parseInt( price ) / 100 ) ) ),
            redeem: false, // Assuming no redemption at the time of order creation
            fullPayment: false,
            type: 'invoice'// invoice/cashBack/creadit
        };

        const NewWallet = new Wallet( WalletData );
        await NewWallet.save();


        const settingsDetails = await Settings.findOne( { appId } );


        const settingsCashBack = settingsDetails.cashBack;


        const cashback = Math.round( amountN * parseInt( settingsCashBack ) / 100 );
        var extraMoney = 0;
        if ( paid >= amountN )
        {
            extraMoney = amountN - paid;
            const finalData =
                await Order.updateOne(
                    { orderId },
                    {
                        $set: {
                            amount: amountN,
                            cashback,
                            fullPaid: true,
                            paid: amountN,
                            paidDate: date
                        }
                    }
                );
        } else
        {

            const finalData =
                await Order.updateOne(
                    { orderId },
                    {
                        $set: {
                            amount: amountN,
                            cashback,
                            fullPaid: false,
                        }
                    }
                );
        }












        const walletTransactions = await Wallet.find( { phoneNumber } );
        let walletBalance = 0;

        if ( walletTransactions )
        {
            // Calculate Wallet
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

            walletBalance = walletBalance - extraMoney;

            if ( walletBalance > 0 )
            {
                walletBalance = walletBalance + extraMoney;
            } else
            {
                walletBalance = extraMoney;
            }
        } else
        {
            walletBalance = extraMoney;
        }

        const ordersT = await Order.find( {
            phoneNumber,
            'status': { $nin: [ "delete", "Delete", "cancel", "Cancel" ] },
            'fullPaid': { $eq: false }
        } );

        // use loop for order:
        var unReleaseAmount = parseFloat( walletBalance );
        const paidDate = new Date().getTime();

        for ( var i = 0; i < ordersT.length; i++ )
        {


            const oneOrder = ordersT[ i ];
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









        const orders = await Order.findOne( { orderId } );
        return res.status( 200 ).send( { status: 1, data: orders } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
} );



SuperAdminViewOrders.post( '/add-product-quality', async ( req, res ) =>   //Todo: Complete this
{
    try
    {
        const { price, name } = req.body;

        const authUser = req.user;
        const type = authUser.type;
        const phoneNumber = authUser.phoneNumber;

        if ( type != "super-admin" ) return res.status( 401 ).send();


        const id = short.generate();


        const newProductQuality = new ProductQuality( { price, name, id } );
        await newProductQuality.save();


        const products = await ProductQuality.find();

        return res.status( 200 ).send( { status: 1, message: "Successful", data: products } );
    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error creating order' );
    }
} );

SuperAdminViewOrders.get( '/fetch-product-quality', async ( req, res ) =>
{
    try
    {
        const authUser = req.user;
        const type = authUser.type;
        const phoneNumber = authUser.phoneNumber;

        if ( type != "super-admin" ) return res.status( 401 ).send();


        const orders = await ProductQuality.find();
        return res.status( 200 ).send( { status: 1, data: orders } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
    }
} );


SuperAdminViewOrders.delete( '/delete-product-quality/:id', async ( req, res ) =>
{
    try
    {
        const id = req.params.id;

        const authUser = req.user;
        const type = authUser.type;
        const phoneNumber = authUser.phoneNumber;

        if ( type != "super-admin" ) return res.status( 401 ).send();


        const ordersDelete = await ProductQuality.deleteOne( { id } );



        const orders = await ProductQuality.find();
        return res.status( 200 ).send( { status: 1, data: orders } );

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching orders' );
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



SuperAdminViewOrders.post( '/edit/:id', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.id;


        const { cashbackStatus, cashback, amount, status } = req.body;

        const authUser = req.user;
        const type = authUser.type;
        const phoneNumberAdmin = authUser.phoneNumber;

        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();


        const oldOrdersData = await Order.findOne( { orderId } );
        const phoneNumber = oldOrdersData.phoneNumber;

        logData( phoneNumber, 'New update for order: ' + orderId ); //Log file
        logData( phoneNumberAdmin, 'New update for order: ' + orderId + " by admin: " + phoneNumberAdmin ); //Log file
        // SendNotification( topic, title, body );
        SendNotification( "super-admin", "Update Order", 'New update for order: ' + orderId );
        SendNotification( "admin", "Update Order", 'New update for order: ' + orderId );
        SendNotification( phoneNumber, "Update Order", 'New update for order: ' + orderId + " by admin: Administrator" );



        const orders = await Order.findOne( { orderId } );

        if ( orders )
        {

            const finalData = await Order.updateOne(
                { orderId }
                ,
                {
                    $set: {
                        cashbackStatus, cashback, amount, status
                    }
                }
                ,
                { upsert: true }
            );

            const allOrders = await Order.find();


            return res.status( 200 ).send( { status: 1, data: allOrders } );
        } else
        {
            return res.status( 200 ).send( { status: 2, message: "Not available" } );
        }

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error updating order' );
    }
} );


SuperAdminViewOrders.post( '/edit/:orderId/item/:itemId', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.orderId;
        // const itemId = req.params.itemId;
        const itemId = req.params.itemId;

        const { width, height, quantity, quality, ringQuantity, totalPrice, needSpaceForBinding } = req.body;

        const authUser = req.user;
        const type = authUser.type;
        const phoneNumberAdmin = authUser.phoneNumber;

        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();




        const oldOrdersData = await Order.findOne( { orderId } );
        const phoneNumber = oldOrdersData.phoneNumber;

        logData( phoneNumber, 'New update for order: ' + orderId ); //Log file
        logData( phoneNumberAdmin, 'New update for order: ' + orderId + " by admin: " + phoneNumberAdmin ); //Log file
        // SendNotification( topic, title, body );
        SendNotification( "super-admin", "Update Order", 'New update for order: ' + orderId );
        SendNotification( "admin", "Update Order", 'New update for order: ' + orderId );
        SendNotification( phoneNumber, "Update Order", 'New update for order: ' + orderId + " by admin: Administrator" );



        // return;
        const orders = await Order.findOne( { orderId } );
        console.log( orders );
        console.log( orderId );

        if ( orders )
        {
            const finalData =
                await Order.updateOne(
                    { orderId },
                    {
                        $set: {
                            // 'items.$[x]': { width, height, quantity, quality, ringQuantity, totalPrice, needSpaceForBinding },
                            'items.$[x].width': width,
                            'items.$[x].height': height,
                            'items.$[x].quantity': quantity,
                            'items.$[x].quality': quality,
                            'items.$[x].ringQuantity': ringQuantity,
                            'items.$[x].needSpaceForBinding': needSpaceForBinding,
                        }
                    },
                    {
                        arrayFilters: [
                            { "x.itemId": itemId }
                        ]
                    }
                );

            const orders = await Order.findOne( { orderId } );

            return res.status( 200 ).send( { status: 1, data: orders } );

        } else
        {
            return res.status( 200 ).send( { status: 2, message: "Not available" } );
        }

    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error updating order' );
    }
} );


SuperAdminViewOrders.get( '/download/:orderId/', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.orderId;

        const authUser = req.user;
        const issueName = authUser.name;
        const phoneNumberAdmin = authUser.phoneNumber;
        const type = authUser.type;
        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();



        console.log( issueName );
        // Todo: get the data of one  orderId 
        const orderItem = await Order.findOne( { orderId } );

        if ( !orderItem ) return res.status( 200 ).send( { status: 2, message: "Not available" } );

        if ( orderItem.status == "active" || orderItem.status == "Active" )
        {
            const finalData = await Order.updateOne(
                { orderId }
                ,
                {
                    $set: {
                        status: "Approved",
                        approvedBy: issueName + " (Super Admin)",
                    }
                }
                ,
                { upsert: true }
            );



            const oldOrdersData = await Order.findOne( { orderId } );
            const phoneNumber = oldOrdersData.phoneNumber;

            logData( phoneNumber, 'Approved for order: ' + orderId ); //Log file
            logData( phoneNumberAdmin, 'Approved for order: ' + orderId + " by admin: " + phoneNumberAdmin ); //Log file
            // SendNotification( topic, title, body );
            SendNotification( "super-admin", "Approved Order", 'order: ' + orderId );
            SendNotification( "admin", "Approved Order", 'order: ' + orderId );
            SendNotification( phoneNumber, "Approved Order", 'order: ' + orderId + " by admin: Administrator" );



        }

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



SuperAdminViewOrders.get( '/download-one/:orderId/:itemId', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.orderId;
        const itemId = req.params.itemId;

        const authUser = req.user;
        const issueName = authUser.name;
        const phoneNumberAdmin = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();



        // Todo: get the data of one  orderId 
        const orderItem = await Order.findOne( { orderId } );

        if ( !orderItem ) return res.status( 200 ).send( { status: 2, message: "Not available" } );

        if ( orderItem.status == "active" || orderItem.status == "Active" )
        {
            const finalData = await Order.updateOne(
                { orderId }
                ,
                {
                    $set: {
                        status: "Approved",
                        approvedBy: issueName + " (Super Admin)",
                    }
                }
                ,
                { upsert: true }
            );

            const oldOrdersData = await Order.findOne( { orderId } );
            const phoneNumber = oldOrdersData.phoneNumber;

            logData( phoneNumber, 'Approved for order: ' + orderId ); //Log file
            logData( phoneNumberAdmin, 'Approved for order: ' + orderId + " by admin: " + phoneNumberAdmin ); //Log file
            // SendNotification( topic, title, body );
            SendNotification( "super-admin", "Approved Order", 'order: ' + orderId );
            SendNotification( "admin", "Approved Order", 'order: ' + orderId );
            SendNotification( phoneNumber, "Approved Order", 'order: ' + orderId + " by admin: Administrator" );

        }


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


SuperAdminViewOrders.get( '/download-one-file-name/:orderId/:itemId', async ( req, res ) =>
{
    try
    {
        const orderId = req.params.orderId;
        const itemId = req.params.itemId;

        const authUser = req.user;
        const issueName = authUser.name;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type != "super-admin" && type != "admin" ) return res.status( 401 ).send();


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







module.exports = SuperAdminViewOrders;
