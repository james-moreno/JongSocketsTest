var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, './bower_components')));
app.use(express.static(path.join(__dirname, './node_modules')));
app.use(express.static(path.join(__dirname, './client')));

var server = app.listen(8000, function() {
    console.log('listening on port 8000');
});

var io = require('./server/sockets.js')(server);
