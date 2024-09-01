// dashboardController.js

const Order = require( '../models/Order' );
const Wallet = require( '../models/Wallet' );


exports.fetchDashboard = async ( req, res ) =>
{
    try
    {
        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;

        if ( type !== 'user' ) return res.status( 401 ).send();


        const today = new Date();
        today.setHours( 0, 0, 0, 0 ); // Set time to 00:00:00
        const todayStart = today.getTime(); // Epoch time for the start of today
        const todayEnd = todayStart + ( 24 * 60 * 60 * 1000 ); // Epoch time for the end of today

        const orders = await Order.find( { phoneNumber, orderDate: { $gte: todayStart, $lte: todayEnd } } );

        // Calculate Total Cashback
        let totalCashback = 0;
        for ( let i = 0; i < orders.length; i++ )
        {
            totalCashback += orders[ i ].cashback;
        }

        // Calculate This Month's Cashback
        const now = new Date();
        const thisMonthStart = new Date( now.getFullYear(), now.getMonth(), 1 );
        const thisMonthEnd = new Date( now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999 );
        let thisMonthCashback = 0;
        for ( let i = 0; i < orders.length; i++ )
        {
            const orderDate = new Date( orders[ i ].orderDate );
            if ( orderDate >= thisMonthStart && orderDate <= thisMonthEnd )
            {
                thisMonthCashback += orders[ i ].cashback;
            }
        }

        // Fetch wallet transactions for the user
        // const walletTransactions = await wallet.find
        const walletTransactions = await Wallet.find( { phoneNumber } );

        if ( !walletTransactions )
        {
            return res.status( 404 ).send( 'Wallet transactions not found' );
        }

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

        // const walletData = await wallet.find
        // const walletResponse = await walletController.fetchWalletAmount(req, res);
        // if (walletResponse.status !== 1) {
        //     return res.status(200).send({ status: 1, messege: 'Somthing error'});
        // }
        // const wallet = walletResponse.data.walletAmount;
        // Assuming you have a wallet feature implemented and stored somewhere in your database,
        // you can fetch the wallet amount here and assign it to the wallet variable.

        // Filter Today's Orders
        // const today = new Date();
        // today.setHours(0, 0, 0, 0); // Set time to 00:00:00
        // const todayStart = today.getTime(); // Epoch time for the start of today
        // const todayEnd = todayStart + (24 * 60 * 60 * 1000); // Epoch time for the end of today
        //const todayOrders = orders.filter(order => order.expTime >= todayStart && order.expTime < todayEnd);

        // Get the count of Today's Orders
        const todayOrdersCount = orders.length;

        // Construct Dashboard data
        const dashboardData = {
            totalCashback,
            thisMonthCashback,
            walletBalance,
            todayOrdersCount
        };

        return res.status( 200 ).send( { status: 1, data: dashboardData } );
    } catch ( error )
    {
        console.error( error );
        res.status( 500 ).send( 'Error fetching dashboard data' );
    }
};


//return res.status(200).send({ status: 1, walletAmount: walletBalance });