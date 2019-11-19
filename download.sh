#!/bin/sh

CSS=public/stylesheets
JS=public/javascripts

if [ ! -d ${CSS} ]; then
	mkdir ${CSS}
fi

if [ ! -d ${JS} ]; then
	mkdir ${JS}
fi

# Jquery
if [ ! -f ${JS}/jquery-3.3.1.slim.min.js  ]; then
	echo "Download jquery js"
	wget https://code.jquery.com/jquery-3.3.1.slim.min.js -P ${JS}
fi

# Popper
if [ ! -f ${JS}/popper.min.js  ]; then
	echo "Download popper js"
	wget https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js -P ${JS}
fi

# Bootstrap
if [ ! -f ${CSS}/bootstrap.min.css ]; then
	echo "Download bootstrap css"
	wget https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css -P ${CSS}
fi

if [ ! -f ${JS}/bootstrap.min.js ]; then
	echo "Download bootstrap js"
	wget https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js -P ${JS}
fi

# jquery.json-editor
if [ ! -f ${JS}/jquery.json-editor.min.js ]; then
	echo "Download jquery.json-editor"
	wget https://raw.githubusercontent.com/dblate/jquery.json-editor/master/dist/jquery.json-editor.min.js -P ${JS}
fi
