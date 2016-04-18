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
var Pirates     = require('./server/Game'); //import the class Game

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

var game = new Pirates.Game();
var nbPlayers = 0;
var nbReady = 0;
var nbPlayersNeeded = 2;
var toUpdate = [];

//-------------- Handle the client-server communication
io.on('connection', function (socket) {
  
  // At the connection, you receive the number of players needed to begin a game 
  socket.emit('nbPlayersRequired', nbPlayersNeeded);
  // And you receive the list of players ready to play 
  socket.emit('memberConnected', game.GetList());

  // Allow a player to join the game and set his pseudo
  socket.on('join', function (pseudo) {
    var idPlayer = game.AddPlayer(pseudo);

    if(idPlayer !== -1) {
      console.log('Player ' + pseudo + ' joined the game.');
  
      // Send pseudo to the others players
      io.emit('memberConnected', pseudo);
      
      //Give an ID to the player
      socket.emit('initId', idPlayer);
      nbPlayers++;
    } else {
      socket.emit('pseudoError', 'alreadyGiven');
    }
  });

  //Event received when the player have succesfully received is ID
  socket.on('initIdDone', function(){
    if(nbPlayers >= nbPlayersNeeded){
      //Give the players list to everyone
      io.emit('init', game.GetList());
    }
  });

  //Event received when a player is ready
  socket.on('ready', function(){
    nbReady++;
    if(nbReady >= nbPlayersNeeded){
      //Start the game for everyone
      io.emit('start');

      setInterval(function(){
        for(var i=0; i < toUpdate.length; i++){
          toUpdate[i].emit('update', game.GetList());
        }

        toUpdate = [];
      }, 100);
    }
  });

  socket.on('updatePlayer', function(p){
    var player = game.Get(p.id);
    player.pos.x = p.player.x;
    player.pos.y = p.player.y;
    player.vel.x = p.player.velX;
    player.vel.y = p.player.velY;
    player.currentAnimation = p.player.currentAnimation;
    player.lastMaj = p.player.lastMaj;
    player.attack = p.player.attack;
    //TODO update other params

    toUpdate.push(socket);
  });

  socket.on('disconnect', function() {
    
    // Clean the game and wait for new players
    console.log('Disconnection. Resetting the game.');
  
    // TODO Send a message to alert disconnected clients
    socket.leave();

    game = new Pirates.Game();
    nbPlayers = 0;
    nbReady = 0;
    nbPlayersNeeded = 2;
    toUpdate = [];
  });
});

//-------------------- Initialize the connection
server.listen(PORT, function() {
  console.log('listening on *:' + PORT);
});
