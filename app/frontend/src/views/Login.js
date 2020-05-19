

import React from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Redirect } from 'react-router-dom'; //for when you're already logged in: bypass the login page
import { domain, protocol } from '../components/Helpers';

class Login extends React.Component {

    constructor(props) {
		super(props)
		
        this.state = {
			username: "",
            password:"",
            error: false,
            firstLogin: true
		}
		
		this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() { //this is always invoked as soon as a react component is mounted: https://reactjs.org/docs/react-component.html
        if (window.localStorage.getItem('loggedIn') != null) {
            this.setState({firstLogin: false});
        }
    }

    onUsernameChange(e) {
		this.setState({username: e.target.value})
	}

	onPasswordChange(e) {
		this.setState({password: e.target.value})
    }

    submit(e) {
        e.preventDefault();
        // Submit username and password to backend
        fetch(`${protocol}://${domain}/api-token-auth/`, {
            method: "POST", 
            headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({username: this.state.username, password: this.state.password})
        }).then(response => {
            if (response.status >= 400) {
                // If we get a negative response, display some sort of error and wipe the fields. (see bottom of <Form>)
                this.setState({error: true, username: "", password: ""});
            } else {
                response.json().then(result => {
                    // Store token in browser
                    window.localStorage.setItem("key_credentials", result.token);
                    // Store permissions in browser
                    window.localStorage.setItem("permissions", result.permissions);
                    // Flag that we've logged in before
                    window.localStorage.setItem("loggedIn", 'true');
                    this.props.history.push(`/attendance`);
                })
            }
        });
    }

    render() {
        //console.log("login has rendered", this)
        const token = window.localStorage.getItem("key_credentials");

        //if we're already logged in, just redirect to /attendance
        if (token !== null) {
            return (<Redirect to='/attendance'/>);
        } else {
            return (
                <div className='center'>
                    <div className='login-container'>
                        <h1 className='center-text' children='Key Attendance'/> {/** We can use the built in children prop... */}
                        <h6 className='center-text'>Sign In</h6> {/** ...to do stuff like this (same effect, different way!) */}
                        <Form onSubmit={e => this.submit(e)}>
                            <Form.Group>
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.state.username}
                                    placeholder="Username"
                                    onChange={this.onUsernameChange}
                                />
                                <br/>
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={this.state.password}
                                    placeholder='Password'
                                    onChange={this.onPasswordChange}
                                />
                            </Form.Group>
                            <Button block type="submit" variant="primary">Continue</Button>
                            <br/>
                            <Alert show={!this.state.firstLogin} variant='info'>You have been logged out.</Alert>
                            <Alert show={this.state.error} variant='danger'>Invalid username or password.</Alert>
                        </Form>
                    </div>
                </div> 
            );
        }
    }
}

export default Login;