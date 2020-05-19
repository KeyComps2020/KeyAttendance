import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router-dom';
import Login from './views/Login';
import Attendance from './views/Attendance';
import Students from './views/Students';
import Volunteers from './views/Volunteers';
import Reports from './views/Reports';
import Admin from './views/Admin';
import NotFound from './views/NotFound';


/**
 * These two functions are used inside of the APP class, but don't need access to its state,
 * so they can exist outside of the class. 2019 originally put them in the Helpers.js file
 * which is where all the other functions like this are, but 2020 realized that these ones 
 * are only used here, so we just moved them to make things more obvious.
*/
// Note: NotFound.js also has a quick token check to see if you should be redirected to login
const checkToken = (Component, history) => { //this is equivalent to function(comp) {etc} but 2020 thinks ES6 is spicy af
  const token = window.localStorage.getItem('key_credentials');
  const permissions = window.localStorage.getItem('permissions');
  //if no token or permissions
  if (token === null || permissions === null) {
      return <Redirect to='/'/>;
  }
  let tokenData = decodeToken(token);
  //send back to login on token timeout
  if (tokenData.exp < Date.now() / 1000) { //this essentially logs a user out
      window.localStorage.clear() //ditch the credentials/permissions
      return <Redirect to='/'/>; //that this Redirect doesn't add the login screen to the history. (supposedly)
  //otherwise, allow component to be rendered
  } else {
      return <Component {...history}/>;
  }
}

//Dunno how this works, but thanks 2019!
const decodeToken = (token) => {
    let partitions = token.split('.');
    return JSON.parse(atob(partitions[1]));
}

class App extends React.Component {

  render() {
    return (
      <BrowserRouter> {/*This automatically creates a `history` object for us, which can be accessed by importing the hook {useHistory} from react-router-dom (new in v5), but can only be used in functional components (like FunctionalButtons.js) */}
        {console.log('app', this)} {/* useful for debugging */}
              <Switch> {/** everything that uses Route's `component` prop automatically gets history, match, location passed into it, which can then be referred to with `this.props.___` since they're class components. In the future, it would be good to rewrite all the class components as functional components and use hooks instead! */}
                <Route exact path='/' component={Login}/> {/* eqivalent to render={({history, match, location} => <Login {...history} {...match} {...location}/>}*/}
                <Route exact path='/attendance' component={Attendance}/>
                <Route path='/students' component={Students}/>
                <Route path='/reports' component={Reports}/>
                <Route path='/volunteers' component={Volunteers}/>
                <Route path='/admin' component={Admin}/>
                <Route component={NotFound}/> {/** this will match anything that doesn't match above */}
              </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
