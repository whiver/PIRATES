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
* Other Player Entity
*/
game.OtherPlayer = me.Entity.extend({

  /**
  * constructor
  */
  init:function (x, y, settings) {
    // call the constructor
    this._super(me.Entity, 'init', [x, y , settings]);

    // set the default horizontal & vertical speed (accel vector)
    this.body.setVelocity(2, 2);

    this.body.gravity = 0;

    // set the display to follow our position on both axis
    me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

    // ensure the player is updated even when outside of the viewport
    this.alwaysUpdate = true;

    // define a basic walking animation (using all frames)
    this.renderable.addAnimation("downWalk",  [3, 4, 5]);
    this.renderable.addAnimation("upWalk",  [39, 40, 41]);
    this.renderable.addAnimation("sideWalk",  [27, 28, 29]);

    // define a standing animation (using the first frame)
    this.renderable.addAnimation("stand",  [4]);
    // set the standing animation as default
    this.renderable.setCurrentAnimation("stand");
  },

  /**
  * update the entity
  */
  update : function (dt) {
    if(this.body.vel.y > 0){
      if(!this.renderable.isCurrentAnimation("downWalk")){
        this.renderable.setCurrentAnimation("downWalk");
      }
    }
    else if(this.body.vel.y < 0){
      if(!this.renderable.isCurrentAnimation("upWalk")){
        this.renderable.setCurrentAnimation("upWalk");
      }
    }
    else if(this.body.vel.x > 0){
      this.renderable.flipX(false);
      if(!this.renderable.isCurrentAnimation("sideWalk")){
        this.renderable.setCurrentAnimation("sideWalk");
      }
    }
    else if(this.body.vel.x < 0){
      this.renderable.flipX(true);
      if(!this.renderable.isCurrentAnimation("sideWalk")){
        this.renderable.setCurrentAnimation("sideWalk");
      }
    }
    else
    {
      if(!this.renderable.isCurrentAnimation("stand")){
        this.renderable.setCurrentAnimation("stand");
      }
    }

    // apply physics to the body (this moves the entity)
    this.body.update(dt);

    // handle collisions against other shapes
    me.collision.check(this);

    // return true if we moved or if the renderable was updated
    return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
  },

  /**
  * colision handler
  * (called when colliding with other objects)
  */
  onCollision : function (response, other) {
    if(other instanceof game.Player || other instanceof game.OtherPlayer){
      return false;
    }
    // Make all other objects solid
    return true;
  }
});
