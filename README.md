# Key Comps 2020

This project is the 3rd iteration of the Carleton comprehensive project that has resulted in an attendance tracking application for the Northfield Union of Youth's Key Youth Center.
Advisor: Sneha Narayan
Members: Isabel, Justin, Liam, Maddie, Sahil

## Running the application
All instructions for running the app can be found in the `docs` folder. If this is your first time setting it up, definitely start there. Otherwise, here is a breif synopsis of local startup:

* The folder "app" contains a django app (located in `/backend`) and a react frontend (located in `/frontend`).
* Start the backend locally:
    * navigate to `/backend`
    * activate your virtualenv 
    * start the local server with `manage.py runserver`
* Start the frontend:
    * navigate to `app/frontend/`
    * start the react app with `npm start`. This should automatically open `localhost:3000` in your browser, and will automatically update for any changes you make in your local javascript files.

## Git Workflow
The master branch was renamed to `develop` by 2019.
The 2019 group opted for feature branches with appropiate naming conventions: "For instance, if you are adding a feature that installs a bouncy house in the living room, the branch would be called `feature/add_bouncy_house_to_living_room`"

2020 thought that for a project with such few people, it was fine to just do local development with braches for each individual.

When you're done with a branch, create a pull request back to develop. Ideally 1 or 2 people should approve the pull request prior to merging it to ensure that we don't miss any obvious issues.

## Further Reading

Under `/docs/`, there is documentation covering the API endpoints, more specific backend function and organization, specific frontend function and organization, database design, and server management.

It's also advisable to read the basic documentation on [React](https://reactjs.org/docs/getting-started.html), [Django](https://docs.djangoproject.com/en/2.1/) and [Django Rest Framework](https://www.django-rest-framework.org/tutorial/quickstart/) if you are unfamiliar with any.