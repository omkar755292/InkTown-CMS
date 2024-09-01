// AddAdmin.js

import React, { Fragment, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { api } from "./../../../GlobalKey/GlobalKey";



const AddAdmin = () =>
{

  const initialItemState = {
    name: '',
    phoneNumber: '',
    mpin: ''
  };


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
  }, [] );



  const [ formData, setFormData ] = useState( initialItemState );
  const [ formError, setFormError ] = useState( false );

  const handleInputChange = ( field, value ) =>
  {
    setFormData( { ...formData, [ field ]: value } );
  };

  const handleSubmit = () =>
  {
    const { name, phoneNumber, mpin } = formData;

    // Validation - Ensure all fields are filled
    if ( !name || !phoneNumber || !mpin )
    {
      setFormError( true );
      return;
    }

    // Validate phone number format (must be exactly 10 digits)
    if ( !/^\d{10}$/.test( phoneNumber ) )
    {
      setFormError( true );
      alert( 'Please enter a 10-digit phone number.' );
      return;
    }

    setFormError( false );

    // Form data is ready for submission
    const adminData = {
      name,
      phoneNumber,
      mpin
    };

    axios
      .post( api + `/super-admin/admin/create`, {
        name,
        phoneNumber,
        mpin
      },
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

    // Clear form after submission (optional)
    setFormData( initialItemState );
  };

  return (
    <div>
      <div className='grid grid-cols-12 gap-x-6'>
        <div className='col-span-12'>
          <div className='box'>
            <div className='box-header' style={ { display: 'flex', justifyContent: 'space-between' } }>
              <h5 className='box-title'>Admin Information</h5>
            </div>
            <div className='box-body'>
              <form>
                <div className='grid lg:grid-cols-2 gap-6 space-y-4 lg:space-y-0'>
                  <div className='space-y-2'>
                    <label className='ti-form-label mb-0'>Name</label>
                    <input
                      type='text'
                      className='my-auto ti-form-input'
                      placeholder='Enter Name'
                      value={ formData.name }
                      onChange={ ( e ) => handleInputChange( 'name', e.target.value ) }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='ti-form-label mb-0'>Phone Number</label>
                    <input
                      type='text'
                      className='my-auto ti-form-input'
                      placeholder='Enter Phone Number'
                      value={ formData.phoneNumber }
                      onChange={ ( e ) => handleInputChange( 'phoneNumber', e.target.value ) }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='ti-form-label mb-0'>MPIN</label>
                    <input
                      type='password'
                      className='my-auto ti-form-input'
                      placeholder='Enter MPIN'
                      value={ formData.mpin }
                      onChange={ ( e ) => handleInputChange( 'mpin', e.target.value ) }
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          { formError && (
            <div className='text-red-500 my-3'>
              Please fill in all fields correctly before submitting.
            </div>
          ) }

          <div className='my-3'>
            <button type='button' className='ti-btn ti-btn-primary' onClick={ handleSubmit }>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
