// dataFunctions.js

// Define a function that retrieves data
function timeCalculate ( expTime, settingsLoadTime )
{



    // Todo: Time now in milliseconds
    var timeNow = new Date().getTime();

    // Todo: Time slot start
    var expTimeMillis = timeNow + ( expTime * 1000 );

    var checkExpTimeMillis = timeNow;

    if ( settingsLoadTime > timeNow )
    {
        checkExpTimeMillis = settingsLoadTime;
    }


    var settingsLoadTimeDate = new Date( checkExpTimeMillis );
    var settingsLoadTimeDateHours = settingsLoadTimeDate.getHours();
    var settingsLoadTimeDateMinutes = settingsLoadTimeDate.getMinutes();

    if ( ( settingsLoadTimeDateHours >= 10 && settingsLoadTimeDateHours < 14 ) || ( settingsLoadTimeDateHours >= 16 && settingsLoadTimeDateHours < 22 ) )
    {
        expTimeMillis = checkExpTimeMillis + ( expTime * 1000 );
        return expTimeMillis;
    } else if ( settingsLoadTimeDateHours == 14 || settingsLoadTimeDateHours == 22 )
    {
        if ( settingsLoadTimeDateMinutes >= 0 && settingsLoadTimeDate < 30 )
        {
            expTimeMillis = checkExpTimeMillis + ( expTime * 1000 );
            return expTimeMillis;
        }
    }

    if ( ( settingsLoadTimeDateHours >= 0 && settingsLoadTimeDateHours < 10 ) )
    {
        var dd = settingsLoadTimeDate.getDate();
        var mm = settingsLoadTimeDate.getMonth();
        var yyyy = settingsLoadTimeDate.getFullYear();
        var newTimeForCalculate = new Date( yyyy, mm, dd, 10, 0, 0 ).getTime();

        expTimeMillis = newTimeForCalculate + ( expTime * 1000 );
    } else if ( ( settingsLoadTimeDateHours >= 14 && settingsLoadTimeDateHours < 16 ) )
    {

        var dd = settingsLoadTimeDate.getDate();
        var mm = settingsLoadTimeDate.getMonth();
        var yyyy = settingsLoadTimeDate.getFullYear();
        var newTimeForCalculate = new Date( yyyy, mm, dd, 14, 0, 0 ).getTime();

        expTimeMillis = newTimeForCalculate + ( expTime * 1000 );
    } else
    {
        settingsLoadTimeDate.setDate( settingsLoadTimeDate.getDate() + 1 );


        var dd = settingsLoadTimeDate.getDate();
        var mm = settingsLoadTimeDate.getMonth();
        var yyyy = settingsLoadTimeDate.getFullYear();
        var newTimeForCalculate = new Date( yyyy, mm, dd, 10, 0, 0 ).getTime();

        expTimeMillis = newTimeForCalculate + ( expTime * 1000 );

    }




    // Todo: Time slot end




    return expTimeMillis;
}

module.exports = timeCalculate;