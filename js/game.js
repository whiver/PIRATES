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

/* Game namespace */
var game = {
  // an object where to store game information
  data : {
    // score
    score : 0
  },


  // Run on page load.
  "onload" : function () {
    // Initialize the video.
    if (!me.video.init(960, 540, {wrapper : "screen", scale : "auto"})) {
      alert("Your browser does not support HTML5 canvas.");
      return;
    }

    // add "#debug" to the URL to enable the debug Panel
    if (me.game.HASH.debug === true) {
      window.onReady(function () {
        me.plugin.register.defer(this, me.debug.Panel, "debug", me.input.KEY.V);
      });
    }

    // Initialize the audio.
    me.audio.init("mp3,ogg");

    // Set a callback to run when loading is complete.
    me.loader.onload = this.loaded.bind(this);

    // Load the resources.
    me.loader.preload(game.resources);

    // Emplace our own loading screen
    me.state.set(me.state.LOADING, new game.LoadingScreen());

    // Initialize melonJS and display a loading screen.
    me.state.change(me.state.LOADING);
  },

  // Run on game resources loaded.
  "loaded" : function () {
    // Game states declarations
    me.state.set(me.state.PLAY, new game.PlayScreen());

    // Pool entries definitions
    me.pool.register("treasure", game.Treasure);
    
    //First, we wait for all the players to connect
    var players = {};
    var treasures = [];
    var playerId;

    socket.on("initId", function(id){
      playerId = id;

      socket.emit("initIdDone");
    });

    socket.on("init", function(param){
      for(var i in param.players){
        var p = param.players[i];

        if(p.id === playerId){
          players[p.id] = new game.Player(p.pos.x, p.pos.y, p.hp, p.id);
        }
        else{
          players[p.id] = new game.OtherPlayer(p.pos.x, p.pos.y, p.id);
        }
      }

      for(var i=0; i < param.treasures.length; i++){
        var t = param.treasures[i];
        
        treasures[i] = new game.Treasure(t.pos.x, t.pos.y, t.points, i);
      }
      
      socket.emit('ready');
    });

    //Then, we start the game
    socket.on('start', function(){
      //Key mappings
      me.input.bindKey(me.input.KEY.LEFT,  "left");
      me.input.bindKey(me.input.KEY.RIGHT, "right");
      me.input.bindKey(me.input.KEY.UP,  "up");
      me.input.bindKey(me.input.KEY.DOWN, "down");

      // Bind the attack on SPACE / LEFT CLICK
      me.input.bindKey(me.input.KEY.SPACE, "attack", true);
      me.input.bindPointer(me.input.KEY.SPACE);

      // Start the game (pass 2 args (players & playerId) to the onResetEvent function of the play screen)
      me.state.change(me.state.PLAY, players, playerId, treasures);

      document.getElementsByClassName("overPanel")[0].style.display = "none";
      document.getElementsByClassName("MemberPanel")[0].style.display = "none"; 
    });
	
	socket.on('infoDisconnect', function(){	  
	  socket.disconnect();
	  document.getElementsByClassName("overPanel")[0].style.display = "flex";
	  document.getElementsByClassName("dialog")[0].innerHTML = "<h3> You have been disconnected </h3>";
	});
	
  }
};
