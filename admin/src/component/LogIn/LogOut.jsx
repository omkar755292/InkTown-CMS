import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios'
import { firebaseApp, app, firebase, auth, analytics } from "./../../layout/firebase/firebaseapikey";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./../../GlobalKey/GlobalKey";
import inkTownLogo from '../../assets/img/inktown-logo.png';

const LogOut = () =>
{
    const [ phoneNumber, setPhoneNumber ] = useState( '' );

    const [ loginStatus, setLoginStatus ] = useState( '' );
    let navigate = useNavigate();

    useEffect( () =>
    {

        // delete localStorage data
        localStorage.removeItem( "token" );
        localStorage.removeItem( "name" );
        localStorage.removeItem( "phoneNumber" );
        navigate( "/" );
    }, [] );

    return (
        <div className="flex justify-center min-h-screen items-center">
            <Helmet>
                <html dir='ltr' className="h-full"></html>
                <body className="cover1 justify-center"></body>
            </Helmet>
            <main id="content" className="w-full max-w-md mx-auto my-auto p-6">
                <Link to={ `${ import.meta.env.BASE_URL }/` } className="header-logo">
                    <img
                        src={ inkTownLogo }
                        alt='logo'
                        className="mx-auto block"
                    />
                </Link>
                <p>Visit again</p>
            </main>
        </div>
    );
};

export default LogOut;
