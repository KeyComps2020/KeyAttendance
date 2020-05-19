import React from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { httpPatch, domain, protocol, httpGet } from './Helpers';

class ChangeStudentStatusParams extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
            show: false,
            frequent: '',
            attendee: '',
            time_range: '',
            type: 'number',
            quickAdd: false,
            error: false,
            errorMsg: ''
		}
		
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validateInput = this.validateInput.bind(this);
    }
    
    async componentDidUpdate() {
        if (this.props.show !== this.state.show) {
            const current = await httpGet(`${protocol}://${domain}/api/status/?type=${'status_info'}`);
            let frequent = current['status']['frequent'];
            let attendee = current['status']['attendee'];
            let time_range = current['status']['time_range'];
            this.setState({
                show: this.props.show,
                frequent: frequent,
                attendee: attendee,
                time_range: time_range
            });
        }
    }

    async componentDidMount() {
        const current = await httpGet(`${protocol}://${domain}/api/status/?type=${'status_info'}`);
        let frequent = current['frequent'];
        let attendee = current['attendee'];
        let time_range = current['time_range'];
        this.setState({
            frequent: frequent,
            attendee: attendee,
            time_range: time_range
        })

    }

    validateInput() {
		const { frequent, attendee, time_range } = this.state;
        const regex = /^\d+$/;
        let success = true;
        if (frequent >= 0 && attendee >= 0 && regex.test(attendee) && regex.test(frequent) && time_range >= 0 && regex.test(time_range) && this.state.type){
            return 'success';
        }else{
            return 'error';
        }
    }
    
    handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(prevstate => {
            const newState = { ...prevstate };
            newState[name] = value;
            return newState;
        });
    };

	cancel() {
        this.setState({
            show: false,
            frequent: '',
            attendee: '',
            time_range: '',
            type: 'number',
            quickAdd: false,
            error: false,
            errorMsg: ''
        });
		this.props.onSubmit();
	}

	submit() {
        const self = this;
        if (self.validateInput() !== 'success') {
            const errorMsg = 'Invalid input. Your input should be a number.'
            self.setState({
                error: true,
                errorMsg: errorMsg
            });
            return;
        }
        let body = {
            frequent: self.state.frequent,
            attendee: self.state.attendee,
            time_range: self.state.time_range,
        }
        httpPatch(`${protocol}://${domain}/api/status/`, body)
            .then(function (result) {
                if ('error' in result) {
                    if (result['error'] === 400) {
                        const errorMsg = 'Change failed due to invalid input. Please check your fields and try again';
                        self.setState({
                            error: true,
                            errorMsg: errorMsg
                        });
                        return;
                    } else {
                        result.response.then(function(response) {
                            self.setState({
                                error: true,
                                errorMsg: response.error
                            });
                        });
                    }
                } else {
                    self.setState({
                        show: false,
                        frequent: '',
                        attendee: '',
                        time_range: '',
                        type: 'number',
                        quickAdd: false,
                        error: false,
                        errorMsg: ''
                    });
                    self.props.onSubmit(result);
                }
            })
    }
    
    render() {
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Change Frequent User/Attendee Range</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form>
                        <Form.Group
                            validationState={this.validateInput()}>
                            <Form.Label>Benchmark Attendance for Frequent User:</Form.Label>
                            <br/>
                            <Form.Control
                                type="text"
                                name="frequent"
                                value={this.state.frequent}
                                defaultValue={this.state.frequent}
                                placeholder= {this.state.frequent}
                                onChange={this.handleChange}
							/>
                            <br/>
                            <br/>
                            <Form.Label>Benchmark Attendance for Attendee:</Form.Label>
                            <br/>
                            <Form.Control
                                type="text"
                                name="attendee"
                                value={this.state.attendee}
                                defaultValue={this.state.attendee}
                                placeholder= {this.state.attendee}
                                onChange={this.handleChange}
							/>
							<br/>
                            <br/>
                            <Form.Label>Within how many days?</Form.Label>
                            <br/>
                            <Form.Control
                                type="text"
                                name="time_range"
                                value={this.state.time_range}
                                defaultValue={this.state.time_range}
                                placeholder={this.state.time_range}
                                onChange={this.handleChange}
							/>
						</Form.Group>
					</Form>
				</Modal.Body>

				<Modal.Footer>
                    {this.state.error && <Alert bsStyle='danger'>{this.state.errorMsg}</Alert>}
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={this.submit} bsStyle="primary">Create</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default ChangeStudentStatusParams;