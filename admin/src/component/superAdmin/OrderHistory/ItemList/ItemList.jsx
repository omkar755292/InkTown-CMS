import React, { Fragment, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { api } from "./../../../../GlobalKey/GlobalKey";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import bgJPG from './../../../../assets/img/letter-head.jpg';
import { PoppinsMedium } from "./../../../../assets/pdf-font/PoppinsMedium"
import { MontserratBold } from "./../../../../assets/pdf-font/MontserratBold"



const ItemList = () =>
{
  const { orderId } = useParams()

  const [ orders, setOrders ] = useState( [] )
  const [ amount, setTotalAmount ] = useState( '' )
  const [ paid, setPaidAmount ] = useState( '' )
  const [ myData, setMyData ] = useState( {} )

  const [ qualityOptions, setQualityOptions ] = useState( [] )

  let navigate = useNavigate()
  const [ myTokens, setMyToken ] = useState( '' )

  useEffect( () =>
  {
    let getToken = localStorage.getItem( 'token' )

    if ( !getToken )
    {
      navigate( '/' )
    }
    setMyToken( getToken )

    axios
      .post(
        api + `/super-admin/order/fetch-one`,
        {
          orderId
        },
        {
          headers: {
            Authorization: 'Bearer ' + getToken
            // 'Content-Type': 'multipart/form-data',
            // 'Content-Type': 'multipart/form-data',
          }
        }
      )
      .then( response =>
      {
        console.log( response.data )
        // setNotes(response.data.quotations)
        if ( response.data.status == '1' )
        {
          setOrders( response.data.data.items )
          setMyData( response.data.data )
        } else
        {
          alert( response.data.message )
        }
      } )
      .catch( error =>
      {
        if ( error.response.status == 403 || error.response.status == 401 )
        {
          // Log out process and go to home page
          localStorage.setItem( 'token', null )
          localStorage.removeItem( 'token' )
          localStorage.clear()
          navigate( '/' )
        } else
        {
          alert( error )
        }
      } );

    axios
      .get( api + `/all-flex-quality-services` )
      .then( response =>
      {
        console.log( response.data )
        // setNotes(response.data.quotations)
        if ( response.data.status == '1' )
        {
          setQualityOptions( response.data.data )
        } else
        {
          alert( response.data.message )
        }
      } )
      .catch( error =>
      {
        if ( error.response.status == 403 || error.response.status == 401 )
        {
          // Log out process and go to home page
          localStorage.setItem( 'token', null )
          localStorage.removeItem( 'token' )
          localStorage.clear()
          navigate( '/' )
        } else
        {
          alert( error )
        }
      } )
  }, [] )

  const [ editFormData, setEditFormData ] = useState( {
    width: '',
    height: '',
    quantity: '',
    quality: '',
    ringQuantity: '',
    totalPrice: '',
    needSpaceForBinding: ''
  } )

  const [ editOrderId, setEditOrderId ] = useState( null )

  const handleEditFormChange = event =>
  {
    const fieldName = event.target.name
    const fieldValue = event.target.value

    setEditFormData( {
      ...editFormData,
      [ fieldName ]: fieldValue
    } )
  }

  const handleEditFormSubmit = event =>
  {
    event.preventDefault()

    const editedOrder = {
      ...editFormData,
      itemId: editOrderId
    }

    const updatedOrders = orders.map( order =>
      order.itemId === editOrderId ? editedOrder : order
    )

    setOrders( updatedOrders )
    setEditOrderId( null )
  }

  const handleEditClick = ( event, order ) =>
  {
    event.preventDefault()
    setEditOrderId( order.itemId )

    setEditFormData( {
      width: order.width,
      height: order.height,
      quantity: order.quantity,
      quality: order.quality,
      ringQuantity: order.ringQuantity,
      totalPrice: order.totalPrice,
      needSpaceForBinding: order.needSpaceForBinding
    } )
  }

  const handleCancelClick = () =>
  {
    setEditOrderId( null )
  }

  const handleDownloadFile = itemId =>
  {
    axios
      .get(
        api +
        `/super-admin/order/download-one-file-name/` +
        orderId +
        `/` +
        itemId,
        {
          headers: {
            Authorization: 'Bearer ' + myTokens
          }
        }
      )
      .then( response =>
      {
        console.log( response.data )
        // setNotes(response.data.quotations)
        if ( response.data.status == '1' )
        {
          const fileName = response.data.name

          axios
            .get(
              api + `/super-admin/order/download-one/` + orderId + `/` + itemId,
              {
                responseType: 'blob', // Important
                headers: {
                  Authorization: 'Bearer ' + myTokens
                }
              }
            )
            .then( response =>
            {
              // Extract filename from content-disposition header if present
              const contentDisposition = response.headers[ 'content-disposition' ]
              // const fileName = contentDisposition ? contentDisposition.split( ';' )[ 1 ].split( 'filename=' )[ 1 ].trim() : 'file';
              console.log( contentDisposition )
              console.log( fileName )
              // Save file using FileSaver.js
              saveAs( new Blob( [ response.data ] ), fileName )
            } )
            .catch( error =>
            {
              if (
                error.response.status == 403 ||
                error.response.status == 401
              )
              {
                // Log out process and go to home page
                localStorage.setItem( 'token', null )
                localStorage.removeItem( 'token' )
                localStorage.clear()
                navigate( '/' )
              } else
              {
                alert( error )
              }
            } )
        }
      } )
      .catch( error =>
      {
        if ( error.response.status == 403 || error.response.status == 401 )
        {
          // Log out process and go to home page
          localStorage.setItem( 'token', null )
          localStorage.removeItem( 'token' )
          localStorage.clear()
          navigate( '/' )
        } else
        {
          alert( error )
        }
      } )
  }

  const handleSaveClick = ( event, editFormData, itemId ) =>
  {
    console.log( editFormData )
    // return;

    axios
      .post(
        api + `/super-admin/order/edit/` + orderId + `/item/` + itemId,
        editFormData,
        {
          headers: {
            Authorization: 'Bearer ' + myTokens
          }
        }
      )
      .then( response =>
      {
        // setNotes(response.data.quotations)
        if ( response.data.status == '1' )
        {
          setEditOrderId( null )
          setQualityOptions( response.data.data )
          // windows refresh
          window.location.reload()
        } else
        {
          alert( response.data.message )
        }
      } )
      .catch( error =>
      {
        if ( error.response.status == 403 || error.response.status == 401 )
        {
          // Log out process and go to home page
          localStorage.setItem( 'token', null )
          localStorage.removeItem( 'token' )
          localStorage.clear()
          navigate( '/' )
        } else
        {
          alert( error )
        }
      } )
  }

  //const dueAmount = amount - paid
  const handleDownloadItem = orderId =>
  {
    axios
      .get( api + `/super-admin/order/download/` + orderId, {
        responseType: 'blob',
        headers: {
          Authorization: 'Bearer ' + myTokens,
        }
      } )
      .then( response =>
      {
        const contentDisposition = response.headers[ 'content-disposition' ];
        const fileName = orderId + ".zip";
        saveAs( new Blob( [ response.data ] ), fileName );
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
  }



  const generatePDFStatement = ( myData ) =>
  {



    axios
      .post( api + `/super-admin/user-profile`,
        { phoneNumber: myData.phoneNumber },
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
          doc.save( `statement_${ myData.phoneNumber }_${ year }-${ month.substr( -2 ) }-${ day.substr( -2 ) } ${ hours }-${ minutes.substr( -2 ) }-${ seconds.substr( -2 ) }.pdf` );


















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

  const generatePDF = ( order ) =>
  {



    axios
      .post( api + `/super-admin/user-profile`,
        { phoneNumber: myData.phoneNumber },
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


























          const myAmount = parseInt( order.amount ).toFixed( 2 );
          const myDue = parseFloat( order.amount ) - parseFloat( order.paid );
          const myItems = order.items;

          var doc = new jsPDF( "p", "mm", "a5" );

          doc.addFileToVFS( 'PoppinsMedium.ttf', PoppinsMedium );
          doc.addFont( 'PoppinsMedium.ttf', 'PoppinsMedium', 'normal' );

          doc.addFileToVFS( 'MontserratBold.ttf', MontserratBold );
          doc.addFont( 'MontserratBold.ttf', 'MontserratBold', 'normal' );

          var width = doc.internal.pageSize.getWidth();
          var height = doc.internal.pageSize.getHeight();

          doc.addImage( bgJPG, 'JPEG', 0, 0, width, height );

          doc.setFontSize( 10 );
          doc.setFont( 'PoppinsMedium' );
          doc.setTextColor( 255, 255, 255 );

          // Content
          doc.setFontSize( 10 );
          doc.setTextColor( 0, 0, 0 );
          doc.setFont( 'PoppinsMedium', 'normal' );
          doc.text( 10, 43, "To:" );
          doc.text( 10, 48, userData.name );
          doc.text( 10, 53, userData.phoneNumber.toString() );
          doc.text( 10, 58, userData.address.toString() );

          // Invoice Details
          doc.setFont( 'PoppinsMedium', 'bold' );
          doc.text( 75, 43, "Invoice :" );
          doc.text( 75, 48, "Date :" );
          doc.text( 75, 53, "Total :" );
          doc.text( 75, 58, "Due :" );
          doc.text( 75, 63, "Currency :" );


          let dateOrder = new Date();


          let yearOrder = dateOrder.getFullYear();
          let monthOrder = "0" + ( dateOrder.getMonth() + 1 );
          let dayOrder = "0" + dateOrder.getDate();


          doc.setFont( 'PoppinsMedium', 'normal' );
          doc.text( 90, 43, "# " + order.orderId );
          doc.text( 90, 48, `${ yearOrder }-${ monthOrder.substr( -2 ) }-${ dayOrder.substr( -2 ) }` );
          doc.text( 90, 53, myAmount.toString() );
          doc.text( 90, 58, myDue.toString() );
          doc.text( 95, 63, "INR" );

          // Create table
          const startX = 10;
          const startYR = 65;
          const startYT = 60;
          const lineHeightM = 16;
          const lineHeightO = 16;
          const cellWidth1 = 75;
          const cellWidth2 = 7;
          const cellWidth3 = 10;
          const cellWidth4 = 20;
          const cellWidth5 = 15;
          const cellHeightM = 16;
          const cellHeightO = 16;

          // Headers
          const headers = [ "Ordered Item", "Q", "Price", "E.Price", "T.Price" ];

          doc.setFont( 'MontserratBold', 'normal' );

          doc.rect( startX, startYR, cellWidth1, cellHeightO );
          doc.text( startX + ( cellWidth1 / 2 ), startYT + lineHeightO / 2, headers[ 0 ], { align: "center" } );


          doc.rect( startX + cellWidth1, startYR, cellWidth2, cellHeightO );
          doc.text( startX + cellWidth1 + ( cellWidth2 / 2 ), startYT + lineHeightO / 2, headers[ 1 ], { align: "center" } );


          doc.rect( startX + cellWidth1 + cellWidth2, startYR, cellWidth3, cellHeightO );
          doc.text( startX + cellWidth1 + cellWidth2 + ( cellWidth3 / 2 ), startYT + lineHeightO / 2, headers[ 2 ], { align: "center" } );

          doc.rect( startX + cellWidth1 + cellWidth2 + cellWidth3, startYR, cellWidth4, cellHeightO );
          doc.text( startX + cellWidth1 + cellWidth2 + cellWidth3 + ( cellWidth4 / 2 ), startYT + lineHeightO / 2, headers[ 3 ], { align: "center" } );

          doc.rect( startX + cellWidth1 + cellWidth2 + cellWidth3 + cellWidth4, startYR, cellWidth5, cellHeightO );
          doc.text( startX + cellWidth1 + cellWidth2 + cellWidth3 + cellWidth4 + ( cellWidth5 / 2 ), startYT + lineHeightO / 2, headers[ 4 ], { align: "center" } );



          var myVerifiedItems = [];

          myItems.forEach( ( item, rowIndex ) =>
          {

            var myItem1 = [];

            var orderName = "item_" + rowIndex + "_" + item.width + "x" + item.height + "px_quality:_" + item.quality + "_ring:_" + item.ringQuantity;

            var others = item.extraPrice;
            var extraPrice = 0;
            var extraPriceT = "";
            var extraName = "";

            if ( others != null )
            {
              extraName = "\n";
              others.forEach( ( item, rowIndex ) =>
              {

                extraName = extraName + " + " + item.name + "";
                extraPrice = extraPrice + parseFloat( item.price );
                extraPriceT = extraPriceT + "+" + item.price;

              } );
            }


            let result1 = '';
            for ( let i = 1; i < extraName.length + 1; i++ )
            {
              result1 += extraName[ i - 1 ];
              if ( ( i ) % 50 === 0 && i !== extraName.length - 1 )
              {
                result1 += "-\n";
              }
            }

            orderName = orderName + result1;



            let result2 = '';
            for ( let i = 1; i < extraPriceT.length + 1; i++ )
            {
              result2 += extraPriceT[ i - 1 ];
              if ( ( i ) % 10 === 0 && i !== extraPriceT.length - 1 )
              {
                result2 += "\n";
              }
            }

            extraPriceT = result2;


            const totalPrice = parseFloat( item.totalPrice ) + extraPrice;

            myItem1.push( orderName );
            myItem1.push( item.quantity );
            myItem1.push( item.totalPrice );
            myItem1.push( extraPriceT );
            myItem1.push( totalPrice );

            myVerifiedItems.push( myItem1 );

          } );



          myVerifiedItems.forEach( ( item, rowIndex ) =>
          {
            doc.setFont( 'Montserrat', 'normal' );

            doc.rect( startX, startYR + lineHeightO + ( lineHeightM * ( rowIndex ) ), cellWidth1, cellHeightM );
            doc.text( startX + ( cellWidth1 / 2 ), startYT + lineHeightO + ( lineHeightM * ( rowIndex + 1 ) ) - lineHeightM / 2, item[ 0 ].toString(), { align: "center" } );


            doc.rect( startX + cellWidth1, startYR + lineHeightO + ( lineHeightM * ( rowIndex ) ), cellWidth2, cellHeightM );
            doc.text( startX + cellWidth1 + ( cellWidth2 / 2 ), startYT + lineHeightO + ( lineHeightM * ( rowIndex + 1 ) ) - lineHeightM / 2, item[ 1 ].toString(), { align: "center" } );


            doc.rect( startX + cellWidth1 + cellWidth2, startYR + lineHeightO + ( lineHeightM * ( rowIndex ) ), cellWidth3, cellHeightM );
            doc.text( startX + cellWidth1 + cellWidth2 + ( cellWidth3 / 2 ), startYT + lineHeightO + ( lineHeightM * ( rowIndex + 1 ) ) - lineHeightM / 2, item[ 2 ].toString(), { align: "center" } );



            doc.rect( startX + cellWidth1 + cellWidth2 + cellWidth3, startYR + lineHeightO + ( lineHeightM * ( rowIndex ) ), cellWidth4, cellHeightM );
            doc.text( startX + cellWidth1 + cellWidth2 + cellWidth3 + ( cellWidth4 / 2 ), startYT + lineHeightO + ( lineHeightM * ( rowIndex + 1 ) ) - lineHeightM / 2, item[ 3 ].toString(), { align: "center" } );


            doc.rect( startX + cellWidth1 + cellWidth2 + cellWidth3 + cellWidth4, startYR + lineHeightO + ( lineHeightM * ( rowIndex ) ), cellWidth5, cellHeightM );
            doc.text( startX + cellWidth1 + cellWidth2 + cellWidth3 + cellWidth4 + ( cellWidth5 / 2 ), startYT + lineHeightO + ( lineHeightM * ( rowIndex + 1 ) ) - lineHeightM / 2, item[ 4 ].toString(), { align: "center" } );





          } );






          // Total

          doc.setFont( 'MontserratBold', 'normal' );


          doc.rect( startX, startYR + lineHeightO + ( lineHeightM * ( myVerifiedItems.length ) ), ( cellWidth1 + cellWidth2 + cellWidth3 + cellWidth4 ), cellHeightO );
          doc.text( startX + ( ( cellWidth1 + cellWidth2 + cellWidth3 + cellWidth4 ) / 2 ), startYT + lineHeightO + ( lineHeightM * ( myVerifiedItems.length + 1 ) ) - lineHeightO / 2, "Total:", { align: "center" } );


          doc.rect( startX + cellWidth1 + cellWidth2 + cellWidth3 + cellWidth4, startYR + lineHeightO + ( lineHeightM * ( myVerifiedItems.length ) ), cellWidth5, cellHeightO );
          doc.text( startX + cellWidth1 + cellWidth2 + cellWidth3 + cellWidth4 + ( cellWidth5 / 2 ), startYT + lineHeightO + ( lineHeightM * ( myVerifiedItems.length + 1 ) ) - lineHeightO / 2, order.amount.toString(), { align: "center" } );


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




          doc.setFont( 'Montserrat', 'bold' );
          const printedOnText = `Printed on: ${ formattedDateTime }`;
          const textWidth = doc.getStringUnitWidth( printedOnText ) * doc.internal.getFontSize() / doc.internal.scaleFactor;
          const textX = ( width - textWidth ) / 2;
          const textY = height - 3;



          doc.text( textX, textY, printedOnText );

          doc.save( order.orderId + ` ${ year }-${ month.substr( -2 ) }-${ day.substr( -2 ) } ${ hours }-${ minutes.substr( -2 ) }-${ seconds.substr( -2 ) } ` + 'memo_bill.pdf' );






















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


  const handleOtherPrice = ( event, itemId ) =>
  {
    event.preventDefault()
    navigate( '/viewItem/' + orderId + '/' + itemId );
  }


  return (
    <div className='app-container'>
      <div className='box-header'>
        <h5 className='box-title'>Item List </h5>
      </div>
      <div style={ { marginBottom: '20px' } }></div>
      <h5 className='box-title'>Order ID: { orderId }</h5>
      <p style={ { marginTop: '10px' } }>Date : { moment().format( 'MMMM Do YYYY, h:mm:ss a' ) }</p>
      <br />
      <div style={ { textAlign: 'left' } }>

        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '15px' } }>
          Order Date : { myData.orderDate }
        </p>
        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '15px', marginTop: '10px' } }>
          Paid Date : { myData.paidDate }
        </p>
        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '15px', marginTop: '10px' } }>
          Cashback : { myData.cashback }
        </p>
        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '15px', marginTop: '10px' } }>
          Cashback Status : { myData.cashbackStatus }
        </p>
        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '15px', marginTop: '10px' } }>
          Order Status : { myData.status }
        </p>
        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '15px', marginTop: '10px' } }>
          Approved By : { myData.approvedBy }
        </p>

      </div>
      <br />
      <table className='ti-custom-table ti-striped-table ti-custom-table-hover'>
        <thead>
          <tr>
            <th>Quality</th>
            <th>Width</th>
            <th>Height</th>
            <th>Quantity</th>
            <th>Ring Quantity</th>
            <th>Binding Space</th>
            <th>Price</th>

            <th>Action</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          { orders.map( order => (
            <Fragment key={ order.itemId }>
              { editOrderId === order.itemId ? (
                <EditableRows
                  editFormData={ editFormData }
                  handleEditFormChange={ handleEditFormChange }
                  handleCancelClick={ handleCancelClick }
                  handleSaveClick={ handleSaveClick }
                  itemId={ order.itemId }
                />
              ) : (
                <ReadOnlyRows
                  order={ order }
                  handleEditClick={ handleEditClick }
                  handleOtherPrice={ handleOtherPrice }
                  handleDownloadFile={ handleDownloadFile }
                />
              ) }
            </Fragment>
          ) ) }
        </tbody>
      </table>
      {/* </form> */ }

      <br />
      <div style={ { textAlign: 'right', marginTop: '10px' } }>

        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '20px' } }>
          Total Amount : { myData.amount }
        </p>
        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '20px', marginTop: '10px' } }>
          Paid Amount : { myData.paid }
        </p>
        <p style={ { fontWeight: 'bold', margin: '0', fontSize: '20px', marginTop: '10px' } }>
          Due Amount : { parseInt( myData.amount ) - parseInt( myData.paid ) }
        </p>

      </div>

      <div style={ { textAlign: 'center', marginTop: '20px', padding: '15px' } }>
        <Link to='/orderHistory'>
          <button
            variant=''
            className='ti-btn ti-btn-secondary me-1'
            type='button'
            style={ { margin: '0 15px' } }
          >
            Back to order
          </button>
        </Link>
        <button
          variant=''
          className='ti-btn ti-btn-secondary me-1'
          type='button'
          onClick={ () => handleDownloadItem( myData.orderId ) }
          style={ { margin: '0 15px' } }
        >
          Download ZIP
        </button>
        <button
          variant=''
          className='ti-btn ti-btn-secondary me-1'
          type='button'
          onClick={ () => generatePDF( myData ) }
          style={ { margin: '0 15px' } }
        >
          Download Memo
        </button>
        <button
          variant=''
          className='ti-btn ti-btn-secondary me-1'
          type='button'
          onClick={ () => navigate( '/userChat/' + myData.orderId ) }
          style={ { margin: '0 15px' } }
        >
          User Chat
        </button>
        <button
          variant=''
          className='ti-btn ti-btn-secondary me-1'
          type='button'
          onClick={ () => navigate( '/adminChat/' + myData.orderId ) }
          style={ { margin: '0 15px' } }
        >
          Admin Chat
        </button>
      </div>
    </div>
  )
}

