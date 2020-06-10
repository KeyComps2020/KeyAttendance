# Troubleshooting

This document serves as a running list of problems we encountered, as well as steps we took to solve them. At the time of writing, most descriptions were form-fitted to MacOS users. Add other OS descriptions when relevant! Keep it updated to make the work of future groups easier!


### virtualenv not found
This likely resulted from multiple versions of python on your system (especially if it's a Mac). You can see all versions of python (or whatever other command/program you're searching for) by typing `which -as python` and `which -as python3`. The output will be lines in the form `pathToThing` or `pathSynonym/Link -> actualPath`, and is ordered by the order your machine uses the program (so the top one is what's being called). You'll want to try calling `which -as` on python, python3, pip, and pip3, and making sure the ones you're using are linked to the same space. You can see the packages a version of pip has installed by typing `pip list` or `pip3 list` (these might be different, which means you've probably found the problem). The simplist solution is to install virtualenv to all pip versions. [More on virtualenv](https://pypi.org/project/virtualenv/).

### npm not found / npm install not working
Make sure that npm is reachable from your $PATH variable. You can see your $PATH variable with `echo $PATH`. The directories included (delimited by `:`) are the locations your computer looks for executables/binaries. Use `which npm` to see where the binary is stored, and then add that directory to your $PATH. 

### can't create keydb
Remember to have the posgresql service running in the background and to end each command with a semicolon if you are running them out of psql.

### for loops are throwing redelcaration warnings or aren't what I expect them to be 
If you're new to Javascript (like me), you might run into some issues with the syntax. Two important things I caught myself doing all the time were:
* Not using `let` instead of `var`. [Variable scoping](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript#Variables) is different that pretty much everything else in JavaScript. The tldr is that `let` is what feels normal, and `var` declares global variables. If you're doing `for (var i; etc...)`, then i has been delcared globally and you'll run into a redeclaration warning.
* The difference between in-loops and of-loops. The tldr is that `for e in elements` returns the index, and `for e of elements` returns the actual element.

### react-bootstrap components aren't rendering
Check that the version of react-bootstrap you are using coincides with the version of bootstrap css. Both can be found in package.lock.
Oftentimes, the way to include bootstrap as styling for a webapp is a `<link>` tag (intentionally lowercase -- not the react component `Link`) in index.html (the page that is served) with a static reference to some version of bootstrap. We (2020) opted to not do this: We're always going to be using the most recent version of react-bootstrap, which is usually built on the most recent version of bootstrap, so it doesn't make sense to hard-code in a version that could become outdated (2020 had to deal with this first hand, because the react-bootstrap v1.01 was built for use with bootstrap4, but the 2019 group had hard-coded in bootstrap 3 in index.html). 

### react-boostrap and react-router-dom
This is kinda tricky if you're just getting into react stuff, so here's some important things to know before we begin:
* `React-Bootstrap` is imported to any react component we write that needs styling. This means pretty much every component.
* We have a single page react app. This means that we're never actually navigating between different html pages -- react is just swapping out components. Because of this, we need a way for the browser to pretend like each "page" (ie new assortment of components render to the screen) is different so we can navigate back and forth between them. We use `React-Router-Dom` to do this.
* `React-Router-Dom` is imported to any react component that needs access to navigation history or has some kind of linking/rerouting. This is so that it can track the artificial "pages" we visit. For example, the `Layout` component (which is used in almost all the views) handles navigation through our single page react app. The way it works is through a prop called `history` which you can just think of a linked list of the views we render (so it works exactly like a regular browser history, but it's just recording the view components instead of the html pages). Any child of the `BrowserRouter` component gets the `BrowserRouter`'s built-in `history` prop passed to it.

You might notice that there are components in these two packages (bootstrap and the router)with names that to overlap! This is something to be very careful about. Specifically, `Nav.Link` and `Nav.Item` from bootstrap, and `NavLink` and `Link` from the router.

The `UserHistory` component and ability to navigate forward and backwards between visited "pages" (remember that technically you're always looking at the same page -- index.html) depend on `React-Router-Dom`. This means it's important to only use components from the router to do, well, routing. Using `Nav.Link` from bootstrap will not add the view component to the `history` prop that the router is using to track our "pages". You can actually see in `Layout` that I manually coppied the styling of the `Nav.Link` bootstrap component into the `Link` router component (via `className=react-bootstrap-link-manual`).

Okay that's the important stuff. Read on to understand the difference (read: struggle) that 2020 had to deal with... 

Originally, the webapp's history stuff relied on a wrapper (aka higher order component or HOC) from the router called `withRouter()`. It was used for `Layout.js` -- the bottom of that file in 2019 is `export default withRouter(Layout)`. This gave `Layout.js` access to the `history` prop that `React-Router-Dom` manages. The reason this was done was because 2019's self-built `Router.js` component that handles all the routing for the app wrapped all the component views in a big `Layout` tag and then rendered the views as children of `Layout`. In other words, in order to pass the `history` prop from the `BrowserRouter` component to the views, they had to go through the `Layout`, hence the HOF. 2020 decided this both not intuitive and was like saying that all dogs share a tail instead of all dogs have a tail, so they ditched the HOC and threw `Layout.js` into the render function of the views. Now each dog has its own tail. This allows the `BrowserRouter` to directly pass the `history` prop to the views (when `super(props)` is called in their constructors). 

Feel free to look more into the [bootstrap side](https://react-bootstrap.github.io/components/navs/#nav-item-props) and [router side](https://reacttraining.com/react-router/web/api/NavLink).

Also, [this](https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually) is a good stack overflow explanation.

Note: Eventually, the app should probably move away from class components using state to functional components using hooks. More on this in `FutureWork.md`

### why does the navbar in layout.js use Link from react-router-dom instead of Nav.Link from react-bootstrap?
Nav.Link compiles as an `as` prop that lets you pass a custom element type to the link, BUT 2020 couldn't figure out a way to pass props to that custom element (namely `history`). The links on the page NEED to be attached to `history` from react-router-dom in order for the BrowserRouter to track it. Our (2020) solution to this was to ditch the react-bootstrap Nav.Link class and just use Link from react-router-dom. To make it look good, we manually copied over the css from react-bootstrap in `className=`.

### where is the `history` object declared?
https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/BrowserRouter.js

BrowserRouter creates a history object for us, so we don't need to make one manually. 

### logging out isn't working
The process of logging out involves 2 steps: clearing the token in the browser (located in `window.localStorage`) and redirecting back to the homepage. If a logout isn't working, one of these two steps isnt'happening.

### my functional component is just a regular function
function name must start with CAPITAL LETTER!
* `const ThisIsFnComp = (inputs) => {...}`
* `function ThisIsAlsoFnComp (inputs) {...}`
* `const tookMe2HoursToFigureOutThisIsNotADangFnComponent = (inputs) => {...}`

Remember not to mix up how you're returning things also! Pop Quiz! Which of these return null, and which return an empty object?
* `... => {}`
* `... => {{}}`
* `... => ({})`
* `... => {return {}}`
* `... => (return {})`
* `... => null`
* `... => {null}`


### the values returned from my class component's function(s) are not what I expect them to be
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind#Examples
* https://medium.com/front-end-weekly/do-i-still-need-to-bind-react-functions-in-2019-6d0fe72f40d7
* https://dev.to/aman_singh/why-do-we-need-to-bind-methods-inside-our-class-component-s-constructor-45bn

Importantly, the different ways of declaring functions inside class components in React have different effects on the scope of those functions; The tldr of this is that If you do `function x() {`, then you must bind it to the class so that any instance of it uses it the right way. You don't have to manually bind it (because it's automatically bound) if you do `x = () => {`. 
