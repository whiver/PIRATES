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
  var Treasure = require("./Treasure");

  /** Represent a Game */
  class Game {

    /**
     * Create a game
     */
    constructor(){
      this.players = {};
      this.respawnPoints = [];
      this.treasures = [];

      this.respawnPoints[0] = {x: 2048, y: 864};
      this.respawnPoints[1] = {x: 640, y: 704};
      this.respawnPoints[2] = {x: 608, y: 2048};
      this.respawnPoints[3] = {x: 1728, y: 1920};
      this.respawnPoints[4] = {x: 2112, y: 352};
      this.respawnPoints[5] = {x: 1280, y: 1280};
      
      this.treasures[0] = new Treasure(1534, 1668, 10);
      this.treasures[1] = new Treasure(1843, 2138, 5);
      this.treasures[2] = new Treasure(1392, 1074, 10);
      this.treasures[3] = new Treasure(612, 1420, 10);
      this.treasures[4] = new Treasure(856, 476, 5);
      this.treasures[5] = new Treasure(2028, 472, 5);
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

  	  // Check if pseudo is already defined
  	  var listPlayers = this.players;
  	  for(var i in listPlayers) {
  		  var player = listPlayers[i];
  		  if(pseudo == player.pseudo)
  		  {
          return id;
  		  }
  	  }

      id = Game.NbPlayers;
      var x = this.respawnPoints[id].x;
      var y = this.respawnPoints[id].y;

      this.players[id] = new Entities.Player(pseudo, id, x, y);

      Game.NbPlayers++;

      return id;
    }

    /**
     * RemovePlayer - Remove a player from the listPlayers
     *
     * @param {int} id the player to remove
     */
    RemovePlayer(id){
      if(this.player[id] !== undefined)
        delete this.player[id];
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

    /**
     * GetList - Get the list of players indexed by ids
     *
     * @return {object}  the players indexed by ids
     */
    GetList(){
      return this.players;
    }
    
    /**
     * GetTreasure - Get a treasure in the list
     */
    GetTreasure(i){
      if(i >= this.treasures.length) throw "Error : treasure not defined!";
      
      return this.treasures[i];
    }
    
    /**
     * Make the treasures of a dead player collectable again
     */
    resetPlayerTreasures(idPlayer){
      var player = this.players[idPlayer];
      
      for(var i = 0; i < player.treasures.length; i++){
        this.treasures[player.treasures[i]].collected = false;
      }
      
      player.treasures = [];
      player.points = 0;
    }

    /**
     * getCollectableTreasures - Get ids of the treasures that are collectable
     * @returns {Array} ids
     */
    getCollectableTreasures(){
      var result = [];
      
      for(var i = 0; i < this.treasures.length; i++){
        if(!this.treasures[i].collected){
          result.push(i);
        }
      }
      
      return result;
    }

  }

  Game.NbPlayers = 0;

  exports.Game = Game;
})();
