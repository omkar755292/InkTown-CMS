import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios'
import { firebaseApp, app, firebase, auth, analytics } from "./../../layout/firebase/firebaseapikey";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./../../GlobalKey/GlobalKey";
import inkTownLogo from '../../assets/img/inktown-logo.png';


const LogIn = () =>
{
    const [ phoneNumber, setPhoneNumber ] = useState( '' );

    const [ loginStatus, setLoginStatus ] = useState( '' );
    let navigate = useNavigate();

    useEffect( () =>
    {
        let getToken = localStorage.getItem( "token" );
        if ( getToken )
        {
            navigate( "/home" );
        }
    }, [] );



    function onCaptchaVerify ()
    {
        if ( !window.RecaptchaVerifier )
        {
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "normal",
                    callback: ( response ) =>
                    {
                        onSignup();
                    },
                    "expired-callback": () => { },
                }
            );
        }
    }

    const handlePhoneSubmit = ( e ) =>
    {
        e.preventDefault();
        const enteredPhoneNumber = e.target.phone.value;
        // Simulate checking if phone number exists (replace with actual logic)
        setPhoneNumber( enteredPhoneNumber );

        setLoginStatus( 'ENTER_MPIN' );

    };



    const handleOTPOrMPINSubmit = ( e ) =>
    {
        e.preventDefault();
        if ( loginStatus === 'ENTER_OTP' )
        {
            // Simulate OTP validation (replace with actual validation logic)
            const enteredOTP = e.target.otp.value;

            window.confirmationResult
                .confirm( enteredOTP )
                .then( async ( result ) =>
                {
                    const user = result.user;
                    console.log( user );

                    setLoginStatus( 'CREATE_MPIN' );

                } )
                .catch( ( error ) =>
                {
                    console.log( error.message );
                    // toast.error( error.message );
                }
                );

        } else if ( loginStatus === 'CREATE_MPIN' )
        {
            const newMpinValue = e.target.newMpin.value;
            const confirmMpinValue = e.target.confirmMpin.value;
            if ( newMpinValue === confirmMpinValue && newMpinValue.length === 4 )
            {




                // setLoginStatus( 'LOGIN_DETAILS' );
                console.log( 'Login details:', {
                    phoneNumber,
                    mpin: newMpinValue,
                } );
            } else
            {
                console.log( 'New MPINs do not match or length not match with  4 digits' );
                alert( 'New MPINs do not match or length not match with 4 digits' );
            }
        } else if ( loginStatus === 'ENTER_MPIN' )
        {
            const mpin = e.target.mpin.value;
            if ( mpin.length === 4 )
            {


                axios
                    .post( api + `/super-admin/auth/login`, {
                        mpin: mpin,
                        phoneNumber: phoneNumber
                    }
                    )
                    .then( response =>
                    {
                        if ( response.data.status == "1" )
                        {

                            localStorage.setItem( 'token', response.data.token )
                            localStorage.setItem( 'name', response.data.name )
                            localStorage.setItem( 'phoneNumber', response.data.phoneNumber )
                            // navigate to home page
                            navigate( "/home" );

                        } else
                        {
                            alert( response.data.message );
                        }
                    }
                    )
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



                // setLoginStatus( 'LOGIN_DETAILS' );
                console.log( 'Login details:', {
                    phoneNumber,
                    mpin: mpin,
                } );
            } else
            {
                console.log( 'New MPINs do not match or length not match with  4 digits' );
                alert( 'New MPINs do not match or length not match with 4 digits' );
            }
        }
    };

    const reSendOTP = ( event ) =>
    {
        event.preventDefault();


        console.log( "Dosomething" );
    }




    const renderLoginSection = () =>
    {
        switch ( loginStatus )
        {
            case 'ENTER_OTP':
                return (
                    <div>
                        <form onSubmit={ handleOTPOrMPINSubmit }>
                            <label className="block text-sm mb-2 dark:text-white">Enter OTP</label>
                            <input
                                type="text"
                                name="otp"
                                className="py-2 px-3 block w-full border-gray-200 rounded-sm text-sm focus:border-primary focus:ring-primary dark:bg-bgdark dark:border-white/10 dark:text-white/70"
                                required
                            />


                            <button onClick={ reSendOTP }>
                                <p className="text-primary decoration-2 hover:underline font-medium">
                                    Resend OTP
                                </p>
                            </button>

                            <button type="submit" className="ti-btn rounded-full ti-btn-secondary mt-3">Submit OTP</button>
                        </form>
                    </div>
                );
            case 'ENTER_MPIN':
                return (
                    <div>
                        <form onSubmit={ handleOTPOrMPINSubmit }>
                            <label className="block text-sm mb-2 dark:text-white">Enter MPIN</label>
                            <input
                                type="password"
                                name="mpin"
                                className="py-2 px-3 block w-full border-gray-200 rounded-sm text-sm focus:border-primary focus:ring-primary dark:bg-bgdark dark:border-white/10 dark:text-white/70"
                                required
                            />
                            <button type="submit" className="ti-btn rounded-full ti-btn-secondary mt-3">Submit MPIN</button>
                        </form>
                    </div>
                );
            case 'CREATE_MPIN':
                return (
                    <div>
                        <form onSubmit={ handleOTPOrMPINSubmit }>
                            <label className="block text-sm mb-2 dark:text-white">Create New MPIN</label>
                            <input
                                type="password"
                                name="newMpin"
                                className="py-2 px-3 block w-full border-gray-200 rounded-sm text-sm focus:border-primary focus:ring-primary dark:bg-bgdark dark:border-white/10 dark:text-white/70"
                                required
                            />
                            <label className="block text-sm mb-2 dark:text-white">Confirm New MPIN</label>
                            <input
                                type="password"
                                name="confirmMpin"
                                className="py-2 px-3 block w-full border-gray-200 rounded-sm text-sm focus:border-primary focus:ring-primary dark:bg-bgdark dark:border-white/10 dark:text-white/70"
                                required
                            />
                            <button type="submit" className="ti-btn rounded-full ti-btn-secondary mt-3">Submit</button>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex justify-center min-h-screen items-center">
            <Helmet>
                <html dir='ltr' className="h-full"></html>
                <body className="cover1 justify-center"></body>
            </Helmet>
            <main id="content" className="w-full max-w-md mx-auto my-auto p-6">
                <Link to={ `${ import.meta.env.BASE_URL }/` }>
                    <img
                        src={ inkTownLogo }
                        alt='logo'
                        className="header-logo"
                    />
                </Link>
                <div className="mt-7 box mb-0">
                    <div className="box-body">
                        <div className="mt-5">

                            { renderLoginSection() }
                            { loginStatus === '' && (
                                <form onSubmit={ handlePhoneSubmit }>
                                    <label className="block text-sm mb-2 dark:text-white">Phone Number (10 digits)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        pattern="[0-9]{10}"
                                        className="py-2 px-3 block w-full border-gray-200 rounded-sm text-sm focus:border-primary focus:ring-primary dark:bg-bgdark dark:border-white/10 dark:text-white/70"
                                        required
                                    />
                                    <div id="recaptcha-container"></div>
                                    <button type="submit" className="ti-btn rounded-full ti-btn-secondary mt-3">Submit</button>
                                </form>
                            ) }
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LogIn;
