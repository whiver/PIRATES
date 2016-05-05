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
var nbPlayersNeeded = 3;
// TODO (or not) Update minPlatersInGame, 2 has been chose randomly
var minPlayersInGame = 2;
var toUpdate = [];

//-------------- Handle the client-server communication
io.on('connection', function (socket) {

  // At the connection, you receive the number of players needed to begin a game
  socket.emit('nbPlayersRequired', nbPlayersNeeded);
  // And you receive the list of players already ready to play
  socket.emit('addMemberConnected', game.GetList());

  // Allow a player to join the game and set his pseudo
  socket.on('join', function (pseudo) {
    var idPlayer = game.AddPlayer(pseudo);
	
	// Save id in socket
	socket.idPlayer = idPlayer;
	
    if(idPlayer !== -1) {
      console.log('Player ' + pseudo + ' joined the game.');

      // Send pseudo to the others players
      io.emit('addMemberConnected', pseudo);

      //Give an ID to the player
      socket.emit('initId', idPlayer);
      nbPlayers++;
	  
	  var player = game.Get(idPlayer);
	  player.state = "Join";
	  
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
	
	  game.SetIsRunning(true);
	
      setInterval(function(){
        for(var i=0; i < toUpdate.length; i++){
          toUpdate[i].emit('update', game.GetList());
      }

        toUpdate = [];
      }, 50);
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
	
	var player = game.Get(socket.idPlayer);
	var gameIsRunning = game.GetIsRunning();
	
	if(player != undefined) {
		// If the game began and the number of player in game < number of player necessary
		// Then we deconnect all the players
		if(gameIsRunning == true && nbReady <= minPlayersInGame)
		{
			io.emit('infoDisconnect');
			console.log('Disconnection in game of player ' + player.pseudo );
			socket.disconnect();
			nbPlayers--;
			nbReady--;
			game.RemovePlayer(player.id);
			
			// No need to restart a new game, but the id of player will increase, and create problem with respawn after 6 players	
			if(nbPlayers==0){
			game = new Pirates.Game();
			nbPlayers = 0;
			nbReady = 0;
			toUpdate = [];
			}
			
		}
		// Else if the game began but there are still players enough
		// Then we deconnect only the player concerned
		else if(gameIsRunning == true && nbReady > minPlayersInGame)
		{
			game.RemovePlayer(player.id);
			console.log('Disconnection in game of player ' + player.pseudo );
			nbPlayers--;
			nbReady--;
			socket.disconnect();
		}
		// Else if the game didn't begin and the player had join
		// Then we remmove the player of the wainting list
		else if(gameIsRunning == false && player.state == 'Join')
		{
			console.log('Disconnection of player ' + player.pseudo );
			nbPlayers--;
			player.state = 'None';
			game.RemovePlayer(player.id);
			io.emit('removeMemberConnected', player.pseudo);
			socket.disconnect();
		}
		// Else the game didn't begin and the player had not join
		else
		{

		}
	}

  });
});

//-------------------- Initialize the connection
server.listen(PORT, function() {
  console.log('listening on *:' + PORT);
});
