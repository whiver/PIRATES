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
game.OtherPlayer = game.Character.extend({

  /**
  * constructor
  */
  init:function (x, y, id) {
    // call the constructor
    this._super(game.Character, 'init', [x, y, id]);

    // define a basic walking animation (using all frames)
    this.characterRenderable.addAnimation(this.DOWN_WALK,  [3, 4, 5]);
    this.characterRenderable.addAnimation(this.UP_WALK,  [39, 40, 41]);
    this.characterRenderable.addAnimation(this.SIDE_WALK,  [27, 28, 29]);

    // define a standing animation (using the first frame)
    this.characterRenderable.addAnimation(this.STAND,  [4]);
    // set the standing animation as default
    this.characterRenderable.setCurrentAnimation(this.STAND);
    
    // other players are not updated outside of the viewport
    this.alwaysUpdate = false;
    
    // Add the weapon
    this.setWeapon();
  },
  
  /**
  * update the entity
  */
  update : function (dt) {
    if(this.body.vel.y > 0){
      if(!this.characterRenderable.isCurrentAnimation(this.DOWN_WALK)){
        this.characterRenderable.setCurrentAnimation(this.DOWN_WALK);
      }
    }
    else if(this.body.vel.y < 0){
      if(!this.characterRenderable.isCurrentAnimation(this.UP_WALK)){
        this.characterRenderable.setCurrentAnimation(this.UP_WALK);
      }
    }
    else if(this.body.vel.x > 0){
      this.characterRenderable.flipX(false);
      if(!this.characterRenderable.isCurrentAnimation(this.SIDE_WALK)){
        this.characterRenderable.setCurrentAnimation(this.SIDE_WALK);
      }
    }
    else if(this.body.vel.x < 0){
      this.characterRenderable.flipX(true);
      if(!this.characterRenderable.isCurrentAnimation(this.SIDE_WALK)){
        this.characterRenderable.setCurrentAnimation(this.SIDE_WALK);
      }
    }
    else
    {
      if(!this.characterRenderable.isCurrentAnimation(this.STAND)){
        this.characterRenderable.setCurrentAnimation(this.STAND);
      }
    }

    // apply physics to the body (this moves the entity)
    this.body.update(dt);

    // handle collisions against other shapes
    me.collision.check(this);

    // return true if we moved or if the renderable was updated
    return (this._super(game.Character, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
  }
});
