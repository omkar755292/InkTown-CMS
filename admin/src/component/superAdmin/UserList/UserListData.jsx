//User List Page

import React, { Fragment, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { api } from "./../../../GlobalKey/GlobalKey";



const UserListData = () =>
{
  const [ users, setUsers ] = useState( [] )

  const [ editFormData, setEditFormData ] = useState( {
    name: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: '',
    status: ''
  } )

  const [ editUserId, setEditUserId ] = useState( '' )

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
      .get( api + `/super-admin/users-list`, {
        headers: {
          Authorization: 'Bearer ' + getToken
        }
      } )
      .then( response =>
      {
        console.log( response.data )
        // setNotes(response.data.quotations)
        if ( response.data.status == '1' )
        {
          setUsers( response.data.data )
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

      }
      );


  }, [] )

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

    const editedUser = {
      id: editUserId,
      name: editFormData.name,
      email: editFormData.email,
      phoneNumber: editFormData.phoneNumber,
      whatsappNumber: editFormData.whatsappNumber,
      address: editFormData.address,
      status: editFormData.status
    }

    const newUsers = [ ...users ]

    const index = users.findIndex( user => user._id === editUserId )

    newUsers[ index ] = editedUser

    setUsers( newUsers )
    setEditUserId( null )
  }

  const handleEditClick = ( event, user ) =>
  {
    event.preventDefault()
    setEditUserId( user._id )

    const formValues = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      whatsappNumber: user.whatsappNumber,
      address: user.address,
      status: user.status
    }

    setEditFormData( formValues )
  }

  const handleCancelClick = () =>
  {
    setEditUserId( null )
  }

  const handleSaveClick = ( event, user, _id ) =>
  {
    console.log( user );
    // event.preventDefault();



    axios
      .post( api + `/super-admin/users-edit/` + _id, user,
        {
          headers: {
            Authorization: 'Bearer ' + myTokens,
            // 'Content-Type': 'multipart/form-data',
            // 'Content-Type': 'multipart/form-data',
          }
        }
      )
      .then( response =>
      {
        console.log( response.data )
        if ( response.data.status == "1" )
        {
          alert( response.data.message );
          setUsers( response.data.data );
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

      }
      );

  }

  // const handleDeleteClick = userId =>
  // {
  //   const newUsers = [ ...users ]

  //   const index = users.findIndex( user => user._id === userId )

  //   newUsers.splice( index, 1 )

  //   setUsers( newUsers )
  // }

  const handleAddOrder = userId =>
  {
    navigate( '/new-order/' + userId )
  }
  const handleViewOrder = userId =>
  {
    navigate( '/vieworderUser/' + userId )
  }
  const handleLogFileClick = userId =>
  {
    navigate( '/logFile/' + userId )
  }
  const handleCashback = userId =>
    {
      navigate('/cashbackWallet/' + userId)
    }
    const handleWallet = userId =>
      {
        navigate('/wallet/' + userId)
      }
  const handleRecharge = userId =>
  {
    navigate( '/recharge/' + userId )
  }  



  return (
    <div className='app-container'>
      <form onSubmit={ handleEditFormSubmit }>
        {/* <div style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className='ti-btn ti-btn-primary' onClick={handleAddUser}>Add User</button>
                </div> */}
        <table className='ti-custom-table ti-striped-table ti-custom-table-hover'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>WhatsApp Number</th>
              <th>Address</th>
              <th style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>Login Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { users.map( user => (
              <Fragment key={ user._id }>
                { editUserId === user._id ? (
                  <EditableUser
                    editFormData={ editFormData }
                    handleEditFormChange={ handleEditFormChange }
                    handleCancelClick={ handleCancelClick }
                    handleSaveClick={ handleSaveClick }
                    _id={ user._id } // Pass user id to EditableUser
                  />
                ) : (
                  <ReadOnlyUser
                    user={ user }
                    handleEditClick={ handleEditClick }
                    // handleDeleteClick={ handleDeleteClick }
                    handleAddOrder={ handleAddOrder }
                    handleViewOrder={ handleViewOrder }
                    handleLogFileClick={ handleLogFileClick }
                    handleCashback={ handleCashback}
                    handleWallet = { handleWallet}
                    handleRecharge={ handleRecharge }
                  />
                ) }
              </Fragment>
            ) ) }
          </tbody>
        </table>
      </form>
    </div>
  )
}






