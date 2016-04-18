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
  onResetEvent: function(players, idPlayer) {
    //Map init
    me.levelDirector.loadLevel("map_base", {
      flatten: false,
      container: me.game.world
    });
    
    /**
     * The container of all characters in the game, creatd in Tiled
     * @type {me.Container}
     */
    this.playerLayer = me.game.world.getChildByName("entities")[0];
    
    if (me.game.HASH.debug === true) {
      console.assert(this.playerLayer !== undefined, 'No children named '
        + '"entities" found. The Tiled map must include such a layer to add '
        + 'the players to the game and the layer must not be empty.', this);
      console.assert(this.playerLayer instanceof me.Container, 'The "entities" '
        + 'Tiled layer must be an object layer to allow adding players inside it.', this);
    }

    var t = this;
    this.players = players;
    this.playerId = idPlayer;

    //Add the players
    for(var id in players){
      this.playerLayer.addChild(players[id]);
    }


    //Emit first player data
    this.updatePayload = {
      x:t.players[t.playerId].pos._x,
      y:t.players[t.playerId].pos._y,
      velX:t.players[t.playerId].body.vel.x,
      velY:t.players[t.playerId].body.vel.y
    };
    socket.emit('updatePlayer', {id: t.playerId, player: this.updatePayload});

    //On each update event, update all the other players
    socket.on('update', function(param){
      var now = Date.now();

      // Loop over each player to update
      for(var i in param) {
        var p = param[i];

        if(p.id !== t.playerId) {
          // Informations about other players
          
          var dt = now - p.lastMaj;

          // Update the players informations
          t.players[p.id].body.vel.set(p.vel.x, p.vel.y);
          t.players[p.id].pos.x = p.pos.x;
          t.players[p.id].pos.y = p.pos.y;
          
          // Run an attack if necessary
          if (p.attack !== undefined) {
            if (me.game.HASH.debug === true) {
              console.info("Attack information received: " + p.id + " > " + p.attack);
            }
            
            t.players[p.id].attack();
            
            // Hurt the player
            t.players[p.attack].hurt();
          }

          if(!isNaN(dt)){
            t.players[p.id].update(dt);
          }
        } else {
          // Informations about the main player
          if (p.attack !== undefined) {
            if (me.game.HASH.debug === true) {
              console.info("Attack action accepted.");
            }
            
            // Hurt the player
            t.players[p.attack].hurt();
          }
        }
      }
      //To force the drawing of each object by the engine
      me.game.repaint();

      // Send the latest player's data to the server
      t.updatePayload.x = t.players[t.playerId].pos._x,
      t.updatePayload.y = t.players[t.playerId].pos._y,
      t.updatePayload.velX = t.players[t.playerId].body.vel.x,
      t.updatePayload.velY = t.players[t.playerId].body.vel.y,
      t.updatePayload.lastMaj = Date.now(),
      t.updatePayload.currentAnimation = t.players[t.playerId].characterRenderable.current.name
      
      socket.emit('updatePlayer', {id: t.playerId, player: t.updatePayload});
      
      // Reset the object's optional properties for the next update
      t.updatePayload.attack = undefined;
    });

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
