import React from 'react';
import ActivityCheckbox from'./ActivityCheckbox.js'
import { Label } from 'react-bootstrap';
import { httpDelete, httpPost, domain, protocol } from './Helpers';

class FlagCheckboxes extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            flags: {},
            error: "",
            errorMsg: "",
            numChecked: 0,
            date: ''
        }

        this.toggleCheckbox = this.toggleCheckbox.bind(this)
    }

    componentDidMount() {
        let numChecked = 0;
        const flags = this.props.row['flags']
        const keys = Object.keys(flags);
        for (let i = 0; i < keys.length; i++) {
            if (flags[keys[i]].type === 'boolean') {
                if (flags[keys[i]].value === true) {
                    numChecked++;
                }
            } else {
                if (flags[keys[i]].value !== '') {
                    numChecked++;
                }
            }
        }

        this.setState({
            flags: flags,
            studentID: this.props.row.studentID,
            numChecked: numChecked,
            date: this.props.row.date
        });
    }

    toggleCheckbox()
    createCheckboxes = () => {
        const { flags } = this.state;
        var boxes = [];
    
        boxes.push(
            <ActivityCheckbox
                type="checkbox"
                value={"Food Insecurity"}
                checked={isChecked}
                onChange={this.toggleCheckbox}
            />
        )
        boxes.push(
            <ActivityCheckbox
                type="checkbox"
                value={"Housing Insecurity"}
                checked={isChecked}
                onChange={this.toggleCheckbox}
            />
        )
        boxes.push(
            <ActivityCheckbox
                type="checkbox"
                value={"Food Insecurity"}
                checked={isChecked}
                onChange={this.toggleCheckbox}
            />
        )
        boxes.push(
            <ActivityCheckbox
                type="checkbox"
                value={"Mental Wellbeing"}
                checked={isChecked}
                onChange={this.toggleCheckbox}
            />
        )
        return boxes;
    };

}