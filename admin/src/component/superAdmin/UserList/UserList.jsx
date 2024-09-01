import React, { Fragment, useState } from 'react'
import UserListData from './UserListData'
import PageHeader from '../../../layout/layoutsection/pageHeader/pageHeader'

const UserList = () =>
{

  return (

    <div>
      <PageHeader
        currentpage='User List '
        activepage='Dashboard'
        mainpage='User List'
      />
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12'>
          <div className='box xl:overflow-auto'>
            <div className='box-header'>
              <h5 className='box-title'>User Details</h5>
            </div>
            <div className='box-body'>
              <div className='overflow-auto table-bordered'>
                <UserListData />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default UserList
