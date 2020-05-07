/* 
  This is the general structure for all of the views except for login.js.

*/

import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPermissions } from './Helpers';
import keyLogo from '../images/NUY30x30.png';

class Layout extends Component {

  constructor(props) {
    super(props);
    this.state ={
        activeItem: 'home' //this is never used....
      }
  }
  componentDidMount() {
    console.log("layout has mounted!")
  }

  render() { 
    console.log("navbar has rendered", this)
    const permissions = getPermissions();
    // shouldn't need to check if permissions is null before using because all the views it's used in do that already.
    //construct the navigation bar based on the permissions of the user. eventuall move this out of render and into a (fat arrow) function of the class!
    let navList = [];
    if (permissions.includes('view_attendanceitems')) {
      navList.push('attendance')
    }
    if (permissions.includes('view_students')) {
      navList.push('students')
    }
    if (permissions.includes('view_group') || permissions.includes('view_user') 
      || permissions.includes('change_activity') || permissions.includes('add_activity')
      || permissions.includes('change_studentcolumn') || permissions.includes('add_studentcolumn')) {
      navList.push('admin')
    }
    if (permissions.includes('view_reports')) {
      navList.push('reports')
    }
    if ((permissions.includes('view_volunteers')) && (permissions.includes('view_volunteerattendanceitems'))){
      navList.push('volunteers')
    }

    const navItems = navList.map((nav, index) => //note that key={index} is never used --  it's just required in a js link. 
        <Link to={`/${nav}`} key={index} className='react-bootstrap-link-manual'> 
          {nav}
        </Link>
    ) //use Link from react-router-dom instead of Nav.Link from react-boostrap!
      //this way it's still being managed by <BrowserRouter>. In other words, 
      //you now don't manually need to do this.props.history.push(`/${nav}`)} 
      //if you're confused, go check out the `troubleshooting` entry on this.
    return (
      <div>
        <Navbar variant='light' bg='light' expand='sm' sticky='top'>
          <Navbar.Brand>
            <img
              src={keyLogo}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Key Logo"
            />{' '}
            KEY
          </Navbar.Brand>

          <Navbar.Toggle/>

          <Navbar.Collapse>
            {/*Add the navigation tabs we assembled above to left side and link them to the clicky click*/}
            <Nav className="mr-auto" activeKey='eventKey'>
              {navItems}
            </Nav>
            {/*Add the logout button on the right side*/}
            <Nav className="ml-auto">
                <Link to='/' 
                      onClick={()=>{window.localStorage.removeItem('key_credentials')}} 
                      className='react-bootstrap-link-manual'
                    >
                    logout
                </Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}


export default Layout;
