#!/bin/bash

mkdir -p sr-build
(cd sr-build && npx electron-packager ../ --asar --platform=darwin --overwrite --ignore="\.git(ignore|modules)|sr-build")
(cd sr-build && npx electron-packager ../ --asar --platform=win32 --overwrite --ignore="\.git(ignore|modules)|sr-build")

