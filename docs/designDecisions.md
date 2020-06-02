# Design 
This document serves as a log of the decision made when designing The Key Attendance system. Note that the "options" label is not inclusive of all possible options, just the one we considered at the time. This document was started during the 3rd iteration, so not all relvant design decisions are listed (yet).

## Virtual Environment
Options: pipenv, venv, __virtualenv__

Reason: Most popular, most support, easiset to use, sustainable between python versions.

## Web Framework
__Django__: implemented by 2019

## Application Structure
__React SPA with Django backend__: Original group (2019) did it. You can become less confused on how Django views (class based in our case) are mapped to React views (class components) [in two sections here](https://www.valentinog.com/blog/drf/#django-rest-with-react-setting-up-the-controll-ehm-the-views). We do option 2, so the tutorial is only useful up to where he lists the options (since he goes with option 1).

## Database Type
Options: __SQL/RDBS__, NoSQL

Reason: A relational database system has the structre that makes sense for storing the information we need to. We care more about ACID than big data analysis, flexibility, or scalability. We aren't storing graphs, documents, or any abnormal datatype. 

## Database Management System
Options: __PostgreSQL__, MongoDB

Reason: PostgreSQL has a lot of support and is very flexible. It also was already implemented. MongoDB specializes in NoSQL. (tip: search "mongoDb is web scale" for a good time)

## Hosting
Options: __Cloud services__, In-House server

Reason: The Key has expressed they care more about minimizing maintenance than the cost they incur from hosting on the cloud.

## File Renewals
Options: __global__ and __local__ .gitignore
Decision: adding all folders of auto-generated files made during instance startup to the .gitignore file
Reason: For the sake of 1) robustness, 2) not encountering unexpected problems during re-instancing, 3) allowing the students working on this project to see how Django migrations are magical.
