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
* Treasure Entity
*/
game.Treasure = me.CollectableEntity.extend({

  /**
  * constructor
  */
  init:function (x, y, settings) {
    // call the constructor
    this._super(me.CollectableEntity, 'init', [x, y , settings]);

    // properties
    this.points = settings.points;

    // define a basic walking animation (using all frames)
    this.renderable.addAnimation("closed",  [0]);
    this.renderable.addAnimation("opened",  [1]);

    this.renderable.setCurrentAnimation("closed");
  },

  // this function is called by the engine, when
  // an object is touched by something (here collected)
  onCollision : function (response, other) {
    // do something when collected

    // make sure it cannot be collected "again"
    this.body.setCollisionMask(me.collision.types.NO_OBJECT);

    // hide it
    this.isRenderable = false;

    return false;
  },

  /**
   * respawn - make the treasure appear again
   */
  respawn: function () {
    // show it
    this.isRenderable = true;

    // make the treasure collectable
    this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
  }

});
