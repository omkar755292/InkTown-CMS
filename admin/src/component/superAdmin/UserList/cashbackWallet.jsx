import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment';
import { api } from "./../../../GlobalKey/GlobalKey";
import PageHeader from "../../../layout/layoutsection/pageHeader/pageHeader";
import DatePicker from 'react-datepicker';
import { addDays, setHours, setMinutes } from 'date-fns';

const CashbackWallet = () =>
{

    const [ startDate, setStartDate ] = useState( new Date() );
    const [ cashbackWallet, setCashbackWallet ] = useState( [] );
    let navigate = useNavigate();
    const [ myTokens, setMyToken ] = useState( "" );

    useEffect( () =>
    {
        let getToken = localStorage.getItem( "token" );
        if ( !getToken )
        {
            navigate( "/" );
        }
        setMyToken( getToken );

        axios
            .get( api + `/user/wallet/CashbackWallwt`, {
                headers: {
                    Authorization: 'Bearer ' + getToken,
                }
            } )
            .then( async response =>
            {
                if ( response.data.status == "1" )
                {
                    var myList = response.data.data;
                    await new Promise( ( resolve ) => setTimeout( resolve, 150 ) );
                    setCashbackWallet( myList );
                } else
                {
                    alert( response.data.message );
                }
            } )
            .catch( error =>
            {
                if ( error.response.status == 403 || error.response.status == 401 )
                {
                    localStorage.setItem( "token", null );
                    localStorage.removeItem( 'token' );
                    localStorage.clear();
                    navigate( '/' )
                } else
                {
                    alert( error )
                }

            } );

    }, [] );


    // Range data picker
    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startsDate, endDate ] = dateRange;

    // Specific time range
    const [ startTime, setStartTime ] = useState(
        setHours( setMinutes( new Date(), 30 ), 17 )
    );

    // Sample data for the table
    // const tableData = [
    //     { date: new Date(), cashback: "Cashback Data 1", totalAmount: "Total Amount Data 1", status: "Status Data 1" },

    // ];

    return (
        <Fragment>
            <PageHeader currentpage="Cashback Wallet" activepage="Home" mainpage="Cashback Wallet" />
            {/* <div className="col-span-12 lg:col-span-3"> */ }
            <div className="box">
                <div className="box-header">
                    <h5 className="box-title">Cashback Data</h5>
                </div>
                <div className="box-body date-picker">
                    <table className="border-collapse border border-gray-200 w-full">
                        <thead>
                            <tr>
                                <th className="border border-gray-200">Date</th>
                                <th className="border border-gray-200">Cashback</th>
                                <th className="border border-gray-200">Total Amount</th>
                                <th className="border border-gray-200">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            { cashbackWallet.map( ( rowData, index ) => (
                                <tr key={ index }>
                                    <td className="border border-gray-200 w-1/4">
                                        <div className="flex rounded-sm">
                                            <div className="px-4 inline-flex items-center min-w-fit ltr:rounded-l-sm rtl:rounded-r-sm border ltr:border-r-0 rtl:border-l-0 border-gray-200 bg-gray-50 dark:bg-black/20 dark:border-white/10">
                                                <span className="text-sm text-gray-500 dark:text-white/70">
                                                    <i className="ri ri-time-line"></i>
                                                </span>
                                            </div>
                                            <input
                                                className="ti-form-input ltr:rounded-l-none rtl:rounded-r-none focus:z-10 bg-transparent"
                                                type="text"
                                                value={ rowData.date.toLocaleString() } // Display date as text
                                                readOnly // Make input non-editable
                                            />
                                        </div>
                                    </td>
                                    <td className="border border-gray-200">{ rowData.cashback }</td>
                                    <td className="border border-gray-200">{ rowData.totalAmount }</td>
                                    <td className="border border-gray-200">{ rowData.status }</td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            </div>
            {/* </div> */ }
        </Fragment>
    );
};
export default CashbackWallet;
