//User List Page

import React, { Fragment, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { api } from "./../../../GlobalKey/GlobalKey";



const NoticeListTable = () => {
    const [notice, setNotice] = useState([])

    let navigate = useNavigate()
    const [myTokens, setMyToken] = useState('')

    useEffect(() => {
        let getToken = localStorage.getItem('token')

        if (!getToken) {
            navigate('/')
        }
        setMyToken(getToken)

        axios
            .get(api + `/notice/fetch`, {
                headers: {
                    Authorization: 'Bearer ' + getToken
                }
            })
            .then(response => {
                console.log(response.data)

                if (response.data.status == '1') {
                    setNotice(response.data.data)
                } else {
                    alert(response.data.message)
                }
            })
            .catch(error => {
                if (error.response.status == 403 || error.response.status == 401) {
                    // Log out process and go to home page
                    localStorage.setItem("token", null);
                    localStorage.removeItem('token');
                    localStorage.clear();
                    navigate('/')
                } else {
                    alert(error)
                }

            }
            );


    }, [])

    const formatDate = (date) => {
        return moment(date).format('DD/MM/YYYY');
    };

    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };


    return (
        <div className='app-container'>

            <table className='ti-custom-table ti-striped-table ti-custom-table-hover'>
                <thead>
                    <tr>
                        <th>Text</th>
                        <th>Date</th>
                        <th>status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notice.map((item) => (
                        <tr key={item._id}>
                            <td>{stripHtml(item.textBox)}</td>
                            <td>{formatDate(item.createdDate)}</td>
                            <td>{item.status}</td>
                            <td>
                                <button className='ti-btn ti-btn-primary me-1'>
                                    Edit
                                </button>
                                <button className='ti-btn ti-btn-danger me-1'>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}






const EditableUser = ({
    editFormData,
    handleEditFormChange,
    handleSaveClick,
    handleCancelClick,
    _id // Receive user id from props

}) => {

    const loginStatusOptions = ["active", "deactive"];


    return (
        <tr>
            <td style={{ width: '500px', marginBottom: '0px', padding: '0px' }}>
                <input
                    className='ti-form-input'
                    type='text'
                    name='name'
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                />
            </td>
            <td style={{ width: '500px', marginBottom: '0px', padding: '0px' }}>
                <input
                    className='ti-form-input'
                    type='email'
                    name='email'
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                />
            </td>
            <td>{editFormData.phoneNumber}</td>
            <td style={{ width: '500px', marginBottom: '0px', padding: '0px' }}>
                <input
                    className='ti-form-input'
                    type='number'
                    name='whatsappNumber'
                    value={editFormData.whatsappNumber}
                    onChange={handleEditFormChange}
                />
            </td>
            <td style={{ width: '500px', marginBottom: '0px', padding: '0px' }}>
                <input
                    className='ti-form-input'
                    type='text'
                    name='address'
                    value={editFormData.address}
                    onChange={handleEditFormChange}
                />
            </td>

            <td style={{ width: '500px', marginBottom: '0px', padding: '0px' }}>
                <select
                    className='ti-form-input'
                    name='status'
                    value={editFormData.status}
                    onChange={handleEditFormChange}
                >
                    {loginStatusOptions.map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </td>

            <td>
                <button className='ti-btn ti-btn-primary me-1' onClick={(event) => handleSaveClick(event, editFormData, _id)}
                >
                    Save
                </button>
                <button
                    className='ti-btn ti-btn-danger me-1'
                    onClick={handleCancelClick}
                >
                    Cancel
                </button>
            </td>
        </tr>
    )
}

const ReadOnlyUser = ({
    user,
    handleEditClick,
    handleViewOrder,
    handleAddOrder,
    handleLogFileClick,
    handleCashback,
    handleWallet,
    handleRecharge,
}) => {

    return (
        <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.phoneNumber}</td>
            <td>{user.whatsappNumber}</td>
            <td>{user.address}</td>
            <td>{user.status}</td>
            <td>
                <button
                    className='ti-btn ti-btn-primary me-1'
                    onClick={event => handleEditClick(event, user)}
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
                    onClick={() => handleCashback(user.phoneNumber)}
                >
                    Cashback
                </button>
                <button
                    className='ti-btn ti-btn-secondary me-1'
                    onClick={() => handleWallet(user.phoneNumber)}
                >
                    Wallet
                </button>
                <button
                    className='ti-btn ti-btn-secondary me-1'
                    onClick={() => handleRecharge(user.phoneNumber)}
                >
                    Recharge
                </button>


                <button
                    className='ti-btn ti-btn-secondary me-1'
                    onClick={() => handleViewOrder(user.phoneNumber)}
                >
                    View Order
                </button>
                <button
                    className='ti-btn ti-btn-secondary me-1'
                    onClick={() => handleAddOrder(user.phoneNumber)}
                >
                    New Order
                </button>
                <button
                    className='ti-btn ti-btn-secondary me-1'
                    onClick={() => handleLogFileClick(user.phoneNumber)}
                >
                    Log File
                </button>
            </td>
        </tr>
    )

}

export default NoticeListTable
