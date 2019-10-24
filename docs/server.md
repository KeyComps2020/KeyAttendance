# Server Reference

## Overview

The server used to host this site is an AWS EC2 virtual machine running ubuntu 18.04. The server has a static IP and url that we use to send web traffic to via the DNS records of the site's domain. To connect to the server, obtain the ssh key and run `ssh -i "keyname.pem" ubuntu@siteurl`.

## Updating the Live Website

First, make sure that the branch you want to pull to the server is prepared. Such branches must:

* have the correct domain and protocol specified in `/frontend/src/components/Helpers.js`. Production builds need to have `domain` set to `keyattendance.com` and `protocol` set to `https`. This ensures that the live website won't attempt to make requests to a local server instead of the one running in the cloud.
* have an updated `/backend/build` folder. This contains the compiled, minified version of the javascript front end that Webpack outputs. If this is not up to date, no front-end changes will be present in the updated app. To update the build folder, first delete the old build folder. Then change directories to `/frontend/`, and run `npm run build`. This may take a while, but will generate a new build folder in the `/frontend/` directory. Finally, move this new folder into `/backend/`.
* have functional migrations. Make sure that any new migrations work (for example, don't attempt to create new primary keys before removing the old primary key).
* have any new packages reflected in `backend/requirements.txt`. To update this file properly, activate virtualenv then run `pip freeze > requirements.txt`.

Once this is complete, you may publish the branch to github.

Second, ssh into the server and checkout the branch you want to pull down by running `git fetch` followed by `git checkout branchname`, where 'branchname' is the name of your branch. Run `git pull` to pull this branch into the server.

Third, run any migrations and install any new packages. You can do this by first activating virtualenv by running `source env/bin/activate` from `/backend/`, then running `pip install -r requirements.txt` to install new packages or `python3 manage.py migrate` to apply new migrations.

Finally, after the files seem to be in working order, run `sudo systemctl restart keyapi` to restart the process that connects the code to the web server.

## Security

The server is secured using HTTPS / TLS for all incoming requests and outgoing data. This is implemented in a few different places:

* nginx is configured to redirect all incoming HTTP traffic (port 80) to be re-sent as HTTPS (port 443), telling modern browsers to send all further communication in this way using a "Strict-Transport-Security" header.
* nginx uses a TLS certificate generated and signed by [Lets Encrypt](https://letsencrypt.org/) and configured for our system through [certbot](https://certbot.eff.org/). Browsers then display the website as secure and send all traffic safely. For more information on TLS, see [https://en.wikipedia.org/wiki/Transport_Layer_Security](https://en.wikipedia.org/wiki/Transport_Layer_Security).

## Software Involved

### nginx

[nginx](https://nginx.org/en/) is a HTTP and proxy server program that handles incoming traffic and forwards it to uWSGI for processing. While uWSGI is a capable web application, [using nginx](https://serverfault.com/questions/590819/why-do-i-need-nginx-when-i-have-uwsgi) as the outward-facing server provides increased security, stability, and a potential to use caching features to increase request handling time.

#### Important Files

* `/etc/nginx/sites-available/key_api_nginx.conf` contains the configuration settings for the server.

### uWSGI

[uWSGI](https://uwsgi-docs.readthedocs.io/en/latest/) acts as an [intermediary](https://stackoverflow.com/questions/38601440/what-is-the-point-of-uwsgi) between the web server, nginx, and the web application, django. This provides extra scalability and more robustness in handling requests. For more information, see [this explanation](https://www.fullstackpython.com/wsgi-servers.html) on why uWSGI is useful, and [this documentation](https://uwsgi-docs.readthedocs.io/en/latest/tutorials/Django_and_nginx.html) on how nginx, uWSGI and django integrate together.

#### Important Files

* `/tmp/keyattendance.log` is where all output produced by uWSGI and Django are logged. Look here if you run into any unexpected 500 errors on the server.
* `app/backend/key_api_uwsgi.ini` is the configuration file for uWSGI.
* `app/backend/key_api.sock` is the unix socket file used for communication between uWSGI and nginx.

### Django

Django is the web application framework that our code executes within. We still directly interact with it on the server for applying migrations, files that track database changes through version control.

### Postgres SQL

The database server used in this project runs postgresql. It can be directly accessed when logged into the web server by switching to the postgres account by running `sudo -i -u postgres`, then running `psql -d keydb` to open the terminal interface.

### virtualenv

Virtualenv creates a new installation of python and the necessary libraries for a given project, ensuring that changes in packages can be easily tracked and updated through version control tools for team projects. The server uses it for keeping track of python packages as uWSGI is designed to work with it.

#### Important Files

* `app/backend/requirements.txt` contains the names and versions of the packages required by the project to faciliate installation.

### systemd

Systemmd is a task scheduler that runs the uWSGI and nginx servers whenever the virtual machine boots. This ensures that any downtime will be minimal.


#### Important Files

* `/etc/systemd/system/keyapi.service` contains the system job for starting uWSGI

### cron

Cron is a task scheduler that runs two comands: 

* deleting the back-end logs (`/tmp/keyattendance.log`) at midnight on the 1st and 15th of every month. This is necessary, as otherwise the file becomes big enough that accidentally opening it will crash the server.
* restarting the server service at midnight every Sunday. This is a memory leak precaution.

You can access the first command using `crontab -e`, and the second using `sudo crontab -e` (needed root permission to restart the service)

### certbot

Certbot is a program used to obtain and automatically renew TLS certificates through letsencrypt.org. These certificates are trusted by the current versions of all major browsers, and, most importantly, are free. Ideally you shouldn't run into any issues here unless you change the domain name or IP address, as this renews itself automatically when the certificate is about to expire.

#### Important Files

* `/etc/letsencrypt/live/sitename/fullchain.pem`: the TLS certificate
* `/etc/letsencrypt/live/sitename/privkey.pem`: the TLS certificate key