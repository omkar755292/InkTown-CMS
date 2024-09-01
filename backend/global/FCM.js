
const axios = require( 'axios' );


async function SendNotification ( topic, title, body )
{
    axios
        .post
        (
            'https://fcm.googleapis.com/fcm/send',
            {
                "to": "/topics/" + topic.toString() + "",
                "notification": {
                    "title": title,
                    "body": body,
                    "sound": "default"
                },
                // "data": data
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'key=' + "AAAAaZ2ozq8:APA91bEjc6MEGVd9BrjW0UKzFrXQapnuxyyEBYB0FB3SmkO0tzSuwOR3L1Hhd0ZxU9uVJtKY4gURaKkZayrpMFwt0l9GyeGnJluyiGLb_t9f41tSl35iwQoON1lZPoN3quCWLnUeLeR-"
                }
            }
        )
        .then
        (
            response =>
            {
                console.log( 'Response data:', response.data );
            }
        )
        .catch
        (
            error =>
            {
                console.error( 'Error making request:', error );
            }
        );

}


module.exports = { SendNotification };
