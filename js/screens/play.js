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
    me.levelDirector.loadLevel("area01");

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
    socket.emit('updatePlayer', {id: t.playerId, player: {x:t.players[t.playerId].pos._x, y:t.players[t.playerId].pos._y}});

    //On each update event, update all the other players
    socket.on('update', function(param){
      for(var i in param){
        var p = param[i];

        if(p.id !== t.playerId){
          t.players[p.id].pos.set(p.pos.x, p.pos.y);
          //TODO update other params
        }
      }
      //To force the drawing of each object by the engine
      me.game.repaint();
      socket.emit('updatePlayer', {id: t.playerId, player: {x:t.players[t.playerId].pos._x, y:t.players[t.playerId].pos._y}});
    });

    // add our HUD to the game world
    this.HUD = new game.HUD.Container();
    me.game.world.addChild(this.HUD);
  },

  /**
  *  action to perform when leaving this screen (state change)
  */
  onDestroyEvent: function() {
    // remove the HUD from the game world
    me.game.world.removeChild(this.HUD);
  }
});
