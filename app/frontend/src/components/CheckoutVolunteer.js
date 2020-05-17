import React from 'react';
import { httpPatch, getPermissions,domain, protocol } from './Helpers';
import { Button, Form, FormGroup } from 'react-bootstrap';

class CheckoutVolunteer extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            volunteerAttendanceItemID: 0,
            color: true,
            text: true,
            check_out: true,
        }

        this.checkOutVolunteer = this.checkOutVolunteer.bind(this);
        this.undoCheckOut = this.undoCheckOut.bind(this);
    }

    componentDidMount() {
        if (this.props.row.check_out === null){
            this.setState({
                volunteerAttendanceItemID: this.props.row.volunteerAttendanceItemID,
            });
        }
        else{
            this.setState({
                volunteerAttendanceItemID: this.props.row.volunteerAttendanceItemID,
                color:false,
                text: false,
                check_out: false,
            });
        }
    }

    componentDidUpdate() {
        if (this.props.row['volunteerAttendanceItemID'] !== this.state.volunteerAttendanceItemID) {
            this.setState({
                volunteerAttendanceItemID: this.props.row['volunteerAttendanceItemID'],
            })
        }
    }

    checkOutVolunteer() {
        const permissions = getPermissions();
        const today = new Date();
        if (permissions.indexOf('change_volunteerattendanceitems') < 0) {
            alert('Error: You are not authorized to check out volunteers.');
        } else {
            const self = this;
            const {volunteerAttendanceItemID} = this.state;
            const id = volunteerAttendanceItemID;
            
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
                    self.setState({})
                }
            });
            this.setState({color: !this.state.color, text: !this.state.text, check_out:!this.state.check_out });
            this.props.CustomFunction(volunteerAttendanceItemID, true);
        }
    }


    undoCheckOut() {
        const permissions = getPermissions();
        if (permissions.indexOf('change_volunteerattendanceitems') < 0) {
            alert('Error: You are not authorized to check out volunteers.');
        } else {
            const self = this;
            const {volunteerAttendanceItemID} = this.state;
            const id = volunteerAttendanceItemID;
            
            let body = {
                "id": id,
                "check_out":null,
            };
            httpPatch(`${protocol}://${domain}/api/volunteer_attendance/`, body)
            .then(function (result) {
                if ('error' in result) {
                    result.response.then(function(response) {
                        self.setState({})
                    });
                } else {
                    self.setState({})
                }
            });
            this.setState({color: !this.state.color, text: !this.state.text, check_out:!this.state.check_out });
            this.props.CustomFunction(volunteerAttendanceItemID, false);
        }
    }
        
        

    render() {
        console.log(this.state)
        let btn_text = this.state.text ? "Check Out" : "Undo Check Out";
        let btn_style = this.state.color ? "primary" : "warning";
        let btn_func = this.state.color ? this.checkOutVolunteer : this.undoCheckOut;
        return(
            <div>
                <Button 
                    bsStyle= {btn_style}
                    onClick={(e) => {btn_func(e)}}>{btn_text}
                </Button>
            </div>
            
        )
    }
}

export default CheckoutVolunteer;
