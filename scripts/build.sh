#!/bin/bash

mkdir -p sr-build
(cd sr-build && npx electron-packager ../ --platform=darwin --arch=arm64 --asar --overwrite --ignore="\.git(ignore|modules)|sr-build")
(cd sr-build && npx electron-packager ../ --platform=darwin --overwrite --asar --ignore="\.git(ignore|modules)|sr-build")
(cd sr-build && npx electron-packager ../ --platform=win32 --overwrite --asar --ignore="\.git(ignore|modules)|sr-build")

