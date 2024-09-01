// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import "firebase/database"
import firebase from "firebase/compat/app";
import { api } from './../../GlobalKey/GlobalKey';
import axios from 'axios'



// Add the Firebase products that you want to use
import "firebase/compat/auth";
// import "firebase/compat/firestore";
// import "firebase/compat/database";
// import "firebase/compat/messaging";
// import "firebase/compat/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  apiKey: "AIzaSyBODkMpjVEjbXqzGjqzmXPQ_ytl_jgiHwU",
  authDomain: "analog-bay-420905.firebaseapp.com",
  projectId: "analog-bay-420905",
  storageBucket: "analog-bay-420905.appspot.com",
  messagingSenderId: "488107729908",
  appId: "1:488107729908:web:159b2fbe14411e01338fa1"

};

// Initialize Firebase
const app = initializeApp( firebaseConfig );
export const authentication = getAuth( app )
const analytics = getAnalytics( app );

const firebaseApp = firebase.initializeApp( firebaseConfig );

// const db = firebaseApp.firestore();
// const rdb = firebaseApp.database();
// const fbStorage = firebaseApp.storage();
const auth = firebase.auth();

//Push messaging

const messaging = getMessaging();

export const RequestForToken = () =>
{

  return getToken( messaging, { vapidKey: `BNS-g30TxrRCk3Ys4Con3wPkvGbDIlWoO7umSuYZ0sUiBLdd98A5XPoh_pUAId4J3PI3RS5e1-b03c-1lN5TKKg` } )
    .then( ( currentToken ) =>
    {
      if ( currentToken )
      {
        console.log( 'current token for client: ', currentToken );


        let fcmToken = localStorage.getItem( "fcm-token" );



        if ( !fcmToken )
        {

          localStorage.setItem( "fcm-token", currentToken );
        } else
        {
          if ( fcmToken != currentToken )
          {

            localStorage.setItem( "token", null );
            localStorage.removeItem( 'token' );
            localStorage.clear();
          }

        }


        let getToken = localStorage.getItem( 'token' )

        axios
          .post( api + `/fcm-subscribe`,
            {
              fcmToken: currentToken
            },
            {
              headers: {
                Authorization: 'Bearer ' + getToken
              }
            } )
          .then( response =>
          {
            console.log( response );
          } )
          .catch( error =>
          {
            console.log( error );
          } );


      } else
      {
        // Show permission request UI
        console.log( 'No registration token available. Request permission to generate one.' );
      }
    } )
    .catch( ( err ) =>
    {
      console.log( 'An error occurred while retrieving token. ', err );
    } );
};


export const onMessageListener = () =>
  new Promise( ( resolve ) =>
  {
    onMessage( messaging, ( payload ) =>
    {
      resolve( payload );
    } );
  } );




// const messaging = getMessaging( app );

// const messaging = firebase.messaging();
// const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null


// // notification permission
// export const requestNotificationPermission = async () =>
// {
//   const permission = await Notification.requestPermission();
//   if ( permission === 'granted' )
//   {
//     console.log( 'Notification permission granted.' );
//     return permission;
//   }
//   else
//   {
//     console.log( 'Unable to get permission to notify.' );
//     return permission;
//   }
// }


// export const onMessageListener = () =>
//   new Promise( ( resolve ) =>
//   {
//     onMessage( messaging, ( payload ) =>
//     {
//       resolve( payload );

//     } );
//   } );


// const requestForToken = async () =>
// {
//   return getToken( messaging, {
//     vapidKey: "BC08UwADeE7xX4eJHoYluNztZSHAhagHttLDgNfaiLd63KFu565gLCC6jGkbMPzlr2ZIyL20k_d9p2q2Nnhm5QE"
//   } )
//     .then( ( currentToken ) =>
//     {
//       if ( currentToken )
//       {
//         console.log( 'current token for client: ', currentToken );
//         localStorage.setItem( "fcmToken", currentToken );

//         console.log( currentToken );
//         fetch( 'https://iid.googleapis.com/iid/v1/' + currentToken + '/rel/topics/developer', {
//           method: 'POST',
//           headers: new Headers( {
//             'Authorization': 'key=' + "AAAAA5H1WlI:APA91bG1emRo2uWS97SclzVfQ02iKo8S93B-efC1w2PT8Z8o3VfzuJO6hpyvAjbY1y6P1zGaKrQiwd7tZ3S68P5cRND3igZmwD213RjAdhuqcjrCgU6ntWg6CAeQyqv198EyOSiJOzP6",

//           } )
//         } ).then( response =>
//         {
//           if ( response.status < 200 || response.status >= 400 )
//           {
//             throw 'Error subscribing to topic: ' + response.status + ' - ' + response.text();
//           }
//         } ).catch( error =>
//         {
//           console.error( error );
//         } );
//         // Perform any other neccessary action with the token
//       } else
//       {
//         // Show permission request UI
//         console.log( 'No registration token available. Request permission to generate one.' );
//       }
//     } )
//     .catch( ( err ) =>
//     {
//       console.log( 'An error occurred while retrieving token. ', err );
//     } );
// };




export { firebaseApp, app, firebase, auth, analytics };
