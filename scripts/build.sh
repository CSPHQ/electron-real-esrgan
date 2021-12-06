#!/bin/bash

mkdir -p sr-build
(cd sr-build && npx electron-packager ../ --all --overwrite --ignore="\.git(ignore|modules)|sr-build")
