import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import PageHeader from '../../../layout/layoutsection/pageHeader/pageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { api } from '../../../GlobalKey/GlobalKey';


const AdminChat = () =>
{

  //const [isActive, setIsActive] = useState(false);
  const [ msgList, setMsgList ] = useState( [] );
  const [ message, setMessage ] = useState( '' );
  const [ chatId, setChatId ] = useState( '' );
  const { orderId } = useParams();
  const type = "adminType";

  const navigate = useNavigate();
  const [ myToken, setMyToken ] = useState( "" );
  const [ phoneNumber, setPhoneNumber ] = useState( "" );

  useEffect( () =>
  {
    let getToken = localStorage.getItem( "token" );

    if ( !getToken )
    {
      navigate( "/" );
    }
    setMyToken( getToken );
    setPhoneNumber( localStorage.getItem( "phoneNumber" ) );


    axios
      .post( api + `/chat/getMessage`,
        {
          orderId,
          type,
        },
        {
          headers: {
            Authorization: 'Bearer ' + getToken,
          }
        } )
      .then( async response =>
      {
        console.log( response )
        if ( response.data.status == "1" )
        {
          var myList = response.data.data.msgBox;
          myList = myList.sort( ( b, a ) => a[ "msgTime" ] - b[ "msgTime" ] );
          await new Promise( resolve => setTimeout( resolve, 150 ) );
          setMsgList( myList );
          setChatId( response.data.data.chatId )
        } else
        {
          alert( response.data.message );
        }
      } )
      .catch( error =>
      {
        console.log( error )
        if ( error.response.status == 403 || error.response.status == 401 )
        {
          localStorage.setItem( "token", null );
          localStorage.removeItem( 'token' );
          localStorage.clear();
          navigate( '/' );
        } else
        {
          alert( error )
        }
      } );

  }, [] );

  //   const toggleActive = () => {
  //     setIsActive(!isActive);
  //   };
  //msgText,msgSenderName,type,chatId,orderId
  const sendMessage = () =>
  {

    axios
      .post( api + `/chat/sendMessage`,
        {
          msgText: message,
          msgSenderName: "Administrator",
          orderId,
          type,
          chatId
        },
        {
          headers: {
            Authorization: 'Bearer ' + myToken,
          }
        } )
      .then( async response =>
      {
        console.log( response )
        if ( response.data.status == "1" )
        {
          var myList = response.data.data.msgBox;
          myList = myList.sort( ( b, a ) => a[ "msgTime" ] - b[ "msgTime" ] );
          await new Promise( resolve => setTimeout( resolve, 150 ) );
          setMsgList( myList );
        } else
        {
          alert( response.data.message );
        }
      } )
      .catch( error =>
      {
        console.log( error )
        if ( error.response.status == 403 || error.response.status == 401 )
        {
          localStorage.setItem( "token", null );
          localStorage.removeItem( 'token' );
          localStorage.clear();
          navigate( '/' );
        } else
        {
          alert( error )
        }
      } );

    setMessage( '' );
  };

  return (
    <div>
      <PageHeader currentpage='Admin Chat' activepage='Mail' mainpage='UserChat' />
      <div className='main-chart-wrapper px-5 gap-2 lg:flex'>
        <div className='main-chat-area'>
          <div className='box'>
            <div className='box-header bg-transparent'>
              <div className='sm:flex justify-between'>
                <div className='flex items-center space-x-4 rtl:space-x-reverse'>
                  <div className='flex'>
                    <span className='chatstatusperson online'></span>
                  </div>
                  <div>
                    <p className='text-base'>
                      <span className='chatnameperson responsive-userinfo-open'>
                        { chatId + " #" + orderId }
                      </span>
                    </p>
                    <p className='text-xs text-gray-500 dark:text-white/70 chatpersonstatus'>
                      online
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='main-chat-content2 chat-content'>
              <div className='absolute top-0 inset-x-0'>
                <div id='chatlist'>
                  <div className='box-body p-8'>

                    { msgList.map( msg => (
                      msg.phoneNumber == phoneNumber
                        ? <div key={ msg._id }>
                          <div className='chat-right'>
                            <div className='flex flex-col items-end space-y-2'>
                              <div className='chat-inner-msg space-y-1'>
                                <span className='p-2 rounded-sm inline-block  border border-gray-200 bg-primary text-white dark:border-white/10'>
                                  { msg.msgText }
                                </span>
                              </div>
                              <p className='text-end text-xs text-gray-500 dark:text-white/70'>
                                { moment( new Date( parseInt( msg.msgTime ) ) ).format( "YYYY-MM-DD HH:mm:ss" ) }
                              </p>
                            </div>
                          </div>
                        </div>
                        :
                        <div key={ msg._id }>
                          <div className='chat-left'>
                            <div className='flex flex-col items-start space-y-2'>
                              <div className='chat-inner-msg space-y-1'>
                                <div>
                                  <p className='text-start text-xs text-gray-500 dark:text-white/70'>
                                    { msg.msgSenderName ? msg.msgSenderName : msg.phoneNumber }
                                  </p>
                                </div>

                                <span className='p-2 rounded-sm inline-block border border-gray-200 bg-primary/20 text-primary dark:text-white dark:border-white/10'>
                                  { msg.msgText }
                                </span>
                                <div>
                                  <p className='text-start text-xs text-gray-500 dark:text-white/70'>
                                    { moment( new Date( parseInt( msg.msgTime ) ) ).format( "YYYY-MM-DD HH:mm:ss" ) }
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                    ) ) }


                  </div>
                </div>
              </div>
            </div>
            <div className='box-footer'>
              <div className='flex items-center space-x-3 rtl:space-x-reverse'>
                <div className='relative w-full'>
                  <input
                    type='text'
                    name='message'
                    value={ message }
                    onChange={ ( e ) => setMessage( e.target.value ) }
                    className='p-3 ti-form-input'
                    placeholder='Type Your Text Here.................'
                  />
                </div>
                <div className='flex'>
                  <button
                    aria-label='Send Message'
                    className='ti-btn px-2 py-1 ti-btn-primary'
                    onClick={ sendMessage }
                  >
                    <i className='text-xl ti ti-send'></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


};

export default AdminChat;
