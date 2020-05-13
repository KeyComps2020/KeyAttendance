import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import Users from './Users';
import Roles from './Roles';
import StudentKeys from './StudentKeys';
import Activities from './Activities';
import EditStudentFields from './EditStudentFields';
import { getPermissions } from './Helpers';

class AdminTabs extends React.Component {
    constructor(props, context) {
      super(props, context);
  
      this.handleSelect = this.handleSelect.bind(this);
      this.toggleRefreshRoles = this.toggleRefreshRoles.bind(this);
      this.state = {
        refreshRoles: false,
        key: 1
      };
    }
  
    handleSelect(key) {
      this.setState({ key });
    }

    toggleRefreshRoles(boolean) {
      this.setState({ refreshRoles: boolean });
    } //test comment
  
    render() {
      let tabs = [];
      let counter = 1;
      const permissions = getPermissions()
      if (permissions.indexOf('view_user') >= 0) {
        tabs.push(<Tab key={counter} eventKey={counter} title="User Management">
          <Users toggleRefreshRoles={this.toggleRefreshRoles} refreshRoles={this.state.refreshRoles} />
        </Tab>)
        counter++;
      }
      if (permissions.indexOf('view_group') >= 0) {
        tabs.push(<Tab key={counter} eventKey={counter} title="User Roles">
          <Roles toggleRefreshRoles={this.toggleRefreshRoles} />
        </Tab>)
        counter++;
      }
      if (permissions.indexOf('change_activity') >= 0 || permissions.indexOf('add_activity') >= 0) {
        tabs.push(<Tab key={counter} eventKey={counter} title="Programming">
          <Activities />
        </Tab>)
        counter++;
      }
      if (permissions.indexOf('change_studentcolumn') >= 0 || permissions.indexOf('add_studentcolumn') >= 0) {
        tabs.push(<Tab key={counter} eventKey={counter} title="Student Profile Fields">
          <EditStudentFields />
        </Tab>)
        counter++;
      }
      if (permissions.indexOf('change_cityspanstudents') >= 0) {
        tabs.push(<Tab key={counter} eventKey={counter} title="Student Key Management">
          <StudentKeys />
        </Tab>)
        counter++;
      }
      return (
        <Tabs
          activeKey={this.state.key}
          onSelect={this.handleSelect}
          id="admin-tabs"
        >
          {tabs}
        </Tabs>
      );
    }
  }
  
export default AdminTabs;