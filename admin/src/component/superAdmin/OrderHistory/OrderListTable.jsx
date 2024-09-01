import React, { Fragment, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'
import moment from 'moment'
import { api } from "../../../GlobalKey/GlobalKey";
import { saveAs } from 'file-saver';



const OrderListTable = () =>
{
  const [ orders, setOrders ] = useState( [] )

  const { phoneNumber } = useParams();
  const [ showOnly, setShowOnly ] = useState( "all" );





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

    if ( phoneNumber )
    {
      axios
        .post( api + `/super-admin/order/fetch-one-user`, {
          phoneNumber
        },
          {
            headers: {
              Authorization: 'Bearer ' + getToken,

            }
          }
        )
        .then( async response =>
        {
          if ( response.data.status == '1' )
          {
            var myList = response.data.data;
            myList = myList.sort( ( b, a ) => a[ "orderDate" ] - b[ "orderDate" ] );
            await new Promise( resolve => setTimeout( resolve, 150 ) );
            setOrders( myList );
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
            localStorage.setItem( "token", null );
            localStorage.removeItem( 'token' );
            localStorage.clear();
            navigate( '/' )
          } else
          {
            alert( error )
          }

        } );
    } else
    {
      axios
        .get( api + `/super-admin/order/fetch`, {
          headers: {
            Authorization: 'Bearer ' + getToken
          }
        } )
        .then( async response =>
        {
          console.log( response );
          if ( response.data.status == '1' )
          {
            var myList = response.data.data;
            myList = myList.sort( ( b, a ) => a[ "orderDate" ] - b[ "orderDate" ] );
            await new Promise( resolve => setTimeout( resolve, 150 ) );
            setOrders( myList );
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
  }, [] );



  const [ editFormData, setEditFormData ] = useState( {
    phoneNumber: '',
    orderDate: '',
    paidDate: '',
    orderId: '',
    amount: '',
    cashback: '',
    cashbackStatus: '',
    status: '',
    note: '',
    countdownTime: 0,
    expTime: 0,
    approvedBy: ''
  } )

  const [ editOrderId, setEditOrderId ] = useState( null )

  const handleEditFormChange = event =>
  {
    event.preventDefault()

    const fieldName = event.target.getAttribute( 'name' )
    const fieldValue = event.target.value

    const newFormData = { ...editFormData }
    newFormData[ fieldName ] = fieldValue

    setEditFormData( newFormData )
  }

  const handleEditFormSubmit = event =>
  {
    event.preventDefault()

    const editedOrder = {
      id: editOrderId,
      phoneNumber: editFormData.phoneNumber,
      orderDate: editFormData.orderDate,
      paidDate: editFormData.paidDate,
      orderId: editFormData.orderId,
      amount: editFormData.amount,
      cashback: editFormData.cashback,
      cashbackStatus: editFormData.cashbackStatus,
      status: editFormData.status,
      note: editFormData.note,
      expTime: editFormData.expTime,
      countdownTime: editFormData.countdownTime,
      approvedBy: editFormData.approvedBy
    }

    const newOrders = [ ...orders ]

    const index = orders.findIndex( order => order.id === editOrderId )

    newOrders[ index ] = editedOrder

    setOrders( newOrders )
    setEditOrderId( null )
  }

  const handleEditClick = ( event, order ) =>
  {
    event.preventDefault()
    setEditOrderId( order._id )

    const formValues = {
      phoneNumber: order.phoneNumber,
      orderDate: order.orderDate,
      paidDate: order.paidDate,
      orderId: order.orderId,
      amount: order.amount,
      cashback: order.cashback,
      cashbackStatus: order.cashbackStatus,
      status: order.status,
      note: order.note,
      expTime: order.expTime,
      countdownTime: order.countdownTime,
      approvedBy: order.approvedBy
    }

    setEditFormData( formValues )
  }

  const handleCancelClick = () =>
  {
    setEditOrderId( null )
  }

  const handleSubmitEdit = ( event, orderId, editFormData ) =>
  {

    console.log( event );
    console.log( orderId );
    console.log( editFormData );


    axios
      .post( api + `/super-admin/order/edit/` + orderId, editFormData,
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
          // setOrders( response.data.data )
        } else
        {
          alert( response.data.message );
        }
      } )
      .catch( error =>
      {
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

  const formatTime = ( seconds ) =>
  {
    const hours = Math.floor( seconds / 3600 );
    const mins = Math.floor( ( seconds % 3600 ) / 60 );
    const secs = seconds % 60;
    return `${ hours < 10 ? '0' + hours : hours }:${ mins < 10 ? '0' + mins : mins }:${ secs < 10 ? '0' + secs : secs }`;
  };


  const handleDeleteClick = orderId =>
  {
    const newOrders = [ ...orders ]

    const index = orders.findIndex( order => order._id === orderId )

    newOrders.splice( index, 1 )

    setOrders( newOrders )
  }

  const handleDownloadFile = orderId =>
  {
    // Function to handle viewing the item
    axios
      .get( api + `/super-admin/order/download/` + orderId,
        {
          responseType: 'blob', // Important
          headers: {
            Authorization: 'Bearer ' + myTokens,
          }
        }
      )
      .then( response =>
      {
        // Extract filename from content-disposition header if present
        const fileName = orderId + ".zip";
        // Save file using FileSaver.js
        saveAs( new Blob( [ response.data ] ), fileName );
      } )
      .catch( error =>
      {
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


  useEffect( () =>
  {
    const interval = setInterval( () =>
    {
      setOrders( prevTimers =>
        prevTimers.map( timer => ( {
          ...timer,
          countdownTime: timer.countdownTime > 0 ? timer.countdownTime - 1 : 0
        } ) )
      );
    }, 1000 );

    return () => clearInterval( interval );
  }, [] );


  const handleUserChat = orderId =>
  {
    navigate( '/userChat/' + orderId )
  }
  const handleAdminChat = orderId =>
  {
    navigate( '/adminChat/' + orderId )
  }
  return (

    <div>

      <div className="box-body">
        <button type="button" onClick={ () => setShowOnly( "Active" ) }
          className="ti-btn rounded-full ti-btn-dark">
          Active
        </button>
        <button type="button" onClick={ () => setShowOnly( "Approved" ) }
          className="ti-btn rounded-full ti-btn-light">
          Approved
        </button>
        <button type="button" onClick={ () => setShowOnly( "Under-processing" ) }
          className="ti-btn rounded-full ti-btn-primary">
          Under-processing
        </button>
        <button type="button" onClick={ () => setShowOnly( "Completed" ) }
          className="ti-btn rounded-full ti-btn-secondary">
          Completed
        </button>
        <button type="button" onClick={ () => setShowOnly( "On-the-way" ) }
          className="ti-btn rounded-full ti-btn-warning">
          On-the-way
        </button>
        <button type="button" onClick={ () => setShowOnly( "Delivered" ) }
          className="ti-btn rounded-full ti-btn-success">
          Delivered
        </button>
        <button type="button" onClick={ () => setShowOnly( "Cancel" ) }
          className="ti-btn rounded-full ti-btn-danger">
          Cancel
        </button>
        <button type="button" onClick={ () => setShowOnly( "all" ) }
          className="ti-btn rounded-full ti-btn-dark">
          Show All
        </button>
        <button type="button" onClick={ () => setShowOnly( "cancel" ) }
          className="ti-btn rounded-full ti-btn-danger">
          Cancel by user
        </button>
      </div>

      <div className='app-container'>
        <form onSubmit={ handleEditFormSubmit }>
          <table
            id='order-datatable'
            className='ti-custom-table ti-striped-table ti-custom-table-hover'
          >
            <thead>
              <tr>
                <th>Phone Number</th>
                <th>Order Date</th>
                <th>Order ID</th>
                <th>Total Amount</th>
                <th>Cashback</th>
                <th>Cashback Status</th>
                <th>Order Status</th>
                <th>Approved By</th>
                <th>Timer</th>
                <th>Ready with in</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              { orders
                .filter( ( showOnly != "all" ) ? item => item.status == showOnly : item => item.status != "BetaZenInfoTech.com" )
                .map( order => (
                  <Fragment key={ order.orderId }>
                    { editOrderId === order._id ? (
                      <EditableRows
                        editFormData={ editFormData }
                        handleEditFormChange={ handleEditFormChange }
                        handleCancelClick={ handleCancelClick }
                        handleSubmitEdit={ handleSubmitEdit }
                        formatTime={ formatTime }
                        orderId={ order.orderId } // Pass order id to EditableRows
                      />
                    ) : (
                      <ReadOnlyRows
                        order={ order }
                        handleEditClick={ handleEditClick }
                        handleDeleteClick={ handleDeleteClick }
                        formatTime={ formatTime }
                        handleDownloadFile={ handleDownloadFile }
                        handleUserChat={ handleUserChat }
                        handleAdminChat={ handleAdminChat }
                      />
                    ) }
                  </Fragment>
                ) ) }
            </tbody>
          </table>
        </form>
      </div>

    </div>

  )
}

const EditableRows = ( {
  editFormData,
  handleEditFormChange,
  handleCancelClick,
  handleSubmitEdit,
  formatTime,
  orderId // Receive order id from props
} ) =>
{

  // Todo: active, cancel, cancel-by-team, approved, under-processing
  const orderStatusOptions = [
    'Active',
    'Cancel',
    // 'cancel-by-user',
    // 'cancel-by-team',
    'Approved',
    'Under-processing',
    'Completed',
    'On-the-way',
    'Delivered'
  ];

  // Todo: active, cancel, cancel-by-team, approved, under-processing
  const orderCashbackStatusOptions = [
    'upcoming',
    'claimed-by-cash',
    'cancel',
  ];


  return (
    <tr>
      <td>
        { editFormData.phoneNumber }
      </td>
      <td>
        { moment( new Date( parseInt( editFormData.orderDate.toString() ) ) ).format(
          'YYYY-MM-DD HH:mm:ss'
        ) }
      </td>
      <td>{ editFormData.orderId }</td>
      <td>{ editFormData.amount }</td>
      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } } >
        <input
          className='ti-form-input'
          type='text'
          required
          placeholder='Enter cashback...'
          name='cashback'
          value={ editFormData.cashback }
          onChange={ handleEditFormChange }
        ></input>
      </td>

      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <select
          className='ti-form-input'
          name='cashbackStatus'
          value={ editFormData.cashbackStatus }
          onChange={ handleEditFormChange }
        >
          { orderCashbackStatusOptions.map( option => (
            <option key={ option } value={ option }>
              { option }
            </option>
          ) ) }
        </select>
      </td>
      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <select
          className='ti-form-input'
          name='status'
          value={ editFormData.status }
          onChange={ handleEditFormChange }
        >
          { orderStatusOptions.map( option => (
            <option key={ option } value={ option }>
              { option }
            </option>
          ) ) }
        </select>
      </td>
      <td>
        { editFormData.approvedBy }
      </td>
      <td><p style={ { color: 'red', fontSize: '16px' } }>{ formatTime( editFormData.countdownTime ) }</p></td>
      <td>{ moment( new Date( parseInt( editFormData.expTime ) ) ).format( "YYYY-MM-DD HH:mm:ss" ) }</td>
      <td>
        <button variant='' className='ti-btn ti-btn-primary me-1' type='submit' onClick={ ( event ) => handleSubmitEdit( event, orderId, editFormData ) }>
          Save
        </button>
        <button
          variant=''
          className='ti-btn ti-btn-danger me-1'
          onClick={ handleCancelClick }
        >
          Cancel
        </button>
      </td>
    </tr>
  )
}

const ReadOnlyRows = ( {
  order,
  handleEditClick,
  handleDeleteClick,
  formatTime,
  handleDownloadFile,
  handleUserChat,
  handleAdminChat
} ) =>
{
  return (
    <tr>
      <td>{ order.phoneNumber }</td>

      <td>
        { moment( new Date( parseInt( order.orderDate.toString() ) ) ).format(
          'YYYY-MM-DD HH:mm:ss'
        ) }
      </td>
      <td>{ order.orderId }</td>
      <td>{ order.amount }</td>
      <td>{ order.cashback }</td>
      <td>{ order.cashbackStatus }</td>
      <td>{ order.status }</td>
      <td>{ order.approvedBy }</td>
      <td><p style={ { color: 'red', fontSize: '16px' } }>{ formatTime( order.countdownTime ) }</p></td>
      <td>{ moment( new Date( parseInt( order.expTime ) ) ).format( "YYYY-MM-DD HH:mm:ss" ) }</td>
      <td>
        <button
          variant=''
          className='ti-btn ti-btn-primary me-1'
          type='button'
          onClick={ event => handleEditClick( event, order ) }
        >
          Edit
        </button>
        {/* <button
          variant=''
          className='ti-btn ti-btn-danger me-1'
          type='button'
          onClick={ () => handleDeleteClick( order._id ) }
        >
          Delete
        </button> */}

        { order.status != "cancel"
          ?
          <div>
            <Link to={ '/viewItem/' + order.orderId }>
              <button
                variant=''
                className='ti-btn ti-btn-secondary me-1'
                type='button'
              >
                View More
              </button>
            </Link>
            <button
              variant=''
              className='ti-btn ti-btn-secondary me-1'
              type='button'
              onClick={ () => handleDownloadFile( order.orderId ) }
            >
              Download File
            </button>
            <button
              className='ti-btn ti-btn-secondary me-1'
              onClick={ () => handleUserChat( order.orderId ) }
            >
              User Chat
            </button>
            <button
              className='ti-btn ti-btn-secondary me-1'
              onClick={ () => handleAdminChat( order.orderId ) }
            >
              Admin Chat
            </button>
          </div>

          : null
        }

      </td>
    </tr>
  )
}

export default OrderListTable;
