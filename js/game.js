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
    if (!me.video.init(640, 480, {wrapper : "screen", scale : "auto"})) {
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

    // Initialize melonJS and display a loading screen.
    me.state.change(me.state.LOADING);
  },

  // Run on game resources loaded.
  "loaded" : function () {
    // Game states declarations
    me.state.set(me.state.MENU, new game.TitleScreen());
    me.state.set(me.state.PLAY, new game.PlayScreen());

    // Pool entries definitions
    me.pool.register("treasure", game.Treasure);
    
    //First, we wait for all the players to connect
    var players = {};
    var playerId;

    socket.on("initId", function(id){
      playerId = id;

      socket.emit("initIdDone");
    });

    socket.on("init", function(param){
      for(var i in param){
        var p = param[i];

        if(p.id === playerId){
          players[p.id] = new game.Player(p.pos.x, p.pos.y, {frameheight: 32, framewidth: 30, image: "pirates", width: 30, height:32});
        }
        else{
          players[p.id] = new game.OtherPlayer(p.pos.x, p.pos.y, {frameheight: 32, framewidth: 30, image: "pirates", width: 30, height:32});
        }
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
      me.state.change(me.state.PLAY, players, playerId);

      document.getElementsByClassName("overPanel")[0].style.display = "none";
      document.getElementsByClassName("MemberPanel")[0].style.display = "none";	
    });
	
  }
};
