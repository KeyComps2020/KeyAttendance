import React from 'react';
import { Label } from 'react-bootstrap';
import { httpPatch, domain, protocol } from './Helpers';
import LocationCheckbox from './LocationCheckbox.js';

class VolunteerCheckboxes extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            volunteerID: 0,
            volunteerAttendanceItemID: 0,
            location: "",
            error: "",
            errorMsg: "",
            date: ''
        }

        this.toggleCheckbox = this.toggleCheckbox.bind(this)
    }

    componentDidMount() {
        // let numChecked = 0;
        // const loc = this.props.row.location;
        // if (loc !== ''){
        // }
        this.setState({
            volunteerID: this.props.row.volunteerID,
            volunteerAttendanceItemID: this.props.row.volunteerAttendanceItemID,
            date: this.props.row.date
        });
    }

    // Makes sure that the checkbox reflects whether it has been selected
    toggleCheckbox = (isChecked, label, value) => {
        const { volunteerID, volunteerAttendanceItemID, date } = this.state;
        var self = this; // This is a cheap hack so the .then() function can have access to state

        // Get attendanceItemID, studentID, activityID from activities
        // const activityID = activities[label].activityID
        // const attendanceItemID = this.props.row.volunteerAttendanceItemID

        // Carry out API actions
        if (!isChecked) {
            // Add attendanceItem to database
            let body = {
                "volunteer_id": volunteerID,
                "volunteer_attendance_item_id": volunteerAttendanceItemID,
                "date":`${date}`,
            };
            httpPatch(`${protocol}://${domain}/api/volunteer_attendance/`, body)
            .then(function (result) {
                if ('error' in result) {
                    const errorCode = result.error;
                    result.response.then(function(response) {
                        self.setState({error: errorCode, errorMsg: response.error})
                    });
                } else {
                    self.setState({location: value, error: '', errorMsg: ''})
                }
            });
        } else{
            let body = {
                "volunteer_id": volunteerID,
                "volunteer_attendance_item_id": volunteerAttendanceItemID,
                "date":`${date}`,
            };
            httpPatch(`${protocol}://${domain}/api/volunteer_attendance/`, body)
            .then(function (result) {
                if ('error' in result) {
                    const errorCode = result.error;
                    result.response.then(function(response) {
                        self.setState({error: errorCode, errorMsg: response.error})
                    });
                } else {
                    self.setState({location: " ", error: '', errorMsg: ''})
                }
            });

        }
    }

    // Creates a checkbox for each activity
    createCheckboxes = () => {
        let boxes = [];
        const value = this.props.row.location;
        let checked = value !== '';
      
        boxes.push(
            <LocationCheckbox
                label={"Location"}
                value={value}
                checked = {checked}
                toggleCheckbox={this.toggleCheckbox}
            />
        )
        return boxes;
    };

    render() {
        let errorMsg = "Your changes have not been saved. Please refresh and try again.";
        if (this.state.errorMsg !== '' && this.state.errorMsg !== null) {
            errorMsg = this.state.errorMsg;
        }
        return (
            <span className="container">
                <span className="row">
                    <span className="col-sm-12">
                        {this.state.error !== "" && <Label bsStyle="danger">Error {this.state.error}: {errorMsg} </Label>}
                        {this.createCheckboxes()}
                    </span>
                </span>
            </span>
        );
    }
}

export default VolunteerCheckboxes;
