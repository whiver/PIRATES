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

game.PlayScreen = me.ScreenObject.extend({
  /**
   *  action to perform on state change
   */
  onResetEvent: function(players, idPlayer, treasures) {
    //Map init
    me.levelDirector.loadLevel("map_base", {
      flatten: false,
      container: me.game.world
    });

    /**
     * The container of all characters in the game, created in Tiled
     * @type {me.Container}
     */
    this.entitiesLayer = me.game.world.getChildByName("entities")[0];

    if (me.game.HASH.debug === true) {
      console.assert(this.entitiesLayer !== undefined, 'No children named ' +
        '"entities" found. The Tiled map must include such a layer to add ' +
        'the players to the game and the layer must not be empty.', this);
      console.assert(this.entitiesLayer instanceof me.Container, 'The "entities" ' +
        'Tiled layer must be an object layer to allow adding players inside it.', this);
    }

    var t = this;
    this.players = players;
    this.treasures = treasures;
    this.playerId = idPlayer;

    //Add the players
    for(var id in players){
      this.entitiesLayer.addChild(players[id]);
    }

    for(var i = 0; i < treasures.length; i++){
      this.entitiesLayer.addChild(treasures[i]);
    }

    //Emit first player data
    this.updatePayload = {};

    /**
     * Update the other players using the informations sent by the server
     * @param {object}  remotePlayer  The player object of the server to update
     */
    socket.on('update', function(remotePlayer) {
      var now = Date.now();

      var dt = now - remotePlayer.lastMaj;

      // Update the players informations
      t.players[remotePlayer.id].body.vel.set(remotePlayer.vel.x, remotePlayer.vel.y);
      t.players[remotePlayer.id].pos.x = remotePlayer.pos.x;
      t.players[remotePlayer.id].pos.y = remotePlayer.pos.y;

      if (!isNaN(dt)) {
        t.players[remotePlayer.id].update(dt);
      }

      //To force the drawing of each object by the engine
      me.game.repaint();
    });

    /**
     * Listen for confirmation from the server of main player's attacks
     * @param {object}  infos Informations about the attack:
     *                        - from: the id of the attacker
     *                        - target: the id of the target
     *                        - hp: the remaining hp of the target
     */
    socket.on("attackConfirmation", function (infos) {
      var target;

      if (infos.from === t.playerId) {
        // If we are the attacker
        if (me.game.HASH.debug === true) {
          console.info("Attack action accepted.");
        }
        target = t.players[infos.target];
        target.hurt();
      } else {
        // If another player is the attacker

        if (me.game.HASH.debug === true) {
          console.info("Attack information received: " + infos.from + " > " + infos.target);
        }

        t.players[infos.from].attack();

        // Hurt the player
        t.players[infos.target].hurt(infos.hp);
      }
    });

    /**
     * Handle the death of a player when the server ask it
     * @param {object}  p The player who must die
     */
    socket.on("death", function (p) {
      t.players[p.id].die(p.pos.x, p.pos.y);
      
      if (me.game.HASH.debug === true) {
        if (p.id === t.playerId) {
          console.info("You died.");
        } else {
          console.info("Player " + p.id + " died.");
        }
      }
    });
    
    socket.on('treasuresRespawn', function(list){
      for(i = 0; i < list.length; i++){
        t.treasures[list[i]].respawn();
      }
    });
    
    /**
     * Handle a treasure collection by a player
     * @param {object} obj an object with 'player' the player id et 'treasure' the treasure id
     */
    socket.on('treasureCollected', function(obj){
      if(obj.treasure > t.treasures.length) return;
      
      var treasure = t.treasures[obj.treasure];
      
      if(obj.player === t.playerId){
        t.players[t.playerId].treasures.push(treasure);
      }
      
      treasure.collect();
      
      if (me.game.HASH.debug === true) {
        console.info('Player ' + t.playerId + ' took a treasure (score : ' + t.players[t.playerId].score() + ')');
      }
    });
    
	/**
     * Handle disconnection
     * 
     */
    socket.on('requestDisconnect', function(p){
	    if (p.id === t.playerId) {
          console.info("You disconnect");
        } else {
          console.info("Player " + p.id + " disconnect.");
        }	
		t.entitiesLayer.removeChild(players[p.id]);
    });
	
	
    // Send the player's informations to the server
    setInterval(function () {
      t.updatePayload.x = t.players[t.playerId].pos._x;
      t.updatePayload.y = t.players[t.playerId].pos._y;
      t.updatePayload.velX = t.players[t.playerId].body.vel.x;
      t.updatePayload.velY = t.players[t.playerId].body.vel.y;
      t.updatePayload.lastMaj = Date.now();
      t.updatePayload.currentAnimation = t.players[t.playerId].characterRenderable.current.name;

      socket.emit('updatePlayer', {id: t.playerId, player: t.updatePayload});
    }, 100);

    // add our HUD to the game world
    this.HUD = new game.HUD.Container();
    me.game.world.addChild(this.HUD);

    // set the display to follow our position on both axis
    me.game.viewport.follow(this.players[this.playerId], me.game.viewport.AXIS.BOTH);
  },

  /**
  *  action to perform when leaving this screen (state change)
  */
  onDestroyEvent: function() {
    // remove the HUD from the game world
    me.game.world.removeChild(this.HUD);
  }
});
