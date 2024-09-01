
const express = require( 'express' );
const router = express.Router();
const short = require( 'short-uuid' );
const Wallet = require( '../models/Wallet' );
const Order = require( '../models/Order' );

const logData = require( '../controllers/LogFileController' );
const { SendNotification } = require( './../global/FCM.js' );


const addCredit = async ( req, res ) =>
{
  try
  {
    const authUser = req.user;
    const type = authUser.type;
    const phoneNumberAdmin = authUser.phoneNumber;

    if ( type != "super-admin" ) return res.status( 401 ).send();
    const { phoneNumber, amount, date } = req.body;

    if ( !phoneNumber || !amount )
    {
      return res.status( 200 ).json( { status: 2, message: 'Invalid request' } );
    }



    logData( phoneNumber, 'Credit added by Administrator & Amount: ' + amount ); //Log file
    logData( phoneNumberAdmin, 'Credit added for ' + phoneNumber + ' & Amount: ' + amount ); //Log file
    // SendNotification( topic, title, body );
    SendNotification( "super-admin", 'Credit added for ' + phoneNumber, 'Credit added for ' + phoneNumber + ' & Amount: ' + amount );
    SendNotification( phoneNumber.toString(), "Credit added ", 'Credit added by Administrator & Amount: ' + amount );



    const txnId = short.generate();
    const credit = new Wallet( {
      phoneNumber,
      amount,
      date,
      type: 'credit',
      fullPayment: true,
      txnId
    } );

    await credit.save();




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

      walletBalance = walletBalance - amount;

      if ( walletBalance > 0 )
      {
        walletBalance = walletBalance + amount;
      } else
      {
        walletBalance = amount;
      }
    } else
    {
      walletBalance = amount;
    }

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

    res.status( 200 ).json( { status: 1 } );

  } catch ( error )
  {
    console.error( error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
};

const getAllData = async ( req, res ) =>
{
  try
  {
    // Fetch all data from the Wallet model
    const authUser = req.user;
    const type = authUser.type;
    const phoneNumber = authUser.phoneNumber;

    if ( type != "user" ) return res.status( 401 ).send();

    const allData = await Wallet.find( { phoneNumber } );
    // Return the fetched data as a response
    res.status( 200 ).json( { status: 1, data: allData } );
  } catch ( error )
  {
    console.error( error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
};


// const getAllDataWallet = async (req, res) => {
//     try {
//       // Fetch all data from the Wallet model
//       const authUser = req.user;
//       const type = authUser.type;
//       const phoneNumber = authUser.phoneNumber;

//       if ( type != "user" ) return res.status( 401 ).send();

//       const filteredData = await Wallet.find({ phoneNumber }, 
//     );

//       // Return the fetched data as a response
//       res.status(200).json({ status: 1, data: filteredData });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal server error' });
//     }

// };

const getCashbackWallet = async ( req, res ) =>
{
  try
  {
    // Fetch all data from the Wallet model
    const authUser = req.user;
    const type = authUser.type;
    const phoneNumber = authUser.phoneNumber;

    if ( type != "user" ) return res.status( 401 ).send();

    const filteredData = await Wallet.find( { phoneNumber, type: "cashback" },

    );

    // Return the fetched data as a response
    res.status( 200 ).json( { status: 1, data: filteredData } );
  } catch ( error )
  {
    console.error( error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
};

const getAdminAllData = async ( req, res ) =>
{
  try
  {
    // Fetch all data from the Wallet model
    const authUser = req.user;
    const type = authUser.type;
    const phoneNumberAdmin = authUser.phoneNumber;

    if ( type != "super-admin" ) return res.status( 401 ).send();

    const phoneNumber = req.params.phoneNumber;


    const allData = await Wallet.find( { phoneNumber } );
    // Return the fetched data as a response
    res.status( 200 ).json( { status: 1, data: allData } );
  } catch ( error )
  {
    console.error( error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
};


module.exports = { addCredit, getAllData, getCashbackWallet, getAdminAllData };