const EditableRows = ( {
  editFormData,
  handleEditFormChange,
  handleCancelClick,
  handleSaveClick,
  itemId
} ) =>
{
  const showBindingSpace = editFormData.ringQuantity
    ? 'N/A'
    : editFormData.bindingSpace

  const needSpaceForBindingOptions = [ 'true', 'false' ]

  return (
    <tr>
      {/* <th>Quality</th> */ }
      {/* <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>{ editFormData.quality }</td> */ }

      {/* <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
                <select
                    className='ti-form-input'
                    name='quality'
                    value={ editFormData.quality }
                    onChange={ handleEditFormChange }
                >
                    { qualityOptions.map( option => (
                        <option key={ option } value={ option }>
                            { option }
                        </option>
                    ) ) }
                </select>
            </td> */}

      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='text'
          required
          name='quality'
          placeholder='quality'
          value={ editFormData.quality }
          onChange={ handleEditFormChange }
        />
      </td>

      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='text'
          required
          name='width'
          placeholder='Width'
          value={ editFormData.width }
          onChange={ handleEditFormChange }
        />
      </td>
      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='text'
          required
          name='height'
          placeholder='Height'
          value={ editFormData.height }
          onChange={ handleEditFormChange }
        />
      </td>
      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='text'
          required
          name='quantity'
          placeholder='Quantity'
          value={ editFormData.quantity }
          onChange={ handleEditFormChange }
        />
      </td>

      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='text'
          required
          name='ringQuantity'
          placeholder='Ring Quantity'
          value={ editFormData.ringQuantity }
          onChange={ handleEditFormChange }
        />
      </td>

      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <select
          className='ti-form-input'
          name='needSpaceForBinding'
          value={ editFormData.needSpaceForBinding }
          onChange={ handleEditFormChange }
        >
          { needSpaceForBindingOptions.map( option => (
            <option key={ option } value={ option }>
              { option }
            </option>
          ) ) }
        </select>
      </td>

      <td>{ editFormData.totalPrice }</td>

      <td>
        {/* Save and Cancel buttons handled separately in this component */ }
        <button
          className='ti-btn ti-btn-primary'
          onClick={ event => handleSaveClick( event, editFormData, itemId ) }
        >
          Save
        </button>
        <button className='ti-btn ti-btn-danger' onClick={ handleCancelClick }>
          Cancel
        </button>
      </td>
    </tr>
  )
}

const ReadOnlyRows = ( { order, handleEditClick, handleDownloadFile, handleOtherPrice } ) =>
{
  const showBindingSpace = order.ringQuantity ? 'N/A' : order.bindingSpace;

  return (
    <tr>
      <td>{ order.quality }</td>
      <td>{ order.width }</td>
      <td>{ order.height }</td>
      <td>{ order.quantity }</td>
      <td>{ order.ring ? order.ringQuantity : order.ring.toString() }</td>
      <td>{ order.needSpaceForBinding.toString() }</td>
      <td>{ order.totalPrice }</td>
      <td>
        {/* Edit button to switch to edit mode */ }
        <button
          className='ti-btn ti-btn-primary'
          onClick={ event => handleEditClick( event, order ) }
        >
          Edit
        </button>

        <button
          className='ti-btn ti-btn-primary'
          onClick={ event => handleOtherPrice( event, order.itemId ) }
        >
          Other Price
        </button>
      </td>
      <td>
        {/* Download button for the file associated with this order */ }
        <button
          className='ti-btn ti-btn-primary'
          onClick={ event => handleDownloadFile( order.itemId ) }
        >
          Download
        </button>
      </td>
    </tr>
  )
}

export default ItemList
