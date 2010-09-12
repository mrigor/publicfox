#!/bin/sh
zip -r dlwatch.xpi . -x \*.swo \*.swp \*.DS_Store "/.git/*" ".gitignore"
