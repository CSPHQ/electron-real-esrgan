#!/bin/bash

mkdir -p sr-build-zip
cd sr-build
for x in ./*
do
    echo ${x}
    zip -rq --symlinks ../sr-build-zip/${x}.zip ./${x}
done
