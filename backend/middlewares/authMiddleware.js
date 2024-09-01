// middlewares/authMiddleware.js
const jwt = require( 'jsonwebtoken' );

function authMiddleware ( req, res, next )
{
    const authHeader = req.headers[ 'authorization' ];
    const token = authHeader && authHeader.split( ' ' )[ 1 ];
    if ( !token ) return res.sendStatus( 401 );
    jwt.verify( token, process.env.JWT_SECRET, ( err, user ) =>
    {
        if ( err ) return res.sendStatus( 403 );

        const regTime = user.time;
        const time = Date.now();
        if ( regTime < ( time - ( 1 * 24 * 60 * 60 * 1000 ) ) ) return res.sendStatus( 401 );
        req.user = user;
        next();
    } );
}

// function authMiddleware1 ( req, res, next )
// {
//     const authHeader = req.headers[ 'authorization' ];
//     const token = authHeader && authHeader.split( ' ' )[ 1 ];
//     if ( !token ) return res.sendStatus( 401 );
//     jwt.verify( token, process.env.JWT_SECRET, ( err, user ) =>
//     {
//         if ( err ) return res.sendStatus( 403 );
//         req.user = user;
//         next();
//     } );
// }

module.exports = authMiddleware;
