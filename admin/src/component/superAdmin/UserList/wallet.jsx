import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment';
import { api } from "./../../../GlobalKey/GlobalKey";
import PageHeader from '../../../layout/layoutsection/pageHeader/pageHeader'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import bgJPG from './../../../assets/img/letter-head.jpg';

const WalletPage = () =>
{
    const [ wallets, setWallets ] = useState( [] );
    let navigate = useNavigate();
    const [ myTokens, setMyToken ] = useState( "" );
    const { phoneNumber } = useParams()

    useEffect( () =>
    {
        let getToken = localStorage.getItem( "token" );
        if ( !getToken )
        {
            navigate( "/" );
        }
        setMyToken( getToken );

        axios
            .get( api + `/super-admin/wallet/fetch/` + phoneNumber, {
                headers: {
                    Authorization: 'Bearer ' + getToken,
                }
            } )
            .then( async response =>
            {
                console.log( response )
                if ( response.data.status == "1" )
                {
                    var myList = response.data.data;
                    await new Promise( ( resolve ) => setTimeout( resolve, 150 ) );
                    setWallets( myList );
                } else
                {
                    alert( response.data.message );
                }
            } )
            .catch( error =>
            {
                console.log( error )
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

    // const downloadPDF = () =>
    // {
    //     const doc = new jsPDF();
    //     doc.autoTable( { html: '#money-datatable' } );
    //     doc.save( 'wallet_table.pdf' );
    // }




    const generatePDF = () =>
    {



        axios
            .post( api + `/super-admin/user-profile`,
                { phoneNumber: phoneNumber },
                {
                    headers: {
                        Authorization: 'Bearer ' + myTokens,
                    }
                }
            )
            .then( response =>
            {
                console.log( response.data )
                if ( response.data.status == "1" )
                {
                    const userData = response.data.data;
                    // setName( response.data.data.name );
                    // setEmail( response.data.data.email );
                    // setPhoneNumber( response.data.data.phoneNumber );
                    // setWhatsappNumber( response.data.data.whatsappNumber );
                    // setAddress( response.data.data.address );
                    // setPincode( response.data.data.pincode );
                    // setState( response.data.data.state );
                    // setStatus( response.data.data.status );













                    // const tableData = [
                    //     [ "ID", "Name", "Age" ],
                    //     [ 1, "John Doe", 30 ],
                    //     [ 2, "Jane Smith", 25 ],
                    //     [ 3, "Bob Johnson", 40 ]
                    // ];


                    var myVerifiedItems = [];
                    myVerifiedItems.push( [ "Order Id", "Txn Id", "Type", "Amount" ] );

                    wallets.forEach( ( item, rowIndex ) =>
                    {

                        var myItem1 = [];

                        myItem1.push( item.orderId );
                        myItem1.push( item.txnId );
                        myItem1.push( item.type );
                        myItem1.push( item.amount );

                        myVerifiedItems.push( myItem1 );

                    } );
                    console.log( myVerifiedItems );
                    // console.log( tableData );

                    // Create a new jsPDF instance
                    // const doc = new jsPDF();
                    var doc = new jsPDF( "p", "mm", "a5" );
                    var width = doc.internal.pageSize.getWidth();
                    var height = doc.internal.pageSize.getHeight();


                    // Add letterhead image on each page
                    doc.setPage( 1 );
                    doc.addImage( bgJPG, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight() );


                    doc.setTextColor( 0, 0, 0 );
                    doc.setFontSize( 10 );
                    doc.text( 10, 43, "To:" );
                    doc.text( 10, 48, userData.name );
                    doc.text( 10, 53, userData.phoneNumber.toString() );
                    doc.text( 10, 58, userData.address.toString() );


                    // Add header to the table
                    const header = [ "Order Id", "Txn Id", "Type", "Amount" ];

                    // Set fixed position for the table below the letterhead
                    const startY = 60; // Adjust this value as needed

                    // Add table using AutoTable plugin
                    doc.autoTable( {
                        head: [ header ],
                        body: myVerifiedItems.slice( 1 ), // Exclude header row
                        startY: startY,
                        theme: 'grid', // Optional theme
                        tableWidth: 'auto' // Auto adjust table width
                    } );




                    // Printed on
                    let date = new Date();


                    let year = date.getFullYear();
                    let month = "0" + ( date.getMonth() + 1 );
                    let day = "0" + date.getDate();
                    let hours = date.getHours();
                    let minutes = "0" + date.getMinutes();
                    let seconds = "0" + date.getSeconds();

                    // Format the date and time
                    let formattedDateTime = `${ year }-${ month.substr( -2 ) }-${ day.substr( -2 ) } ${ hours }:${ minutes.substr( -2 ) }:${ seconds.substr( -2 ) }`;
                    doc.setFontSize( 8 ); // Set the font size to 12 (adjust as needed)

                    // Set page numbering
                    const pageCount = doc.internal.getNumberOfPages();
                    for ( let i = 1; i <= pageCount; i++ )
                    {
                        doc.setPage( i );



                        const printedOnText = `Statement on: ${ formattedDateTime }             Page ${ i } of ${ pageCount } `;
                        const textWidth = doc.getStringUnitWidth( printedOnText ) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                        const textX = ( width - textWidth ) / 2;
                        const textY = height - 3;



                        doc.text( textX, textY, printedOnText );

                        // doc.addImage( bgJPG, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight() );

                    }

                    // Save the PDF
                    doc.save( `statement_${ phoneNumber }_${ year }-${ month.substr( -2 ) }-${ day.substr( -2 ) } ${ hours }-${ minutes.substr( -2 ) }-${ seconds.substr( -2 ) }.pdf` );


















                } else
                {
                    alert( response.data.message );
                }
            } )
            .catch( error =>
            {
                console.error( error );
                if ( error.response.status == 403 || error.response.status == 401 )
                {
                    // Log out process and go to home page
                    localStorage.setItem( "token", null );
                    localStorage.removeItem( 'token' );
                    localStorage.clear();
                    navigate( '/' )
                } else
                {
                    alert( error )
                }

            } );

    }



    const downloadPDF = () =>
    {
        // const doc = new jsPDF();

        var doc = new jsPDF( "p", "mm", "a5" );
        var width = doc.internal.pageSize.getWidth();
        var height = doc.internal.pageSize.getHeight();


        doc.autoTable( { html: '#money-datatable' } );





        // Printed on
        let date = new Date();


        let year = date.getFullYear();
        let month = "0" + ( date.getMonth() + 1 );
        let day = "0" + date.getDate();
        let hours = date.getHours();
        let minutes = "0" + date.getMinutes();
        let seconds = "0" + date.getSeconds();

        // Format the date and time
        let formattedDateTime = `${ year }-${ month.substr( -2 ) }-${ day.substr( -2 ) } ${ hours }:${ minutes.substr( -2 ) }:${ seconds.substr( -2 ) }`;
        doc.setFontSize( 8 ); // Set the font size to 12 (adjust as needed)

        // Set page numbering
        const pageCount = doc.internal.getNumberOfPages();
        for ( let i = 1; i <= pageCount; i++ )
        {
            doc.setPage( i );



            const printedOnText = `Printed on: ${ formattedDateTime }             Page ${ i } of ${ pageCount } `;
            const textWidth = doc.getStringUnitWidth( printedOnText ) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            const textX = ( width - textWidth ) / 2;
            const textY = height - 3;



            doc.text( textX, textY, printedOnText );

            // doc.addImage( bgJPG, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight() );

        }




        doc.save( `print_out_${ phoneNumber }_${ year }-${ month.substr( -2 ) }-${ day.substr( -2 ) } ${ hours }-${ minutes.substr( -2 ) }-${ seconds.substr( -2 ) }.pdf` );
    }




    return (
        <div>
            <PageHeader
                currentpage='Wallet'
                activepage='Home'
                mainpage='Wallet'
            />
            <div className='app-container'>
                <button type="button"
                    className="ti-btn bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500 dark:focus:ring-offset-white/10" onClick={ downloadPDF } >
                    Print Screen
                </button>

                <br />
                <div style={ { height: '20px' } }>
                    {/* Your content here */ }
                </div>
                <button type="button"
                    className="ti-btn bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 dark:focus:ring-offset-white/10" onClick={ generatePDF } >
                    Download Passbook
                </button>

                <br />
                <div style={ { height: '20px' } }>

                </div>


                <table id='money-datatable' className='ti-custom-table ti-striped-table ti-custom-table-hover'>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Cashback</th>
                            <th>Redeem</th>
                            <th>Full Payment</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        { wallets.map( money => (
                            <Fragment key={ money._id }>
                                <tr>
                                    <td>{ money.orderId ? money.orderId : money.txnID }</td>
                                    <td>{ money.date }</td>
                                    <td>{ money.amount }</td>
                                    <td>{ money.cashback }</td>
                                    <td>{ money.redeem }</td>
                                    <td>{ money.fullPayment }</td>
                                    <td>{ money.type }</td>
                                </tr>
                            </Fragment>
                        ) ) }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WalletPage;
