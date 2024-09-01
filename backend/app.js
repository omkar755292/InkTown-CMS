// app.js
const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userOrderRoutes = require('./routes/userOrderRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

const routerSuperAdminImage = require('./routes/imageRoutesSuperAdmin');
const routerUserImage = require('./routes/imageRoutesUser');

const walletRoutes = require('./routes/wallteRoutes');
const authController = require('./controllers/authController');
const { allFlexQualityServices, SuperAdminFetchSettings, SuperAdminEditSettings, SuperAdminAddTime, SuperAdminResetTime } = require('./controllers/Settings');
const { userRegister, userMPinReset, userNumberCheck, userLogin, adminLogin, SuperAdminLogin, SuperAdminRegister, myProfile, userProfile, updateMyProfile } = require('./controllers/authController');
const { viewAllUsers, UserEdit } = require('./controllers/SuperAdmin-AllUserList');
const SuperAdminViewOrders = require('./routes/SuperAdminViewOrders');
const SuperAdmin_Admin = require('./routes/SuperAdmin_Admin');
const dashboardRoutes = require('./routes/dashboardRoutes');
//const creditRoutes = require('./controllers/invoiceController');
const logfileData = require('./routes/LogfileRoutes');
const { addCredit } = require('./controllers/creditController');
const SuperAdminWalletRoutes = require('./routes/SuperAdminWalletRoutes');
const ChatRoutes = require('./routes/chatRoutes');
const imageRoutes = require('./routes/uploadRoutes');
const axios = require('axios');


//const walletRoutes = require( './routes/wallteRoutes' );
const Order = require('./models/Order');
const Settings = require('./models/Settings');
const ProductQuality = require('./models/ProductQuality');
const path = require("path");
const authMiddleware = require('./middlewares/authMiddleware');
const router = express.Router();
const cors = require('cors');
const short = require('short-uuid');
const fs = require("fs");
const { configTimezone } = require('./timezone');
const { SendNotification } = require('./global/FCM'); // Adjust the path as needed

const moment = require('moment');

dotenv.config();
const app = express();

configTimezone('Asia/Kolkata');


// Middleware
app.use(express.json());
app.use(cors(
  {
    origin: '*',
  }
));

// Middleware to log API requests
app.use((req, res, next) => {
  console.log(`Requested API: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.get('/api/time', (req, res) => {
  // const now = moment();
  // const serverTime = new Date();
  // console.log( serverTime );
  // console.log( now );
  // console.log( now.format( 'dddd, MMMM Do YYYY, h:mm:ss a' ) ); // Output: Friday, June 7th 2024, 3:25:50 pm
  // console.log( moment( serverTime ).format( 'dddd, MMMM Do YYYY, h:mm:ss a' ) ); // Output: Friday, June 7th 2024, 3:25:50 pm
  // const serverTimeE = moment( serverTime ).format( 'dddd, MMMM Do YYYY, h:mm:ss a' );
  const serverTime = new Date().getTime();
  res.json({ serverTime });
});




// Todo: Not JWT for create auth api
app.post('/user/auth/register', userRegister);
app.post('/user/auth/login', userLogin);
app.post('/user/auth/reset', userMPinReset);
app.post('/user/number-check', userNumberCheck);
app.get('/user/my-profile', authMiddleware, myProfile);
app.post('/user/update-my-profile', authMiddleware, updateMyProfile);

app.post('/super-admin/auth/login', SuperAdminLogin);
app.post('/super-admin/auth/register', SuperAdminRegister);
app.post('/admin/auth/login', adminLogin);
app.post('/super-admin/user-profile', authMiddleware, userProfile);


app.get('/all-flex-quality-services', allFlexQualityServices);


app.use('/user/image', routerUserImage);
app.use('/super-admin/image', routerSuperAdminImage);



app.use('/user/order', userOrderRoutes);
app.use('/super-admin/order', SuperAdminViewOrders);
app.use('/super-admin/admin', SuperAdmin_Admin);
app.use('/user/dashboard', dashboardRoutes);
app.use('/user/wallet', walletRoutes);
app.use('/data/log', logfileData);
app.use('/chat', ChatRoutes);
app.use('/images', imageRoutes);
app.use('/notice', noticeRoutes); // Notice Route


app.use('/super-admin/wallet', SuperAdminWalletRoutes);



router.post('/super-admin/add_credit', authMiddleware, addCredit);

app.get('/super-admin/users-list', authMiddleware, viewAllUsers);
app.post('/super-admin/users-edit/:_id', authMiddleware, UserEdit);
app.post('/super-admin/users-edit/:_id', authMiddleware, UserEdit);
app.get('/super-admin/fetch-settings', authMiddleware, SuperAdminFetchSettings);
app.post('/super-admin/edit-settings', authMiddleware, SuperAdminEditSettings);
app.post('/super-admin/add-time', authMiddleware, SuperAdminAddTime);
app.delete('/super-admin/reset-time', authMiddleware, SuperAdminResetTime);



//JWT auth
router.use(authMiddleware);

//storage engine
const storage = multer.diskStorage({
  destination: '',
  filename: (req, file, cb) => {
    // get year and month
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const path1 = "./uploads";
    const path2 = path1 + "/files";
    const path3 = path2 + "/" + year.toString();
    const path4 = path3 + "/" + month.toString();

    // create folder if not exist
    if (!fs.existsSync(path1)) {
      fs.mkdirSync(path1);
    }
    if (!fs.existsSync(path2)) {
      fs.mkdirSync(path2);
    }
    if (!fs.existsSync(path3)) {
      fs.mkdirSync(path3);
    }
    if (!fs.existsSync(path4)) {
      fs.mkdirSync(path4);
    }

    const fileName = short.generate();

    return cb(null, `${path4}/${fileName}${path.extname(file.originalname)}`)
  }
});


// File Upload
const upload = multer({
  storage: storage
});



// app.post( "/upload", upload.single( 'fileData' ), authMiddleware, async ( req, res ) =>
app.post("/upload", upload.single('fileData'), async (req, res) => {

  var myRes = {
    status: 1,
    data: req.file
  }

  res.status(200).json(myRes);
  return;

});


app.post('/fcm-subscribe', authMiddleware, async (req, res) => {


  const { fcmToken } = req.body;

  const authUser = req.user;
  const phoneNumber = authUser.phoneNumber;
  const type = authUser.type;
  if (type == "super-admin") {


    axios.post('https://iid.googleapis.com/iid/v1/' + fcmToken + '/rel/topics/' + "super-admin",
      {},
      {
        headers: {
          'Authorization': 'key=' + "AAAAaZ2ozq8:APA91bEjc6MEGVd9BrjW0UKzFrXQapnuxyyEBYB0FB3SmkO0tzSuwOR3L1Hhd0ZxU9uVJtKY4gURaKkZayrpMFwt0l9GyeGnJluyiGLb_t9f41tSl35iwQoON1lZPoN3quCWLnUeLeR-"
        }
      }
    ).then(response => {
      console.log('Response data:', response.data);
    })
      .catch(error => {
        console.error('Error making request:', error);
      });


  } else if (type == "admin") {

    axios.post('https://iid.googleapis.com/iid/v1/' + fcmToken + '/rel/topics/' + "admin",
      {},
      {
        headers: {
          'Authorization': 'key=' + "AAAAaZ2ozq8:APA91bEjc6MEGVd9BrjW0UKzFrXQapnuxyyEBYB0FB3SmkO0tzSuwOR3L1Hhd0ZxU9uVJtKY4gURaKkZayrpMFwt0l9GyeGnJluyiGLb_t9f41tSl35iwQoON1lZPoN3quCWLnUeLeR-"
        }
      }
    ).then(response => {
      console.log('Response data:', response.data);
    })
      .catch(error => {
        console.error('Error making request:', error);
      });
  } else if (type == "user") {

    axios.post('https://iid.googleapis.com/iid/v1/' + fcmToken + '/rel/topics/' + phoneNumber.toString(),
      {},
      {
        headers: {
          'Authorization': 'key=' + "AAAAaZ2ozq8:APA91bEjc6MEGVd9BrjW0UKzFrXQapnuxyyEBYB0FB3SmkO0tzSuwOR3L1Hhd0ZxU9uVJtKY4gURaKkZayrpMFwt0l9GyeGnJluyiGLb_t9f41tSl35iwQoON1lZPoN3quCWLnUeLeR-"
        }
      }
    ).then(response => {
      console.log('Response data:', response.data);
    })
      .catch(error => {
        console.error('Error making request:', error);
      });
  }

});


app.post('/fcm-message', authMiddleware, async (req, res) => {


  const { topic, title, body } = req.body;

  const authUser = req.user;
  const phoneNumber = authUser.phoneNumber;
  const type = authUser.type;

  SendNotification(topic, title, body);






});


//Download file

// app.get( '/download_file/orderId', authMiddleware, async ( req, res ) =>
// {
//   try
//   {
//     const { orderId } = req.params;

//     // Find the order by orderId
//     const order = await Order.findOne( { orderId } );

//     if ( !order )
//     {
//       return res.status( 404 ).send( 'Order not found' );
//     }

//     // Assuming the file path is stored in the order object, retrieve it
//     const filePath = order.filePath;

//     if ( !filePath )
//     {
//       return res.status( 404 ).send( 'File not found for this order' );
//     }

//     // Check if the file exists
//     if ( fs.existsSync( filePath ) )
//     {
//       // Set appropriate headers for file download
//       res.setHeader( 'Content-Disposition', `attachment; filename=${ path.basename( filePath ) }` );
//       res.setHeader( 'Content-Type', 'application/octet-stream' );

//       // Create a read stream from the file path and pipe it to the response
//       const fileStream = fs.createReadStream( filePath );
//       fileStream.pipe( res );
//     } else
//     {
//       return res.status( 404 ).send( 'File not found' );
//     }
//   } catch ( error )
//   {
//     console.error( error );
//     res.status( 500 ).send( 'Error downloading file' );
//   }
// } );




// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('MongoDB connection error:', error));




function deleteZipFiles() {

  const directory = './'; // Replace this with the path to your directory containing zip files

  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      if (file.endsWith('.zip')) {
        fs.unlink(path.join(directory, file), err => {
          if (err) {
            console.error('Error deleting file:', err);
            return;
          }
          console.log(`Deleted file: ${file}`);
        });
      }
    });
  });
}

// Schedule the task to run every 60 minutes
setInterval(deleteZipFiles, 1 * 60 * 60 * 1000);
