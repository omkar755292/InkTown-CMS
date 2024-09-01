import React, { Fragment, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { setHours, setMinutes } from 'date-fns'; // Removed unnecessary import
import axios from 'axios'
import moment from 'moment';

import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../../layout/layoutsection/pageHeader/pageHeader';
import { api } from '../../GlobalKey/GlobalKey';

const AdminLogFile = () =>
{
    const [ startTime, setStartTime ] = useState(
        setHours( setMinutes( new Date(), 30 ), 17 )
    );

    const [ AdminLogFileList, setAdminLogFileList ] = useState( [] );
    const [ myToken, setMyToken ] = useState( "" );
    const navigate = useNavigate();

    useEffect( () =>
    {
        const getToken = localStorage.getItem( "token" );

        if ( !getToken )
        {
            navigate( "/" );
        }
        setMyToken( getToken );

        axios
            .get( api + `/data/log/alldata`, {
                headers: {
                    Authorization: 'Bearer ' + getToken,
                }
            } )
            .then( async response =>
            {
                console.log( response.data )
                if ( response.data.status == "1" )
                {
                    var myList = response.data.data;
                    myList = myList.sort( ( b, a ) => a[ "timeStamp" ] - b[ "timeStamp" ] );
                    await new Promise( resolve => setTimeout( resolve, 150 ) );
                    setAdminLogFileList( myList );
                } else
                {
                    alert( response.data.message );
                }
            } )
            .catch( error =>
            {
                console.log( error );
                if ( error.response.status === 403 )
                {
                    localStorage.setItem( "token", null );
                    localStorage.removeItem( 'token' );
                    localStorage.clear();
                    navigate( '/' );
                } else
                {
                    alert( error );
                }
            } );

    }, [] );

    return (
        <Fragment>
            <PageHeader currentpage="Log File" activepage="Home" mainpage="Log File" />
            <div className="box">
                <div className="box-header">
                    <h5 className="box-title">Log File Data</h5>
                </div>
                <div className="box-body date-picker">
                    <table className="border-collapse border border-gray-200 w-full">
                        <thead>
                            <tr>
                                <th className="border border-gray-200" style={ { width: '33%' } }>Time Stamp</th>
                                <th className="border border-gray-200">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            { AdminLogFileList.map( ( log, index ) => (
                                <tr key={ index }>
                                    <td className="border border-gray-200">{ moment( parseInt( log.timeStamp.toString() ) ).format( 'MMMM Do YYYY, h:mm:ss a' ) }</td>
                                    <td className="border border-gray-200">{ log.notes }</td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            </div>
        </Fragment>
    );
};

export default AdminLogFile;
