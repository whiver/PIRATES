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

(function(){
  "use strict";

  var Entities = require("./Player");

  /** Represent a Game */
  class Game {

    /**
     * Create a game
     */
    constructor(){
      this.players = {};
    }

    /**
     * AddPlayer - Add a player to the game
     *
     * @param  {String} pseudo the player pseudo
     * @param  {Int} id the player ID
     * @return {int} the player id
     */
    AddPlayer(pseudo){
      var id = -1;
      //TODO check if pseudo is already defined
      //TODO make a system to locate the players in differents parts of the map
      Game.NbPlayers++;

      id = Game.NbPlayers;
      this.players[id] = new Entities.Player(pseudo, id, 0, 0);

      return id;
    }

    /**
     * Get - Get a player
     *
     * @param  {int} id the player id
     * @return {Player} the player
     */
    Get(id){
      return this.players[id];
    }

  }

  Game.NbPlayers = 0;

  exports.Game = Game;
})();
