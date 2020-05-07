import React from 'react';
import { Redirect } from 'react-router-dom';
import Layout from '../components/Layout';
import AdminTabs from '../components/AdminTabs';
import { getPermissions } from '../components/Helpers';

class Admin extends React.Component {

    render() {
        console.log("admin", this)
        const permissions = getPermissions();

        if (permissions.indexOf('view_user') >= 0 || permissions.indexOf('view_group') >= 0 ||
            permissions.indexOf('change_activity') >= 0 || permissions.indexOf('add_activity') >= 0 || 
            permissions.indexOf('change_studentcolumn') >= 0 || permissions.indexOf('add_studentcolumn') >= 0) {
            return (
                <div className='content'>
                        <Layout />
                        <AdminTabs />
                </div>
            );
        } else {
            return (<Redirect to='/notfound'/>);
        }
    }
}

export default Admin;