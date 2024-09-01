const ProductQuality = require( '../models/ProductQuality' );
const Settings = require( '../models/Settings' );


async function allFlexQualityServices ( req, res )
{
    try
    {
        const pQ = await ProductQuality.find();
        var myRes = {}

        if ( pQ )
        {
            myRes = {
                status: 1,
                message: "User already exists",
                data: pQ
            }
            res.status( 200 ).json( myRes );
            return;
        } else
        {
            return res.status( 200 ).json( { status: 2, message: "Not found" } );
        }
        myRes = {
            status: 2,
            message: "Something went wrong"
        }
        res.status( 200 ).json( myRes );
        return;
    } catch ( error )
    {
        console.error( error );
        return res.status( 500 ).send( 'Error registering user' );
    }
}


async function SuperAdminFetchSettings ( req, res )
{
    try
    {


        const authUser = req.user;
        const type = authUser.type;

        if ( type != "super-admin" ) return res.status( 401 ).send();

        const appId = "InkTown";

        const settingsDetails = await Settings.findOne( { appId } );


        var myRes = {};

        if ( settingsDetails )
        {
            myRes = {
                status: 1,
                message: "Data found",
                data: settingsDetails
            }

            return res.status( 200 ).json( myRes );
        } else
        {
            return res.status( 200 ).json( { status: 2, message: "Not found" } );
        }

    } catch ( error )
    {
        console.error( error );
        return res.status( 500 ).send( 'Error registering user' );
    }
}


async function SuperAdminEditSettings ( req, res )
{
    try
    {


        const authUser = req.user;
        const type = authUser.type;

        if ( type != "super-admin" ) return res.status( 401 ).send();

        const appId = "InkTown";

        const settingsDetails = await Settings.findOne( { appId } );

        if ( settingsDetails )
        {
            // update data 
            const updateSettingsDetails = await Settings.updateOne( { appId }, req.body );

            const newSettingsDetails = await Settings.findOne( { appId } );

            return res.status( 200 ).json( { status: 1, message: "Data updated", data: newSettingsDetails } );

        } else
        {
            return res.status( 200 ).json( { status: 2, message: "Not found" } );
        }

    } catch ( error )
    {
        console.error( error );
        return res.status( 500 ).send( 'Error registering user' );
    }
}


async function SuperAdminAddTime ( req, res )
{
    try
    {

        const { addTime } = req.body;

        const authUser = req.user;
        const type = authUser.type;

        if ( type != "super-admin" ) return res.status( 401 ).send();

        const appId = "InkTown";

        const settingsDetails = await Settings.findOne( { appId } );

        if ( settingsDetails )
        {


            const loadTime = parseInt( settingsDetails.loadTime ) + ( parseInt( addTime ) * 60 * 1000 );

            // update data 
            const updateSettingsDetails = await Settings.updateOne( { appId }, { loadTime } );

            const newSettingsDetails = await Settings.findOne( { appId } );

            return res.status( 200 ).json( { status: 1, message: "Data updated", data: newSettingsDetails } );

        } else
        {
            return res.status( 200 ).json( { status: 2, message: "Not found" } );
        }

    } catch ( error )
    {
        console.error( error );
        return res.status( 500 ).send( 'Error registering user' );
    }
}

async function SuperAdminResetTime ( req, res )
{
    try
    {


        const authUser = req.user;
        const type = authUser.type;

        if ( type != "super-admin" ) return res.status( 401 ).send();

        const appId = "InkTown";

        const settingsDetails = await Settings.findOne( { appId } );

        if ( settingsDetails )
        {
            // update data 
            var loadTime = new Date().getTime();

            const updateSettingsDetails = await Settings.updateOne( { appId }, { loadTime } );

            const newSettingsDetails = await Settings.findOne( { appId } );

            return res.status( 200 ).json( { status: 1, message: "Data updated", data: newSettingsDetails } );

        } else
        {
            return res.status( 200 ).json( { status: 2, message: "Not found" } );
        }

    } catch ( error )
    {
        console.error( error );
        return res.status( 500 ).send( 'Error registering user' );
    }
}



module.exports = { allFlexQualityServices, SuperAdminFetchSettings, SuperAdminEditSettings, SuperAdminAddTime, SuperAdminResetTime };