import React from 'react';
import ReactCollapsingTable from 'react-collapsing-table';
import { Button, ButtonToolbar, Form } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Layout from '../components/Layout';
import ActivityCheckboxes from '../components/ActivityCheckboxes';
import AttendanceOptions from '../components/AttendanceOptions';
import AddStudentModal from '../components/AddStudentModal';
import Autocomplete from "../components/Autocomplete";
import { getPermissions, downloadAttendanceCSV, compareActivities, dateToString, getEarlierDate, borderStyle, whiteBorderStyle } from '../components/Helpers';
import { httpPost, httpGet, domain, protocol } from '../components/Helpers';

class Attendance extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            buildingCSV: false,
            students: [],
            activities: [],
            attendanceItems: [],
            suggestionsArray: [],
            attendance: [],
            showStudentModal: false,
            date: this.getCurrentDate(),
            prevDate: '',
            canCreateStudent: false,
            canVeiwFlags: false,
            studentFlags: {},
            mobile: (window.innerWidth < 768),
        }

        this.downloadCSV = this.downloadCSV.bind(this);
        this.addStudent = this.addStudent.bind(this);
        this.removeAttendanceRow = this.removeAttendanceRow.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.updateDate = this.updateDate.bind(this);
        this.setDateToToday = this.setDateToToday.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
        this.fetchAndBuild() //this causes a shitton of rerendering but is necessary because of 2019's ways of initializing states
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
        let {studentFlags} = this.state;
        try {
            const students = await httpGet(`${protocol}://${domain}/api/students/`);
            const attendanceItems = await httpGet(`${protocol}://${domain}/api/attendance/?day=${date}`);
            let activities = await httpGet(`${protocol}://${domain}/api/activities/`);
            const permissions = getPermissions()
            let studentFields = [];
            let canCreateStudent = false;
            if (permissions.includes('add_students')) {
                studentFields = await httpGet(`${protocol}://${domain}/api/student_column/?quick_add=True`);
                canCreateStudent = true;
            }
            let canViewFlags = false;
            if(permissions.indexOf('add_studentflags') >= 0) {
                canViewFlags = true;
                for (var i = 0; i < attendanceItems.length; i++) {
                    let flags = await httpGet(`${protocol}://${domain}/api/flags/?student_id=${attendanceItems[i].student_id}&date=${date}&startdate=${dateToString(getEarlierDate(7))}&type=${"notifications"}`);
                    studentFlags[attendanceItems[i].student_id] = flags;
                }
            }
            activities = activities.filter(item => item.is_showing === true);
            activities.sort(compareActivities)
            const suggestions = this.makeSuggestionsArray(students);
         

            this.setState({
                suggestionsArray: suggestions,
                students: students,
                activities: activities,
                studentFields : studentFields,
                attendanceItems: attendanceItems,
                canCreateStudent: canCreateStudent,
                canViewFlags: canViewFlags,
                studentFlags: studentFlags
            });
        } catch (e) {
            console.log(e);
        }
        this.buildSheet(); //TODO: figure out if this should be moved into the try statement
    }

    buildSheet() {
        const { activities, attendanceItems, students, studentFlags } = this.state;
        // Combine attendance items. Need to sort by student id.
        var entries = {};
        for (let i = 0; i < attendanceItems.length; i++) {
            if (attendanceItems[i].activity_id === -1) {
                continue;
            }
            if (entries[`${attendanceItems[i].student_id}`] == null) {
                entries[`${attendanceItems[i].student_id}`] = {'time':attendanceItems[i].time};
            }
            let value = true;
            if (attendanceItems[i].num_value !== null) {
                value = attendanceItems[i].num_value;
            } else if (attendanceItems[i].str_value !== null) {
                value = attendanceItems[i].str_value;
            }
            entries[`${attendanceItems[i].student_id}`][attendanceItems[i].activity_id] = {'value':value, 'itemID':attendanceItems[i].id};
        }

        // Build table of the form [{name, activity1, ... , activityn, time}]
        var sheet = [];
        const ids = Object.keys(entries);
        var columns = ['Name'];
        var today = getEarlierDate(0);
        var todayDateString = dateToString(today);
        var weekEarlier = getEarlierDate(7);
        var weekEarlierString = dateToString(weekEarlier);

        for (let i = 0; i < activities.length; i++) {
            columns.push(activities[i].name);
        }
        for (let i = 0; i < ids.length; i++) {
            var row = {}
            // match student data to current id
            for (let j = 0; j < students.length; j++) { // unfortunately, student data isn't in any particular order. O(n) it is!
                if (students[j].id === parseInt(ids[i])) {
                    row['name'] = `${students[j].first_name} ${students[j].last_name}`;
                    row['studentID'] = students[j].id;
                    break;
                }
            } 
            row['time'] = entries[ids[i]].time;
            row['activities'] = {};
            // fill in activities data
            for (let j = 0; j < activities.length; j++) {
                let value;
                if (!entries[ids[i]][activities[j].activity_id]) {
                    if (activities[j].type === 'boolean') {
                        value = false;
                    } else {
                        value = '';
                    }
                } else {
                    value = entries[ids[i]][activities[j].activity_id].value;
                }
                row['activities'][activities[j].name] = {
                    'value': value,
                    'activityID': activities[j].activity_id,
                    'type': activities[j].type,
                    'attendanceItemID': (entries[ids[i]][activities[j].activity_id]) ? entries[ids[i]][activities[j].activity_id].itemID : 0,
                }
            }
            if (this.state.canViewFlags === true){
                let flags = studentFlags[row['studentID']].notifications;
                row['notifications'] = flags;
                
            }
            sheet.push(row)
        }

        this.setState({ attendance: sheet });
    }

    async addStudent(e, studentID) {
        const { students, attendance, activities, date } = this.state;
        const today = new Date();
        const self = this;

        // make sure we don't already have this student.
        for (let i = 0; i < attendance.length; i++) {
            if (parseInt(studentID) === attendance[i].studentID) {
                return;
            }
        }

        httpPost(`${protocol}://${domain}/api/attendance/`, {
            "student_id": studentID,
            "activity_id": 7, // Key    
            "date":`${date}`,
            "time":`${today.getHours()}:${today.getMinutes() >= 10 ? today.getMinutes() : `0${today.getMinutes()}`}:${today.getSeconds() >= 10 ? today.getSeconds() : `0${today.getSeconds()}`}`,
        }).then(function(result) {
            if ('error' in result) {
                result.response.then(function(response) {alert(`Error: ${response.error}`)});
            } else {
                // Add new row to table
                let name = "";
                for (let j = 0; j < students.length; j++) {
                    if (students[j].id === parseInt(studentID)) {
                        name = `${students[j].first_name} ${students[j].last_name}`;
                        break;
                    }
                }

                let activityList = {};
                for (let j = 0; j < activities.length; j++) {
                    const type = activities[j].type;
                    const value = type === 'boolean' ? false : '';
                    activityList[activities[j].name] = {
                        'activityID': activities[j].activity_id,
                        'attendanceItemID': 0,
                        'value': value,
                        'type': type
                    }
                }
                activityList['Key']['value'] = true;
                activityList['Key']['attendanceItemID'] = result.id;

                const row = { 'name': name, 'studentID': parseInt(studentID), 'time': result.time, 'notifications': "", 'activities': activityList };
                attendance.push(row);
                self.setState({ attendance: attendance });
            }
        });
        // Refresh attendance page.
        await this.fetchAndBuild();
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
        await downloadAttendanceCSV(`${this.state.date}`)
        this.setState({ buildingCSV: false });
    }

    // Allows the AttendanceOptions object to  update state here
    removeAttendanceRow(studentID) {
        const { attendance } = this.state;
        for (let i = 0; i < attendance.length; i++) {
            if (attendance[i].studentID === studentID) {
                attendance.splice(i, 1);
            }
        }
        this.setState({attendance: attendance});
    }

    openModal() {
        this.setState({showStudentModal: true});
    }

    refresh() {
        this.fetchAndBuild();
    }

    closeModal(student=null) {
        const { students } = this.state;
        let suggestions = []

        if (student !== null) {
            // First, add student to students list
            students.push({'first_name': student.first_name, 'last_name': student.last_name, 'id': student.id});
            suggestions = this.makeSuggestionsArray(students);
            // Then, add student to the array.
            this.addStudent(null, student.id);
        }

        this.setState({showStudentModal: false, students: students, suggestions: suggestions});
    }

    updateDate(e) {
        this.setState({date: e.target.value});
    }

    setDateToToday() {
        this.setState({date: this.getCurrentDate()})
    }

    render() {
        console.log("attendance has rendered", this)
        const permissions = getPermissions();
        
        if (permissions.includes('view_attendanceitems')) {

            const rows = this.state.attendance.map(item =>
                (
                {
                    name: item.name,
                    time: item.time,
                    activities: item.activities,
                    studentID: item.studentID,
                    date: this.state.date,
                    notifications: item.notifications,
                }
            )
            ).sort((a, b) => {
                return b.time.localeCompare(a.time); // For some reason the table doesn't automatically sort.
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
                    accessor: 'time',
                    label: 'Check-in Time',
                    priorityLevel: 2,
                    position: 2,
                    minWidth: 100,
                    sortable: true
                },
                {
                    accessor: 'options',
                    label: 'Options',
                    priorityLevel: 3,
                    position: 3,
                    CustomComponent: AttendanceOptions,
                    sortable: false,
                    minWidth: 100
                },
                {
                    accessor: 'notifications',
                    label: 'Notifications',
                    priorityLevel: 4,
                    position: 4,
                    sortable: false,
                    minWidth: 100
                },
                { 
                    accessor: 'activities',
                    label: 'Activities',
                    priorityLevel: 4,
                    position: 4,
                    minWidth: 2000,
                    CustomComponent: ActivityCheckboxes,
                    sortable: false, 
                }
            ];

            const buildingCSV = this.state.buildingCSV;

            let buttonToolbar;
        if (this.state.canCreateStudent) {
            buttonToolbar = <ButtonToolbar style={{ marginBottom: '2em'}}>
                <Button onClick={this.openModal}>Create New Student
                </Button>
                <Button onClick={this.refresh}>Refresh</Button>
                {!this.state.mobile && <Button onClick={this.setDateToToday}>Go To Today</Button>}
                {!this.state.mobile && <Button onClick={this.downloadCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download'}</Button>}
            </ButtonToolbar>
        } else {
            buttonToolbar = <ButtonToolbar style={{  marginBottom: '2em'}}>
                <Button onClick={this.refresh}>Refresh</Button>
                {!this.state.mobile && <Button onClick={this.setDateToToday}>Go To Today</Button>}
                {!this.state.mobile && <Button onClick={this.downloadCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download'}</Button>}
            </ButtonToolbar>
        }

            return (
                <div className='content' style={{minWidth: 'fit-content'}}>
                    <Layout {...this.history}/>
                    <AddStudentModal studentFields={this.state.studentFields} show={this.state.showStudentModal} onSubmit={this.closeModal}/>
                    <div style={{textAlign: 'center'}}>
                <h1
                style={{fontSize: '25px'}}
                >{this.state.date}</h1> 
                <h1
                style={{marginTop: '0px', fontSize: '30px'}}
                >Attendance</h1>
                </div>
                <br/>
                <div style={{marginLeft:'10px'}} >
                        <Autocomplete
                            
                            label={'Check-in Student:'}
                            suggestions={this.state.suggestionsArray}
                            handler={this.addStudent}
                        />
                        </div>
                        
                        <div style={borderStyle()}>
                        {this.state.mobile?
                            <div 
                            >
                            {<Form>
                                <Form.Group >
                                    <Form.Label>Date:</Form.Label>{' '}
                                    <Form.Control onChange={this.updateDate} value={this.state.date} type="date"/>
                                </Form.Group>
                            </Form>}
                            </div>
                            :
                            
                            <div 
                        style = {{float: 'right'}}>
                        {<Form inline >
                            <Form.Group >
                                <Form.Label>Date:</Form.Label>{' '}
                                <Form.Control onChange={this.updateDate} value={this.state.date} type="date"/>
                            </Form.Group>
                        </Form>}
                        </div>
                        }
                        
                        <div>
                        {buttonToolbar}
                        </div>
                        <div
                        style={whiteBorderStyle()}>
                        <ReactCollapsingTable
                                rows = { rows }
                                columns = { columns }
                                column = {'time'}
                                direction = {'descending'}
                                showPagination={ true }
                                callbacks = {{'options':this.removeAttendanceRow}}
                        />
                        </div>
                    </div>
                </div>
            );
        } else {
            return (<Redirect to='/notfound' />);
        }
    }
}

export default Attendance;