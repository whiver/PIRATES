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

  /**
   * Represent a player in a game
   */
  class Player {

    /**
     * Create a player
     *
     * @param  {String} pseudo the player's pseudo
     * @param  {int} id the player's id
     * @param  {int} x the player's x coordinate
     * @param  {int} y the player's y coordinate
     */
    constructor(pseudo, id, x, y){
      this.pseudo = pseudo;
      this.id = id;
      this.hp = 100;
      this.dmg = 25;
      this.healSpeed = 0.5;
      this.currentAnimation = "stand";
      this.points = 0;
      this.x = x;
      this.y = y;
    }

    //------------------------ Getters / Setters -------------------------------

    /**
     * Pseudo - Get the pseudo of the player
     *
     * @return {String} the pseudo
     */
    Pseudo(){
      return this.pseudo;
    }

    /**
     * Id - Get the id of the player
     *
     * @return {int} the id
     */
    Id(){
      return this.id;
    }

    /**
     * HP - Get Health Points of the player
     *
     * @return {int} the HP
     */
    HP(){
      return this.hp;
    }

    /**
     * Dmg - Get the Damages of the player
     *
     * @return {int} the damages
     */
    Dmg(){
      return this.dmg;
    }

    /**
     * CurrentAnimation - Get or set the current animation of the player
     *
     * @param newANimation {String} The newAnimation to set
     * @return {String | Void} The animation if 0 args, nothing if 1 arg
     */
    CurrentAnimation(newAnimation){
      if(newAnimation === undefined){
        return this.CurrentAnimation;
      }

      this.CurrentAnimation = newAnimation;
    }

    /**
     * Points - Get or set the player's score
     *
     * @param {int} newScore the new score to set
     * @return {int | void} The score if 0 args, nothing if 1 arg
     */
    Points(newScore){
      if(newScore === undefined){
        return this.points;
      }

      this.points = newScore;
    }
    //--------------------------------------------------------------------------
  }

  exports.Player = Player;
})();
