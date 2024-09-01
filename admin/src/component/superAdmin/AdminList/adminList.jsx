import React, { Fragment, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { api } from "./../../../GlobalKey/GlobalKey";

// Assuming PageHeader is imported from the appropriate location
import PageHeader from '../../../layout/layoutsection/pageHeader/pageHeader'

const AdminList = () =>
{
  const [ users, setUsers ] = useState( [] )

  const [ editFormData, setEditFormData ] = useState( {
    name: '',
    phoneNumber: '',
    mpin: ''
  } )

  const [ editUserDetailsId, setEditUserDetailsId ] = useState( null )

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
      .get( api + `/super-admin/admin/fetch`, {
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

      } )
  }, [] );

  const handleEditFormChange = event =>
  {
    event.preventDefault()

    const fieldName = event.target.getAttribute( 'name' )
    let fieldValue = event.target.value

    // Validate input based on field
    if ( fieldName === 'phoneNumber' )
    {
      fieldValue = fieldValue.slice( 0, 10 ) // Limit phone number to 10 digits
    } else if ( fieldName === 'mpin' )
    {
      fieldValue = Math.abs( fieldValue ) // Ensure MPIN is positive number
    }

    const newFormData = { ...editFormData }
    newFormData[ fieldName ] = fieldValue

    setEditFormData( newFormData )
  }

  const handleEditFormSubmit = event =>
  {
    event.preventDefault()

    const editedUser = {
      id: editUserDetailsId,
      name: editFormData.name,
      phoneNumber: editFormData.phoneNumber,
      mpin: editFormData.mpin
    }

    const newUsers = [ ...users ]

    const index = users.findIndex( user => user._id === editUserDetailsId )

    newUsers[ index ] = editedUser

    setUsers( newUsers )
    setEditUserDetailsId( null )
  }

  const handleEditClick = ( event, user ) =>
  {
    event.preventDefault();
    setEditUserDetailsId( user._id );

    const formValues = {
      name: user.name,
      phoneNumber: user.phoneNumber,
      mpin: user.mpin
    }

    setEditFormData( formValues )
  }

  const handleCancelClick = () =>
  {

    setEditUserDetailsId( null )
  }

  const handleDataSave = ( e, userData, _id ) =>
  {

    console.log( _id );
    console.log( userData );

    axios
      .post( api + `/super-admin/admin/edit/` + _id, userData,
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

      } );

  }

  const handleDeleteClick = ( event, userId ) =>
  {
    // event.PreventDefault();

    // get windows pop up confirmation
    if ( window.confirm( 'Are you sure you want to delete this user?' ) )
    {


      axios
        .delete( api + `/super-admin/admin/delete/` + userId,
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
          // setNotes(response.data.quotations)
          if ( response.data.status == "1" )
          {
            // const newUsers = [ ...users ]
            const newUsers = users.filter( user => userId._id !== userId )
            setUsers( newUsers )
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
  }

  return (
    <div className='app-container'>
      {/* Adding PageHeader */ }
      <PageHeader
        currentpage='Admin List'
        activepage='Dashboard'
        mainpage='Add Admin'
      />

      <form onSubmit={ handleEditFormSubmit }>
        <table
          id='order-datatable'
          className='ti-custom-table ti-striped-table ti-custom-table-hover'
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>MPIN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { users.map( user => (
              <Fragment key={ user._id }>
                { editUserDetailsId === user._id ? (
                  <EditableRows
                    editFormData={ editFormData }
                    _id={ user._id }
                    handleEditFormChange={ handleEditFormChange }
                    handleCancelClick={ handleCancelClick }
                    handleDataSave={ handleDataSave }
                  />
                ) : (
                  <ReadOnlyRows
                    user={ user }
                    handleEditClick={ handleEditClick }
                    handleDeleteClick={ handleDeleteClick }
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

const EditableRows = ( {
  editFormData,
  _id,
  handleEditFormChange,
  handleCancelClick,
  handleDataSave
} ) =>
{
  return (
    <tr>
      <td>
        <input
          className='ti-form-input'
          type='text'
          required
          placeholder='Enter name...'
          name='name'
          value={ editFormData.name }
          onChange={ handleEditFormChange }
        />
      </td>
      <td>
        <input
          className='ti-form-input'
          type='tel'
          minLength='10'
          maxLength='10'
          required
          placeholder='Enter phone number...'
          name='phoneNumber'
          value={ editFormData.phoneNumber }
          onChange={ handleEditFormChange }
        />
      </td>

      <td>
        <input
          className='ti-form-input'
          type='text'
          minLength='4'
          maxLength='4'
          required
          placeholder='Enter MPIN...'
          name='mpin'
          value={ editFormData.mpin }
          onChange={ handleEditFormChange }
        />
      </td>
      <td>
        <button className='ti-btn ti-btn-primary me-1' onClick={ e => handleDataSave( e, editFormData, _id ) }>
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

const ReadOnlyRows = ( {
  user,
  handleEditClick,
  handleDeleteClick,
  handleViewItem
} ) =>
{
  return (
    <tr>
      <td>{ user.name }</td>
      <td>{ user.phoneNumber }</td>
      <td>{ user.mpin }</td>
      <td>
        <button
          className='ti-btn ti-btn-primary me-1'
          type='button'
          onClick={ ( event ) => handleEditClick( event, user ) }
        >
          Edit
        </button>
        <button
          className='ti-btn ti-btn-danger me-1'
          type='button'
          onClick={ ( event ) => handleDeleteClick( event, user._id ) }
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

export default AdminList
