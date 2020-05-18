import React from 'react';
import ReactCollapsingTable from 'react-collapsing-table';
import VolunteerAttendanceOptions from '../components/VolunteerAttendanceOptions';
import VolunteerCheckboxes from'../components/VolunteerCheckboxes';
import AddVolunteerModal from '../components/AddVolunteerModal';
import Autocomplete from "../components/Autocomplete";
import { httpPost, httpGet, domain, protocol } from '../components/Helpers';
import { Button, ButtonToolbar, Form, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';
import { getPermissions, downloadVolunteerAttendanceCSV, borderStyle, whiteBorderStyle } from '../components/Helpers';
import { Redirect } from 'react-router-dom';
import CheckoutVolunteer from '../components/CheckoutVolunteer';

class Volunteers extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            buildingCSV: false,
            volunteers: [],
            volunteerAttendanceItems: [],
            suggestionsArray: [],
            volunteerAttendance: [],
            showVolunteerModal: false,
            date: '',
            prevDate: '',
            canCreateVolunteer: false,
            mobile: false,
        }

        this.downloadCSV = this.downloadCSV.bind(this);
        this.addVolunteer = this.addVolunteer.bind(this);
        this.removeVolunteerAttendanceRow = this.removeVolunteerAttendanceRow.bind(this);
        this.checkOutVolunteer = this.checkOutVolunteer.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.updateDate = this.updateDate.bind(this);
        this.setDateToToday = this.setDateToToday.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
        this.setState({date: this.getCurrentDate(), mobile: (window.innerWidth < 768)})
    }

    componentDidUpdate() {
        if (this.state.date !== this.state.prevDate) {
            this.setState({prevDate: this.state.date})
            this.fetchAndBuild()
        }
    }

    getCurrentDate() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        return `${today.getFullYear()}-${month >= 10 ? month : `0${month}`}-${day >= 10 ? day : `0${day}`}`
    }

    async fetchAndBuild() {
        const { date } = this.state;
        try {
            const volunteers =  await httpGet(`${protocol}://${domain}/api/volunteers/`);
            const volunteerAttendanceItems = await httpGet(`${protocol}://${domain}/api/volunteer_attendance/?day=${date}`);
            const permissions = getPermissions()
            let canCreateVolunteer = false;
            if (permissions.indexOf('add_volunteers') >= 0) {
                canCreateVolunteer = true;
            }
            const suggestions = this.makeSuggestionsArray(volunteers);

            this.setState({
                suggestionsArray: suggestions,
                volunteers: volunteers,
                volunteerAttendanceItems: volunteerAttendanceItems,
                canCreateVolunteer: canCreateVolunteer
            });
        } catch (e) {
            console.log(e);
        }
        this.buildSheet();
    }

    buildSheet() {
        const {volunteerAttendanceItems, volunteers } = this.state;
        // Combine attendance items. Need to sort by volunteer id.
        var entries = {};
        for (var i = 0; i < volunteerAttendanceItems.length; i++) {
            if (entries[`${volunteerAttendanceItems[i].volunteer_id}`] == null) {
                entries[`${volunteerAttendanceItems[i].volunteer_id}`] = {'check_in':volunteerAttendanceItems[i].check_in, 
                                                                            'check_out': volunteerAttendanceItems[i].check_out,
                                                                            'itemID': volunteerAttendanceItems[i].id, 
                                                                            'location': volunteerAttendanceItems[i].location, 
                                                                            'description': volunteerAttendanceItems[i].description};
            }
        }

        // Build table of the form [{name, check_in,...}]
        var sheet = [];
        const ids = Object.keys(entries);
        for (var i = 0; i < ids.length; i++) {
            var row = {}
            // match volunteer data to current id
            for (var j = 0; j < volunteers.length; j++) { // unfortunately, volunteer data isn't in any particular order. O(n) it is!
                if (volunteers[j].id === parseInt(ids[i])) {
                    row['name'] = `${volunteers[j].first_name} ${volunteers[j].last_name}`;
                    row['volunteerID'] = volunteers[j].id;
                    break;
                }
            } 
            row['check_in'] = entries[ids[i]].check_in;
            row['location'] = entries[ids[i]].location;
            row['description'] = entries[ids[i]].description;
            row['check_out'] = entries[ids[i]].check_out;
            if (row['check_out']!== null){
                row['checked_out'] = true;
            }
            row['volunteerAttendanceItemID'] = entries[ids[i]].itemID;
            sheet.push(row)
        }

        this.setState({ volunteerAttendance: sheet });
    }



    async addVolunteer(e, volunteerID) {
        // Refresh attendance page.
        await this.fetchAndBuild();

        const { volunteers, volunteerAttendance, date } = this.state;
        const today = new Date();
        const self = this;

        // make sure we don't already have this volunteer.
        for (let i = 0; i < volunteerAttendance.length; i++) {
            if (parseInt(volunteerID) === volunteerAttendance[i].volunteerID) {
                alert('Error: This volunteer has already been checked in');
                return;
            }
        }

        httpPost(`${protocol}://${domain}/api/volunteer_attendance/`, {
            "volunteer_id": volunteerID,
            "date":`${date}`,
            "check_in":`${today.getHours()}:${today.getMinutes() >= 10 ? today.getMinutes() : `0${today.getMinutes()}`}:${today.getSeconds() >= 10 ? today.getSeconds() : `0${today.getSeconds()}`}`,
        }).then(function(result) {
            if ('error' in result) {
                result.response.then(function(response) {alert(`Error: ${response.error}`)});
            } else {
                // Add new row to table
                let name = "";
                for (var j = 0; j < volunteers.length; j++) {
                    if (volunteers[j].id === parseInt(volunteerID)) {
                        name = `${volunteers[j].first_name} ${volunteers[j].last_name}`;
                        break;
                    }
                }
                const row = { 'name': name, 'volunteerID': parseInt(volunteerID), 'check_in': result.check_in , 'volunteerAttendanceItemID' : result.id, 'checked_out': false};
                volunteerAttendance.push(row);
                self.setState({ volunteerAttendance: volunteerAttendance });
            }
        });
    }

    makeSuggestionsArray(suggestions) {
        var array = [];
        var lastHolder1;
        var lastHolder2;
        var tempArray;
        for (var object in suggestions) {
            if (suggestions[object]['last_name'].includes(" ")) {
                tempArray = suggestions[object]['last_name'].split(" ");
                lastHolder1 = tempArray[0];
                lastHolder2 = tempArray[1];
            }
            else {
                lastHolder1 = suggestions[object]['last_name'];
                lastHolder2 = "";
            }
            array.push({
                firstName: suggestions[object]['first_name'],
                lastName1: lastHolder1,
                lastName2: lastHolder2,
                id: suggestions[object]['id']
            });
        }
        return array;
    }

    async downloadCSV() {
        this.setState({ buildingCSV: true });
        await downloadVolunteerAttendanceCSV(`${this.state.date}`)
        this.setState({ buildingCSV: false });
    }

    // Allows the AttendanceOptions object to  update state here
    removeVolunteerAttendanceRow(id) {
        const { volunteerAttendance } = this.state;
        for (let i = 0; i < volunteerAttendance.length; i++) {
            if (volunteerAttendance[i].volunteerAttendanceItemID === id) {
                volunteerAttendance.splice(i, 1);
            }
        }
        this.setState({volunteerAttendance: volunteerAttendance});
        this.fetchAndBuild();
        this.refresh();
    }

    // Allows CheckoutVolunteer object to update state here
    checkOutVolunteer(id, checked_out){
        const { volunteerAttendance } = this.state;
        const today = new Date();
        let name = "";
        let description = "";
        let location = "";
        let check_in;
        let volunteerID = 0;

        if(checked_out){
            let check_out;
            for (let i = 0; i < volunteerAttendance.length; i++) {
                if (volunteerAttendance[i].volunteerAttendanceItemID === id) {
                    name = volunteerAttendance[i].name;
                    description = volunteerAttendance[i].description;
                    location = volunteerAttendance[i].location;
                    check_in = volunteerAttendance[i].check_in;
                    volunteerID = volunteerAttendance[i].volunteerID;
                    check_out = `${today.getHours()}:${today.getMinutes() >= 10 ? today.getMinutes() : `0${today.getMinutes()}`}:${today.getSeconds() >= 10 ? today.getSeconds() : `0${today.getSeconds()}`}`;
                    volunteerAttendance.splice(i, 1);
                }
            }
            const row = { 'name': name, 
                        'volunteerID': parseInt(volunteerID), 
                        'check_in': check_in , 
                        'volunteerAttendanceItemID' : id, 
                        'location': location,
                        'description': description,
                        'check_out': check_out,
                        'checked_out': true};
            volunteerAttendance.push(row);
            this.setState({volunteerAttendance: volunteerAttendance});
            this.fetchAndBuild();
        }
        else{
            for (let i = 0; i < volunteerAttendance.length; i++) {
                if (volunteerAttendance[i].volunteerAttendanceItemID === id) {
                    name = volunteerAttendance[i].name;
                    description = volunteerAttendance[i].description;
                    location = volunteerAttendance[i].location;
                    check_in = volunteerAttendance[i].check_in;
                    volunteerID = volunteerAttendance[i].volunteerID;
                    volunteerAttendance.splice(i, 1);
                }
            }
            const row = {'name': name, 
                        'volunteerID': volunteerID, 
                        'check_in': check_in , 
                        'volunteerAttendanceItemID' : id, 
                        'location': location,
                        'description': description,
                        'checked_out': false};
            volunteerAttendance.push(row);
            this.setState({volunteerAttendance: volunteerAttendance});
            this.fetchAndBuild();
        }
    }

    openModal() {
        this.setState({showVolunteerModal: true});
    }

    refresh() {
        this.fetchAndBuild();
    }

    closeModal(volunteer=null) {
        const { volunteers } = this.state;
        let suggestions = []

        if (volunteer !== null) {
            // First, add volunteer to volunteers list
            volunteers.push({'first_name': volunteer.first_name, 'last_name': volunteer.last_name, 'id': volunteer.id});
            suggestions = this.makeSuggestionsArray(volunteers);
            // Then, add student to the array.
            this.addVolunteer(null, volunteer.id);
        }

        this.setState({showVolunteerModal: false, volunteers: volunteers, suggestions: suggestions});
    }

    updateDate(e) {
        this.setState({date: e.target.value});
    }

    setDateToToday() {
        this.setState({date: this.getCurrentDate()})
    }

    render() {
        const permissions = getPermissions();
        if (permissions.indexOf('view_volunteerattendanceitems') < 0) {
            return (<Redirect to='/notfound'/>);
        }
        const rows = this.state.volunteerAttendance.map(item =>
            (
               {    
                   name: item.name,
                   check_in: item.check_in,
                   volunteerId: item.volunteer_id,
                   date: this.state.date,
                   location: item.location,
                   description:item.description,
                   check_out: item.check_out,
                   volunteerAttendanceItemID: item.volunteerAttendanceItemID
               }
           )
        ).sort((a, b) => {
            return b.check_in.localeCompare(a.check_in); // For some reason the table doesn't automatically sort.
        });

        const columns = [
            {
                accessor: 'name',
                label: 'Name',
                priorityLevel: 1,
                position: 1,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'check_in',
                label: 'Check-in Time',
                priorityLevel: 2,
                position: 2,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'checkOut',
                label: 'Check-Out Volunteer',
                priorityLevel: 3,
                position: 3,
                CustomComponent: CheckoutVolunteer,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'check_out',
                label: 'Check-out Time',
                priorityLevel: 4,
                position: 4,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'options',
                label: 'Options',
                priorityLevel: 5,
                position: 5,
                CustomComponent: VolunteerAttendanceOptions,
                sortable: false,
                minWidth: 100
            },
            { 
                accessor: 'location',
                label: 'Additonal Info',
                priorityLevel: 6,
                position: 6,
                minWidth: 2000,
                CustomComponent: VolunteerCheckboxes,
                sortable: false, 
            },
        ];

        const buildingCSV = this.state.buildingCSV;

        let buttonToolbar;
        if (this.state.canCreateVolunteer) {
            buttonToolbar = <ButtonToolbar>
                <Button onClick={this.openModal}>Create New Volunteer</Button>
                <Button onClick={this.refresh}>Refresh</Button>
                {!this.state.mobile && <Button onClick={this.setDateToToday}>Go To Today</Button>}
                {!this.state.mobile && <Button onClick={this.downloadCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download'}</Button>}
            </ButtonToolbar>
        } else {
            buttonToolbar = <ButtonToolbar>
                <Button onClick={this.refresh}>Refresh</Button>
                {!this.state.mobile && <Button onClick={this.setDateToToday}>Go To Today</Button>}
                {!this.state.mobile && <Button onClick={this.downloadCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download'}</Button>}
            </ButtonToolbar>
        }

        return (
            <div className='content' style={{minWidth: 'fit-content'}}>
                <AddVolunteerModal  show={this.state.showVolunteerModal} onSubmit={this.closeModal}/>
                <div style={{textAlign: 'center'}}>
                <h1
                style={{fontSize: '25px'}}
                >{this.state.date}</h1> 
                <h1
                style={{marginTop: '0px', fontSize: '30px'}}
                >Volunteer Attendance</h1>
                </div>
                <br/>
                <div style={{marginLeft:'10px'}} >
                <Autocomplete
                    label={'Check-in Volunteer:'}
					suggestions={this.state.suggestionsArray}
					handler={this.addVolunteer}
				/>
                </div>
                <div style={borderStyle()}>
                
                {this.state.mobile?
                    <div 
                    >
                    {<Form inline >
                        <FormGroup >
                            <ControlLabel>Date:</ControlLabel>{' '}
                            <FormControl onChange={this.updateDate} value={this.state.date} type="date"/>
                        </FormGroup>
                    </Form>}
                    </div>
                    :
                    
                    <div 
                style = {{float: 'right'}}>
                {<Form inline >
                    <FormGroup >
                        <ControlLabel>Date:</ControlLabel>{' '}
                        <FormControl onChange={this.updateDate} value={this.state.date} type="date"/>
                    </FormGroup>
                </Form>}
                </div>
                }
                
                <div>
                {buttonToolbar}
                </div>
                <br />
                <div
                style={whiteBorderStyle()}>
                <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        column = {'check_in'}
                        direction = {'descending'}
                        showPagination={ true }
                        callbacks = {{'options':this.removeVolunteerAttendanceRow, 'checkOut':this.checkOutVolunteer}}
                />
                </div>
            </div>
            </div>
        )
    }
}

export default Volunteers;