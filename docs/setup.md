# First Time Setup Reference
Adding all components mentioned below to your `$PATH` (MacOS/Linux) or `%PATH%` (Windows) environment variables is recommeneded. 

## Backend Setup

Make sure that you have python3 and pip installed. If you are using Homebrew on MacOS (highly recommended), `brew install python` [takes care of both](https://docs.brew.sh/Homebrew-and-Python). 


### Setting up the Virtual Development Environment

First, install [virtualenv](https://pypi.org/project/virtualenv/):

* `pip install virtualenv`

This is a package that allows you to isolate a python environment. Any changes you make to a virtual environment will be present anytime you re-open the virtual environment. 

Once this is complete, cd to `KeyAttendance/app/backend/` and run:

* `virtualenv env`. This creates a virtual environment named `env/` (You can name it something else if you want, but make sure you change the `.gitignore` file so you aren't pushing it to the repo). All the settings/packages/etc that you make will now be recorded in the folders `env/bin`, `env/lib`, etc.
* `"env/Scripts/activate"` if you're using Windows, or `source env/bin/activate` if you're using a Unix-based OS. This activates the virtual environment. You'll see an indicator that you're in the virtual environment named `(env)`.
* `pip install -r requirements.txt`. This installs the python dependencies listed in `requirements.txt` into your virtual environment. Remember that these are isolated in your virtual environment `env`, so these packages won't work elsewhere unless you also have them installed elsewhere. You can check this by running `pip list` inside and outside your virtual environment.
* Note: To upgrade the dependencies in requirements.txt, do the following: (note this should be revised by the next group, as 2020 only figured out how to do this at the end and didn't examine all alternatives)
    * install pip-tools (`pip install pip-tools`)
    * rename `requirements.txt` to `requirements.in`
    * `pip-compile --upgrade`, which looks at `requirements.in` and spits out a `requirements.txt`
    * now do `pip install -r requirements.txt`.
    * (hopefully there is a better way to do this in the future...)
* Exit the virtual environment with `deactivate` or Ctrl-d.

Huzzah! You now have a virtual environment in the project folder will the necessary python dependencies.


### Database Setup

Make sure you have [PostgreSQL installed](https://www.postgresql.org/download/). If you are using Homebrew on MacOS, use `brew install postgresql`. To start, run `brew services start postgresql`. This starts postgresql as a background service. To stop it, run `brew services stop postgresql`.

You have two options from here:
* Use a GUI for interacting with postgres like [pgAdmin](https://www.pgadmin.org/).
* Use the CLI/shell executable or run `psql` from terminal, the included command-line based front-end for postgres. (This is what the writer of this tutorial used, but there's no better or worse option. I'm just a purist.)

Now, start up the postgreSQL server/service locally by one of the following (based on what you did last step probably): 
* Opening the GUI you have or following instructions for starting the server.
* Opening the CLI/shell executable.
* `brew services start postgresql` from terminal.
* If you have problems, you can run `python manage.py dbshell` to have django detect what database shell to use (in our case it will be psql).
 
Next, choose one of the options to add a database for the key to your postgres server:
* Do it from the GUI.
* `createdb keydb` from terminal. `createdb` is a binary you gain after installing postgres.
* Open the shell for interacing with the postgres server with `psql -d posgtres` ("postgres" is the name of the database you get by default) and then `CREATE DATABASE keydb;`.

Now, change directories to make sure you're in `KeyAttendance/app/backend`, activate your virtual environment(`source env/bin/activate`), and run: 
* `python manage.py makemigrations key`. This tells Django to look at `key/models.py` and construct instructions (`key/migrations/0001_initial.py`) for making each of the models into a table. 
* `python manage.py migrate`. This runs the instructions you just generated to populate the keydb database you made.
* `python manage.py createsuperuser`. Enter `postgres` for the username and password. The email field doesn't matter. This creates a user named postgres with all the admin permissions for a postgres database. Read more about it [here](https://docs.djangoproject.com/en/3.0/intro/tutorial02/) and [here](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Admin_site).

Finally, let's add keydb-specific permissions to the superuser you just made. If you don't do this, you'll get errors when you log in because you'll be trying to call indexOf() on a null object that is supposed to be a list of keydb permissions.
* `python manage.py dbshell`. This opens up the command line interface for whatever database you're using with Django, and is equivalent to `psql keydb -U postgres` in our case. You should see some kind of new line symbol like `keydb=> `. In other words, you're connecting to the database `keydb` as the (super)user `postgres`. You can verify all of this info before moving on with `\conninfo`.
* Create the Admin role for our database (which has access to all endpoints and views), and assigns it to your new superuser:
    * `INSERT INTO auth_group VALUES (1, 'Admin');` (response should be `INSERT 0 1`)
    * `INSERT INTO auth_group_permissions(group_id, permission_id) select 1, id from auth_permission;` (response should be `INSERT 0 84`)
    * `INSERT INTO auth_user_groups(user_id, group_id) VALUES (1, 1);` (response should be `INSERT 0 1`)
* Create basic activity type and student data information that the site expects when loading data:
    * `INSERT INTO activities (activity_id, is_showing, name, type, is_parent, ordering) VALUES (7, true, 'Key', 'boolean', false, 1);` (response should be `INSERT 0 1`)
    * `INSERT INTO studentcolumns (info_id, is_showing, quick_add, name, type) VALUES (1, true, false, 'Birthday', 'date');` (response should be `INSERT 0 1`) 
    * (If you're curious what these responses mean, "0" stands for the OID/object-identifier of the row that was inserted (which we don't have, so it's always 0), and "1" stands for the number of the records added to the table).

Nice, you now have a databse! And because of the way Django is configured, it will automatically be linked to the Django web framework, allowing access of the data from the endpoints specified.


## Frontend Setup

Make sure you have node and npm installed. If you are using Homebrew on MacOS, brew install node [takes care of both](https://changelog.com/posts/install-node-js-with-homebrew-on-os-x).

Once this is complete, cd to `KeyAttendance/app/frontend` and run:
* `npm install -g npm-check-updates`. This tells npm (Node Package Manager) to look at all your default/global packages and dependencies in package.json and compile a list of ones that can be updated safely.
* `ncu`. List the packages that can be updated
* `ncu -u`. Update `package.json` to reflect the updated versions.
* `npm install`. This tells npm to install (or upgrade already installed) javascript dependencies listed in `pacakage.json`. Another file, `package-lock.json` is generated. It contains all the subdependencies to the packages you installed. The folder `node_modules` is created and holds all the local dependencies for this project. You can see the packages with `npm list` and the global ones with `npm list -g`.

## All together now!

To see if everything is working properly, first edit `app/frontend/src/components/Helpers.js` such that the local development domain and protocol are uncommented and the remote domain and protocol are commented. This is pretty important, as it sets the front end to grab all its data locally instead of actually messing with live data.

Then, open two terminal windows. 

In one, cd to `KeyAttendance/app/backend`
* make sure you're virtual environment is activated
* make sure the postgresql service is running
* `python manage.py runserver` if you're on a Windows machine, or `python3 manage.py runserver` if you're on a Unix machine.

If it works, you'll see:
> `Django version 2.1.7, using settings 'key_api.settings.base'`  
> `Starting development server at http://127.0.0.1:8000/`

Sweet, you now have a postgres server with all the stuff you need to access and a Django setup that has all the instructions for acessing it.

In the other terminal, cd to `KeyAttendance/app/frontend/`
* `npm start`. This tells npm to look at `package.json` and execute the value associated with `start`. If you look in that file, you'll see the line `"start": "react-scripts start"`. `react-scripts` are binaires that we get for using React as our frontend manager. The `start` command runs the server that React inclues in it's package. If you want more details than this, you can find them [here](https://github.com/facebook/create-react-app#whats-included).

If everything was installed correctly, this should open a browser pointed at `localhost:3000` with the website in it, and the username and password for the superuser you created in the database should grant access to the local site.


__Important Note__  
You are being handed a project that has already been set up using the webframework Django with a React SPA as the frontent. A good thing to understand is the structure of the project (particularily because the names of the folders are not very intuitive), which can be found on the [backend reference page](https://github.com/KeyComps2020/KeyAttendance/blob/develop/docs/backend.md) and the [frontened reference page](https://github.com/KeyComps2020/KeyAttendance/blob/develop/docs/frontend.md).

_This document was last updated May 2020_
