#!/usr/bin/env node
/******************************************************************************
    This file is part of PIRATES.

    PIRATES is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    PIRATES is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with PIRATES.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************/

'use strict';

//---------------------------- Parameters
var PORT = 8000;

//---------------------- Import required modules
var express     = require('express');
var app         = express();
var serveStatic = require('serve-static');
var server      = require('http').Server(app);
var io          = require('socket.io')(server);
var path        = require('path');
var Pirates     = require('./server/Game');

//------------------- Serve the HTML/Js client files
app.get('/', function (req, res) {
    res.setHeader('Content-type', 'text/html');
    res.sendFile(__dirname + '/index.html');
});

app.get('/index.css', function (req, res) {
    res.setHeader('Content-type', 'text/css');
    res.sendFile(__dirname + '/index.css');
});

app.use("/data", serveStatic(__dirname + '/data/'));
app.use("/js", serveStatic(__dirname + '/js/'));
app.use("/lib", serveStatic(__dirname + '/lib/'));
app.use("/build", serveStatic(__dirname + '/build/'));

//-------------- Handle the client-server communication
io.on('connection', function (socket) {

    // Allow a player to join the game and set his pseudo
    socket.on('join', function (pseudo) {
        socket.pseudo = pseudo;
        console.log('Player ' + pseudo + ' joined the game.');
        socket.broadcast.emit('joined', pseudo);
        // TODO Send the initial position of the player
    });

    // TODO Update players stats (position, items & life)
});

//-------------------- Initialize the connection
server.listen(PORT, function() {
    console.log('listening on *:' + PORT);
});
