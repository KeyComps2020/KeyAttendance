import React from 'react';
import { Button, Form, Badge } from 'react-bootstrap';

class FileUploader extends React.Component {
	
	constructor() {
	  super();
	  this.state = {
		file: undefined,
		error: "",
	  };

	  this.submit = this.submit.bind(this);
	}
  
	handleChange = event => {
		const file = event.target.files[0];

		// if we don't have a filetype requirement or the file matches the type requirement
		if (!this.props.extension || file.name.indexOf(this.props.extension) >= 0) {
			this.setState({
				file: file,
				error: ""
			});
		} else {
			this.setState({
				error: "Invalid file type"
			})
		}
	};

	submit() {
		if (this.state.file !== undefined) {
			this.props.upload(this.state.file);
			this.setState({file: undefined});
			this.setState({error: "Upload Successful"});
		}
	}
  
	render() {
	  return (//TODO: figure out if the input tag should be a Form.Control tag.
		<Form>
			<Form.Group>
			<Form.Label style={{display: 'inline-block'}}>{this.props.label}</Form.Label>{' '}
					<input style={{display: 'inline-block'}} onChange={this.handleChange} placeholder={null} type="file"/>
				{' '}<Button style={{display: 'inline-block'}} onClick={this.submit}>Upload</Button>
			</Form.Group>
			{this.state.error !== "Upload Successful" && <Badge variant="danger">{this.state.error}</Badge>}
			{this.state.error === "Upload Successful" && <Badge variant="success">{this.state.error}</Badge>}		
		</Form>
	  );
	}
  }
  
  export default FileUploader;