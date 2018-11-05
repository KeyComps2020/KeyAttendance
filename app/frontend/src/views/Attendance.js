import React from 'react';
import ReactCollapsingTable from 'react-collapsing-table';
import Checkboxes from './Checkboxes';
import NameForm from "./NameForm.js";
import { Button } from 'react-bootstrap';
import { downloadAttendanceCSV } from '../components/Helpers';

class Attendance extends React.Component {
    state = {
        keys: []
    };

    async componentDidMount() {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/');

            const keys = await res.json();
            console.log(keys);
            this.setState({
                keys
            });
        } catch (e) {
            console.log(e);
        }
    }



    constructor(props) {
        super(props);

        this.state = {
            buildingCSV: false
        }

        this.downloadCSV = this.downloadCSV.bind(this);
    }

    downloadCSV() {
        const today = new Date()
        this.setState({ buildingCSV: true });
        downloadAttendanceCSV('2018-02-13') // `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
        this.setState({ buildingCSV: false });
    }
    
    render() {
         const rows = this.state.keys.map(item =>
             (
                {
                    id: item.id,
                    firstName: item.first_name,
                    lastName: item.last_name
                }));

         const columns = [
             {
             accessor: 'firstName',
             label: 'First Name',
             priorityLevel: 1,
             position: 1,
             minWidth: 100
            },
             {
                 accessor: 'lastName',
                 label: 'Last Name',
                 priorityLevel: 2,
                 position: 2,
                 minWidth: 100
             },
             {accessor: 'timeCheckedIn',
                label: 'Time Checked In',
                 priorityLevel: 3,
                position: 3,
                minWidth: 100},
             { accessor: 'activities',
                 label: 'Activities',
                 priorityLevel: 4,
                 position: 4,
                 minWidth: 2000,
                 CustomComponent: Checkboxes,
                 sortable: false, }];

        const buildingCSV = this.state.buildingCSV;
        return (
            <div className='content'>
                <h1>Attendance</h1>

                <NameForm />
                <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        showPagination={ true }
                />
                <Button onClick={this.downloadCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download'}</Button>
            </div>
        )
    }
}



export default Attendance;