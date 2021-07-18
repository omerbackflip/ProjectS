#!/usr/bin/env bash

# get current environment
#X_ENV=$(node -r ts-node/register -e 'console.log(require("./src/config.ts").env)')
#echo $X_ENV;

X_MODULE=$1

echo $X_MODULE

rm -rf build/

npm run build:$X_MODULE

cp -r 'src/_certificates' builds/$X_MODULE/src/

cp 'configurations/Dockerfile' builds/$X_MODULE

cp 'docker-compose.yml' builds/$X_MODULE

cp 'package.json' builds/$X_MODULE

cp 'configurations/entrypoint.sh' builds/$X_MODULE

cp 'wait-for-it.sh' builds/$X_MODULE

cd builds/$X_MODULE

docker build -t $X_MODULE './'

docker save -o ./$X_MODULE.tar $X_MODULE
