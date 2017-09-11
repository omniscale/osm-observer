#OSM-Observer

## Features

## Current status

###Missing

##Installation

First step is to clone this repository and cd into it.

###Dependencies

    - nodejs >= 6.10.2
    - python >= 3.5.2
    - virtualenvwrapper
    - postgresql >= 9.5.6
    - postgis >= 2.2.1
    - go >= 1.8

###Database setup

Create a database for Imposm-Changes and OSM-Observer:

    createuser -P os
    createdb -O os osm_observer

Create required database extensions:

    echo 'create extension postgis' | psql -d osm_observer
    echo 'create extension hstore' | psql -d osm_observer

Create database schema for Imposm-Changes:

    psql -d osm_observer -c "CREATE SCHEMA changes; ALTER SCHEMA changes OWNER TO os;"

Create database schema for OSM-Observer:

    psql -d osm_observer -c "CREATE SCHEMA changes_app; ALTER SCHEMA changes_app OWNER TO os;"


###Imposm-Changes

See [Imposm-Changes repository ](https://github.com/omniscale/imposm-changes) for installation notes

###OSM-Observer

Create a virtual environment (replace path to python3 executable if it differs):

    mkvirtualenv -p /usr/bin/python3 osm-observer

Install python requirements into virtual env:

    pip install -r dev/requirements.txt

Install OSM-Observer app into virtual env:

    pip install -e app/

Create required database tables:

    cd dev
    python manage.py create_db

Install [@angular/cli](https://github.com/angular/angular-cli)

    npm install -g @angular/cli

Install necessary node packages


    (cd app/osm_observer/webapp && npm install)

Building WebApp

    cd dev
    python manage.py build_webapp



