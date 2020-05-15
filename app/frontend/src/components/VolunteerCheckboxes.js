import React from 'react';
import { Label } from 'react-bootstrap';
import { httpPatch, domain, protocol } from './Helpers';
import LocationCheckbox from './LocationCheckbox.js';
import DescriptionCheckbox from './DescriptionCheckbox.js'

class VolunteerCheckboxes extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            volunteerID: 0,
            volunteerAttendanceItemID: 0,
            location: "",
            description: "",
            error: "",
            errorMsg: "",
            date: ''
        }

        this.toggleCheckbox = this.toggleCheckbox.bind(this)
        this.toggleDescriptionCheckbox = this.toggleDescriptionCheckbox.bind(this)
    }

    componentDidMount() {
        // let numChecked = 0;
        // const loc = this.props.row.location;
        // if (loc !== ''){
        // }
        this.setState({
            volunteerID: this.props.row.volunteerID,
            volunteerAttendanceItemID: this.props.row.volunteerAttendanceItemID,
            date: this.props.row.date,
            location: this.props.row.location,
            description: this.props.row.description
        });
    }

    // Makes sure that the checkbox reflects whether it has been selected
    toggleCheckbox = (isChecked, value) => {
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
                "id": volunteerAttendanceItemID,
                "date":`${date}`,
                "location": value,
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
                "id": volunteerAttendanceItemID,
                "date":`${date}`,
                "location": '',
            };
            httpPatch(`${protocol}://${domain}/api/volunteer_attendance/`, body)
            .then(function (result) {
                if ('error' in result) {
                    const errorCode = result.error;
                    result.response.then(function(response) {
                        self.setState({error: errorCode, errorMsg: response.error})
                    });
                } else {
                    self.setState({location: '', error: '', errorMsg: ''})
                }
            });
        }
    }
     // Makes sure that the checkbox reflects whether it has been selected
     toggleDescriptionCheckbox = (isChecked, value) => {
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
                "id": volunteerAttendanceItemID,
                "date":`${date}`,
                "description": value,
            };
            httpPatch(`${protocol}://${domain}/api/volunteer_attendance/`, body)
            .then(function (result) {
                if ('error' in result) {
                    const errorCode = result.error;
                    result.response.then(function(response) {
                        self.setState({error: errorCode, errorMsg: response.error})
                    });
                } else {
                    self.setState({description: value, error: '', errorMsg: ''})
                }
            });
        } else{
            let body = {
                "volunteer_id": volunteerID,
                "id": volunteerAttendanceItemID,
                "date":`${date}`,
                "description": '',
            };
            httpPatch(`${protocol}://${domain}/api/volunteer_attendance/`, body)
            .then(function (result) {
                if ('error' in result) {
                    const errorCode = result.error;
                    result.response.then(function(response) {
                        self.setState({error: errorCode, errorMsg: response.error})
                    });
                } else {
                    self.setState({description: '', error: '', errorMsg: ''})
                }
            });
        }
    }

    // Creates a checkbox for each activity
    createCheckboxes = () => {
        let boxes = [];
        const {location, description} = this.state;
        let checked = location !== '';
        let descChecked = description!== '';
        let type = "string"
      
        boxes.push(
            <LocationCheckbox
                label={"Location"}
                value={location}
                type = {type}
                checked = {checked}
                toggleCheckbox={this.toggleCheckbox}
            />
        )
        boxes.push(
            <DescriptionCheckbox
                label={"Description"}
                value={description}
                type = {type}
                checked = {descChecked}
                toggleCheckbox={this.toggleDescriptionCheckbox}
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
