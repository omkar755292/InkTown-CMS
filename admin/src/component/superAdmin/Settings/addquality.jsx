//User List Page
import { api } from './../../../GlobalKey/GlobalKey';
import React, { Fragment, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'



const AddQuality = () =>
{
    const [ products, setProducts ] = useState( [] );


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
            .get( api + `/super-admin/order/fetch-product-quality`, {
                headers: {
                    Authorization: 'Bearer ' + getToken
                    // 'Content-Type': 'multipart/form-data',
                    // 'Content-Type': 'multipart/form-data',
                }
            } )
            .then( response =>
            {
                console.log( response.data )
                // setNotes(response.data.quotations)
                if ( response.data.status == '1' )
                {
                    var allData = response.data.data;
                    // todo: add status in every data in the list of al data

                    setProducts( response.data.data )
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






    const [ editFormData, setEditFormData ] = useState( {
        id: '',
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
            id: editProductId,
            name: editFormData.name,
            price: editFormData.price,
        };
        console.log( editedProduct );





        axios
            .post( api + `/super-admin/order/add-product-quality`,
                {
                    name: editFormData.name,
                    price: editFormData.price,
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
                    setProducts( response.data.data )

                    // const newProducts = [ ...products ];
                    // const index = products.findIndex( product => product.id === editProductId );
                    // newProducts[ index ] = editedProduct;
                    // setProducts( newProducts );
                    // setEditProductId( null );
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
        setEditProductId( product.id );

        const formValues = {
            id: product.id,
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
            .delete( api + `/super-admin/order/delete-product-quality/` + productId,

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
                    setProducts( response.data.data )

                    // const newProducts = [ ...products ];
                    // const index = products.findIndex( product => product.id === editProductId );
                    // newProducts[ index ] = editedProduct;
                    // setProducts( newProducts );
                    // setEditProductId( null );
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

        const newProducts = products.filter( product => product.id !== productId );
        setProducts( newProducts );
    };

    const handleAddProduct = ( event ) =>
    {
        event.preventDefault();

        const id = products.length > 0 ? products[ products.length - 1 ].id + 1 : 1;
        const newProduct = {
            id: id,
            name: '',
            price: '',
            new: true
        };

        const updatedProducts = [ ...products, newProduct ];
        setProducts( updatedProducts );
    };

    return (
        <div className='app-container'>
            <form onSubmit={ handleEditFormSubmit }>
                <div style={ { justifyContent: 'space-between', alignItems: 'center' } }>
                    <button className='ti-btn ti-btn-primary' onClick={ handleAddProduct }>Add Product</button>
                </div>
                <table className='ti-custom-table ti-striped-table ti-custom-table-hover'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { products.map( product => (
                            <Fragment key={ product.id }>
                                { editProductId === product.id ? (
                                    <EditableProduct
                                        editFormData={ editFormData }
                                        handleEditFormChange={ handleEditFormChange }
                                        handleCancelClick={ handleCancelClick }
                                        productId={ product.id } // Pass product id to EditableProduct
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
};

const EditableProduct = ( {
    editFormData,
    handleEditFormChange,
    handleCancelClick,
    productId // Receive product id from props
} ) =>
{
    return (
        <tr>
            <td>{ editFormData.id }</td>
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
            <td>{ product.id }</td>
            <td>{ product.name }</td>
            <td>{ product.price }</td>
            <td>
                { product.new
                    ?
                    <button className='ti-btn ti-btn-primary me-1' onClick={ event => handleEditClick( event, product ) }>
                        Edit
                    </button>
                    : null }

                <button className='ti-btn ti-btn-danger me-1' onClick={ () => handleDeleteClick( product.id ) }>
                    Delete
                </button>
            </td>
        </tr>
    );
};

export default AddQuality;
