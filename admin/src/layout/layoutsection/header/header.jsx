import React, { Fragment, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Modalsearch from "../modalsearch/modalsearch";
import { connect } from "react-redux"
import { ThemeChanger } from "../../../redux/Action"
import store from "../../../redux/store";
//import home from "../pagecomponent/profile/home/"
import { Closedmenu, Defaultmenu, DetachedFn, DoubletFn, iconOverayFn, iconText } from "../../../common/switcherdata";
import inkTownLogo from '../../../assets/img/inktown-logo.png';



const Header = ( { local_varaiable, ThemeChanger } ) =>
{

    const [ name, setName ] = useState( '' );
    const [ phoneNumber, setPhoneNumber ] = useState( '' );


    // window screen resize
    useEffect( () =>
    {


        setName( localStorage.getItem( "name" ) );
        setPhoneNumber( localStorage.getItem( "phoneNumber" ) );


        function debounce ( func, delay )
        {
            let timeoutId;

            return function ()
            {
                const context = this;
                const args = arguments;

                clearTimeout( timeoutId );
                timeoutId = setTimeout( function ()
                {
                    func.apply( context, args );
                }, delay );
            };
        }

        const handleResize = () =>
        {
            const windowObject = window;
            if ( windowObject.innerWidth <= 991 )
            {
                const theme = store.getState()
                ThemeChanger( { ...theme, "toggled": "close" } )
            } else
            {
                if ( localStorage.Syntoverticalstyles )
                {
                    let verticalStyles = localStorage.getItem( "Syntoverticalstyles" );
                    switch ( verticalStyles )
                    {
                        case "default":
                            Defaultmenu( ThemeChanger )
                            break;
                        case "closed":
                            Closedmenu( ThemeChanger )
                            break;
                        case "icontext":
                            iconText( ThemeChanger )
                            break;
                        case "overlay":
                            iconOverayFn( ThemeChanger )
                            break;
                        case "detached":
                            DetachedFn( ThemeChanger )
                            break;
                        case "doublemenu":
                            DoubletFn( ThemeChanger )
                            break;
                    }
                } else
                {
                    const theme = store.getState()
                    ThemeChanger( {
                        ...theme,
                        "toggled": "",
                        // "dataVerticalStyle":"default"
                    } )
                }
            }
        };
        handleResize(); // Check on component mount
        const debouncedResize = debounce( handleResize, 300 );
        window.addEventListener( 'resize', debouncedResize );
        return () =>
        {
            window.removeEventListener( 'resize', debouncedResize );
        };
    }, [] );


    function menuClose ()
    {
        const theme = store.getState()
        ThemeChanger( { ...theme, "toggled": "close" } )
    }

    const toggleSidebar = () =>
    {
        const theme = store.getState()
        let sidemenuType = theme.dataNavLayout;
        if ( window.innerWidth >= 992 )
        {
            console.log( "Workinh", sidemenuType, theme.dataVerticalStyle );
            if ( sidemenuType === 'vertical' )
            {
                let verticalStyle = theme.dataVerticalStyle;
                switch ( verticalStyle )
                {
                    // closed
                    case "closed":
                        ThemeChanger( { ...theme, "dataNavStyle": "" } )
                        if ( theme.toggled === "close-menu-close" )
                        {
                            ThemeChanger( { ...theme, "toggled": "" } )
                        } else
                        {
                            ThemeChanger( { ...theme, "toggled": "close-menu-close" } )
                        }
                        break;
                    // icon-overlay
                    case "overlay":
                        ThemeChanger( { ...theme, "dataNavStyle": "" } )
                        if ( theme.toggled === "icon-overlay-close" )
                        {
                            ThemeChanger( { ...theme, "toggled": "" } )
                        } else
                        {
                            if ( window.innerWidth >= 992 )
                            {
                                ThemeChanger( { ...theme, "toggled": "icon-overlay-close" } )
                            }
                        }
                        break;
                    // icon-text
                    case "icontext":
                        ThemeChanger( { ...theme, "dataNavStyle": "" } )
                        if ( theme.toggled === "icon-text-close" )
                        {
                            ThemeChanger( { ...theme, "toggled": "" } )
                        } else
                        {
                            ThemeChanger( { ...theme, "toggled": "icon-text-close" } )
                        }
                        break;
                    // doublemenu
                    case "doublemenu":
                        ThemeChanger( { ...theme, "dataNavStyle": "" } )
                        if ( theme.toggled === "double-menu-open" )
                        {
                            ThemeChanger( { ...theme, "toggled": "double-menu-close" } )
                        } else
                        {
                            let sidemenu = document.querySelector( ".side-menu__item.active" );
                            if ( sidemenu )
                            {
                                ThemeChanger( { ...theme, "toggled": "double-menu-open" } )
                                if ( sidemenu.nextElementSibling )
                                {
                                    sidemenu.nextElementSibling.classList.add( "double-menu-active" );
                                } else
                                {

                                    ThemeChanger( { ...theme, "toggled": "" } )
                                }
                            }
                        }

                        // doublemenu(ThemeChanger);
                        break;
                    // detached
                    case "detached":
                        if ( theme.toggled === "detached-close" )
                        {
                            ThemeChanger( { ...theme, "toggled": "" } )
                        } else
                        {
                            ThemeChanger( { ...theme, "toggled": "detached-close" } )
                        }
                        break;
                    // default
                    case "default":
                        ThemeChanger( { ...theme, "toggled": "" } )
                }
            }
        }
        else
        {

            const theme = store.getState()
            if ( theme.toggled === "close" )
            {
                ThemeChanger( { ...theme, "toggled": "open" } )
                setTimeout( () =>
                {
                    if ( theme.toggled == "open" )
                    {
                        document.querySelector( "#responsive-overlay" ).classList.add( "active" );
                        document
                            .querySelector( "#responsive-overlay" )
                            .addEventListener( "click", () =>
                            {
                                document
                                    .querySelector( "#responsive-overlay" )
                                    .classList.remove( "active" );
                                menuClose();
                            } );
                    }
                    window.addEventListener( "resize", () =>
                    {
                        if ( window.screen.width >= 992 )
                        {
                            document.querySelector( "#responsive-overlay" ).classList.remove( "active" );
                        }
                    } );
                }, 100 );
            } else
            {
                ThemeChanger( { ...theme, "toggled": "close" } )
            }


        }


    }

    //Dark Model
    const ToggleDark = () =>
    {

        ThemeChanger( {
            ...local_varaiable,
            "class": local_varaiable.class == 'dark' ? 'light' : 'dark',
            "dataHeaderStyles": local_varaiable.dataHeaderStyles == 'dark' ? 'light' : 'dark'
        } )
        const theme = store.getState()

        if ( theme.class != 'dark' )
        {
            ThemeChanger( {
                ...theme,
                "bodyBg": '',
                "darkBg": '',
            } )
            localStorage.setItem( "Syntolighttheme", "light" )
            localStorage.removeItem( "Syntodarktheme" )
        }
        else
        {
            localStorage.setItem( "Syntodarktheme", "dark" )
            localStorage.removeItem( "Syntolighttheme" )
        }

    }


    //full screen
    let elem = document.documentElement;
    let [ i, seti ] = useState( true );

    const Fullscreen = ( vale ) =>
    {
        switch ( vale )
        {
            case true:
                if ( elem.requestFullscreen )
                {
                    elem.requestFullscreen();
                } else if ( elem.webkitRequestFullscreen )
                {
                    elem.webkitRequestFullscreen();
                } else if ( elem.msRequestFullscreen )
                {
                    elem.msRequestFullscreen();
                }
                seti( false )
                break;
            case false:
                document.exitFullscreen()
                seti( true )
                break;
        }
    }


    useEffect( () =>
    {
        const navbar = document.querySelector( ".header" );
        const navbar1 = document.querySelector( ".app-sidebar" );
        const sticky = navbar.clientHeight;
        // const sticky1 = navbar1.clientHeight;

        function stickyFn ()
        {
            if ( window.pageYOffset >= sticky )
            {
                navbar.classList.add( "sticky-pin" );
                navbar1.classList.add( "sticky-pin" );
            } else
            {
                navbar.classList.remove( "sticky-pin" );
                navbar1.classList.remove( "sticky-pin" );
            }
        }

        window.addEventListener( 'scroll', stickyFn );
        window.addEventListener( 'DOMContentLoaded', stickyFn );

        // Cleanup event listeners when the component unmounts
        return () =>
        {
            window.removeEventListener( 'scroll', stickyFn );
            window.removeEventListener( 'DOMContentLoaded', stickyFn );
        };
    }, [] );





    return (
        <Fragment>
            <header className="header custom-sticky !top-0 !w-full">
                <nav className="main-header" aria-label="Global">
                    <div className="header-content">
                        <div className="header-left">

                            <div className="">
                                <button type="button" className="sidebar-toggle" onClick={ () => toggleSidebar() } >
                                    <span className="sr-only">Toggle Navigation</span>
                                    <i className="ri-arrow-right-circle-line header-icon"></i>
                                </button>
                            </div>

                        </div>

                        <div className="responsive-logo">
                            <Link className="responsive-logo-dark" to={ `${ import.meta.env.BASE_URL }home` } aria-label="Brand">
                                <img
                                    src={ inkTownLogo }
                                    alt='logo'
                                    className="mx-auto"
                                />
                            </Link>
                            <Link className="responsive-logo-light" to={ `${ import.meta.env.BASE_URL }home` } aria-label="Brand">
                                <img
                                    src={ inkTownLogo }
                                    alt='logo'
                                    className="mx-auto"
                                />
                            </Link>
                        </div>

                        <div className="header-right">
                            <div className="responsive-headernav">
                                <div className="header-nav-right">

                                    <div className="header-theme-mode hidden sm:block" onClick={ () => ToggleDark() } >
                                        <Link aria-label="anchor" className="hs-dark-mode-active:hidden flex hs-dark-mode group flex-shrink-0 justify-center items-center gap-2 h-[2.375rem] w-[2.375rem] rounded-full font-medium bg-gray-100 hover:bg-gray-200 text-gray-500 align-middle focus:outline-none focus:ring-0 focus:ring-gray-400 focus:ring-offset-0 focus:ring-offset-white transition-all text-xs dark:bg-bgdark dark:hover:bg-black/20 dark:text-white/70 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                                            to="#" data-hs-theme-click-value="dark">
                                            <i className="ri-moon-line header-icon"></i>
                                        </Link>
                                        <Link aria-label="anchor" className="hs-dark-mode-active:flex hidden hs-dark-mode group flex-shrink-0 justify-center items-center gap-2 h-[2.375rem] w-[2.375rem] rounded-full font-medium bg-gray-100 hover:bg-gray-200 text-gray-500 align-middle focus:outline-none focus:ring-0 focus:ring-gray-400 focus:ring-offset-0 focus:ring-offset-white transition-all text-xs dark:bg-bgdark dark:hover:bg-black/20 dark:text-white/70 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                                            to="#" data-hs-theme-click-value="light">
                                            <i className="ri-sun-line header-icon"></i>
                                        </Link>
                                    </div>
                                    <div className="header-fullscreen hidden lg:block" onClick={ () => Fullscreen( i ) }>
                                        <Link aria-label="anchor" to="#" className="inline-flex flex-shrink-0 justify-center items-center gap-2 h-[2.375rem] w-[2.375rem] rounded-full font-medium bg-gray-100 hover:bg-gray-200 text-gray-500 align-middle focus:outline-none focus:ring-0 focus:ring-gray-400 focus:ring-offset-0 focus:ring-offset-white transition-all text-xs dark:bg-bgdark dark:hover:bg-black/20 dark:text-white/70 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10">
                                            { i ? (
                                                <i className="ri-fullscreen-line header-icon full-screen-open"></i>
                                            ) : (
                                                <i className="ri-fullscreen-exit-line header-icon fullscreen-exit-line"></i>
                                            ) }
                                        </Link>
                                    </div>

                                    <div className="header-profile hs-dropdown ti-dropdown" data-hs-dropdown-placement="bottom-right">
                                        <button id="dropdown-profile" type="button" className="hs-dropdown-toggle ti-dropdown-toggle gap-2 p-0 flex-shrink-0 h-8 w-8 rounded-full shadow-none focus:ring-gray-400 text-xs dark:focus:ring-white/10">
                                            <img
                                                src={ inkTownLogo }
                                                alt='logo'
                                                className="inline-block rounded-full ring-2 ring-white dark:ring-white/10" />
                                        </button>

                                        <div className="hs-dropdown-menu ti-dropdown-menu border-0 w-[20rem]" aria-labelledby="dropdown-profile">
                                            <div className="ti-dropdown-header !bg-primary flex">
                                                <div className="ltr:mr-3 rtl:ml-3">
                                                    <img
                                                        src={ inkTownLogo }
                                                        alt='logo'
                                                        className="avatar shadow-none rounded-full !ring-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="ti-dropdown-header-title !text-white">{ name }</p>
                                                    <p className="ti-dropdown-header-content !text-white/50">{ phoneNumber }</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 ti-dropdown-divider">
                                                <Link to={ `${ import.meta.env.BASE_URL }profile` } className="ti-dropdown-item">
                                                    <i className="ti ti-user-circle text-lg"></i>
                                                    Profile
                                                </Link>

                                                <Link to={ `${ import.meta.env.BASE_URL }log-out` } className="ti-dropdown-item">
                                                    <i className="ti ti-logout  text-lg"></i>
                                                    Log Out
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="switcher-icon">
                                        <button aria-label="button" type="button" className="hs-dropdown-toggle inline-flex flex-shrink-0 justify-center items-center gap-2 h-[2.375rem] w-[2.375rem] rounded-full font-medium bg-gray-100 hover:bg-gray-200 text-gray-500 align-middle focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-gray-400 focus:ring-offset-0 focus:ring-offset-white transition-all text-xs dark:bg-bgdark dark:hover:bg-black/20 dark:text-white/70 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10" data-hs-overlay="#hs-overlay-switcher">
                                            <i className="ri-settings-5-line header-icon animate-spin"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <Modalsearch />
        </Fragment>
    );
};

const mapStateToProps = ( state ) => ( {
    local_varaiable: state
} )
export default connect( mapStateToProps, { ThemeChanger } )( Header );

