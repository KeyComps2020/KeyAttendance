# First Time Setup Reference
Adding all components mentioned below to your $PATH (MacOS/Linux) or %PATH% (Windows) environment variables is recommeneded. 

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
* Exit the virtual environment with `deactivate` or Ctrl-d.

Huzzah! You now have a virtual environment in the project folder will the necessary python dependencies.


### Database Setup

Make sure you have [PostgreSQL installed](https://www.postgresql.org/download/). If you are using Homebrew on MacOS, use `brew install postgresql`. To start, run `brew services start postgresql`. This starts postgresql as a background service. To stop it, run `brew services stop postgresql`.

You have two options from here:
 * Use a GUI for interacting with postgres like [pgAdmin](https://www.pgadmin.org/).
 * Use the CLI/shell executable or run `psql` from terminal, the included command-line based front-end for postgres. (This is what the writer of this md used, but there's no better or worse option.)

Now, start up the postgreSQL server/service locally by one of the following: 
 * Opening the GUI you have or following instructions for starting the server.
 * Opening the CLI/shell executable.
 * `brew services start postgresql` from terminal. `postgres` is the name of one of the default databases that you get when installing postgreSQL.
 * If you have problems, you can run `python manage.py dbshell` to have django detect what database shell to use (in our case it will be psql).
 
Next, choose one of the options to add a database for the key to your postgres server:
* Do it from the GUI.
* `createdb keydb` from terminal. `createdb` is a binary you gain after installing postgres.
* Open the shell for interacing with the postgres server with `psql -d posgtres` ("postgres" is the name of the database you get by default) and then  `CREATE DATABASE keydb;`.

Now, change directories to make sure you're in `KeyAttendance/app/backend`, activate your virtual environment(`source env/bin/activate`), and run: 
* `python manage.py makemigrations key`. This tells Django to look at `key/models.py` and construct instructions (`key/migrations/0001_initial.py`) for making each of the models into a table. 
* `python manage.py migrate`. This runs the instructions you just generated to populate the keydb database you made.
* `python manage.py createsuperuser`.

Nice, you now have a databse.


## Frontend Setup

Make sure you have node and npm installed. If you are using Homebrew on MacOS, `brew install node` [takes care of both](https://changelog.com/posts/install-node-js-with-homebrew-on-os-x).

Once this is complete, cd to `KeyAttendance/app/frontend` and run:

* `npm install`. This tells npm (Node Package Manager) to install the javascript dependencies listed in `pacakage-lock.json`. Note that we're NOT using a virtual environment for our javascript portion... (future groups feel free to consider this, though it appears to not be widely used anyway).


## All together now!

To see if everything is working properly, first edit `app/frontend/src/components/Helpers.js` such that the local development domain and protocol are uncommented and the remote domain and protocol are commented. This is pretty important, as it sets the front end to grab all its data locally instead of actually messing with live data.

Then, open two terminal windows. In the first:

* cd to `KeyAttendance/app/frontend/`
* `npm start`

Then, in the second, activate your virtual environment in `KeyAttendance/app/backend`and run:

* `python manage.py runserver` if you're on a Windows machine, or `python3 manage.py runserver` if you're on a Unix machine.

If everything was installed correctly, this should open a browser pointed at `localhost:3000` with the website in it, and the username and password for the superuser you created in the database should grant access to the local site.


__Important Note__ (Read on to understand the file structure of the Django project).
You are being handed a project that has already been set up using the webframework Django. Here are the important pieces of the structure:

#TODO finish this diagram

`KeyAttendance`  
|-- `app` (contains all the code)  
|        |-- `backend` (all the django stuff)  
|        |        |-- `manage.py` (controls for django, written by django)  
|        |        |-- `keyManager`  
|        |        |        |-- settings (settings for production or development)  
|        |        |        |-- `urls.py` (endpoints/paths for the website)  
|        |        |-- `key`  
|        |        |        |--   
|        |-- frontend (all the react stuff)  
|-- docs (contains all the documentation)
