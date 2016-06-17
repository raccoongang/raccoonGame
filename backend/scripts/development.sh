#!/usr/bin/env bash

pwd=`pwd`
CONTAINER_NAME=raccoon_game
WEBSITE_ASSETS="$pwd/../frontend"

docker stop ${CONTAINER_NAME}
docker rm ${CONTAINER_NAME}

docker run -i -d -p 80:3000 --name ${CONTAINER_NAME} -e "NODE_ENV=development" -v ${WEBSITE_ASSETS}:/static/ -v `pwd`:/app library/node:6.2 /app/scripts/dev_entrypoint.sh