# Dependencies Resources and Summaries

## Python
From requirements.txt:
 * [Django](https://www.djangoproject.com/) - Web framework. Employes "Loose Coupling," which allows data, design, and business logic to be handled independently. Read more about [model, view, template](https://djangobook.com/mdj2-django-structure/)
 * [django-cors-headers](https://pypi.org/project/django-cors-headers/) - Cross-Origin Resource Sharing for Django. Allows requests for restricted resources from other sources/domains.
 * [django-simple-history](https://django-simple-history.readthedocs.io/en/latest/) - Stores a snapshot of the Model after each create/update/delete.
 * [djangorestframework](https://www.django-rest-framework.org/#example) - Equips the web framework to rely on a RESTful API.
 * [djangorestframework-jwt](https://pypi.org/project/djangorestframework-jwt/) - Provides authenitication/login support for Django using JSON web tokens.
 * [Pillow](https://pillow.readthedocs.io/en/stable/handbook/tutorial.html) - Image processing.
 * [psycopg2](https://www.psycopg.org/docs/usage.html) - PostgreSQL database adapter for the Python programming language. 
 * [PyJWT](https://pyjwt.readthedocs.io/en/latest/) - JSON web tokens for python (to be used with djangorestframework-jwt).
 * [pytz](https://pypi.org/project/pytz/) - Used for timezone calculations.
 * [coverage](https://coverage.readthedocs.io/en/coverage-5.1/) - Used for [testing](https://www.valentinog.com/blog/drf/#django-rest-with-react-a-sprinkle-of-testing).

 ## Javascript
 From package-lock.json:
 * [node-sass](https://www.npmjs.com/package/node-sass) - bindings for node to SASS stylesheet processor
 * papaparse - csv parser.
 * prop-types - used to typecheck the prop types for react components. not currently implemented.
 * react - bigboi
 * react-bootstrap - bootstrap styling for react apps (Alert, Form, etc.).
 * bootstrap - the actual css files that react-bootstrap uses to build its the components we use for styling.
    * Note: this dependency was added in 2020, because we decided hard-coding a version of bootstrap in as link in `index.html` could break react-bootstrap, which counts on the most recent version (read: it did break it, so we had to fix it).
 * react-collapsing-table - DOM structure thats not in bootstrap but is useful
 * react-dom - used for testing in tests.js. Allows react components to be rendered in an HTML file directly.
 * react-router-dom - wrapper for react-router that adds web functionality (as opposed to native)
   * react-router - Used for navigating between pages in a react app
   * [history](https://www.npmjs.com/package/history) - API for managing session history.
 * react-scripts - allows react commands from command line through npm.
 * react-vis - used for creating the heatmap