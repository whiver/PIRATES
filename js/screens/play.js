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
    me.levelDirector.loadLevel("map_base");

    // reset the score
    game.data.score = 0;

    var t = this;
    this.players = players;
    this.playerId = idPlayer;

    //Add the players
    for(var id in players){
      me.game.world.addChild(players[id]);
    }


    //Emit first player data
    var data =
    {
      x:t.players[t.playerId].pos._x,
      y:t.players[t.playerId].pos._y,
      velX:t.players[t.playerId].body.vel.x,
      velY:t.players[t.playerId].body.vel.y
    };
    socket.emit('updatePlayer', {id: t.playerId, player: data});

    //On each update event, update all the other players
    socket.on('update', function(param){
      var now = Date.now();

      for(var i in param) {
        var p = param[i];

        if(p.id !== t.playerId){
          var dt = now - p.lastMaj;

          t.players[p.id].body.vel.set(p.vel.x, p.vel.y);
          t.players[p.id].pos.x = p.pos.x;
          t.players[p.id].pos.y = p.pos.y;

          if(!isNaN(dt)){
            t.players[p.id].update(dt);
          }
          //TODO update other params
        }
      }
      //To force the drawing of each object by the engine
      me.game.repaint();

      var data =
      {
        x:t.players[t.playerId].pos._x,
        y:t.players[t.playerId].pos._y,
        velX:t.players[t.playerId].body.vel.x,
        velY:t.players[t.playerId].body.vel.y,
        lastMaj: Date.now(),
        currentAnimation:t.players[t.playerId].characterRenderable.current.name
      };
      socket.emit('updatePlayer', {id: t.playerId, player: data});
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
