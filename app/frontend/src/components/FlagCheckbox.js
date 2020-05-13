import React, { Component } from 'react';
import PropTypes from "prop-types";

class FlagCheckbox extends Component {
    state = {
        isChecked: false,
        value: '',
        activityType: ''
    };

    componentDidMount() {
        this.setState({ isChecked: this.props.checked, value: this.props.value, activityType: this.props.activityType});
    }

    componentDidUpdate() {
        if (this.props.checked !== this.state.isChecked) {
            this.setState({ isChecked: this.props.checked, value: this.props.value, activityType: this.props.activityType });
        }
    }

    // Handles checked/unchecked state of checkbox
    toggleCheckboxChange = () => {
        const { toggleCheckbox, label } = this.props;
        toggleCheckbox(this.state.isChecked, label, this.state.value, this.state.activityType)
    };

    handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(prevstate => {
            const newState = { ...prevstate };
            newState[name] = value;
            return newState;
        });
    };

    render() {
        const { label } = this.props;
        const { isChecked, activityType } = this.state;

        let checkbox = <span className="checkbox">
            <label>
                <input
                    type="checkbox"
                    value={label}
                    checked={isChecked}
                    onChange={this.toggleCheckboxChange}
                />
                {label}
            </label>
        </span>;
        return (
            <span className="checkbox">
                {checkbox}
            </span>)
         
    }
}

FlagCheckbox.propTypes = {
    label: PropTypes.string.isRequired,
    toggleCheckbox: PropTypes.func.isRequired
};

export default FlagCheckbox;