const EditableUser = ( {
  editFormData,
  handleEditFormChange,
  handleSaveClick,
  handleCancelClick,
  _id // Receive user id from props

} ) =>
{

  const loginStatusOptions = [ "active", "deactive" ];


  return (
    <tr>
      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='text'
          name='name'
          value={ editFormData.name }
          onChange={ handleEditFormChange }
        />
      </td>
      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='email'
          name='email'
          value={ editFormData.email }
          onChange={ handleEditFormChange }
        />
      </td>
      <td>{ editFormData.phoneNumber }</td>
      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='number'
          name='whatsappNumber'
          value={ editFormData.whatsappNumber }
          onChange={ handleEditFormChange }
        />
      </td>
      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <input
          className='ti-form-input'
          type='text'
          name='address'
          value={ editFormData.address }
          onChange={ handleEditFormChange }
        />
      </td>

      <td style={ { width: '500px', marginBottom: '0px', padding: '0px' } }>
        <select
          className='ti-form-input'
          name='status'
          value={ editFormData.status }
          onChange={ handleEditFormChange }
        >
          { loginStatusOptions.map( option => (
            <option key={ option } value={ option }>
              { option }
            </option>
          ) ) }
        </select>
      </td>

      <td>
        <button className='ti-btn ti-btn-primary me-1' onClick={ ( event ) => handleSaveClick( event, editFormData, _id ) }
        >
          Save
        </button>
        <button
          className='ti-btn ti-btn-danger me-1'
          onClick={ handleCancelClick }
        >
          Cancel
        </button>
      </td>
    </tr>
  )
}

const ReadOnlyUser = ( {
  user,
  handleEditClick,
  handleViewOrder,
  handleAddOrder,
  handleLogFileClick,
  handleCashback,
  handleWallet,
  handleRecharge,
} ) =>
{

  return (
    <tr>
      <td>{ user.name }</td>
      <td>{ user.email }</td>
      <td>{ user.phoneNumber }</td>
      <td>{ user.whatsappNumber }</td>
      <td>{ user.address }</td>
      <td>{ user.status }</td>
      <td>
        <button
          className='ti-btn ti-btn-primary me-1'
          onClick={ event => handleEditClick( event, user ) }
        >
          Edit
        </button>
        {/* <button
          className='ti-btn ti-btn-danger me-1'
          onClick={ () => handleDeleteClick( user._id ) }
        >
          Delete
        </button> */}
        <button
          className='ti-btn ti-btn-secondary me-1'
          onClick={ () => handleCashback( user.phoneNumber ) }
        >
          Cashback
        </button>
        <button
          className='ti-btn ti-btn-secondary me-1'
          onClick={ () => handleWallet( user.phoneNumber ) }
        >
          Wallet
        </button>
        <button
          className='ti-btn ti-btn-secondary me-1'
          onClick={ () => handleRecharge( user.phoneNumber ) }
        >
          Recharge
        </button>


        <button
          className='ti-btn ti-btn-secondary me-1'
          onClick={ () => handleViewOrder( user.phoneNumber ) }
        >
          View Order
        </button>
        <button
          className='ti-btn ti-btn-secondary me-1'
          onClick={ () => handleAddOrder( user.phoneNumber ) }
        >
          New Order
        </button>
        <button
          className='ti-btn ti-btn-secondary me-1'
          onClick={ () => handleLogFileClick( user.phoneNumber ) }
        >
          Log File
        </button>
      </td>
    </tr>
  )

}

export default UserListData
