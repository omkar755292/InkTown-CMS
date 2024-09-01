import PageHeader from '../../../layout/layoutsection/pageHeader/pageHeader';
import { api } from './../../../GlobalKey/GlobalKey';
import React, { Fragment, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'





const SettingsNav = () =>
{
  const [ isEditingSpeedLimit, setIsEditingSpeedLimit ] = useState( false );
  const [ speedLimit, setSpeedLimit ] = useState( 0 ); // Initial speed limit
  const [ timeBlock, setTimeBlock ] = useState( "" );
  const [ isEditingCashBack, setIsEditingCashBack ] = useState( false );
  const [ cashBackPercentage, setCashBackPercentage ] = useState( 0 ); // Initial cash back percentage



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
      .get( api + `/super-admin/fetch-settings`, {
        headers: {
          Authorization: 'Bearer ' + getToken
          // 'Content-Type': 'multipart/form-data',
          // 'Content-Type': 'multipart/form-data',
        }
      } )
      .then( response =>
      {
        if ( response.data.status == '1' )
        {

          setSpeedLimit( response.data.data.speedLimit );
          setTimeBlock( response.data.data.loadTime );
          setCashBackPercentage( response.data.data.cashBack );
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
  }, [] );


  const handleEditSpeedLimit = () =>
  {
    setIsEditingSpeedLimit( true );
  };

  const handleSaveSpeedLimit = () =>
  {
    setIsEditingSpeedLimit( false );
    // Perform save operation for speed limit
    console.log( 'Speed limit updated:', speedLimit );

    axios
      .post( api + `/super-admin/edit-settings`, {
        speedLimit: speedLimit
      }, {
        headers: {
          Authorization: 'Bearer ' + myTokens
        }
      } )
      .then( response =>
      {
        if ( response.data.status == '1' )
        {
          setTimeBlock( response.data.data.loadTime );
          setSpeedLimit( response.data.data.speedLimit );
          setCashBackPercentage( response.data.data.cashBack );
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



  };

  const handleEditCashBack = () =>
  {
    setIsEditingCashBack( true );
  };

  const handleSaveCashBack = () =>
  {
    setIsEditingCashBack( false );
    // Perform save operation for cash back percentage
    console.log( 'Cash back percentage updated:', cashBackPercentage );

    axios
      .post( api + `/super-admin/edit-settings`, {
        cashBack: cashBackPercentage
      }, {
        headers: {
          Authorization: 'Bearer ' + myTokens
        }
      } )
      .then( response =>
      {
        if ( response.data.status == '1' )
        {
          setTimeBlock( response.data.data.loadTime );
          setSpeedLimit( response.data.data.speedLimit );
          setCashBackPercentage( response.data.data.cashBack );
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
  };

  const handleTimeBlock = () =>
  {
    const blockTime = prompt( 'Enter time period for time block in minutes.' );
    if ( blockTime !== null )
    {
      axios
        .post( api + `/super-admin/add-time`, {
          addTime: blockTime
        }, {
          headers: {
            Authorization: 'Bearer ' + myTokens
          }
        } )
        .then( response =>
        {
          if ( response.data.status == '1' )
          {
            setTimeBlock( response.data.data.loadTime );
            setSpeedLimit( response.data.data.speedLimit );
            setCashBackPercentage( response.data.data.cashBack );
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
  };

  const handleTimeBlockReset = () =>
  {
    // Widows pop up confirmation
    if ( window.confirm( 'Are you sure you want to reset time block?' ) )
    {
      axios
        .delete( api + `/super-admin/reset-time`, {
          headers: {
            Authorization: 'Bearer ' + myTokens
          }
        } )
        .then( response =>
        {
          if ( response.data.status == '1' )
          {
            setTimeBlock( response.data.data.loadTime );
            setSpeedLimit( response.data.data.speedLimit );
            setCashBackPercentage( response.data.data.cashBack );
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
  };

  const handleCashBackChange = ( e ) =>
  {
    setCashBackPercentage( Number( e.target.value ) );
  };

  const validateTopImage = ( input ) =>
  {
    const myFile = input.files[ 0 ];

    if ( input.files && input.files[ 0 ] )
    {
      var reader = new FileReader();
      reader.onload = function ( e )
      {
        var img = new Image();
        img.src = e.target.result;


        img.onload = function async ()
        {

          console.log( ( img.width * 3 ) - ( img.height * 8 ) );
          console.log( img.height <= img.width );


          if (
            ( ( ( img.width * 3 ) - ( img.height * 8 ) ) <= 50 && img.height <= img.width && ( ( img.width * 3 ) - ( img.height * 8 ) ) >= -50 )
          )
          {
            // Image dimensions are correct, proceed with upload
            // You can add your upload logic here


            const formData = new FormData();
            formData.append( 'fileData', myFile );

            axios
              .post( api + `/super-admin/image/upload/top-image`,
                formData,
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
                // setNotes(response.data.quotations)
                if ( response.data.status == "1" )
                {
                  alert( "File uploaded successful !!!" );

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

          } else
          {
            alert( "Please upload an image with 8:3 ratio." );
            input.value = ''; // Clear the input field
          }
        };
      };
      reader.readAsDataURL( input.files[ 0 ] );
    }
  };

  const validateBottomImage = ( input ) =>
  {
    const myFile = input.files[ 0 ];

    if ( input.files && input.files[ 0 ] )
    {
      var reader = new FileReader();
      reader.onload = function ( e )
      {
        var img = new Image();
        img.src = e.target.result;


        img.onload = function async ()
        {

          console.log( img.width * 3 );
          console.log( img.height * 8 );
          if (
            ( ( ( img.width * 3 ) - ( img.height * 8 ) ) <= 50 && img.height <= img.width && ( ( img.width * 3 ) - ( img.height * 8 ) ) >= -50 )
          )
          {
            // Image dimensions are correct, proceed with upload
            // You can add your upload logic here

            const formData = new FormData();
            formData.append( 'fileData', myFile );

            axios
              .post( api + `/super-admin/image/upload/bottom-image`,
                formData,
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
                // setNotes(response.data.quotations)
                if ( response.data.status == "1" )
                {
                  alert( "File uploaded successful !!!" );

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

          } else
          {
            alert( "Please upload an image with 8:3 ratio." );
            input.value = ''; // Clear the input field
          }
        };
      };
      reader.readAsDataURL( input.files[ 0 ] );
    }
  };


  const inputBigImage = ( input ) =>
  {
    const myFile = input.files[ 0 ];

    if ( input.files && input.files[ 0 ] )
    {
      var reader = new FileReader();
      reader.onload = function ( e )
      {
        var img = new Image();
        img.src = e.target.result;


        img.onload = function async ()
        {


          if (
            img.width === img.height
          )
          {
            // Image dimensions are correct, proceed with upload
            // You can add your upload logic here

            const formData = new FormData();
            formData.append( 'fileData', myFile );

            axios
              .post( api + `/super-admin/image/upload/big-image`,
                formData,
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
                // setNotes(response.data.quotations)
                if ( response.data.status == "1" )
                {
                  alert( "File uploaded successful !!!" );

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

          } else
          {
            alert( "Please upload an image with 1:1 ratio." );
            input.value = ''; // Clear the input field
          }
        };
      };
      reader.readAsDataURL( input.files[ 0 ] );
    }
  };

  return (
    <div>
      <PageHeader
        currentpage='Settings'
        activepage='Dashboard'
        mainpage='Settings'
      />

      <div className='col-span-12'>
        <div className='box'>
          <div className='box-body'>
            <div className='flex justify-between mb-4'>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>Current Speed Limit</label>
                { isEditingSpeedLimit ? (
                  <input
                    type='number'
                    className='my-auto ti-form-input'
                    value={ speedLimit }
                    onChange={ ( e ) => setSpeedLimit( Number( e.target.value ) ) }
                  />
                ) : (
                  <p>{ speedLimit } sqf/h</p>
                ) }
              </div>
              <div className='space-y-2'>
                <button
                  className='ti-btn ti-btn-primary'
                  onClick={ isEditingSpeedLimit ? handleSaveSpeedLimit : handleEditSpeedLimit }
                >
                  { isEditingSpeedLimit ? 'Save' : 'Edit Speed Limit' }
                </button>
              </div>
            </div>
            <hr />
            <br />

            <div className='space-y-2'>
              <button
                className='ti-btn ti-btn-primary'
                onClick={ handleTimeBlock }
              >
                Set Time Block
              </button>
              <button
                className='ti-btn ti-btn-primary'
                onClick={ handleTimeBlockReset }
              >
                Reset Time Block
              </button>
              <p style={ { color: 'red', fontSize: '16px' } }>Book up to: { moment( new Date( parseInt( timeBlock.toString() ) ) ).format(
                'YYYY-MM-DD HH:mm:ss'
              ) }</p>
            </div>
            <hr />
            <br />

            <div className='flex justify-between mb-4'>
              <div className='space-y-2'>
                <label className='ti-form-label mb-0'>Current Cash Back (%)</label>
                { isEditingCashBack ? (
                  <input
                    type='number'
                    className='my-auto ti-form-input'
                    value={ cashBackPercentage }
                    onChange={ handleCashBackChange }
                  />
                ) : (
                  <p>{ cashBackPercentage }%</p>
                ) }
              </div>
              <div className='space-y-2'>
                <button
                  className='ti-btn ti-btn-primary'
                  onClick={ isEditingCashBack ? handleSaveCashBack : handleEditCashBack }
                >
                  { isEditingCashBack ? 'Save' : 'Edit Cash Back' }
                </button>
              </div>
            </div>
            <hr />
            <br />

            {/* Add Quality Button */ }
            <div className='space-y-2'>
              <Link to={ '/addquality' }>
                <button
                  className='ti-btn ti-btn-primary'
                  onClick={ () =>
                  {
                    // Add your functionality for "Add Quality" here
                    console.log( 'Add Quality clicked' );
                  } }
                >
                  Add Quality
                </button>
              </Link>
              <div>
                <h5 className="box-title">Upload Top Image (Please select image with 8:3 ratio.)</h5>
                <br></br>
                <label htmlFor="file-input" className="sr-only">Choose file</label>
                <input type="file" name="file-input" id="file-input"
                  accept="image/png, image/jpeg"
                  onChange={ ( e ) => validateTopImage( e.target ) }
                  className="block border border-gray-200 focus:shadow-sm dark:focus:shadow-white/10 rounded-sm text-sm focus:z-10 focus:outline-0 focus:border-gray-200 dark:focus:border-white/10 dark:border-white/10 dark:text-white/70 file:bg-transparent file:border-0 file:bg-gray-100 ltr:file:mr-4 rtl:file:ml-4 file:py-3 file:px-4 dark:file:bg-black/20 dark:file:text-white/70" />
              </div>
              <div>
                <h5 className="box-title">Upload Bottom Image (Please select image with 8:3 ratio.)</h5>
                <br></br>
                <label htmlFor="file-input" className="sr-only">Choose file</label>
                <input type="file" name="file-input" id="file-input"
                  accept="image/png, image/jpeg"
                  onChange={ ( e ) => validateBottomImage( e.target ) }
                  className="block border border-gray-200 focus:shadow-sm dark:focus:shadow-white/10 rounded-sm text-sm focus:z-10 focus:outline-0 focus:border-gray-200 dark:focus:border-white/10 dark:border-white/10 dark:text-white/70 file:bg-transparent file:border-0 file:bg-gray-100 ltr:file:mr-4 rtl:file:ml-4 file:py-3 file:px-4 dark:file:bg-black/20 dark:file:text-white/70" />
              </div>

              <div>
                <h5 className="box-title">Upload Big Image (Please select image with 1:1 ratio.)</h5>
                <br></br>
                <label htmlFor="file-input" className="sr-only">Choose file</label>
                <input type="file" name="file-input" id="file-input"
                  accept="image/png, image/jpeg"
                  onChange={ ( e ) => inputBigImage( e.target ) }
                  className="block border border-gray-200 focus:shadow-sm dark:focus:shadow-white/10 rounded-sm text-sm focus:z-10 focus:outline-0 focus:border-gray-200 dark:focus:border-white/10 dark:border-white/10 dark:text-white/70 file:bg-transparent file:border-0 file:bg-gray-100 ltr:file:mr-4 rtl:file:ml-4 file:py-3 file:px-4 dark:file:bg-black/20 dark:file:text-white/70" />
              </div>

            </div>
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsNav;
