import React from 'react';
import { Button, Alert, Modal } from 'react-bootstrap';
import { httpPost, domain, protocol } from './Helpers';
import FlagCheckbox from './FlagCheckbox';

class AddFlagModal extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
			name: "",
			show: false,
            student_id: '',
            date: '',
            food: false,
            house: false,
            edu: false,
            mental:false,
            notes: '',
            numChecked: 0,
            error: false,
            errorMsg: ''
            
		}
		
		this.cancel = this.cancel.bind(this);
        this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
	}

	componentDidUpdate() {
        if (this.props.show !== this.state.show) {
			const name = this.props.studentInfo.first_name;
			const student_id = this.props.student_id;
			const date = this.getCurrentDate();
            this.setState({
				show: this.props.show,
				name: name,
                student_id: student_id,
                date: date
			});
        }
    }

    getCurrentDate() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        return `${today.getFullYear()}-${month >= 10 ? month : `0${month}`}-${day >= 10 ? day : `0${day}`}`
    }

	cancel() {
		this.setState({
			firstName: "",
			lastName:"",
		});
		this.props.onSubmit();
    }
    
    handleChange = e => {
        this.setState({ notes: e.target.value });                                                                                                   
    }

	createCheckboxes = () => {
        var boxes = [];
        boxes.push(
            <FlagCheckbox
                label='Education/Employment'
                activityType='boolean'
                checked = {this.state.edu}
                toggleCheckbox={this.toggleCheckbox}
            />
        )
        boxes.push(
            <FlagCheckbox
                label='Mental Health'
                activityType='boolean'
                checked = {this.state.mental}
                toggleCheckbox={this.toggleCheckbox}
            />
        )
        boxes.push(
            <FlagCheckbox
                label='Housing Insecurity'
                activityType='boolean'
                checked = {this.state.house}
                toggleCheckbox={this.toggleCheckbox}
            />
        )
        boxes.push(
            <FlagCheckbox
                label='Food Insecurity'
                activityType='boolean'
                checked = {this.state.food}
                toggleCheckbox={this.toggleCheckbox}
            />
        )
        return boxes;
	}

	submit(){
        const self = this;
        if (self.state.food === false && self.state.edu === false && self.state.house === false && self.state.mental === false){
            self.setState({error: true, errorMsg: "You must check at least one of the fields"});
        }else{
            self.setState({
                error: false,
                errorMsg: '',
            });
            httpPost(`${protocol}://${domain}/api/flags/`, {
                "student_id": self.state.student_id,
                "date": self.state.date,
                "food_insecurity_tag": self.state.food,
                "housing_tag": self.state.house,
                "acedemics_employment_tag": self.state.edu,
                "mental_health_tag": self.state.mental,
                "notes": self.state.notes
            }).then(function (result) {
                if ('error' in result) {
                result.response.then(function (response) { alert(`Error: ${response.error}`) });
                }else{
                    self.setState({
                        name: "",
                        show: false,
                        student_id: '',
                        date: '',
                        food: false,
                        house: false,
                        edu: false,
                        mental:false,
                        notes: '',
                        numChecked: 0,
                        error: false,
                        errorMsg: ''
                    });
                    self.props.onSubmit();
                }
            });
        }
	}


	toggleCheckbox = (isChecked, label) => {

        this.setState({isChecked});
        if(isChecked){
            isChecked = !isChecked;
            if (label === 'Food Insecurity'){
               this.setState({food: false})
            } 
            else if (label === 'Education/Employment'){
               this.setState({edu: false})
            }
            else if (label === 'Mental Health'){
                this.setState({mental: false})
            } 
            else if (label === 'Housing Insecurity'){
                this.setState({house: false})
            }
        }else{
            isChecked = !isChecked;
            if (label === 'Food Insecurity'){
                this.setState({food: true})
             } 
             else if (label === 'Education/Employment'){
                this.setState({edu: true})
             }
             else if (label === 'Mental Health'){
                 this.setState({mental: true})
             } 
             else if (label === 'Housing Insecurity'){
                 this.setState({house: true})
             }
        }

    }

    render() {
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Report New Flags</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{this.createCheckboxes()}
                    <div>
                        <h5>Notes:</h5>
                        <input type="text" id="note" onChange={this.handleChange}></input>
                    </div>
				</Modal.Body>

				<Modal.Footer>
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={this.submit} bsStyle="primary">Submit</Button>
                    {this.state.error && <Alert bsStyle='danger'>{this.state.errorMsg}</Alert>}
				</Modal.Footer>
			</Modal>
        )
    }
}

export default AddFlagModal;