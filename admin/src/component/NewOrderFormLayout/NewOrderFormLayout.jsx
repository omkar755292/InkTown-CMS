// AddItem.js

import PageHeader from '../../layout/layoutsection/pageHeader/pageHeader';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { api } from "../../GlobalKey/GlobalKey";




const NewOrderFormLayout = () =>
{
  const { phoneNumber } = useParams();





  const [ underSubmit, setUnderSubmit ] = useState( false )







  const initialItemState = {
    width: '',
    height: '',
    quantity: '',
    quality: '', // will store the ID of the selected quality option
    ring: false,
    ringQuantity: 0,
    needSpaceForBinding: false,
    file: null,
    totalPrice: 0
  }

  const [ items, setItems ] = useState( [ initialItemState ] );
  const [ formError, setFormError ] = useState( false )


  const [ qualityOptions, setQualityOptions ] = useState( [] );

  let navigate = useNavigate();
  const [ myTokens, setMyToken ] = useState( "" )

  useEffect( () =>
  {
    let getToken = localStorage.getItem( "token" );

    if ( !getToken )
    {
      navigate( "/" );
    }
    setMyToken( getToken );

    axios
      .get( api + `/all-flex-quality-services` )
      .then( response =>
      {
        console.log( response.data )
        // setNotes(response.data.quotations)
        if ( response.data.status == "1" )
        {
          console.log( response.data.data );
          console.log( qualityOptions );
          setQualityOptions( response.data.data )
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



  }, [] );




  const handleFileChange = ( event, index ) =>
  {
    const selectedFile = event.target.files[ 0 ];
    const allowedFormats = [ 'jpg', 'pdf', 'png', 'cdr', 'tiff' ]
    const fileExtension = selectedFile.name.split( '.' ).pop().toLowerCase()
    if ( allowedFormats.includes( fileExtension ) )
    {
      const newItems = [ ...items ]
      newItems[ index ].file = selectedFile
      setItems( newItems )
    } else
    {
      alert( 'Please select a file with jpg, pdf, png, cdr, or tiff format.' )
    }
  }

  const handleInputChange = ( index, field, value ) =>
  {
    const newItems = [ ...items ]
    if (
      field === 'width' ||
      field === 'height' ||
      field === 'ringQuantity'
    )
    {
      // Validate input to allow only positive numbers
      if ( !isNaN( value ) && parseFloat( value ) >= 0 )
      {
        newItems[ index ][ field ] = value
      }
    } else
    {
      newItems[ index ][ field ] = value
    }

    console.log( newItems );

    // Calculate total price when width, height, quantity, or quality changes
    const item = newItems[ index ]
    const selectedQuality = qualityOptions.find(
      option => option._id == item.quality
    );

    console.log( selectedQuality );



    if ( selectedQuality && item.width && item.height && item.quantity )
    {
      let price =
        parseFloat( selectedQuality.price ) *
        parseFloat( item.width ) *
        parseFloat( item.height ) *
        parseFloat( item.quantity )
      if ( item.ring )
      {
        price += parseFloat( item.ringQuantity ) * parseFloat( item.quantity )
      }
      newItems[ index ].totalPrice = price
    } else
    {
      newItems[ index ].totalPrice = 0
    }

    setItems( newItems )
  }

  const handleAddNewItem = () =>
  {
    setItems( [ ...items, { ...initialItemState } ] )
  }

  const handleRemoveItem = index =>
  {
    const newItems = [ ...items ]
    newItems.splice( index, 1 )
    setItems( newItems )
  }





















  const handleFileUpload = async ( item ) =>
  {

    const selectedQuality = qualityOptions.find(
      option => option._id == item.quality
    )
    const qualityName = selectedQuality ? selectedQuality.name : ''
    const totalPrice = item.totalPrice


    // api call for upload filter:
    const formData = new FormData();
    formData.append( 'fileData', item.file );

    try
    {
      const res = await axios.post( api + `/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } );

      if ( res.data )
      {
        if ( res.data.status == "1" )
        {
          var myThisData = {
            width: item.width,
            height: item.height,
            quantity: item.quantity,
            quality: qualityName,
            ring: item.ring,
            ringQuantity: item.ringQuantity,
            needSpaceForBinding: item.needSpaceForBinding,
            file: res.data.data.filename,
            totalPrice: totalPrice
          }
          return ( true, myThisData );
        }
      }
      return ( false, "err" );


    } catch ( error )
    {
      console.error( 'Error fetching data:', error );
      return ( false, error );
    }

    // return ( false, "err" );

  }

  const handleSubmit = async () =>
  {


    setUnderSubmit( true );
    setUnderSubmit( false );


    const hasEmptyFields = items.some(
      item =>
        item.width === '' ||
        item.height === '' ||
        item.quantity === '' ||
        item.quality === '' ||
        ( item.ring && item.ringQuantity === '' ) ||
        item.file === null
    )

    if ( hasEmptyFields )
    {
      setUnderSubmit( false );
      setFormError( true )
    } else
    {
      setFormError( false )

      var submittedItems1 = [];

      for ( var i = 0; i < items.length; i++ )
      {
        var item = items[ i ];

        var myThisData = await handleFileUpload( item );

        submittedItems1.push( myThisData );

      }



      console.log( "myTokens" );
      console.log( myTokens );
      console.log( "myTokens" );

      axios
        .post( api + `/super-admin/order/create`,
          {
            items: submittedItems1,
            phoneNumber: phoneNumber
          },
          {
            headers: {
              Authorization: 'Bearer ' + myTokens,
            }
          }
        )
        .then( response =>
        {
          console.log( response.data )
          // setNotes(response.data.quotations)
          if ( response.data.status == "1" )
          {
            navigate( "/orderHistory" );
          } else
          {
            setUnderSubmit( false );
            alert( response.data.message );
          }
        } )
        .catch( error => 
        {
          setUnderSubmit( false );

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

  const totalSum = items.reduce( ( acc, item ) => acc + item.totalPrice, 0 )













  return (
    <div>
      <PageHeader
        currentpage='New Order'
        activepage='Dashboard'
        mainpage='New Order'
      />

      <div className='grid grid-cols-12 gap-x-6'></div>

      <div className='grid grid-cols-12 gap-x-6'>
        <div className='col-span-12'>
          { items.map( ( item, index ) => (
            <div key={ index } className='box'>
              <div
                className='box-header'
                style={ { display: 'flex', justifyContent: 'space-between' } }
              >
                <h5 className='box-title'>Item Details { index + 1 }</h5>
                { items.length > 1 && (
                  <button
                    className='close-btn'
                    onClick={ () => handleRemoveItem( index ) }
                    aria-label='Remove Item'
                    style={ { marginLeft: 'auto' } }
                  >
                    &#x2715;
                  </button>
                ) }
              </div>
              <div className='box-body'>
                <form>
                  <div className='grid lg:grid-cols-2 gap-6 space-y-4 lg:space-y-0'>
                    <div className='space-y-2'>
                      <label className='ti-form-label mb-0'>Width (Foot)</label>
                      <input
                        type='number'
                        className='my-auto ti-form-input'
                        placeholder='Width'
                        value={ item.width }
                        onChange={ e =>
                          handleInputChange( index, 'width', e.target.value )
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='ti-form-label mb-0'>Height (Foot)</label>
                      <input
                        type='number'
                        className='my-auto ti-form-input'
                        placeholder='Height'
                        value={ item.height }
                        onChange={ e =>
                          handleInputChange( index, 'height', e.target.value )
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='ti-form-label mb-0'>Quantity</label>
                      <input
                        type='number'
                        className='my-auto ti-form-input'
                        placeholder='Quantity'
                        value={ item.quantity }
                        onChange={ e =>
                          handleInputChange( index, 'quantity', e.target.value )
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='ti-form-label mb-0'>Quality</label>
                      <select
                        className='my-auto ti-form-select'
                        value={ item.quality }
                        onChange={ e =>
                          handleInputChange( index, 'quality', e.target.value )
                        }
                        required
                      >
                        <option value=''>Select Quality</option>
                        { qualityOptions.map( option => (
                          <option key={ option._id } value={ option._id }>
                            { option.name } - Price { option.price }/sqft
                          </option>
                        ) ) }
                      </select>
                    </div>

                    { !item.needSpaceForBinding && (
                      <div className='space-y-2'>
                        <label className='ti-form-label mb-0'>Ring</label>
                        <div className='flex items-center'>
                          <input
                            type='checkbox'
                            checked={ item.ring }
                            onChange={ e =>
                              handleInputChange( index, 'ring', e.target.checked )
                            }
                          />
                          <label className='ml-2'>(1 Rs. per Ring)</label>
                        </div>
                      </div>
                    ) }

                    { item.ring && (
                      <div className='space-y-2'>
                        <label className='ti-form-label mb-0'>
                          Ring Quantity (Ring for single flex)
                        </label>
                        <input
                          type='number'
                          className='my-auto ti-form-input'
                          placeholder='Ring Quantity'
                          value={ item.ringQuantity }
                          onChange={ e =>
                            handleInputChange(
                              index,
                              'ringQuantity',
                              e.target.value
                            )
                          }
                          required={ item.ring }
                        />
                      </div>
                    ) }

                    { !item.ring && (
                      <div className='space-y-2'>
                        <div className='flex items-center'>
                          <input
                            type='checkbox'
                            checked={ item.needSpaceForBinding }
                            onChange={ e =>
                              handleInputChange(
                                index,
                                'needSpaceForBinding',
                                e.target.checked
                              )
                            }
                          />
                          <label
                            className='ti-form-label mb-0'
                            style={ { padding: '8px' } }
                          >
                            Need Space for Binding
                          </label>
                        </div>
                      </div>
                    ) }
                    <div className='space-y-2'>
                      <label className='ti-form-label mb-0'>Upload File</label>
                      <input
                        type='file'
                        className='my-auto ti-form-input'
                        onChange={ e => handleFileChange( e, index ) }
                        required
                      />
                    </div>
                    <div className='space-y-2 flex flex-col'>
                      <div className='space-y-2'>
                        <label className='ti-form-label mb-0'>Price</label>
                        <input
                          type='text'
                          className='my-auto ti-form-input'
                          value={ item.totalPrice }
                          readOnly
                          required
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) ) }

          { formError && (
            <div className='text-red-500 my-3'>
              Please fill in all fields for each item before submitting.
            </div>
          ) }

          <div className='my-3'>
            <label className='ti-form-label mb-0'>Total</label>
            <input
              type='text'
              className='my-auto ti-form-input'
              value={ totalSum }
              readOnly
              required
            />
          </div>

          <div>
            <button
              type='button'
              className='ti-btn ti-btn-primary'
              onClick={ handleAddNewItem }
            >
              Add New Item
            </button>
            <button type="button" className={ ( underSubmit ) ? "ti-btn ti-btn-disabled ti-btn-success" : "ti-btn ti-btn-success" }
              onClick={ handleSubmit }
              disabled={ underSubmit }
            >
              {
                underSubmit
                  ?
                  <div>
                    <span className="ti-spinner text-white" role="status" aria-label="loading"></span>
                    <span>Loading...</span>
                  </div>
                  :
                  <span>Submit</span>

              }

            </button>
          </div>
        </div>
      </div>
      <div style={ { height: '50px' } }>
        {/* Your content here */ }
      </div>
    </div>
  );








};

export default NewOrderFormLayout;
