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

/**
 * Sword animated sprite. Defines the animation of the basic weapon
 * @type {me.AnimationSheet}
 */
game.Sword = me.AnimationSheet.extend({
  init: function () {
    "use strict";

    /**
     * The default position of the weapon, corresponding to the position of the weapon when the player is facing
     * right.
     * @type {{x: number, y: number}}
     */
    this.defaultWeaponPos = {
      x: 8,
      y: -2
    };
    
    /**
     * The default position of the hitbox for each weapon orientation
     */
    this.defaultHitboxPos = {
      top: new me.Rect(-5, -12, 39, 12).toPolygon(),
      right: new me.Rect(22, -5, 12, 39).toPolygon(),
      bottom: new me.Rect(-5, 34, 39, 12).toPolygon(),
      left: new me.Rect(-5, -5, 12, 39).toPolygon()
    }

    this._super(me.AnimationSheet, "init", [
      this.defaultWeaponPos.x,
      this.defaultWeaponPos.y, {
      framewidth: 42,
      frameheight: 42,
      image: "sword"
    }]);

    this.addAnimation("attack_hor", [0,1,2,3,4,5,6], 40);
    this.addAnimation("attack_ver", [7,8,9,10,11,12,13], 40);
    this.setCurrentAnimation("attack_ver");
  }
});
