import React, { useState } from 'react';
import PageHeader from '../../layout/layoutsection/pageHeader/pageHeader';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';

const ProfilePage = () =>
{
  const [ isEditing, setIsEditing ] = useState( false );
  const [ fullName, setFullName ] = useState( 'Omkar Panchal' );
  const [ email, setEmail ] = useState( 'omkar13021@example.com' );
  const [ phoneNumber ] = useState( '+919011261543' ); // Mobile number is read-only
  const [ whatsappNumber, setWhatsappNumber ] = useState( '+919011261543' );
  const [ address, setAddress ] = useState( '123 Street, City' );
  const [ pincode, setPincode ] = useState( '123456' );
  const [ state, setState ] = useState( 'State' );
  const status = true;

  const handleEdit = () =>
  {
    setIsEditing( true );
  };

  const handleSave = () =>
  {
    setIsEditing( false );
    // Perform save operation here (e.g., update the user profile)
    console.log( 'Profile updated:', {
      fullName,
      email,
      whatsappNumber,
      address,
      pincode,
      state,
    } );
  };

  return (
    <div>
      <PageHeader
        currentpage='Profile'
        activepage='Profile'
        mainpage='Profile'
      />

      <div className='col-span-12'>
        <div className='box'>
          <div className='box-header'>
            <h5 className='box-title'>Profile Information</h5>
          </div>
          <div className='box-body'>
            <div className='grid lg:grid-cols-2 gap-6 space-y-4 lg:space-y-0'>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>Full Name</label>
                { isEditing ? (
                  <input
                    type='text'
                    className='my-auto ti-form-input'
                    value={ fullName }
                    onChange={ ( e ) => setFullName( e.target.value ) }
                  />
                ) : (
                  <p>{ fullName }</p>
                ) }
              </div>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>Email Address</label>
                { isEditing ? (
                  <input
                    type='email'
                    className='my-auto ti-form-input'
                    value={ email }
                    onChange={ ( e ) => setEmail( e.target.value ) }
                  />
                ) : (
                  <p>{ email }</p>
                ) }
              </div>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>Phone Number</label>
                <p>{ phoneNumber }</p>
              </div>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>WhatsApp Number</label>
                { isEditing ? (
                  <input
                    type='text'
                    className='my-auto ti-form-input'
                    value={ whatsappNumber }
                    onChange={ ( e ) => setWhatsappNumber( e.target.value ) }
                  />
                ) : (
                  <p>{ whatsappNumber }</p>
                ) }
              </div>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>Address</label>
                { isEditing ? (
                  <input
                    type='text'
                    className='my-auto ti-form-input'
                    value={ address }
                    onChange={ ( e ) => setAddress( e.target.value ) }
                  />
                ) : (
                  <p>{ address }</p>
                ) }
              </div>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>Pincode</label>
                { isEditing ? (
                  <input
                    type='text'
                    className='my-auto ti-form-input'
                    value={ pincode }
                    onChange={ ( e ) => setPincode( e.target.value ) }
                  />
                ) : (
                  <p>{ pincode }</p>
                ) }
              </div>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>State</label>
                { isEditing ? (
                  <input
                    type='text'
                    className='my-auto ti-form-input'
                    value={ state }
                    onChange={ ( e ) => setState( e.target.value ) }
                  />
                ) : (
                  <p>{ state }</p>
                ) }
              </div>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>Status</label>
                <p>{ status ? 'Active' : 'Inactive' }</p>
              </div>
            </div>
            { isEditing ? (
              <div className='my-5'>
                <button
                  className='ti-btn ti-btn-primary'
                  onClick={ handleSave }
                >
                  Save
                </button>
              </div>
            ) : (
              <div className='my-5'>
                <button
                  className='ti-btn ti-btn-primary'
                  onClick={ handleEdit }
                >
                  Edit
                </button>
              </div>
            ) }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
