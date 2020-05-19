# Troubleshooting

This document serves as a running list of problems we encountered, as well as steps we took to solve them. At the time of writing, most descriptions were form-fitted to MacOS users. Add other OS descriptions when relevant! Keep it updated to make the work of future groups easier!

### virtualenv not found
This likely resulted from multiple versions of python on your system (especially if it's a Mac). You can see all versions of python (or whatever other command/program you're searching for) by typing `which -as python` and `which -as python3`. The output will be lines in the form `pathToThing` or `pathSynonym/Link -> actualPath`, and is ordered by the order your machine uses the program (so the top one is what's being called). You'll want to try calling `which -as` on python, python3, pip, and pip3, and making sure the ones you're using are linked to the same space. You can see the packages a version of pip has installed by typing `pip list` or `pip3 list` (these might be different, which means you've probably found the problem). The simplist solution is to install virtualenv to all pip versions. [More on virtualenv](https://pypi.org/project/virtualenv/).

### npm not found / npm install not working
Make sure that npm is reachable from your $PATH variable. You can see your $PATH variable with `echo $PATH`. The directories included (delimited by `:`) are the locations your computer looks for executables/binaries. Use `which npm` to see where the binary is stored, and then add that directory to your $PATH. 

### can't create keydb
This is likely happening because you are using psql. Remember to have the posgresql service running in the background and to end each command with a semicolon.

### react-bootstrap components aren't rendering
Check that the version of react-bootstrap you are using coincides with the version of bootstrap css. Both can be found in package.lock.
Note that often, there will be a `<link>` tag in index.html (the page that is served) with a static reference to some version of bootstrap. We (2020) opted to not do this: We're always going to be using the most recent version of react-bootstrap, which is usually built on the most recent version of bootstrap, so it doesn't make sense to hard-code in a version that could become outdated (2020 had to deal with this first hand, because the react-bootstrap v1.01 was built for use with bootstrap4, but the 2019 group had hard-coded in bootstrap 3 in index.html). 

### react-boostrap and react-router-dom
You might notice that there are components that seem to overlap! This is something to be very careful about. Specifically, `Nav.Link` and `Nav.Item` from bootstrap, and `NavLink` and `Link` from the router.
Because the `UserHistory` component depends on the functionality of the router's `withRouter()` wrapper (which is used in `Router.js` and `Layout.js` only, since all views pass through them), ideally you should always be navigate with router components. This way, the `BrowserRouter` component that wraps the entire app (see `index.js`) can keep track of the history of each user without requiring manual additions to the `history` prop (which there was a lot of in the 2019 group's final version). Also, most of this is more of a hypothesis than fact, as there were practically no comments, dependency notes, or component descriptions left behind by 2019. Feel free to look more into the [bootstrap side](https://react-bootstrap.github.io/components/navs/#nav-item-props) and [router side](https://reacttraining.com/react-router/web/api/NavLink).

### where is the `history` object declared?
https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/BrowserRouter.js


REDO ALL THIS:
Router v5 has hooks that make it EASY PEASY

BrowserRouter creates a history object for us, so we don't need to make one manually. 
We access it by using the hook { useHistory } from rrd

previously, in 2019, accessing the history was done through using the withRouter() HOC (when outside a router component). With the hook useHistory() introduced in v5, we don't need to do that anymore.

### logging out isn't working
The process of logging out involves 2 steps: clearing the cookies in the browser (located in `window.localStorage`) and redirecting back to the homepage. If a logout isn't working, one of these two steps isnt'happening.


IF you're outside of a <Router> then you must use withRouter() HOC to have access to things like history and location.


### my function component is just a regular function
function name must start with CAPITAL LETTER!
    * const ThisIsFnComp = (
    * function ThisIsAlsoFnComp (
    * const tookMe2HoursToFigureOutThisIsNotADangFnComponent
Also, you should have a return statement and take in props probably

Most helpful link so far:
https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually


### the values returned from my class function are not what I expect them to be
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind#Examples
https://medium.com/front-end-weekly/do-i-still-need-to-bind-react-functions-in-2019-6d0fe72f40d7
https://dev.to/aman_singh/why-do-we-need-to-bind-methods-inside-our-class-component-s-constructor-45bn
Importantly, the different ways of declaring functions inside classes in React have different effects on the scope of those functions; The tldr of this is that If you do `function x() {`, then you must bind it to the class so that any instance of it uses it the right way. You don't have do bind it (because it's automatically bound) if you do `x = () => {`. 

### why does the navbar in layout.js use Link from react-router-dom instead of Nav.Link from react-bootstrap?
Nav.Link does as an `as` prop that lets you pass a custom element type to the link, BUT 2020 couldn't figure out a way to pass props to that custom element. The links on the page NEED to be attached to Link from react-router-dom in order for the BrowserRouter to track it's history. Our (2020) solution to this was to ditch the react-bootstrap Nav.Link class and just use Link from react-router-dom. To make it look good, we manually copied over the css from react-bootstrap in `className=`.