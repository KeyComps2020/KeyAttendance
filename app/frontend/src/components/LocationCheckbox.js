import React, { Component } from 'react';
import PropTypes from "prop-types";

class LocationCheckbox extends Component {
    state = {
        isChecked: false,
        value: '',
    };
    
    componentDidMount() {
        this.setState({ isChecked: this.props.checked, value: this.props.value});
    }

    componentDidUpdate() {
        if (this.props.checked !== this.state.isChecked) {
            this.setState({ isChecked: this.props.checked, value: this.props.value});
        }
    }


    toggleCheckboxChange = () => {
        const { toggleCheckbox } = this.props;
        toggleCheckbox(this.state.isChecked, this.state.value)
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
        const { isChecked, value } = this.state;

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
        let input;
        input = <input
                    type="text"
                    value={value}
                    name="value"
                    disabled = {isChecked}
                    onChange={this.handleChange}
                />
        return (
            <span className="checkbox">
                {checkbox}
                {input}
            </span>
        )

    }
}

LocationCheckbox.propTypes = {
    label: PropTypes.string.isRequired,
    toggleCheckbox: PropTypes.func.isRequired
};

export default LocationCheckbox;
