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

  const DEFAULT_HP          = 100;
  const DEFAULT_DMG         = 25;
  const DEFAULT_HEAL_SPEED  = 0.5;
  const DEFAULT_ANIMATION   = "stand";

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
    constructor(pseudo, id, px, py){
      this.pseudo = pseudo;
      this.id = id;
      this.hp = DEFAULT_HP;
      this.dmg = DEFAULT_DMG;
      this.dead = false;
      this.healSpeed = DEFAULT_HEAL_SPEED;
      this.currentAnimation = DEFAULT_ANIMATION;
      this.points = 0;
      this.defaultPos = {x: px, y: py};
      this.vel = {x: 0, y: 0};
      this.lastMaj = Date.now();

      // Initialize the position with de default one
      this.pos = this.defaultPos;
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

    hurt () {
      this.hp -= this.dmg;
      if (this.hp <= 0) {
        // Mark the player as dead
        this.dead = true;

        // Reset his properties
        this.hp = DEFAULT_HP;
        this.pos = this.defaultPos;
      }
    }

    /**
     * CurrentAnimation - Get or set the current animation of the player
     *
     * @param newANimation {String} The newAnimation to set
     * @return {String | Void} The animation if 0 args, nothing if 1 arg
     */
    CurrentAnimation(newAnimation){
      if(newAnimation === undefined){
        return this.currentAnimation;
      }

      this.currentAnimation = newAnimation;
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

    /**
     * Velocity - Get or Set the velocity of the player
     *
     * @param  {Object} newVel the new velocity to set
     * @return {Object}        The velocity if 0 args, nothing if 1 arg
     */
    Velocity(newVel){
      if(newVel === undefined){
        return this.vel;
      }

      this.vel = newVel;
    }
    //--------------------------------------------------------------------------
  }

  exports.Player = Player;
})();
