import React, { Fragment } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.scss";
import { RouteData } from "./common/routingData";
import { HelmetProvider } from 'react-helmet-async';

import App from "./layout/App";

import LogIn from "./component/LogIn/LogIn";

import Authenticationlayout from "./layout/Authenticationlayout";

import Error404 from "./component/Authentication/errorpage/error404/error404";
import Error500 from "./component/Authentication/errorpage/error500/error500";
import Notification from "./layout/firebase/Notification";

import ScrollToTop from "./ScrollToTop/ScrolltoTop";

const helmetContext = {};

ReactDOM.createRoot( document.getElementById( "root" ) ).render(
	<Fragment>
		<HelmetProvider context={ helmetContext }>
			<BrowserRouter>
				<ScrollToTop />
				<Routes>

					<Route path={ `${ import.meta.env.BASE_URL }` } element={ <LogIn /> }>
						<Route index element={ <LogIn /> } />
						<Route path={ `${ import.meta.env.BASE_URL }log-in` } element={ <LogIn /> } />
					</Route>

					{ RouteData.map( ( idx ) => (
						<Fragment key={ Math.random() }>
							{/* //Main page */ }
							<Route path={ `${ import.meta.env.BASE_URL }` } element={ <App /> }>
								<Route index element={ <LogIn /> } />
								<Route exact path={ idx.path } element={ idx.element } />
							</Route>




							{/* Authentication */ }

							<Route path={ `${ import.meta.env.BASE_URL }` } element={ <Authenticationlayout /> }>
								<Route path="*" element={ <Error404 /> } />
								<Route path={ `${ import.meta.env.BASE_URL }Authentication/errorpage/error404` } element={ <Error404 /> } />
								<Route path={ `${ import.meta.env.BASE_URL }Authentication/errorpage/error500` } element={ <Error500 /> } />
							</Route>

						</Fragment>
					) ) }

				</Routes>
			</BrowserRouter>
		</HelmetProvider>
		<Notification/>
	</Fragment>,
);
