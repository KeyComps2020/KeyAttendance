import React from 'react';
import { httpPatch, getPermissions,domain, protocol } from './Helpers';
import { Button } from 'react-bootstrap';

class CheckoutVolunteer extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            row: {},
        }

        this.deleteRow = this.deleteRow.bind(this);
    }

    componentDidMount() {
        this.setState({
            row: this.props.row,
        });
    }

    componentDidUpdate() {
        if (this.props.row['volunteerID'] !== this.state.row['volunteerID']) {
            this.setState({
                row: this.props.row,
            })
        }
    }

    checkOutVolunteer() {
        const permissions = getPermissions();
        var self = this;
        const today = new Date();
        if (permissions.indexOf('delete_volunteerattendanceitems') < 0) {
            alert('Error: You are not authorized to delete volunteer attendance items');
        } else {
            const {row} = this.state;
            const id = row['volunteerAttendanceItemID'];
            let body = {
                "id": id,
                "check_out":`${today.getHours()}:${today.getMinutes() >= 10 ? today.getMinutes() : `0${today.getMinutes()}`}:${today.getSeconds() >= 10 ? today.getSeconds() : `0${today.getSeconds()}`}`,
            };
            httpPatch(`${protocol}://${domain}/api/volunteer_attendance/`, body)
            .then(function (result) {
                if ('error' in result) {
                    result.response.then(function(response) {
                        self.setState({})
                    });
                } else {
                    self.setState({check_out: `${today.getHours()}:${today.getMinutes() >= 10 ? today.getMinutes() : `0${today.getMinutes()}`}:${today.getSeconds() >= 10 ? today.getSeconds() : `0${today.getSeconds()}`}`, error: '', errorMsg: ''})
                }
            });
        }
    }

    render() {
        console.log(this.state)
        return(
            <Button 
                bsStyle="danger" 
                onClick={(e) => {this.checkOutVolunteer(e)}}>Delete
            </Button>
        )
    }
}

export default CheckoutVolunteer;
