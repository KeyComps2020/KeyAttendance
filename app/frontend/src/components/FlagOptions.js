import React from 'react';
import { Button } from 'react-bootstrap';
import { httpDelete, getPermissions, domain, protocol } from './Helpers';

class FlagOptions extends React.Component {
    
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
        if (this.props.row['id'] !== this.state.row['id']) {
            this.setState({
                row: this.props.row,
            })
        }
    }

    deleteRow() {
        const permissions = getPermissions();
        if (permissions.indexOf('delete_studentflags') < 0) {
            alert('Error: You are not authorized to delete a flag');
        } else {
            const { row } = this.state;
            const id = row['id'];

            httpDelete(`${protocol}://${domain}/api/flags/?id=${id}`);

            this.props.CustomFunction(row['id']);
        }
    }

    render() {
        return(
            <Button 
                bsStyle="danger" 
                onClick={(e) => { if (window.confirm('Are you sure you wish to delete this flag?')) this.deleteRow(e)}}>Delete
            </Button>
        )
    }
}

export default FlagOptions;
