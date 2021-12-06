#!/bin/bash

mkdir -p sr-build
(cd sr-build && npx electron-packager ../ --platform=darwin --arch=arm64 --overwrite --ignore="\.git(ignore|modules)|sr-build")
(cd sr-build && npx electron-packager ../ --platform=darwin --overwrite --ignore="\.git(ignore|modules)|sr-build")
(cd sr-build && npx electron-packager ../ --platform=win32 --overwrite --ignore="\.git(ignore|modules)|sr-build")

