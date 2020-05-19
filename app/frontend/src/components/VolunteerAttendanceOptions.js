import React from 'react';
import { Button } from 'react-bootstrap';
import { httpDelete, getPermissions, domain, protocol } from './Helpers';

class VolunteerAttendanceOptions extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            volunteerAttendanceItemID: 0,
        }

        this.deleteRow = this.deleteRow.bind(this);
    }

    componentDidMount() {
        this.setState({
            volunteerAttendanceItemID: this.props.row.volunteerAttendanceItemID,
        });
    }

    componentDidUpdate() {
        if (this.props.row['volunteerAttendanceItemID'] !== this.state.volunteerAttendanceItemID) {
            this.setState({
                volunteerAttendanceItemID: this.props.row['volunteerAttendanceItemID'],
            })
        }
    }

    deleteRow() {
        const permissions = getPermissions();
        if (permissions.indexOf('delete_volunteerattendanceitems') < 0) {
            alert('Error: You are not authorized to delete volunteer attendance items');
        } else {
            const {volunteerAttendanceItemID} = this.state;
            const id = volunteerAttendanceItemID;
            httpDelete(`${protocol}://${domain}/api/volunteer_attendance/?key=${id}`);  
            this.props.CustomFunction(volunteerAttendanceItemID);
        }
    }

    render() {
        console.log(this.state)
        return(
            <Button 
                variant="danger" 
                onClick={(e) => { if (window.confirm('Are you sure you wish to delete this volunteer?')) this.deleteRow(e)}}>Delete
            </Button>
        )
    }
}

export default VolunteerAttendanceOptions;
