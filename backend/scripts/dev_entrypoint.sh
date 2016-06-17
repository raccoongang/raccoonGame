#!/usr/bin/env bash

# This script runs when the development container starts.
# We move into the /app directory (previously mounted) and install npm dependencies.
# Dependencies have to be installed after the container starts
# because we're starting from a public base image.

cd /app
npm install --no-bin-links
./node_modules/nodemon/bin/nodemon.js --legacy-watch index.js