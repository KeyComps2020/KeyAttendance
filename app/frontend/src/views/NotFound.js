/* This is the component that is rendered when a link does no match
   any of the links in router in App.js (notice that it's at the 
   bottom of the switch statement and doesn't have a `path` props)

   If we end up at a link like /doesntexist, then
   * if you're logged in, you'll get the 404 error
   * if you're not logged in, you'll be redirected to the login page
*/

import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Jumbotron } from 'react-bootstrap';

class NotFound extends React.Component {
    token = window.localStorage.getItem('key_credentials');
    permissions = window.localStorage.getItem('permissions');
    render() {
        if (this.token === null || this.permissions === null) {
            return <Redirect to='/'/>;
        }
        else {
            return (
                <div className='content'>
                    <Jumbotron> 
                        <div className='content-jumbotron'>
                            <h1>
                                404 <small>page not found</small>
                            </h1>
                            <p>
                                The page you're looking for has mysteriously disappeared! 
                                Try navigating from <Link to='/attendance'>the home page</Link> to take another look.
                            </p>
                        </div>
                    </Jumbotron>
                </div>
            );
        }
    }
}

export default NotFound;