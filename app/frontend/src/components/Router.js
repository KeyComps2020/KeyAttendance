/*
    This file and layout.js handles almost all of the routing for the app
    There are 2 ways this works:
      * using the <Redirect> tag from react-router-dom. This works in 
        places where we're injecting HTML and overwrites the current location
            example usage: in layout, if a user is not logged in and at a 
            location other than the login page, we redirect them to the login 
            page. We don't want that other page in their history!
      * using this.props.history.push(path). Pretty sure this is just 

*/

import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './views/Login';
import Attendance from './views/Attendance';
import Students from './views/Students';
import Volunteers from './views/Volunteers';
import Reports from './views/Reports';
import Admin from './views/Admin';
import NotFound from './views/NotFound';

const component = (props) => {return useHistory();}