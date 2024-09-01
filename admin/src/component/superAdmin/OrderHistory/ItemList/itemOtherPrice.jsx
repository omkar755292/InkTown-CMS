import React, { Fragment, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { api } from '../../../../GlobalKey/GlobalKey'




const ItemOtherPrice = () =>
{
  const { orderId, itemId } = useParams()

  const [ extraPrices, setExtraPrices ] = useState( [] );


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
          const items = response.data.data.items;
          const item = items.filter( x => x.itemId == itemId ).pop();

          setExtraPrices( item.extraPrice );

        } else
        {
          alert( response.data.message )
        }
      } )
      .catch( error =>
      {
        console.error( error )
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


    // axios
    //   .get( api + `/super-admin/order/fetch-product-quality`, {
    //     headers: {
    //       Authorization: 'Bearer ' + getToken
    //       // 'Content-Type': 'multipart/form-data',
    //       // 'Content-Type': 'multipart/form-data',
    //     }
    //   } )
    //   .then( response =>
    //   {
    //     console.log( response.data )
    //     // setNotes(response.data.quotations)
    //     if ( response.data.status == '1' )
    //     {
    //       var allData = response.data.data;
    //       // todo: add status in every data in the list of al data

    //       setExtraPrices( response.data.data )
    //     } else
    //     {
    //       alert( response.data.message )
    //     }
    //   } )
    //   .catch( error =>
    //   {
    //     if ( error.response.status == 403 || error.response.status == 401 )
    //     {
    //       // Log out process and go to home page
    //       localStorage.setItem( "token", null );
    //       localStorage.removeItem( 'token' );
    //       localStorage.clear();
    //       navigate( '/' )
    //     } else
    //     {
    //       alert( error )
    //     }

    //   } );



  }, [] );






  const [ editFormData, setEditFormData ] = useState( {
    _id: '',
    name: '',
    price: '',
  } );

  const [ editProductId, setEditProductId ] = useState( null );

  const handleEditFormChange = event =>
  {
    event.preventDefault();

    const fieldName = event.target.getAttribute( 'name' );
    const fieldValue = event.target.value;

    const newFormData = { ...editFormData };
    newFormData[ fieldName ] = fieldValue;

    setEditFormData( newFormData );
  };

  const handleEditFormSubmit = event =>
  {
    event.preventDefault();

    const editedProduct = {
      _id: editProductId,
      name: editFormData.name,
      price: editFormData.price,
    };
    console.log( editedProduct );

    axios
      .post( api + `/super-admin/order/fetch-one-add-extra-amount`,
        {
          name: editFormData.name,
          price: editFormData.price,
          orderId, itemId
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
          const items = response.data.data.items;
          const item = items.filter( x => x.itemId == itemId ).pop();

          setExtraPrices( item.extraPrice );
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


  };

  const handleEditClick = ( event, product ) =>
  {
    event.preventDefault();
    setEditProductId( product._id );

    const formValues = {
      _id: product._id,
      name: product.name,
      price: product.price,
    };
    console.log( formValues );
    setEditFormData( formValues );
  };

  const handleCancelClick = () =>
  {
    setEditProductId( null );
  };

  const handleDeleteClick = productId =>
  {



    axios
      .post( api + `/super-admin/order/fetch-one-delete-extra-amount/` + productId,
        {
          orderId, itemId
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
          const items = response.data.data.items;
          const item = items.filter( x => x.itemId == itemId ).pop();

          setExtraPrices( item.extraPrice );
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

    const newProducts = extraPrices.filter( product => product._id !== productId );
    setExtraPrices( newProducts );
  };

  const handleAddProduct = ( event ) =>
  {
    event.preventDefault();

    const _id = extraPrices.length > 0 ? extraPrices[ extraPrices.length - 1 ]._id + 1 : 1;
    const newProduct = {
      _id: _id,
      name: '',
      price: '',
      new: true
    };

    const updatedProducts = [ ...extraPrices, newProduct ];
    setExtraPrices( updatedProducts );
  };

  return (
    <div className='app-container'>
      <form onSubmit={ handleEditFormSubmit }>
        <div style={ { justifyContent: 'space-between', alignItems: 'center' } }>
          <button className='ti-btn ti-btn-primary' onClick={ handleAddProduct }>Add Others Price</button>
        </div>
        <table className='ti-custom-table ti-striped-table ti-custom-table-hover'>
          <thead>
            <tr>
              {/* <th>ID</th> */ }
              <th>Type</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { extraPrices.map( product => (
              <Fragment key={ product._id }>
                { editProductId === product._id ? (
                  <EditableProduct
                    editFormData={ editFormData }
                    handleEditFormChange={ handleEditFormChange }
                    handleCancelClick={ handleCancelClick }
                    productId={ product._id } // Pass product _id to EditableProduct
                  />
                ) : (
                  <ReadOnlyProduct
                    product={ product }
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
  );



}

const EditableProduct = ( {
  editFormData,
  handleEditFormChange,
  handleCancelClick,
  productId // Receive product _id from props
} ) =>
{
  return (
    <tr>
      {/* <td>{ editFormData._id }</td> */ }
      <td>
        <input
          className='ti-form-input'
          type='text'
          required
          name='name'
          value={ editFormData.name }
          onChange={ handleEditFormChange }
        />
      </td>
      <td>
        <input
          className='ti-form-input'
          type='text'
          required
          name='price'
          value={ editFormData.price }
          onChange={ handleEditFormChange }
        />
      </td>

      <td>
        <button className='ti-btn ti-btn-primary me-1' type='submit'>
          Save
        </button>
        <button className='ti-btn ti-btn-danger me-1' onClick={ handleCancelClick }>
          Cancel
        </button>
      </td>
    </tr>
  );
};

const ReadOnlyProduct = ( { product, handleEditClick, handleDeleteClick } ) =>
{
  return (
    <tr>
      {/* <td>{ product._id }</td> */ }
      <td>{ product.name }</td>
      <td>{ product.price }</td>
      <td>
        { product.new
          ?
          <button className='ti-btn ti-btn-primary me-1' onClick={ event => handleEditClick( event, product ) }>
            Edit
          </button>
          : null }

        <button className='ti-btn ti-btn-danger me-1' onClick={ () => handleDeleteClick( product._id ) }>
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ItemOtherPrice;
