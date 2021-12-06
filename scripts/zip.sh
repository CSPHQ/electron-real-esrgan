#!/bin/bash

mkdir -p sr-build-zip
rm -rf sr-build-zip/*
cd sr-build
for x in *
do
    echo ${x}
    # npm i electron-installer-zip -g
    electron-installer-zip ${x} ../sr-build-zip/${x}.zip
    # zip -rq --symlinks ../sr-build-zip/${x}.zip ./${x}
done
