#!/bin/bash

mkdir -p dist
(cd dist && npx electron-packager ../ --all --ignore="\.git(ignore|modules)|dist")
