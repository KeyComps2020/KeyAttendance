import React from 'react';
import { Button, FormControl, Form, Modal } from 'react-bootstrap';
import { httpPost, domain, protocol } from './Helpers';

class AddStudentModal extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
			firstName: "",
			lastName:"",
			show: false,
			studentFields: {},
			studentInfo: {},
		}
		
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
		this.onFirstNameChange = this.onFirstNameChange.bind(this);
		this.onLastNameChange = this.onLastNameChange.bind(this);
		this.handleInfoChange = this.handleInfoChange.bind(this);
	}

	componentDidUpdate() {
        if (this.props.show !== this.state.show) {
			let studentInfo = {};
			const fieldsList = this.props.studentFields;
			let studentFields = {};
			for (var index in fieldsList) {
				studentInfo[fieldsList[index].name] = '';
				studentFields[fieldsList[index].name] = fieldsList[index];
			}
            this.setState({
				show: this.props.show,
				studentFields: studentFields,
				studentInfo: studentInfo,
			});
        }
    }

	validateInput() {
		const { firstName, lastName } = this.state;
		if (firstName.length > 0 && lastName.length > 0) {
			return 'success';
		} else if (firstName.length === 0 && lastName.length === 0) {
			return null;
		} else {
			return 'error';
		}
	}

	onFirstNameChange(e) {
		this.setState({firstName: e.target.value})
	}

	onLastNameChange(e) {
		this.setState({lastName: e.target.value})
	}
	
	cancel() {
		this.setState({
			firstName: "",
			lastName:"",
		});
		this.props.onSubmit();
	}

	createStudentInfo(name, value, student_id, self) {
		const {studentFields} = self.state;
		const field = studentFields[name];
		let body = {student_id: student_id, info_id: field.info_id};
		if (field.type === 'str') {
			body['str_value'] = value;
		} else if (field.type === 'int') {
			body['int_value'] = value;
		} else if (field.type === 'date') {
			body['date_value'] = value;
		}
		return body;
	}

	submit() {
		const self = this;
		httpPost(`${protocol}://${domain}/api/students/`, {
			first_name: this.state.firstName,
			last_name: this.state.lastName
		}).then(function(result) {
			if ('error' in result) {
				console.log(result);
			} else {
				const student_id = result.id;
				const {studentInfo} = self.state;
				let infoBody = [];
				for (var field in studentInfo) {
					if (studentInfo[field] !== '') {
						infoBody.push(self.createStudentInfo(field, studentInfo[field], student_id, self));
					}
				}
				httpPost(`${protocol}://${domain}/api/student_info/`, infoBody)
					.then(function (infoResult) {
						if ('error' in infoResult) {
							console.log(infoResult);
						} else {
							self.setState({
								firstName: "",
								lastName: "",
						});
						self.props.onSubmit(result);
					}
				})
			}
		})
	}

	createStudentInfoFields () {
		let info = [];
		const { studentFields } = this.state;
		for (var fieldName in studentFields) {
			const field = studentFields[fieldName];
			let type;
			switch (field.type) {
				case 'str':
					type = "text";
					break;
				case 'int':
					type = "int";
					break;
				case 'date':
					type = "date";
					break;
				default:
					break;
			}
			info.push(	<div  key={field.info_id}>
							<Form.Label>{fieldName}</Form.Label>
							<Form.Control value={this.state.studentInfo[fieldName]} name={fieldName} type={type} onChange={this.handleInfoChange} />
							<br/>
						</div>);
		}
		return info;
	}

	handleInfoChange = e => {
        const name = e.target.name;
		const value = e.target.value;
		let { studentInfo } = this.state;
		studentInfo[name] = value;
        this.setState({
			studentInfo
        });
    };

    render() {
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Create New Student</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form>
						<Form.Group
							controlId="addStudentForm"
							validationState={this.validateInput()}
						>
							<Form.Label>First Name</Form.Label>
							<Form.Control
								type="text"
								value={this.state.firstName}
								placeholder="First"
								onChange={this.onFirstNameChange}
							/>
							<FormControl.Feedback />
							<br/>
							<Form.Label>Last Name</Form.Label>
							<Form.Control
								type="text"
								value={this.state.lastName}
								placeholder="Last"
								onChange={this.onLastNameChange}
							/>
							<br/>
							{this.createStudentInfoFields()}
							<FormControl.Feedback />
						</Form.Group>
					</Form>
				</Modal.Body>

				<Modal.Footer>
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={this.submit} variant="primary">Create</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default AddStudentModal;
