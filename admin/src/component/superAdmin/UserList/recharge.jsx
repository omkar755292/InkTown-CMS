import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom' // Importing useParams hook
import PageHeader from '../../../layout/layoutsection/pageHeader/pageHeader'
import DatePicker from 'react-datepicker'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { api } from '../../../GlobalKey/GlobalKey'



const Recharge = () =>
{
  const [ amount, setAmount ] = useState( '' )
  const [ date, setDate ] = useState( new Date() )
  const { phoneNumber } = useParams() // Extracting phone number from URL params


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
  } )

  const handleAmountChange = e =>
  {
    const { value } = e.target
    // Validate if input is a positive number
    // if ( /^\d*\.?\d*$/.test( value ) )
    // {
    setAmount( value )
    // }
  }

  const handleDateChange = date =>
  {
    setDate( date )
  }

  const handleAddRecharge = () =>
  {
    // Handle adding recharge logic here
    console.log( 'User ID (Phone Number):', phoneNumber )
    console.log( 'Amount:', amount )
    console.log( 'Date:', date )




    axios
      .post( api + `/user/wallet/add`,
        { phoneNumber, amount, date }, {

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
          navigate( '/userList' )
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

  return (
    <div>
      <PageHeader
        currentpage='Recharge Form'
        activepage='Recharge'
        mainpage='User List'
      />
      <div className='col-span-12 xxl:col-span-6'>
        <div className='box'>
          <div className='box-header'>
            <h5 className='box-title'>Recharge Wallet</h5>
          </div>
          <div className='box-body'>
            <form className='space-y-3'>
              <div className='sm:grid grid-cols-12 gap-x-6'>
                <label className='col-span-3 ti-form-label'>User ID</label>
                <input
                  type='text'
                  className='col-span-9 ti-form-input'
                  value={ phoneNumber } // Using phoneNumber as User ID
                  disabled // Disabling input since it's fetched from URL
                />
              </div>
              <div className='sm:grid grid-cols-12 gap-x-6'>
                <label className='col-span-3 ti-form-label'>Amount</label>
                <input
                  type='text'
                  className='col-span-9 ti-form-input'
                  placeholder='Enter amount'
                  value={ amount }
                  onChange={ handleAmountChange }
                />
              </div>
              <div className='sm:grid grid-cols-12 gap-x-6'>
                <label className='col-span-3 ti-form-label'>Date</label>
                <div className='col-span-9'>
                  <DatePicker
                    selected={ date }
                    onChange={ handleDateChange }
                    className='ti-form-input'
                    dateFormat='MM/dd/yyyy HH:mm'
                    showTimeSelect
                    timeFormat='HH:mm'

                  />
                </div>
              </div>
              <div className='grid grid-cols-12 gap-x-6'>
                <div className='col-span-3'></div>
                <div className='col-span-9'>
                  {/*navigate korte hobe, date changable */ }
                  <button
                    type='button'
                    onClick={ handleAddRecharge }
                    className='ti-btn ti-btn-primary'
                  >
                    Add
                  </button>

                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recharge
